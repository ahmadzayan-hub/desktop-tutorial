// Editorial journal entries for /journal.
// Each post carries an English body and an Arabic body written in natural
// UAE-appropriate register. Related product IDs point into src/data/products.

export type JournalPost = {
  slug: string;
  publishedAt: string; // ISO
  readMinutes: number;
  category: string;
  categoryAr: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  coverVariant: string; // maps to a ProductTile Variant for the cover art
  bodyEn: string; // markdown-ish plain text with blank-line paragraphs and single line "## Heading"
  bodyAr: string;
  relatedProductIds: string[];
};

export const JOURNAL: JournalPost[] = [
  {
    slug: "how-to-choose-a-bridal-bracelet-in-the-uae",
    publishedAt: "2026-04-12",
    readMinutes: 5,
    category: "Bridal",
    categoryAr: "زفاف",
    coverVariant: "name-bracelet",
    titleEn: "How to choose a bridal bracelet in the UAE",
    titleAr: "كيف تختار إسوارة العروس في الإمارات",
    excerptEn:
      "A short, practical guide to picking a bridal bracelet that fits your dress, your henna, and the wear-after-the-wedding life.",
    excerptAr:
      "دليل مختصر وعملي لاختيار إسوارة عروس تناسب فستانك وحفل الحنّاء، وتصلح للارتداء بعد الزواج أيضاً.",
    relatedProductIds: ["name-bracelet", "arabic-charm", "hamsa"],
    bodyEn: `A bridal bracelet is a keepsake more than an accessory. It shows up in the wedding photos, sits on the wrist during the henna night, and if you choose it well, becomes something you keep wearing after the last guest leaves.

Here is how our brides in Dubai, Abu Dhabi, Sharjah and Ajman usually approach it.

## Start with the dress

If the dress is white or ivory with a lot of embroidery, pick a slim bracelet in a warm gold tone. It photographs cleanly and never competes with the neckline.

If the dress is jewel-toned (emerald or navy is common in UAE weddings), a name plate reads beautifully in either English or Arabic script.

## Match the henna, not the trend

The henna night is where the bracelet lives closest to the story. Warm-gold pieces sit next to the henna colour. A single Hamsa charm layered on top of a name bracelet gives you the symbolism your family expects and the personal touch of a name.

## Think about what happens after the ceremony

The bracelet you love on the day is not always the bracelet you want to wear on a Tuesday afternoon. Choose a piece that will layer well with your daily bracelets. This is why our Personalised Name Bracelet is our most-requested piece for brides: it is quiet enough for daily wear and personal enough for the wedding album.

## Lead times matter

Made-to-order pieces take three to five days at Beyond Gallery, and we always PDF-proof the Arabic or English script before we start production. Send your WhatsApp order at least two weeks before the ceremony to leave room for delivery and a final adjustment.

## Common questions

**Should the bracelet match the earrings?** Not exactly. Same metal family, different weight. Earrings can be heavier if the neckline is bare.

**Is it acceptable to have two Arabic letters or a short name?** Yes. Up to fourteen characters fits comfortably on our name plate.

**Can we personalise gifts for the bridesmaids?** Yes, and this is where our Elegant Gift Box Set gets requested. Same finish, different names or letters.`,
    bodyAr: `إسوارة العروس تذكار أكثر منها إكسسواراً. تظهر في صور الزفاف، وترتديها ليلة الحنّاء، وإذا اخترتها جيداً تصير قطعة تلبسينها بعد رحيل آخر الضيوف.

هذه طريقة عرائسنا في دبي وأبوظبي والشارقة وعجمان في اختيار الإسوارة.

## ابدئي من الفستان

إذا كان الفستان أبيض أو عاجياً بتطريز كثيف، اختاري إسوارة رفيعة بلون ذهبي دافئ. تظهر بوضوح في الصور ولا تتنافس مع فتحة الرقبة.

إذا كان الفستان بلون جوهرة كالزمرّدي أو الكحلي، فإن لوحة الاسم تُقرأ بجمال سواء بالإنجليزية أو بالخط العربي.

## نسّقي مع الحنّاء لا مع الموضة

ليلة الحنّاء هي أقرب لحظة للإسوارة من قصّة العرس كلها. تظهر القطع الذهبية الدافئة بجانب لون الحنّاء. زخرفة كف واحدة فوق إسوارة الاسم تمنحك الرمزية التي تتوقّعها عائلتك واللمسة الشخصية للاسم.

## فكّري بما بعد الحفلة

الإسوارة التي تحبّينها يوم الزفاف ليست دائماً هي التي ستريدين ارتداءها يوم الثلاثاء. اختاري قطعة تتنسّق مع إسواراتك اليومية. لهذا فإن إسوارة الاسم المخصّصة هي الأكثر طلباً بين عرائسنا: هادئة تكفي للاستخدام اليومي، وشخصية بما يكفي لألبوم العرس.

## وقت التنفيذ مهم

القطع تحت الطلب تحتاج من ثلاثة إلى خمسة أيام لدى بيوند جاليري، ونرسل لك دائماً معاينة PDF للخط العربي أو الإنجليزي قبل بدء الإنتاج. أرسلي طلبك على واتساب قبل الحفلة بأسبوعين على الأقل لترك مساحة للتوصيل ولأي تعديل نهائي.

## أسئلة شائعة

**هل يجب أن تتطابق الإسوارة مع الأقراط؟** ليس تماماً. نفس عائلة المعدن بوزن مختلف. يمكن أن تكون الأقراط أثقل إذا كانت الرقبة مكشوفة.

**هل يمكن نقش حرفين عربيين أو اسم قصير؟** نعم. تتّسع لوحة الاسم لدينا حتى 14 حرفاً بشكل مريح.

**هل يمكن تخصيص هدايا لوصيفات العروس؟** نعم، وهنا يُطلب طقم صندوق الهدية الأنيق كثيراً. نفس التشطيب، وأسماء أو أحرف مختلفة.`,
  },
  {
    slug: "uae-guide-to-corporate-gifting-that-lands",
    publishedAt: "2026-05-03",
    readMinutes: 6,
    category: "Corporate",
    categoryAr: "شركات",
    coverVariant: "vip-box",
    titleEn: "A UAE guide to corporate gifting that lands",
    titleAr: "دليل الإمارات لهدايا الشركات التي تصل رسالتها",
    excerptEn:
      "How UAE procurement, marketing, and HR teams pick a gift that gets opened, remembered, and reused, not forgotten in a drawer.",
    excerptAr:
      "كيف يختار فريق المشتريات والتسويق والموارد البشرية في الإمارات هدية تُفتح وتُتذكّر ويُعاد استخدامها، لا هدية تُنسى في درج.",
    relatedProductIds: ["vip-box", "notebook", "pen", "mug"],
    bodyEn: `A corporate gift in the UAE works when three things line up. The recipient recognises the intent, the item earns a place in their daily life, and the package looks like a company that pays attention to detail.

## Anchor on the audience, then the budget

The mistake we see most often is picking a gift from the catalogue first and then trying to fit an audience to it. Start with a single sentence. Who is this for and what do you want them to feel when they open it.

For a UAE-based leadership team, the answer usually lands in the AED 200 to 400 per box range and the recipients are used to seeing branded work at that level. This is why our Premium and VIP packs are our most-requested tiers, because the packaging matches the expectation.

For a wider staff appreciation drop, the answer is often AED 30 to 60 per person and the win is a piece that quietly gets used every day. Our A5 Branded Notebook, Metal Gift Pen, and Ceramic Gift Mug all do that.

## Personalisation earns its cost

A branded pen costs the same to produce whether the branding is one colour or two. But a name on the box lid or a handwritten thank-you card changes the moment the box is opened. In our experience, per-person personalisation lifts the "actually reused" number more than a bigger overall budget does.

## Match the packaging to the occasion

- **Onboarding gifts.** Small, warm, easy to open on a Zoom call. Notebook, pen, keepsake.
- **Year-end appreciation.** Presentation matters. Rigid box, satin ribbon, thank-you card.
- **Client and government appreciation.** Restraint and quality. Ivory and gold, no over-branding.
- **Event giveaways.** Bulk, useful, brandable. Totes, mugs, notebooks.

## Delivery, invoicing, and PO

Procurement teams in the UAE ask three questions almost every time.

- Can you deliver by our internal deadline. For Premium tier orders under 100 pieces the answer is three to five business days. For VIP we ask for seven to ten.
- Is the VAT invoice correct with the recipient TRN. Yes, on request at order time.
- Can you accept a PO with payment on terms. Yes on the VIP tier.

## What we recommend

Start with a Premium pack sample, sent on WhatsApp with our latest catalogue PDF. See the box in your hand before you decide.`,
    bodyAr: `تنجح هدية الشركة في الإمارات عندما تتوافق ثلاثة أمور. أن يفهم المستلم القصد، وأن يستحقّ المنتج مكاناً في حياته اليومية، وأن يبدو التغليف من شركة تهتم بالتفاصيل.

## ابدأ بالجمهور ثم الميزانية

الخطأ الأكثر شيوعاً هو اختيار الهدية من الكتالوج أولاً ثم محاولة تفصيل الجمهور عليها. ابدأ بجملة واحدة. لمن هذه الهدية، وماذا تريد أن يشعر بها عند فتحها.

بالنسبة لفريق قيادة في الإمارات، تقع الإجابة عادةً في نطاق 200 إلى 400 درهم للصندوق، والمستلمون معتادون على رؤية شغل مطبوع بهذا المستوى. لذلك تظل باقتنا المميّزة وباقة VIP الأكثر طلباً، لأن التغليف يطابق التوقّع.

بالنسبة لتوزيعات تقدير الموظّفين على نطاق أوسع، تقع الإجابة عادةً في نطاق 30 إلى 60 درهماً للشخص، والنجاح هو قطعة تُستخدم يومياً بصمت. دفتر A5 مع الشعار، القلم المعدني، وكوب السيراميك، كلها تحقّق ذلك.

## التخصيص يستحقّ تكلفته

طباعة القلم بلون واحد أو لونين تكلّف نفس التكلفة تقريباً. لكن اسم المستلم على غطاء الصندوق أو بطاقة شكر مكتوبة بخط اليد تغيّر لحظة فتح الهدية. من واقع تجربتنا، التخصيص لكل شخص يرفع نسبة الاستخدام الفعلي أكثر ممّا ترفعه ميزانية أكبر بالكامل.

## طابق التغليف مع المناسبة

- **هدايا الانضمام.** صغيرة، دافئة، سهلة الفتح في اجتماع عن بُعد. دفتر، قلم، تذكار.
- **تقدير نهاية العام.** التقديم مهم. صندوق صلب، شريط ساتان، بطاقة شكر.
- **تقدير العملاء والجهات الحكومية.** الرقيّ والجودة. عاجي وذهبي، بدون مبالغة في العلامة.
- **توزيعات الفعاليات.** بالجملة، مفيدة، قابلة للتخصيص. حقائب، أكواب، دفاتر.

## التوصيل والفوترة وأوامر الشراء

يسأل فريق المشتريات في الإمارات ثلاثة أسئلة في كل مرّة تقريباً.

- هل يمكنكم التوصيل قبل الموعد الداخلي. للطلبات في الباقة المميّزة أقل من 100 قطعة، الإجابة من ثلاثة إلى خمسة أيام عمل. لباقة VIP نطلب سبعة إلى عشرة.
- هل الفاتورة الضريبية صحيحة مع الرقم الضريبي للمستلم. نعم، عند طلبها وقت تقديم الطلب.
- هل تقبلون أمر شراء مع دفع بشروط. نعم على باقة VIP.

## توصيتنا

ابدأ بعيّنة من الباقة المميّزة، تُرسل عبر واتساب مع أحدث كتالوج PDF. شاهد الصندوق في يدك قبل أن تقرّر.`,
  },
  {
    slug: "the-hamsa-symbolism-and-how-to-wear-it",
    publishedAt: "2026-05-24",
    readMinutes: 4,
    category: "Symbols",
    categoryAr: "رموز",
    coverVariant: "hamsa",
    titleEn: "The Hamsa: symbolism and how to wear it",
    titleAr: "الكف الحمساوي: الرمزية وكيفية ارتدائها",
    excerptEn:
      "A short read on where the Hamsa comes from, why it lives so comfortably in Gulf and Levantine wardrobes, and how to layer it without over-doing it.",
    excerptAr:
      "قراءة قصيرة عن أصل الكف الحمساوي، ولماذا يستقرّ بأناقة في خزانات الخليج والشام، وكيف تنسّقه دون مبالغة.",
    relatedProductIds: ["hamsa", "necklace", "arabic-charm"],
    bodyEn: `The Hamsa is one of the most recognised motifs in the Gulf and the Levant. Its meaning has been carried, quietly, across generations. Today it lives comfortably next to a Rolex on a Dubai wrist and next to a name plate in an Abu Dhabi office.

## Where it comes from

The Hamsa, also called the hand of Fatima or khamsa, appears across North African, Levantine and Gulf cultures. The five fingers are usually read as protection. In some traditions the middle finger stands for the person themselves, and the two on either side stand for guardianship.

A small eye placed in the centre of the palm shows up in older folk versions from the Levant, and today it reads as a design choice more than a religious one for many buyers.

## How to wear it

Two comfortable ways.

**As a single charm.** A single Hamsa on a slim gold-tone bracelet reads as a personal keepsake. This is the version we recommend for daily wear because it never feels overdressed.

**Layered with a name piece.** A Hamsa charm on top of a name bracelet is the combination our brides ask for on the henna night, and the one our regular customers reach for during Eid visits. The symbolism sits under the personal touch of the name.

## What we do at Beyond Gallery

Our Hamsa and Evil Eye Bracelet uses a hypoallergenic base with a warm gold-tone finish. The evil-eye centre is a single small stone, not a large focal piece, so it layers comfortably with the rest of your bracelets.

We ship it in the ivory sleeve, ready to gift. Free delivery on orders 300 AED and above, or 25 AED flat otherwise.`,
    bodyAr: `الكف الحمساوي من أكثر الرموز شهرةً في الخليج والشام. حمل معناه، بهدوء، عبر الأجيال. اليوم يستقرّ بأناقة إلى جانب ساعة رولكس على معصم في دبي، وإلى جانب لوحة اسم في مكتب في أبوظبي.

## من أين جاء

الكف الحمساوي، ويُعرف أيضاً بـ كف فاطمة أو الخمسة، يظهر في ثقافات شمال إفريقيا والشام والخليج. تُقرأ الأصابع الخمسة عادةً كرمز للحماية. في بعض التقاليد يمثّل الإصبع الأوسط الشخص ذاته، والاثنان على جانبيه يمثّلان الحماية.

العين الصغيرة الموضوعة في وسط الكف تظهر في نسخ فولكلورية قديمة من الشام، واليوم يقرؤها كثير من المشترين كخيار تصميمي أكثر منها رمزاً دينياً.

## كيف ترتديه

طريقتان مريحتان.

**كزخرفة منفردة.** كف واحد على إسوارة رفيعة بلون ذهبي دافئ يُقرأ كتذكار شخصي. هذه الطريقة نوصي بها للاستخدام اليومي لأنها لا تبدو مبالغة أبداً.

**منسّق مع قطعة تحمل اسماً.** كف حمساوي فوق إسوارة الاسم هو التنسيق الذي تطلبه عرائسنا في ليلة الحنّاء، وهو نفسه ما تختاره عميلاتنا الدائمات في زيارات العيد. تجلس الرمزية تحت اللمسة الشخصية للاسم.

## ما نقدّمه في بيوند جاليري

إسوارة الكف والعين لدينا تستخدم قاعدة مضادّة للحساسية بتشطيب ذهبي دافئ. العين الوسطية حجر صغير واحد، وليست قطعة محورية كبيرة، فتنسّق بسهولة مع باقي الإسوارات.

نشحنها داخل الجراب العاجي، جاهزة للإهداء. توصيل مجاني للطلبات 300 درهم فأكثر، أو 25 درهم للطلبات الأقل.`,
  },
];

export function getPost(slug: string): JournalPost | undefined {
  return JOURNAL.find((p) => p.slug === slug);
}
