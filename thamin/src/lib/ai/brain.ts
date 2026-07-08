import { prisma } from '../db';
import { computePrice } from '../pricing/engine';
import type { PricingInput } from '../pricing/types';
import { loadRules } from '../rules';
import { chat, type ChatMessage, type ToolDef } from './client';

/**
 * Smart Pricing Brain — a goal-driven agent loop over an open-source LLM.
 *
 * Orchestration pattern:
 *   user goal → LLM plans → calls tools (rates, rules, formula engine,
 *   product lookup, history) → observes results → loops (max 6 steps) →
 *   final grounded answer.
 *
 * Guardrails:
 *   - every AED price it quotes must come from the compute_price tool
 *     (the deterministic formula engine) — never from the model's own math
 *   - when data is missing it must ask, not invent
 *   - memory: conversation turns are persisted in BrainConversation
 */

const SYSTEM_PROMPT = `You are Thamin, the internal pricing assistant of Beyond Style UAE, a fashion accessories business in the UAE (stainless steel pieces, gold-tone and silver-tone finishes, customized items, plus future silver 925 and gold lines).

STRICT RULES:
1. Never invent numbers. Every selling price, profit, margin, or safe price you state MUST come from the compute_price tool. Call it with the data you have.
2. If required data is missing (weight, supplier cost, material, delivery area...), ask the user for it clearly in one short list. Do NOT guess.
3. Use get_material_rates and get_business_rules for current rates, VAT and margins. Check rate freshness and warn if stale.
4. Protect margin: never recommend a price below the minimum safe price. If the user insists, explain the risk and that admin override is required.
5. Answer in the user's language (Arabic or English). Arabic must be natural, grammatically correct and business-friendly. Keep answers short, clear, and practical for a small team.
6. For WhatsApp quotations and Instagram captions: customer-facing text must NEVER reveal cost, profit, or margin. Price and value only.
7. SAFE CLAIMS POLICY (mandatory): products are fashion accessories. Never write "real gold", "real silver", "waterproof" or "anti-tarnish" in any customer text unless the user explicitly confirms it is verified. Use "stainless steel", "gold tone", "silver tone", "elegant finishing".
8. Show your reasoning briefly: which costs, which margin, which rules were applied.`;

