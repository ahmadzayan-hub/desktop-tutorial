#!/usr/bin/env bash
# =====================================================================
# setup.sh — تجهيز المساعد على جهازك في خطوة واحدة.
# بيعمل: فحص Node ← npm install ← إنشاء .env (بيسأل عن التوكن والمفتاح)
#        ← تشغيل تجربة ← إرشادك لجلب chat_id.
# مفيش أي سر مكتوب جوه الملف ده — بيتسأل وقت التشغيل ويتكتب في .env بس.
#
# الاستخدام:
#   cd telegram-wife-assistant
#   chmod +x setup.sh && ./setup.sh
# =====================================================================
set -euo pipefail

# نتنقل لمجلد السكربت عشان يشتغل من أي مكان.
cd "$(dirname "$0")"

echo "💌 تجهيز مساعد رسايل تيليجرام"
echo "================================"

# ---- 1) فحص Node ----
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js مش متثبّت. ثبّته من https://nodejs.org (نسخة 18 أو أحدث) وأعد المحاولة."
  exit 1
fi
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "❌ محتاج Node 18 أو أحدث. النسخة الحالية: $(node -v)"
  exit 1
fi
echo "✅ Node $(node -v)"

# ---- 2) تثبيت المكتبات ----
echo ""
echo "📦 بثبّت المكتبات (npm install)..."
npm install
echo "✅ المكتبات اتثبتت"

# ---- 3) إنشاء .env ----
echo ""
if [ -f .env ]; then
  echo "ℹ️  ملف .env موجود بالفعل — مش هلمسه."
else
  echo "🔑 هنجهّز ملف .env (الأسرار بتتحط هنا بس، مش بتترفع على git)."
  echo "   - توكن البوت: من @BotFather على تيليجرام"
  echo "   - مفتاح Groq: من https://console.groq.com/keys"
  echo ""
  printf "ابعت توكن تيليجرام (TELEGRAM_BOT_TOKEN): "
  read -r TG_TOKEN
  printf "ابعت مفتاح Groq (GROQ_API_KEY): "
  read -r GROQ_KEY

  cat > .env <<EOF
TELEGRAM_BOT_TOKEN=${TG_TOKEN}
GROQ_API_KEY=${GROQ_KEY}
EOF
  echo "✅ اتعمل .env"
fi

# ---- 4) تجربة سريعة بدون إرسال ----
echo ""
echo "🧪 تجربة سريعة (node test.js) — اقتراحات بدون إرسال لأي حد:"
echo "-----------------------------------------------------------"
node test.js || echo "⚠️ التجربة فشلت (غالباً مفتاح Groq غلط أو النت محجوب). راجع .env."

# ---- 5) الخطوات الأخيرة ----
cat <<'EOF'

-----------------------------------------------------------
🎉 خلصنا التجهيز. ناقص خطوتين بس:

1) جلب chat_id بتاعك:
   - شغّل:  npm start
   - روح للبوت على تيليجرام واضغط Start (أو ابعت /start)
   - هيطبعلك:  🆔 الـ chat_id بتاعك هو: ...
   - حط الرقم ده في config.js عند chatId، وأعد التشغيل.

2) تفعيل الإرسال الفعلي:
   - في config.js غيّر dryRun: false
   - npm start  (هيبعتلك الاقتراحات في مواعيدها بأزرار)

🔁 تشغيل دائم بـ pm2:
   npm install -g pm2
   pm2 start index.js --name wife-assistant
   pm2 save && pm2 startup

🔐 أمان: لو التوكن/المفتاح ظهروا في أي مكان قبل كده، اعمللهم rotate
   (@BotFather /revoke + console.groq.com/keys) وحدّث .env.
-----------------------------------------------------------
EOF
