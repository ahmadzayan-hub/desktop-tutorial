// Central product data. Server-safe (no client hooks). Imported by:
//   - page.tsx (the featured grid, search, filter, quick view)
//   - /product/[slug]/page.tsx (individual detail pages)
//   - /journal/[slug]/page.tsx ("related products" strip)
//
// The extended fields (longDescription, materials, care, giftBox) only exist
// for detail pages so the featured grid stays lightweight.

import type { Ribbon, Variant } from "../app/_components/ProductTile";
import type { QuickViewProduct } from "../app/_components/QuickView";

export type Category = "accessories" | "gifts" | "boards" | "corporate" | "lifestyle";
export type Stock = "in" | "made_to_order" | "bespoke";

export type Product = QuickViewProduct & {
  id: string;
  category: Category;
  stock: Stock;
  leadDays?: string;
  ribbon?: Ribbon;
  // Extended fields for detail pages.
  longDescriptionEn?: string;
  longDescriptionAr?: string;
  materialsEn?: string;
  materialsAr?: string;
  careEn?: string;
  careAr?: string;
  giftBoxEn?: string;
  giftBoxAr?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "arabic-charm",
    name: "Arabic Charm Bracelet",
    nameAr: "إسوارة بأحرف عربية",
    benefit: "Personalise with Arabic letters or name.",
    benefitAr: "خصّصها بأحرف أو اسم عربي.",
    price: "AED 65",
    variant: "arabic-bracelet",
    category: "accessories",
    stock: "in",
    ribbon: "bestseller",
    longDescriptionEn:
      "Our most requested bracelet. Wear an Arabic letter, initial or short name in a clean Kufic script on a hypoallergenic band. Ready to gift in a slim ivory sleeve.",
    longDescriptionAr:
      "الإسوارة الأكثر طلباً لدينا. حرف عربي أو اسم قصير بخط كوفي واضح على سوار مضاد للحساسية. مغلّفة داخل جراب عاجي أنيق جاهز للإهداء.",
    materialsEn: "Stainless steel base with gold-tone plating. Nickel-free, sweat-safe.",
    materialsAr: "قاعدة ستانلس ستيل مع طلاء ذهبي اللون. خالٍ من النيكل، آمن مع العرق.",
    careEn: "Wipe with a soft dry cloth. Avoid perfume or lotion contact for the first hour after wearing.",
    careAr: "امسحها بقطعة قماش ناعمة وجافّة. تجنّب ملامسة العطر أو المرطّب في الساعة الأولى بعد الارتداء.",
    giftBoxEn: "Ships in the signature ivory sleeve at no extra cost.",
    giftBoxAr: "تُشحن داخل الجراب العاجي الخاص بنا بدون تكلفة إضافية.",
  },
  {
    id: "name-bracelet",
    name: "Personalised Name Bracelet",
    nameAr: "إسوارة الاسم",
    benefit: "Custom name in English or Arabic.",
    benefitAr: "اسم مخصّص بالعربية أو الإنجليزية.",
    price: "AED 75",
    variant: "name-bracelet",
    category: "gifts",
    stock: "made_to_order",
    leadDays: "3 to 5 days",
    ribbon: "custom",
    longDescriptionEn:
      "A slim name plate in your chosen finish (gold, emerald or navy). Up to 14 characters in English or Arabic. A quiet, personal piece that reads as everyday wear.",
    longDescriptionAr:
      "لوحة اسم رفيعة باللون الذي تختاره: ذهبي أو زمرّدي أو كحلي. تتّسع حتى 14 حرفاً بالإنجليزية أو العربية. قطعة هادئة وشخصية تصلح للاستخدام اليومي.",
    materialsEn: "Stainless steel plate with brushed finish. Adjustable clasp fits 15 to 20 cm wrists.",
    materialsAr: "لوحة ستانلس ستيل بتشطيب مصقول. مشبك قابل للتعديل يناسب مقاسات الرسغ من 15 إلى 20 سم.",
    careEn: "Store away from other jewellery to avoid scratches. Rinse and pat dry after a swim.",
    careAr: "احفظها بعيداً عن باقي المجوهرات لتجنّب الخدوش. اشطفها وجفّفها بلطف بعد السباحة.",
    giftBoxEn: "Presented in a stitched ivory pouch with a small thank-you card.",
    giftBoxAr: "تقدَّم داخل جراب عاجي مخيّط مع بطاقة شكر صغيرة.",
  },
  {
    id: "hamsa",
    name: "Hamsa and Evil Eye Bracelet",
    nameAr: "إسوارة الكف والعين",
    benefit: "Symbolic everyday wear.",
    benefitAr: "رمزية للارتداء اليومي.",
    price: "AED 55",
    variant: "hamsa",
    category: "accessories",
    stock: "in",
    longDescriptionEn:
      "Two of the most recognised Levantine and Gulf motifs on one wrist. The Hamsa hand with a small evil-eye centre, sized to layer well with other bracelets.",
    longDescriptionAr:
      "أكثر رمزَين معروفين في الخليج والشام على معصم واحد. الكف الحمساوي مع عين وسطية صغيرة، بمقاس مناسب للتنسيق مع باقي الإسوارات.",
    materialsEn: "Gold-tone stainless steel charm on a satin cord.",
    materialsAr: "زخرفة من الستانلس ستيل بلون ذهبي على خيط ساتان.",
    careEn: "Keep dry when possible. Wipe with a dry cloth after use.",
    careAr: "أبقها جافّة قدر الإمكان. امسحها بقماش جاف بعد الاستخدام.",
    giftBoxEn: "Ivory sleeve, ready to gift.",
    giftBoxAr: "جراب عاجي، جاهز للإهداء.",
  },
  {
    id: "necklace",
    name: "Premium Necklace Set",
    nameAr: "طقم قلائد فاخر",
    benefit: "Elegant pendant and chain set.",
    benefitAr: "طقم قلادة بسلسلة أنيقة.",
    price: "AED 145",
    variant: "necklace",
    category: "accessories",
    stock: "in",
    ribbon: "new",
    longDescriptionEn:
      "A refined pendant on a 45 cm chain, chosen to sit at the collarbone. Ships polished with a soft cloth for touch-ups.",
    longDescriptionAr:
      "قلادة راقية بسلسلة 45 سم مصمّمة لتستقرّ عند عظم الترقوة. تُشحن مصقولة مع قطعة قماش ناعمة للتلميع.",
    materialsEn: "Gold-tone stainless steel with a diamond-cut pendant.",
    materialsAr: "ستانلس ستيل بلون ذهبي مع قلادة مقطوعة بحواف الماس.",
    careEn: "Store flat in the pouch. Avoid perfume on the pendant.",
    careAr: "احفظها مسطّحة داخل الجراب. تجنّب رشّ العطر على القلادة.",
    giftBoxEn: "Comes in the Beyond Gallery ivory gift box.",
    giftBoxAr: "تصل داخل صندوق هدية بيوند جاليري العاجي.",
  },
  {
    id: "gift-box",
    name: "Elegant Gift Box Set",
    nameAr: "طقم صندوق هدية أنيق",
    benefit: "Ready to gift packaging.",
    benefitAr: "تغليف جاهز للإهداء.",
    price: "AED 120",
    variant: "gift-box",
    category: "gifts",
    stock: "in",
    ribbon: "bestseller",
    longDescriptionEn:
      "A curated bracelet plus a small keepsake inside a rigid magnetic-closure box. Choose from three colourways at checkout on WhatsApp.",
    longDescriptionAr:
      "إسوارة مختارة مع تذكار صغير داخل صندوق صلب بإغلاق مغناطيسي. اختر من ثلاث تدرّجات لونية عند التأكيد عبر واتساب.",
    materialsEn: "Rigid paperboard with satin lining. Contents vary by colour.",
    materialsAr: "ورق مقوّى صلب مع بطانة ساتان. المحتويات تتغيّر حسب اللون.",
    careEn: "Keep the box away from direct heat to preserve the finish.",
    careAr: "احفظ الصندوق بعيداً عن الحرارة المباشرة للحفاظ على المظهر.",
    giftBoxEn: "The box is the packaging. Ships tied with a satin ribbon.",
    giftBoxAr: "الصندوق نفسه هو التغليف. يُشحن مربوطاً بشريط ساتان.",
  },
  {
    id: "drawing-board",
    name: "Creative Drawing Board",
    nameAr: "لوحة رسم إبداعية",
    benefit: "Reusable, ideal for kids and students.",
    benefitAr: "قابلة لإعادة الاستخدام للأطفال والطلاب.",
    price: "AED 89",
    variant: "drawing-board",
    category: "boards",
    stock: "in",
    longDescriptionEn:
      "A reusable board with a wipe-clean surface. A single page can be re-drawn thousands of times, so it saves paper and travels well for restaurants, flights and study time.",
    longDescriptionAr:
      "لوحة قابلة لإعادة الاستخدام بسطح يمسح بسهولة. يمكن إعادة الرسم على الصفحة الواحدة آلاف المرّات، تحفظ الورق، ومناسبة للسفر والمطاعم والمذاكرة.",
    materialsEn: "ABS plastic frame with LCD reactive surface. Comes with a stylus.",
    materialsAr: "إطار من بلاستيك ABS مع سطح LCD تفاعلي. يأتي مع قلم.",
    careEn: "Wipe the surface with a dry cloth. Do not press with sharp objects.",
    careAr: "امسح السطح بقماش جاف. لا تضغط بأدوات حادّة.",
    giftBoxEn: "Ships in the original branded box.",
    giftBoxAr: "تُشحن في العلبة الأصلية للماركة.",
  },
  {
    id: "notebook",
    name: "A5 Branded Notebook",
    nameAr: "دفتر A5 مع الشعار",
    benefit: "Hardcover with brand printing option.",
    benefitAr: "غلاف فاخر مع خيار طباعة الشعار.",
    price: "AED 35",
    variant: "notebook",
    category: "corporate",
    stock: "made_to_order",
    leadDays: "5 to 7 days",
    ribbon: "custom",
    longDescriptionEn:
      "A5 hardcover notebook with 200 pages of premium off-white paper. Add your team's logo in one or two colours for orders of 25 pieces and above.",
    longDescriptionAr:
      "دفتر A5 بغلاف صلب و200 صفحة من الورق العاجي الفاخر. يمكن إضافة شعار فريقك بلون أو لونين للطلبات من 25 قطعة فأكثر.",
    materialsEn: "Hardcover cloth binding, 90 gsm paper, ribbon marker.",
    materialsAr: "غلاف صلب من القماش، ورق 90 غ/م²، فاصل شريطي.",
    careEn: "Store upright. Keep away from water and direct sunlight.",
    careAr: "احفظه بشكل عمودي. أبقه بعيداً عن الماء وأشعة الشمس المباشرة.",
    giftBoxEn: "Individually shrink-wrapped, bulk-packed by 25.",
    giftBoxAr: "كل قطعة مغلّفة بغلاف حراري وتُعبّأ بالجملة كل 25 قطعة.",
  },
  {
    id: "pen",
    name: "Metal Gift Pen",
    nameAr: "قلم معدني للهدايا",
    benefit: "Smooth writing, gift ready.",
    benefitAr: "كتابة سلسة وجاهز للإهداء.",
    price: "AED 25",
    variant: "pen",
    category: "corporate",
    stock: "in",
    longDescriptionEn:
      "A weighted metal ballpoint with a smooth click and long-life ink cartridge. Refillable, so employees keep using it.",
    longDescriptionAr:
      "قلم حبر جاف معدني بوزن مريح ونقرة سلسة وخرطوشة حبر طويلة العمر. قابل لإعادة التعبئة ليستمر الموظّفون في استخدامه.",
    materialsEn: "Aluminium body with anti-fingerprint finish. Refillable ink cartridge.",
    materialsAr: "جسم من الألمنيوم بطلاء مقاوم لبصمات الأصابع. خرطوشة حبر قابلة لإعادة التعبئة.",
    careEn: "Cap the tip when not in use. Store nib-up to prevent leakage.",
    careAr: "غطِّ رأس القلم عند عدم الاستخدام. احفظه رأساً لأعلى لمنع التسريب.",
    giftBoxEn: "Individually sleeved and gift-ready.",
    giftBoxAr: "كل قلم داخل جراب فردي وجاهز للإهداء.",
  },
  {
    id: "tote",
    name: "Canvas Gift Tote Bag",
    nameAr: "حقيبة قماشية",
    benefit: "Reusable canvas tote with logo option.",
    benefitAr: "حقيبة قابلة لإعادة الاستخدام مع خيار الشعار.",
    price: "AED 30",
    variant: "tote",
    category: "corporate",
    stock: "in",
    longDescriptionEn:
      "A sturdy 12 oz canvas tote sized for a laptop, notebook and a water bottle. Screen-print your logo on one or two sides.",
    longDescriptionAr:
      "حقيبة قماشية متينة بوزن 12 أونصة بمقاس يستوعب اللابتوب، الدفتر، وقارورة ماء. يمكن طباعة شعارك على وجه أو وجهين بالسلك سكرين.",
    materialsEn: "12 oz cotton canvas, reinforced handles, boxed bottom.",
    materialsAr: "قطن كانفس 12 أونصة، مقابض معزّزة، قاع مربّع.",
    careEn: "Machine wash cold, air dry. Do not tumble dry the print.",
    careAr: "يُغسل في الغسّالة بماء بارد ويُجفّف في الهواء. تجنّب المجفّف على الطباعة.",
    giftBoxEn: "Folded flat with the printed side facing out.",
    giftBoxAr: "تُطوى بشكل مسطّح مع إظهار الجهة المطبوعة.",
  },
  {
    id: "mug",
    name: "Ceramic Gift Mug",
    nameAr: "كوب سيراميك",
    benefit: "Ideal for offices and giveaways.",
    benefitAr: "مناسب للمكاتب والفعاليات.",
    price: "AED 28",
    variant: "mug",
    category: "corporate",
    stock: "in",
    ribbon: "new",
    longDescriptionEn:
      "A 350 ml matte-glazed ceramic mug that holds heat well. Comfortable handle sized for full-hand grip. Full-colour logo printing available in bulk.",
    longDescriptionAr:
      "كوب سيراميك بطلاء مطفي بسعة 350 مل يحتفظ بالحرارة جيداً. مقبض مريح بمقاس يناسب اليد بالكامل. طباعة شعار بالألوان الكاملة متاحة للجملة.",
    materialsEn: "Stoneware ceramic, dishwasher safe, microwave safe.",
    materialsAr: "سيراميك ستون وير، آمن في غسالة الأطباق، وآمن في الميكروويف.",
    careEn: "Hand wash for the first week to protect the print.",
    careAr: "اغسله يدوياً في الأسبوع الأول للحفاظ على الطباعة.",
    giftBoxEn: "Boxed individually with protective inserts.",
    giftBoxAr: "معبّأ فردياً داخل صندوق مع حشوة حماية.",
  },
  {
    id: "vip-box",
    name: "Corporate VIP Gift Pack",
    nameAr: "طقم هدايا مميّز للشركات",
    benefit: "Curated executive presentation.",
    benefitAr: "تشكيلة تنفيذية مختارة.",
    price: "AED 250",
    variant: "vip-box",
    category: "corporate",
    stock: "bespoke",
    leadDays: "7 to 10 days",
    ribbon: "limited",
    longDescriptionEn:
      "A curated presentation for leadership gifts and key clients. Includes the branded notebook, metal pen, a small keepsake and a handwritten thank-you card, all inside a rigid ivory-and-gold box.",
    longDescriptionAr:
      "تشكيلة مختارة لهدايا القيادة والعملاء الرئيسيين. تضمّ الدفتر مع الشعار، القلم المعدني، تذكاراً صغيراً، وبطاقة شكر مكتوبة بخط اليد، داخل صندوق صلب بلونين عاجي وذهبي.",
    materialsEn: "Rigid paperboard box with gold foil accents. Contents vary by brief.",
    materialsAr: "صندوق ورق مقوّى صلب مع لمسات فويل ذهبي. المحتويات تتغيّر حسب الطلب.",
    careEn: "Keep the box away from humidity to preserve the foil finish.",
    careAr: "احفظ الصندوق بعيداً عن الرطوبة للحفاظ على الفويل الذهبي.",
    giftBoxEn: "The box is the presentation. Ships tied with a satin ribbon.",
    giftBoxAr: "الصندوق نفسه هو التقديم. يُشحن مربوطاً بشريط ساتان.",
  },
  {
    id: "desk-decor",
    name: "Lifestyle Desk Decor",
    nameAr: "ديكور مكتب",
    benefit: "Charming desk accents.",
    benefitAr: "لمسات أنيقة للمكتب.",
    price: "AED 95",
    variant: "desk-decor",
    category: "lifestyle",
    stock: "in",
    longDescriptionEn:
      "A trio of desk accents in complementary colours: a small tray, a card holder, and a slim vertical stand. Weighted bases stay put.",
    longDescriptionAr:
      "ثلاثية من لمسات المكتب بألوان منسّقة: صينية صغيرة، حامل بطاقات، وحامل عمودي رفيع. قواعد بأوزان ثابتة لا تتحرك.",
    materialsEn: "Powder-coated metal with felt bases. Nickel-free finishes.",
    materialsAr: "معدن مطلي بالبودر مع قواعد لباد. طلاءات خالية من النيكل.",
    careEn: "Wipe with a soft dry cloth. Avoid abrasive cleaners.",
    careAr: "امسحه بقطعة قماش ناعمة وجافّة. تجنّب المنظّفات الكاشطة.",
    giftBoxEn: "Ships in a slim box, nested for safe transit.",
    giftBoxAr: "يُشحن في صندوق رفيع مع تعبئة لضمان النقل الآمن.",
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === slug);
}

export function relatedProducts(slug: string, count = 4): Product[] {
  const p = getProduct(slug);
  if (!p) return PRODUCTS.slice(0, count);
  const sameCategory = PRODUCTS.filter((x) => x.id !== slug && x.category === p.category);
  const others = PRODUCTS.filter((x) => x.id !== slug && x.category !== p.category);
  return [...sameCategory, ...others].slice(0, count);
}

export const FILTER_TABS: { key: Category | "all"; en: string; ar: string }[] = [
  { key: "all", en: "All", ar: "الكل" },
  { key: "accessories", en: "Accessories", ar: "إكسسوارات" },
  { key: "gifts", en: "Gifts", ar: "هدايا" },
  { key: "boards", en: "Boards", ar: "لوحات" },
  { key: "corporate", en: "Corporate", ar: "شركات" },
  { key: "lifestyle", en: "Lifestyle", ar: "أسلوب حياة" },
];
