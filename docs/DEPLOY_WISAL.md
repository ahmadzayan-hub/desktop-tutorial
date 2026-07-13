# 🚀 دليل نشر وصال (Play + Vercel)

الكود جاهز بالكامل للاتنين. الخطوات اللي تحت **من ناحيتك** (أسرار/حسابات) —
مش محتاجة أي تعديل كود مننا.

---

## 1) توقيع Play + رفع AAB (أندرويد)

الـ CI بيبني `wisal.apk` (تثبيت مباشر) و `wisal.aab` (لـ Google Play) في كل بناء،
وبيوقّع توقيع رسمي **أوتوماتيك لو الأسرار موجودة**، وإلا يرجع لتوقيع debug عشان
البناء يفضل أخضر. الملفات في release الثابت `android-latest`.

### أ) اعمل keystore (مرة واحدة على جهازك)
```bash
keytool -genkeypair -v -keystore wisal-release.keystore \
  -alias wisal -keyalg RSA -keysize 2048 -validity 10000
```
احفظ الباسورد والـ alias — من غيرهم مش هتقدر تحدّث التطبيق على Play مستقبلاً.

### ب) ضيف 4 أسرار في GitHub
Settings → Secrets and variables → Actions → **New repository secret**:

| السرّ | القيمة |
| --- | --- |
| `KEYSTORE_BASE64` | ناتج `base64 -w0 wisal-release.keystore` (Linux) أو `base64 -i wisal-release.keystore` (macOS) |
| `KEYSTORE_PASSWORD` | باسورد الـ keystore |
| `KEY_ALIAS` | `wisal` |
| `KEY_PASSWORD` | باسورد المفتاح |

بعد ما تضيفهم، أعد تشغيل workflow **Build Android APK** من تبويب Actions →
الملفات الجديدة هتبقى موقّعة توقيع رسمي.

### ج) Play Console
- افتح حساب Google Play Developer (رسوم 25$ مرة واحدة).
- طبّق أول: `com.wisal.app` هو `applicationId` بالفعل.
- ارفع `wisal.aab`، وحط رابط سياسة الخصوصية: `https://<دومينك>/privacy`.

> ملاحظة: `versionCode` بيزيد أوتوماتيك من رقم بناء الـ CI، فكل رفعة جديدة أعلى من اللي قبلها.

---

## 2) نشر صفحة الهبوط على Vercel (wisal-web)

المجلد `wisal-web/` static خالص + فيه `vercel.json` (أمان headers + cleanUrls).

### الطريقة الأسهل (Dashboard)
1. vercel.com → **Add New… → Project** → استورد الريبو `desktop-tutorial`.
2. **Root Directory = `wisal-web`** (مهم جداً — عشان ما يبنيش تطبيق الـ root).
3. Framework Preset = **Other** (مفيش build؛ static). اضغط Deploy.
4. بعد النشر: استبدل الدومين المؤقّت `wisal-app.vercel.app` باللي Vercel هيديهولك
   في أي مكان مذكور فيه (index.html / JSON-LD / privacy).

### أو عبر CLI
```bash
cd wisal-web
npx vercel --prod
```

بعد ما يبقى عندك دومين ثابت:
- حطّه في Play (بند سياسة الخصوصية).
- حدّث روابط التنزيل في الموقع لو حبيت تشاور على آخر release.

---

## حالة الجاهزية

| البند | الكود | متبقّي منك |
| --- | --- | --- |
| APK/AAB build | ✅ CI جاهز | — |
| توقيع رسمي | ✅ يقرأ الأسرار | إضافة 4 أسرار |
| صفحة خصوصية | ✅ `/privacy` | — |
| Vercel config | ✅ `vercel.json` | ربط المشروع + Root=`wisal-web` |
| Memory حيّة | ✅ workflow + sync | — |
