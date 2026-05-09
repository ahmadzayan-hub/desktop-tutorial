/**
 * PresentIQ — bilingual (EN/AR) translations.
 *
 * Used by the i18n provider; keys are flat for ergonomics.
 * Add new keys at the bottom and translate both columns.
 */

export type Lang = "en" | "ar";

export const TRANSLATIONS = {
  // ─── Brand / nav ─────────────────────────────────────────────
  "brand.name":           { en: "PresentIQ",                          ar: "PresentIQ" },
  "brand.tagline":        { en: "Boardroom-ready presentations",      ar: "عروض جاهزة لمجلس الإدارة" },
  "nav.dashboard":        { en: "Dashboard",                           ar: "لوحة التحكم" },
  "nav.projects":         { en: "Projects",                            ar: "المشاريع" },
  "nav.templates":        { en: "Templates",                           ar: "القوالب" },
  "nav.brandkits":        { en: "Brand Kits",                          ar: "هويات العلامة" },
  "nav.admin":            { en: "Admin",                               ar: "الإدارة" },
  "nav.billing":          { en: "Billing",                             ar: "الفوترة" },
  "nav.contact":          { en: "Contact",                             ar: "تواصل" },
  "nav.changelog":        { en: "What's new",                          ar: "الجديد" },
  "nav.new":              { en: "New presentation",                    ar: "عرض جديد" },
  "nav.lang":             { en: "العربية",                              ar: "English" },

  // ─── Landing ─────────────────────────────────────────────────
  "land.pill":            { en: "v0.2 · AI Agent Platform · Editable PPTX · Bilingual RTL",
                            ar: "الإصدار ٠٫٢ · منصة وكلاء ذكاء اصطناعي · PPTX قابلة للتحرير · ثنائية اللغة" },
  "land.h1":              { en: "From raw content to boardroom-ready presentation in minutes.",
                            ar: "من المحتوى الخام إلى عرض تقديمي جاهز لمجلس الإدارة في دقائق." },
  "land.lede":            { en: "PresentIQ is an agentic workflow combining brand governance, evidence-controlled generation, editable PPTX rendering, full Arabic-RTL, and a 10-dimension quality score — enforced automatically.",
                            ar: "منصة PresentIQ هي تدفّق ذكي متعدد الوكلاء يجمع بين حوكمة الهوية، التحقّق من الأدلة، إنتاج ملفات PPTX قابلة للتحرير، دعم كامل للعربية وRTL، ودرجة جودة من ١٠ أبعاد — يُطبَّق تلقائياً." },
  "land.cta.start":       { en: "Start a presentation",                ar: "ابدأ عرضاً جديداً" },
  "land.cta.dashboard":   { en: "Open dashboard",                      ar: "افتح لوحة التحكم" },
  "land.cta.contact":     { en: "Talk to us",                          ar: "تواصل معنا" },

  // ─── Feature cards ───────────────────────────────────────────
  "feat.brand.title":     { en: "Brand Governance",                    ar: "حوكمة الهوية" },
  "feat.brand.body":      { en: "Logos, fonts, colors, terminology, density and tone enforced before any visual is rendered.",
                            ar: "الشعارات والخطوط والألوان والمصطلحات والكثافة والنبرة، يُطبَّق ضبطها قبل أي عرض مرئي." },
  "feat.evidence.title":  { en: "Evidence-Controlled",                 ar: "إدارة بالأدلّة" },
  "feat.evidence.body":   { en: "Every claim is classified — fact, assessment, estimate, or input required. We don't invent figures.",
                            ar: "كل ادعاء مُصنَّف: حقيقة، تقدير، تقييم، أو يحتاج مدخلات. لا نختلق الأرقام." },
  "feat.pptx.title":      { en: "Editable PPTX",                       ar: "PPTX قابل للتحرير" },
  "feat.pptx.body":       { en: "Real text boxes, shapes, charts, tables, masters and speaker notes — not screenshots.",
                            ar: "مربعات نصّ، أشكال، مخططات، جداول، قوالب رئيسية وملاحظات المتحدث — وليست صوراً." },
  "feat.rtl.title":       { en: "Arabic & RTL",                         ar: "العربية وRTL" },
  "feat.rtl.body":        { en: "Bilingual layouts, mirrored diagrams, formal corporate Arabic. UAE government-ready.",
                            ar: "تخطيطات ثنائية اللغة، مخططات معكوسة، عربية مؤسسية رسمية. جاهزة للقطاع الحكومي الإماراتي." },
  "feat.quality.title":   { en: "Boardroom Readiness",                 ar: "جاهزية مجلس الإدارة" },
  "feat.quality.body":    { en: "10-dimension quality score with recommendations. Know if it's ready for the CEO.",
                            ar: "درجة جودة من ١٠ أبعاد مع توصيات. اعرف إن كان جاهزاً للرئيس التنفيذي." },
  "feat.regen.title":     { en: "Slide-level Regeneration",             ar: "إعادة توليد على مستوى الشريحة" },
  "feat.regen.body":      { en: "Edit one slide without regenerating the deck. Lock approved slides. Audit everything.",
                            ar: "حرّر شريحة واحدة دون إعادة توليد العرض كاملاً. اقفل الشرائح المعتمدة. سجّل كل شيء." },

  // ─── New v0.2 differentiators ───────────────────────────────
  "v2.title":             { en: "What's new in v0.2",                  ar: "الجديد في الإصدار ٠٫٢" },
  "v2.outline":           { en: "Outline editor — sketch the deck before generation",
                            ar: "محرّر المخطّط — اكتب الهيكل قبل التوليد" },
  "v2.theme":             { en: "Live theme picker with the new Pine palette",
                            ar: "اختيار حيّ للسمة بألوان Pine الجديدة" },
  "v2.share":             { en: "View-only shareable links (no login required)",
                            ar: "روابط مشاركة للعرض فقط (دون تسجيل دخول)" },
  "v2.compare":           { en: "Version compare — see what changed slide-by-slide",
                            ar: "مقارنة النسخ — اعرف ما تغيّر شريحةً بشريحة" },
  "v2.assets":            { en: "Stock images + icon library inside the editor",
                            ar: "صور ومكتبة أيقونات داخل المحرّر" },
  "v2.demo":              { en: "Demo mode — no signup needed for trial",
                            ar: "وضع التجربة — دون تسجيل" },

  // ─── Wizard ──────────────────────────────────────────────────
  "wiz.steps.mode":       { en: "Mode",                                ar: "النمط" },
  "wiz.steps.brief":      { en: "Brief",                               ar: "الموجز" },
  "wiz.steps.sources":    { en: "Sources",                             ar: "المصادر" },
  "wiz.steps.brand":      { en: "Brand",                               ar: "الهوية" },
  "wiz.steps.outline":    { en: "Outline",                             ar: "المخطّط" },
  "wiz.steps.generate":   { en: "Generate",                            ar: "توليد" },
  "wiz.steps.done":       { en: "Done",                                ar: "اكتمل" },
  "wiz.title":            { en: "Title",                               ar: "العنوان" },
  "wiz.audience":         { en: "Audience",                            ar: "الجمهور" },
  "wiz.objective":        { en: "Objective",                           ar: "الهدف" },
  "wiz.decision":         { en: "Decision required",                   ar: "القرار المطلوب" },
  "wiz.language":         { en: "Language",                            ar: "اللغة" },
  "wiz.lang.en":          { en: "English",                             ar: "إنجليزية" },
  "wiz.lang.ar":          { en: "Arabic",                              ar: "عربية" },
  "wiz.lang.bi":          { en: "Bilingual",                           ar: "ثنائية اللغة" },
  "wiz.slides":           { en: "Slide count",                         ar: "عدد الشرائح" },
  "wiz.duration":         { en: "Duration (min)",                      ar: "المدة (دقيقة)" },
  "wiz.confidentiality":  { en: "Confidentiality",                     ar: "السرّية" },
  "wiz.back":             { en: "Back",                                ar: "السابق" },
  "wiz.continue":         { en: "Continue",                            ar: "متابعة" },
  "wiz.skip":             { en: "Skip",                                ar: "تخطّي" },
  "wiz.create":           { en: "Create project",                      ar: "إنشاء مشروع" },
  "wiz.creating":         { en: "Creating…",                           ar: "جارٍ الإنشاء…" },
  "wiz.generating":       { en: "Generating…",                         ar: "جارٍ التوليد…" },
  "wiz.gen.outline":      { en: "Generate outline",                    ar: "توليد المخطّط" },
  "wiz.gen.deck":         { en: "Generate deck",                       ar: "توليد العرض" },
  "wiz.upload":           { en: "Upload sources (PDF, DOCX, PPTX, XLSX, CSV, TXT)",
                            ar: "ارفع المصادر (PDF, DOCX, PPTX, XLSX, CSV, TXT)" },
  "wiz.brand.note":       { en: "The organisation's default brand kit will be used. Manage custom kits under Brand Kits.",
                            ar: "سيُستخدم كيت الهوية الافتراضي للمنظمة. يمكنك إدارة الكيتات من قسم هويات العلامة." },
  "wiz.outline.note":     { en: "PresentIQ runs Intake → Evidence → Strategy → Storytelling → Slide Architect to produce a blueprint you can review.",
                            ar: "تنفّذ PresentIQ سلسلة الاستلام ← الأدلة ← الاستراتيجية ← السرد ← مهندس الشرائح لإنتاج مخطّط يمكنك مراجعته." },
  "wiz.deck.note":        { en: "Now PresentIQ runs Copywriter → Visual → Data Viz → RTL → Translation → QA → Renderer.",
                            ar: "تنفّذ PresentIQ الآن: المحرّر ← التصميم ← البيانات ← RTL ← الترجمة ← الجودة ← الإخراج." },
  "wiz.error":            { en: "Something went wrong",                ar: "حدث خطأ" },

  // ─── Dashboard ───────────────────────────────────────────────
  "dash.title":           { en: "Dashboard",                            ar: "لوحة التحكم" },
  "dash.lede":            { en: "Recent presentations and quick actions.", ar: "أحدث العروض وإجراءات سريعة." },
  "dash.kpi.decks":       { en: "Boardroom decks YTD",                  ar: "العروض هذا العام" },
  "dash.kpi.compliance":  { en: "Brand compliance",                     ar: "التزام الهوية" },
  "dash.kpi.readiness":   { en: "Avg readiness",                        ar: "متوسط الجاهزية" },
  "dash.recent":          { en: "Recent projects",                      ar: "المشاريع الأخيرة" },
  "dash.recent.lede":     { en: "Your most recent work",                ar: "أحدث أعمالك" },
  "dash.empty":           { en: "No projects yet.",                     ar: "لا توجد مشاريع بعد." },
  "dash.empty.cta":       { en: "Create your first",                    ar: "أنشئ أوّل عرض" },

  // ─── Projects list ───────────────────────────────────────────
  "proj.title":           { en: "Projects",                             ar: "المشاريع" },
  "proj.col.title":       { en: "Title",                                ar: "العنوان" },
  "proj.col.mode":        { en: "Mode",                                 ar: "النمط" },
  "proj.col.lang":        { en: "Language",                             ar: "اللغة" },
  "proj.col.status":      { en: "Status",                               ar: "الحالة" },
  "proj.col.updated":     { en: "Updated",                              ar: "آخر تحديث" },

  // ─── Brand kits ──────────────────────────────────────────────
  "bk.title":             { en: "Brand Kits",                            ar: "هويات العلامة" },
  "bk.new":               { en: "New brand kit",                         ar: "هوية جديدة" },
  "bk.empty":             { en: "No kits yet.",                          ar: "لا توجد هويات بعد." },

  // ─── Templates ───────────────────────────────────────────────
  "tpl.title":            { en: "Templates",                             ar: "القوالب" },
  "tpl.lede":             { en: "Curated boardroom blueprints. Click to start a presentation from a template.",
                            ar: "مخططات معتمدة لمجلس الإدارة. انقر على القالب لبدء عرض منه." },
  "tpl.use":              { en: "Use template",                          ar: "استخدم القالب" },

  // ─── Contact ─────────────────────────────────────────────────
  "ctc.title":            { en: "Talk to us about your trial",            ar: "تواصل معنا بشأن تجربتك" },
  "ctc.lede":             { en: "Send improvement ideas, bug reports, or request a tailored boardroom demo. Founder responds personally.",
                            ar: "أرسل مقترحات التحسين، البلاغات، أو اطلب عرضاً تجريبياً مخصصاً. يردّ المؤسس شخصياً." },
  "ctc.email":            { en: "Email Ahmad",                           ar: "راسل أحمد عبر البريد" },
  "ctc.subject":          { en: "Subject",                                ar: "الموضوع" },
  "ctc.message":          { en: "Message",                                ar: "الرسالة" },
  "ctc.your_email":       { en: "Your email",                             ar: "بريدك الإلكتروني" },
  "ctc.send":             { en: "Send feedback",                          ar: "أرسل" },
  "ctc.sending":          { en: "Sending…",                               ar: "جارٍ الإرسال…" },
  "ctc.sent":             { en: "Thanks — we received your message and will reply soon.",
                            ar: "شكراً — تم استلام رسالتك وسنردّ قريباً." },

  // ─── Footer ──────────────────────────────────────────────────
  "foot.line":            { en: "Built in the UAE · Made for boardrooms · ",
                            ar: "صُمّم في الإمارات · للقرارات التنفيذية · " },

  // ─── Common ──────────────────────────────────────────────────
  "common.demo":          { en: "Demo mode",                              ar: "وضع تجربة" },
  "common.coming_soon":   { en: "Coming soon",                            ar: "قريباً" },
} as const;

export type TKey = keyof typeof TRANSLATIONS;

export function t(key: TKey, lang: Lang): string {
  const entry = TRANSLATIONS[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en;
}