const TOOLS: ToolDef[] = [
  {
    type: 'function',
    function: {
      name: 'get_business_rules',
      description: 'Get current business rules: VAT rate, default/minimum margins, delivery costs, payment fees, rounding ladder, quote validity.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_material_rates',
      description: 'Get current material rates (gold, silver 925, stainless steel, plating, packaging...) with last-updated timestamps and sources.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compute_price',
      description:
        'The ONLY source of truth for prices. Runs the deterministic pricing formula. Returns total cost, recommended/rounded/minimum-safe/wholesale/bundle prices, profit, margin and warnings. Pass every cost you know; omit unknowns.',
      parameters: {
        type: 'object',
        properties: {
          materialCategory: { type: 'string', enum: ['GOLD', 'SILVER', 'STAINLESS', 'OTHER'] },
          materialRatePerGram: { type: 'number' },
          weightGrams: { type: 'number' },
          supplierCost: { type: 'number', description: 'Supplier quote in AED' },
          makingCharge: { type: 'number' },
          chainCost: { type: 'number' },
          claspCost: { type: 'number' },
          stoneCost: { type: 'number' },
          engravingCost: { type: 'number' },
          customizationCost: { type: 'number' },
          packagingCost: { type: 'number' },
          giftBoxCost: { type: 'number' },
          deliveryCost: { type: 'number' },
          remoteArea: { type: 'boolean' },
          customerPaysDelivery: { type: 'boolean', description: 'True when the courier fee is charged to the customer on top of the item price (the default Beyond Style policy)' },
          paymentMethod: { type: 'string', enum: ['CARD', 'COD', 'ZIINA', 'LINK', 'CASH'] },
          marketingCost: { type: 'number' },
          operationsCost: { type: 'number' },
          otherCosts: { type: 'number' },
          vatMode: { type: 'string', enum: ['EXCLUSIVE', 'INCLUSIVE', 'NONE'] },
          targetMarginPct: { type: 'number' },
          sellingPriceOverride: { type: 'number', description: 'To answer "what is my profit if I sell at X"' },
          discountPct: { type: 'number' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'find_product',
      description: 'Look up a saved product costing sheet by SKU or name substring.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'recent_calculations',
      description: 'Get the most recent stored price calculations (history) for context.',
      parameters: {
        type: 'object',
        properties: { limit: { type: 'number' } },
      },
    },
  },
];

async function runTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'get_business_rules': {
      const rules = await loadRules();
      return JSON.stringify(rules);
    }
    case 'get_material_rates': {
      const mats = await prisma.material.findMany({ orderBy: { category: 'asc' } });
      return JSON.stringify(
        mats.map((m) => ({
          name: m.name, category: m.category, unit: m.unit,
          ratePerUnit: m.ratePerUnit, currency: m.currency,
          source: m.source, lastUpdated: m.updatedAt,
          ageHours: Math.round((Date.now() - m.updatedAt.getTime()) / 36e5),
          riskNote: m.riskNote,
        }))
      );
    }
    case 'compute_price': {
      const rules = await loadRules();
      const input: PricingInput = {
        vatMode: (args.vatMode as PricingInput['vatMode']) ?? 'EXCLUSIVE',
        ...args,
      } as PricingInput;
      try {
        const result = computePrice(input, rules);
        return JSON.stringify(result);
      } catch (e) {
        return JSON.stringify({ error: e instanceof Error ? e.message : String(e) });
      }
    }
    case 'find_product': {
      const q = String(args.query ?? '');
      const products = await prisma.product.findMany({
        where: { OR: [{ sku: { contains: q } }, { name: { contains: q } }] },
        take: 5,
      });
      return JSON.stringify(products);
    }
    case 'recent_calculations': {
      const rows = await prisma.priceCalculation.findMany({
        orderBy: { createdAt: 'desc' },
        take: Math.min(Number(args.limit ?? 5), 20),
        select: {
          mode: true, totalCost: true, recommendedPrice: true,
          finalPrice: true, marginPct: true, createdAt: true, channelKey: true,
        },
      });
      return JSON.stringify(rows);
    }
    default:
      return JSON.stringify({ error: `Unknown tool ${name}` });
  }
}

export interface BrainTurnResult {
  answer: string;
  usedFormulaEngine: boolean;
  steps: { tool: string; args: string }[];
}

const MAX_STEPS = 6;

export async function runBrainTurn(
  history: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string
): Promise<BrainTurnResult> {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content }) as ChatMessage),
    { role: 'user', content: userMessage },
  ];
  const steps: BrainTurnResult['steps'] = [];
  let usedFormulaEngine = false;

  for (let i = 0; i < MAX_STEPS; i++) {
    const res = await chat({ messages, tools: TOOLS, temperature: 0.2 });
    if (!res.toolCalls.length) {
      let answer = res.content.trim();
      // Guardrail: if the model states AED figures without having consulted
      // the formula engine, flag the answer as unvalidated.
      const mentionsPrice = /(\bAED\b|درهم|د\.إ)\s*\d|\d+\s*(AED|درهم|د\.إ)/i.test(answer);
      if (mentionsPrice && !usedFormulaEngine) {
        answer +=
          '\n\n⚠️ Note: these figures were not validated by the pricing formula engine. Use the calculator (or ask me again with full item details) before quoting a customer.';
      }
      return { answer, usedFormulaEngine, steps };
    }
    messages.push({ role: 'assistant', content: res.content, tool_calls: res.toolCalls });
    for (const tc of res.toolCalls) {
      let args: Record<string, unknown> = {};
      try { args = JSON.parse(tc.function.arguments || '{}'); } catch { /* tolerate */ }
      if (tc.function.name === 'compute_price') usedFormulaEngine = true;
      steps.push({ tool: tc.function.name, args: tc.function.arguments });
      const output = await runTool(tc.function.name, args);
      messages.push({ role: 'tool', content: output, tool_call_id: tc.id, name: tc.function.name });
    }
  }
  return {
    answer:
      'I could not finish reasoning within the step limit. Please simplify the question or provide the missing data directly.',
    usedFormulaEngine,
    steps,
  };
}
