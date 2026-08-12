# wisal-cloud-api — WhatsApp Business Cloud API backend

باك-إند سيرفرلس (Vercel) بيبعت رسائل للعملاء عبر **WhatsApp Business Cloud API**
الرسمي من Meta — الطريق الوحيد المشروع للإرسال الآلي. مفيش أي توكن في الكود؛ كله من
متغيّرات البيئة.

> ⚠️ ده **مش** أداة بلاست لأرقام باردة. الاستخدام المشروع: (1) رد على عميل راسلك — نص
> حر خلال **24 ساعة** من آخر رسالة منه؛ (2) **قالب معتمد** من Meta لعملاء عملوا opt-in.
> الإرسال غير المرغوب بيخالف شروط Meta وبيوقّف رقمك.

## الملفات
- `api/send.js` — `POST /api/send` يبعت رسالة (نص أو قالب). محمي بـ `x-api-key`.
- `api/webhook.js` — `GET` تحقّق الاشتراك، `POST` استقبال الوارد + حالات التسليم.
- `lib/wa.js` — غلاف Graph API + `buildMessage` (نقي/مختبَر).
- `test/wa.test.js` — اختبارات بناء الرسالة (`npm test`).

## الإعداد على Meta (مرة واحدة)
1. [Meta for Developers](https://developers.facebook.com) → أنشئ App نوعه **Business**.
2. ضيف منتج **WhatsApp** → هتلاقي **Phone number ID** و**Access token** تجريبي.
3. للإنتاج: أنشئ **System User** توكن دائم بصلاحية `whatsapp_business_messaging`.
4. (اختياري) اعمل **Message Templates** واستنى اعتمادها للرسائل خارج الـ24 ساعة.

## متغيّرات البيئة
انسخ `.env.example` واملاه: `WHATSAPP_TOKEN`, `PHONE_NUMBER_ID`, `VERIFY_TOKEN`,
`APP_API_KEY`, `GRAPH_VERSION`.

## ✅ النشر الحالي (production)

الخدمة منشورة وشغّالة على:

- **Base URL:** `https://wisal-cloud-api.vercel.app`
- **Send:** `POST https://wisal-cloud-api.vercel.app/api/send`
- **Webhook:** `https://wisal-cloud-api.vercel.app/api/webhook`

اتحقق منها فعليًا بعد النشر: `GET /api/send` → 405، و`GET /api/webhook` بدون
باراميترات → 403 (يعني الدوال حيّة والحماية شغّالة). ناقص بس ظبط متغيّرات البيئة
في Vercel → Project → Settings → Environment Variables عشان الإرسال الفعلي يشتغل.

> ملاحظة تشغيلية: مشروع Vercel ده متظبّط عليه Output Directory = `.next`
> وRoot Directory = `public` (إعدادات قديمة من محاولة استيراد سابقة). النشر
> الحالي متوافق معاها: الملفات بتترفع تحت `public/` وأمر البناء بينشئ `.next`
> كمخرج ثابت. لو هتنضّف الإعدادات دي من الداشبورد لاحقًا، ارفع الملفات بدون
> البادئة `public/` وسيب أمر البناء echo بسيط.

## النشر (Vercel)
```bash
npm i -g vercel
cd wisal-cloud-api
vercel            # ربط المشروع
# حطّ المتغيّرات في Vercel → Project → Settings → Environment Variables
vercel --prod
```
بعد النشر:
- **Webhook URL:** `https://<your-app>.vercel.app/api/webhook` — حطّه في Meta →
  WhatsApp → Configuration، والـ **Verify token** = نفس `VERIFY_TOKEN`، واشترك في `messages`.
- **Send URL:** `https://<your-app>.vercel.app/api/send`.

## تجربة الإرسال
```bash
curl -X POST https://<your-app>.vercel.app/api/send \
  -H "x-api-key: $APP_API_KEY" -H "Content-Type: application/json" \
  -d '{"to":"9715XXXXXXXX","type":"text","text":"أهلاً 👋 وصلتني رسالتك"}'
```
قالب معتمد:
```bash
-d '{"to":"9715XXXXXXXX","type":"template","template":{"name":"hello_world","language":"en_US"}}'
```

## ربط تطبيق وصال (أندرويد) — الخطوة الجاية
التطبيق دلوقتي بيفتح واتساب بضغطة يدوية (آمن ومشروع بدون سيرفر). لما تنشر الباك-إند ده:
1. ضيف في إعدادات وصال: **Business API endpoint** + **APP_API_KEY**.
2. في «وضع الأعمال»، لما يكونوا متظبّطين، زر «🚀 ابعت عبر Business API» يعمل
   `POST /api/send` بدل فتح واتساب — إرسال آلي **مشروع** للعملاء المؤهّلين.

أقدر أعمل الربط ده كخطوة تانية بعد ما يكون عندك endpoint شغّال + رقم Meta موثّق.

## العقد (Contract) اللي التطبيق هينادي بيه
`POST /api/send` — Header: `x-api-key: <APP_API_KEY>` — Body:
```json
{ "to": "9715XXXXXXXX", "type": "text", "text": "..." }
```
الرد: `{ "ok": true, "id": "wamid...." }` أو `{ "ok": false, "error": "..." }`.
