import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

  // ── business rules (defaults from the spec, editable by admin) ──────────
  await prisma.businessRules.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default' }, // all defaults defined in the schema
  });

  // ── material library ────────────────────────────────────────────────────
  const materials = [
    { name: 'Gold 24K', nameAr: 'ذهب عيار 24', category: 'GOLD', unit: 'gram', ratePerUnit: 295, riskNote: 'Volatile — verify daily against UAE market rate' },
    { name: 'Gold 21K', nameAr: 'ذهب عيار 21', category: 'GOLD', unit: 'gram', ratePerUnit: 258, riskNote: 'Volatile — verify daily' },
    { name: 'Gold 18K', nameAr: 'ذهب عيار 18', category: 'GOLD', unit: 'gram', ratePerUnit: 221, riskNote: 'Volatile — verify daily' },
    { name: 'Silver 925', nameAr: 'فضة 925', category: 'SILVER', unit: 'gram', ratePerUnit: 4.2, riskNote: 'Check supplier premium over spot' },
    { name: 'Silver plated', nameAr: 'مطلي بالفضة', category: 'PLATING', unit: 'piece', ratePerUnit: 8 },
    { name: 'Gold plating (per piece)', nameAr: 'طلاء ذهب (للقطعة)', category: 'PLATING', unit: 'piece', ratePerUnit: 15 },
    { name: 'Gold plated stainless steel', nameAr: 'ستانلس ستيل مطلي ذهب', category: 'STAINLESS', unit: 'piece', ratePerUnit: 20 },
    { name: '316L stainless steel', nameAr: 'ستانلس ستيل 316L', category: 'STAINLESS', unit: 'piece', ratePerUnit: 12 },
    { name: 'Brass', nameAr: 'نحاس', category: 'OTHER', unit: 'gram', ratePerUnit: 0.35 },
    { name: 'Pearls (freshwater)', nameAr: 'لؤلؤ (مياه عذبة)', category: 'STONE', unit: 'piece', ratePerUnit: 6 },
    { name: 'Cubic zirconia stone', nameAr: 'حجر زركون', category: 'STONE', unit: 'piece', ratePerUnit: 3 },
    { name: 'Crystals', nameAr: 'كريستال', category: 'STONE', unit: 'piece', ratePerUnit: 4 },
    { name: 'Chain (steel, 45cm)', nameAr: 'سلسلة (ستيل 45 سم)', category: 'CHAIN', unit: 'piece', ratePerUnit: 10 },
    { name: 'Chain (silver 925, 45cm)', nameAr: 'سلسلة (فضة 925، 45 سم)', category: 'CHAIN', unit: 'piece', ratePerUnit: 35 },
    { name: 'Clasp (lobster)', nameAr: 'قفل (لوبستر)', category: 'CLASP', unit: 'piece', ratePerUnit: 3 },
    { name: 'Gift box (standard)', nameAr: 'علبة هدية (عادية)', category: 'PACKAGING', unit: 'piece', ratePerUnit: 10 },
    { name: 'Gift box (premium)', nameAr: 'علبة هدية (فاخرة)', category: 'PACKAGING', unit: 'piece', ratePerUnit: 18 },
  ];
  for (const m of materials) {
    const existing = await prisma.material.findFirst({ where: { name: m.name } });
    if (!existing) await prisma.material.create({ data: m });
  }

  // ── channels ────────────────────────────────────────────────────────────
  const channels = [
    { key: 'instagram', name: 'Instagram', nameAr: 'انستغرام', commissionPct: 0, adsCostPerOrder: 8, paymentFeePct: 2.5, deliveryCost: 25, targetMarginPct: 40 },
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

  // ── suppliers ───────────────────────────────────────────────────────────
  const suppliersData = [
    {
      name: 'Dubai Gold Souk Trading LLC', country: 'UAE', contact: '+971 50 000 0001',
      materialsSupplied: 'Silver 925, gold-plated items', moq: '10 pcs', deliveryCost: 0,
      leadTimeDays: 3, currency: 'AED', reliabilityScore: 5,
      qualityNotes: 'Consistent 925 stamping, hallmark certificates available',
    },
    {
      name: 'Guangzhou Silver Factory', country: 'China', contact: 'wechat: gzsilver',
      materialsSupplied: 'Silver 925, stainless steel 316L, chains', moq: '50 pcs', deliveryCost: 120,
      leadTimeDays: 14, currency: 'USD', reliabilityScore: 4,
      qualityNotes: 'Request assay report per batch; plating thickness varies',
    },
    {
      name: 'Istanbul Accessories Co', country: 'Türkiye', contact: '+90 500 000 0002',
      materialsSupplied: 'Gold-plated brass, crystals, gift boxes', moq: '30 pcs', deliveryCost: 80,
      leadTimeDays: 10, currency: 'USD', reliabilityScore: 4,
      qualityNotes: 'Good finishing; confirm nickel-free plating',
    },
  ];
  for (const s of suppliersData) {
    const existing = await prisma.supplier.findFirst({ where: { name: s.name } });
    if (!existing) await prisma.supplier.create({ data: s });
  }
  const dubaiSupplier = await prisma.supplier.findFirst({ where: { country: 'UAE' } });

  // ── sample products (costing sheets) ────────────────────────────────────
  const admin = await prisma.user.findUnique({ where: { email: 'admin@beyondstyle.ae' } });
  const products = [
    {
      sku: 'BS-NCK-925-001', name: 'Silver 925 Name Necklace', nameAr: 'سلسال فضة 925 بالاسم',
      category: 'NECKLACE', material: 'SILVER_925', purity: '925', weightGrams: 8,
      supplierQuote: 45, makingCharge: 25, chainCost: 0, engravingCost: 15,
      packagingCost: 10, deliveryCost: 25, paymentMethod: 'CARD', paymentFeePct: 2.5,
      marketingCost: 5, operationsCost: 50, vatMode: 'EXCLUSIVE', targetMarginPct: 40,
      approvalStatus: 'APPROVED', approvedPrice: 299,
    },
    {
      sku: 'BS-BRC-GPS-002', name: 'Gold-Plated Steel Bracelet', nameAr: 'أسوارة ستيل مطلية ذهب',
      category: 'BRACELET', material: 'GOLD_PLATED_STEEL',
      supplierQuote: 22, makingCharge: 0, platingCost: 15, claspCost: 3,
      packagingCost: 10, deliveryCost: 25, paymentMethod: 'COD',
      marketingCost: 8, operationsCost: 50, vatMode: 'EXCLUSIVE', targetMarginPct: 40,
      approvalStatus: 'APPROVED', approvedPrice: 199,
    },
    {
      sku: 'BS-EAR-316-003', name: 'Stainless Steel Earrings', nameAr: 'حلق ستانلس ستيل',
      category: 'EARRINGS', material: 'STAINLESS_316L',
      supplierQuote: 12, stoneCost: 6, packagingCost: 10, deliveryCost: 25,
      paymentMethod: 'ZIINA', paymentFeePct: 2.5, marketingCost: 5, operationsCost: 50,
      vatMode: 'EXCLUSIVE', targetMarginPct: 40, approvalStatus: 'PENDING',
    },
  ];
  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: { ...p, supplierId: dubaiSupplier?.id, createdById: admin?.id },
    });
  }

  console.log('✅ Seed complete.');
  console.log('   Logins: admin@beyondstyle.ae / Admin@123 · manager@… / Manager@123 · sales@… / Sales@123 · viewer@… / Viewer@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
