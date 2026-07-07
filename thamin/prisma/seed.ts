import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Seed data mirrors the Beyond Style UAE operations master database
// (Phase 3, June 2026): real catalog, real supplier, real delivery policy.

async function main() {
  // ── users (change passwords after first login!) ─────────────────────────
  const users = [
    { email: 'admin@beyondstyle.ae', name: 'Beyond Style Admin', role: 'ADMIN', password: 'Admin@123' },
    { email: 'manager@beyondstyle.ae', name: 'Store Manager', role: 'MANAGER', password: 'Manager@123' },
    { email: 'sales@beyondstyle.ae', name: 'Sales Rep', role: 'SALES', password: 'Sales@123' },
    { email: 'viewer@beyondstyle.ae', name: 'Viewer', role: 'VIEWER', password: 'Viewer@123' },
  ];
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: await bcrypt.hash(u.password, 10),
      },
    });
  }

  // ── business rules ───────────────────────────────────────────────────────
  // Delivery AED 25 (Halan / approved courier, policy of 31 May 2026).
  // Bundle discounts follow the real ladder: 1 pc 79, 2 pcs 129, 3 pcs 159.
  await prisma.businessRules.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', bundle2DiscountPct: 18, bundle3DiscountPct: 33 },
  });

  // ── material library ────────────────────────────────────────────────────
  const materials = [
    { name: '316L stainless steel piece', nameAr: 'قطعة ستانلس ستيل 316L', category: 'STAINLESS', unit: 'piece', ratePerUnit: 12, riskNote: 'Fashion accessory. Never claim real gold or silver.' },
    { name: 'Gold-tone stainless steel piece', nameAr: 'قطعة ستانلس ستيل بلون ذهبي', category: 'STAINLESS', unit: 'piece', ratePerUnit: 20, riskNote: 'Say gold tone, not gold plated, unless verified.' },
    { name: 'Silver-tone stainless steel piece', nameAr: 'قطعة ستانلس ستيل بلون فضي', category: 'STAINLESS', unit: 'piece', ratePerUnit: 15, riskNote: 'Say silver tone. It is not real silver.' },
    { name: 'Gold 24K', nameAr: 'ذهب عيار 24', category: 'GOLD', unit: 'gram', ratePerUnit: 295, riskNote: 'Volatile. Verify daily against the UAE market rate.' },
    { name: 'Gold 21K', nameAr: 'ذهب عيار 21', category: 'GOLD', unit: 'gram', ratePerUnit: 258, riskNote: 'Volatile. Verify daily.' },
    { name: 'Gold 18K', nameAr: 'ذهب عيار 18', category: 'GOLD', unit: 'gram', ratePerUnit: 221, riskNote: 'Volatile. Verify daily.' },
    { name: 'Silver 925', nameAr: 'فضة 925', category: 'SILVER', unit: 'gram', ratePerUnit: 4.2, riskNote: 'Check the supplier premium over spot.' },
    { name: 'Gold plating (per piece)', nameAr: 'طلاء ذهبي (للقطعة)', category: 'PLATING', unit: 'piece', ratePerUnit: 15 },
    { name: 'Cubic zirconia stone', nameAr: 'حجر زركون', category: 'STONE', unit: 'piece', ratePerUnit: 3 },
    { name: 'Crystals', nameAr: 'كريستال', category: 'STONE', unit: 'piece', ratePerUnit: 4 },
    { name: 'Chain (steel, 45cm)', nameAr: 'سلسلة ستيل 45 سم', category: 'CHAIN', unit: 'piece', ratePerUnit: 10 },
    { name: 'Clasp (lobster)', nameAr: 'قفل لوبستر', category: 'CLASP', unit: 'piece', ratePerUnit: 3 },
    { name: 'Gift box (standard)', nameAr: 'علبة هدية عادية', category: 'PACKAGING', unit: 'piece', ratePerUnit: 10 },
    { name: 'Gift box (premium)', nameAr: 'علبة هدية فاخرة', category: 'PACKAGING', unit: 'piece', ratePerUnit: 18 },
  ];
  for (const m of materials) {
    const existing = await prisma.material.findFirst({ where: { name: m.name } });
    if (!existing) await prisma.material.create({ data: m });
  }

  // ── channels ────────────────────────────────────────────────────────────
  const channels = [
    { key: 'instagram', name: 'Instagram', nameAr: 'إنستغرام', commissionPct: 0, adsCostPerOrder: 8, paymentFeePct: 2.5, deliveryCost: 25, targetMarginPct: 40 },
    { key: 'whatsapp', name: 'WhatsApp', nameAr: 'واتساب', commissionPct: 0, adsCostPerOrder: 0, paymentFeePct: 2.5, deliveryCost: 25, targetMarginPct: 40 },
    { key: 'tiktok', name: 'TikTok', nameAr: 'تيك توك', commissionPct: 0, adsCostPerOrder: 10, paymentFeePct: 2.5, deliveryCost: 25, targetMarginPct: 42 },
    { key: 'noon', name: 'Noon', nameAr: 'نون', commissionPct: 15, adsCostPerOrder: 0, paymentFeePct: 0, deliveryCost: 0, targetMarginPct: 45 },
    { key: 'website', name: 'Website', nameAr: 'الموقع الإلكتروني', commissionPct: 0, adsCostPerOrder: 5, paymentFeePct: 2.9, deliveryCost: 25, targetMarginPct: 40 },
    { key: 'corporate', name: 'Corporate Orders', nameAr: 'طلبات الشركات', commissionPct: 0, adsCostPerOrder: 0, paymentFeePct: 1, deliveryCost: 0, targetMarginPct: 30 },
    { key: 'marketplace', name: 'Marketplace', nameAr: 'سوق إلكتروني', commissionPct: 12, adsCostPerOrder: 0, paymentFeePct: 0, deliveryCost: 0, targetMarginPct: 45 },
  ];
  for (const c of channels) {
    await prisma.channel.upsert({ where: { key: c.key }, update: {}, create: c });
  }

  // ── suppliers (real supplier from invoice 121, 3 Apr 2026) ──────────────
  const suppliersData = [
    {
      name: 'Beyond Connect General Trading LLC', country: 'UAE', contact: 'Owner approved contact',
      materialsSupplied: 'Stainless steel fashion accessories: necklaces, bracelets, anklets, bangles, half sets',
      moq: 'Per invoice', deliveryCost: 0, leadTimeDays: 3, currency: 'AED', reliabilityScore: 5,
      qualityNotes: 'Primary import source (invoice 121). Verify material claims per batch before publishing.',
    },
    {
      name: 'Guangzhou Accessories Factory', country: 'China', contact: 'wechat: gzaccessories',
      materialsSupplied: 'Stainless steel 316L, chains, clasps', moq: '50 pcs', deliveryCost: 120,
      leadTimeDays: 14, currency: 'USD', reliabilityScore: 4,
      qualityNotes: 'Request an assay report per batch. Plating thickness varies.',
    },
    {
      name: 'Istanbul Accessories Co', country: 'Türkiye', contact: '+90 500 000 0002',
      materialsSupplied: 'Gold-tone brass, crystals, gift boxes', moq: '30 pcs', deliveryCost: 80,
      leadTimeDays: 10, currency: 'USD', reliabilityScore: 4,
      qualityNotes: 'Good finishing. Confirm nickel-free plating.',
    },
  ];
  for (const s of suppliersData) {
    const existing = await prisma.supplier.findFirst({ where: { name: s.name } });
    if (!existing) await prisma.supplier.create({ data: s });
  }
  const mainSupplier = await prisma.supplier.findFirst({ where: { name: 'Beyond Connect General Trading LLC' } });

  // ── products: the real Beyond Style UAE catalog ──────────────────────────
  const admin = await prisma.user.findUnique({ where: { email: 'admin@beyondstyle.ae' } });
  const base = {
    material: 'STAINLESS_STEEL',
    packagingCost: 10,
    deliveryCost: 25,
    paymentMethod: 'COD',
    paymentFeePct: 2.5,
    marketingCost: 5,
    operationsCost: 5,
    vatMode: 'EXCLUSIVE',
    targetMarginPct: 40,
    supplierCurrency: 'AED',
  };
  const safeClaim =
    'Safe claim: stainless steel fashion accessory. Do not claim real gold, real silver, waterproof or anti-tarnish.';
  const products = [
    {
      ...base,
      sku: 'BSU-MA-BR', name: "Masha'Allah Bracelet", nameAr: 'سوار ما شاء الله',
      category: 'BRACELET', supplierQuote: 25, customizationCost: 0,
      approvalStatus: 'APPROVED', approvedPrice: 79, finalPrice: 79,
      notes: `Hero product. Customizable strap colour and writing tone. Bundles: 2 pcs AED 129, 3 pcs AED 159. ${safeClaim}`,
    },
    {
      ...base,
      sku: 'BSU-HOB-NK', name: 'Hob Necklace', nameAr: 'قلادة حب',
      category: 'NECKLACE', supplierQuote: 25,
      approvalStatus: 'APPROVED', approvedPrice: 59, finalPrice: 59,
      notes: `Silver tone or gold tone depending on stock. Add-on price AED 49 when attached to a bracelet order. ${safeClaim}`,
    },
    {
      ...base,
      sku: 'BSU-QH-BR', name: 'Qul Huwa Allah Ahad Bracelet', nameAr: 'سوار قل هو الله أحد',
      category: 'BRACELET', supplierQuote: 25,
      approvalStatus: 'APPROVED', approvedPrice: 79, finalPrice: 79,
      notes: `Confirm the actual photo with the customer before payment. Bundles: 2 pcs AED 129, 3 pcs AED 159. ${safeClaim}`,
    },
    {
      ...base,
      sku: 'BSU-PAL-BR', name: 'Palestine Bracelet', nameAr: 'سوار فلسطين',
      category: 'BRACELET', supplierQuote: 25,
      approvalStatus: 'APPROVED', approvedPrice: 79, finalPrice: 79,
      notes: `Subject to stock. Bundles: 2 pcs AED 129, 3 pcs AED 159. ${safeClaim}`,
    },
    {
      ...base,
      sku: 'BSU-NK-003', name: 'Necklace 592-9709-72', nameAr: 'قلادة موديل 592',
      category: 'NECKLACE', supplierQuote: 18,
      approvalStatus: 'APPROVED', approvedPrice: 69, finalPrice: 69,
      notes: `Imported item, invoice 121. Material to be verified before publishing. ${safeClaim}`,
    },
    {
      ...base,
      sku: 'BSU-BR-009', name: 'Bracelet 781-12667-112-M', nameAr: 'سوار موديل 781',
      category: 'BRACELET', supplierQuote: 28,
      approvalStatus: 'APPROVED', approvedPrice: 79, finalPrice: 79,
      notes: `Imported item, invoice 121. ${safeClaim}`,
    },
    {
      ...base,
      sku: 'BSU-AN-010', name: 'Anklet Y-727-12211-28', nameAr: 'خلخال موديل 727',
      category: 'ANKLET', supplierQuote: 7,
      approvalStatus: 'APPROVED', approvedPrice: 39, finalPrice: 39,
      notes: `Imported item, invoice 121. ${safeClaim}`,
    },
    {
      ...base,
      sku: 'BSU-PD-019', name: 'Pendant 267-5352-52', nameAr: 'تعليقة موديل 267',
      category: 'PENDANT', supplierQuote: 13,
      approvalStatus: 'APPROVED', approvedPrice: 69, finalPrice: 69,
      notes: `Imported item, invoice 121. ${safeClaim}`,
    },
    {
      ...base,
      sku: 'BSU-HS-020', name: 'Half Set 266-5347-168', nameAr: 'نصف طقم موديل 266',
      category: 'HALF_SET', supplierQuote: 42,
      approvalStatus: 'PENDING', finalPrice: 79,
      notes: `Imported item, invoice 121. Margin needs review at AED 79. ${safeClaim}`,
    },
    {
      ...base,
      sku: 'BSU-BG-023', name: 'Bangle 133-3465-76', nameAr: 'بنجل موديل 133',
      category: 'BANGLE', supplierQuote: 19,
      approvalStatus: 'APPROVED', approvedPrice: 65, finalPrice: 65,
      notes: `Imported item, invoice 121. Low stock: 2 pieces. ${safeClaim}`,
    },
  ];
  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: { ...p, supplierId: mainSupplier?.id, createdById: admin?.id },
    });
  }

  console.log('Seed complete.');
  console.log('Logins: admin@beyondstyle.ae / Admin@123 | manager / Manager@123 | sales / Sales@123 | viewer / Viewer@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
