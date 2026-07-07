# وصال، موقع الهبوط والتحميل (wisal-web)

موقع تعريفي وتحميل لتطبيق **وصال**، مبني بشكل **mobile first**، عربي بالكامل مع
دعم **RTL**، وصفحة واحدة سريعة بدون أي طلبات خارجية (CSS و SVG داخل الصفحة).

## المميزات التقنية
- **SEO**: عنوان ووصف وكلمات مفتاحية، وسوم Open Graph و Twitter، رابط canonical،
  خريطة موقع `sitemap.xml`، ملف `robots.txt`.
- **AIO** (تهيئة لمحركات الذكاء الاصطناعي): ملف `llms.txt` وبيانات منظّمة
  JSON-LD من نوعي `SoftwareApplication` و `FAQPage`.
- **الأداء**: صفحة واحدة، CSS مضمّن، خطوط النظام، وأيقونة SVG خفيفة.
- **PWA**: ملف `manifest.webmanifest` مع ثيم ولون خلفية.

## النشر على Vercel (مشروع منفصل)
الموقع يعمل كمشروع Vercel مستقل تماماً عن باقي الريبو:

1. من لوحة Vercel: **New Project** واختر ريبو `desktop-tutorial`.
2. في إعدادات المشروع اضبط **Root Directory** على `wisal-web`.
3. **Framework Preset**: Other (موقع ثابت). لا يوجد أمر بناء.
4. Deploy. هيطلع لك رابط زي `https://wisal-app.vercel.app`.

> بعد النشر، حدّث الروابط في `index.html` و `sitemap.xml` و `robots.txt`
> بعنوان نطاقك الفعلي.

## رابط التحميل
زر التحميل يشير إلى أحدث نسخة APK من إصدارات GitHub:
`releases/download/android-latest/wisal.apk`

## التطوير محلياً
أي خادم ثابت يكفي، مثال:

```bash
cd wisal-web
python3 -m http.server 8080
# افتح http://localhost:8080
```
