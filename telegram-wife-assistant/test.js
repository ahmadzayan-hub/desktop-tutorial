// =====================================================================
// test.js — تجربة سريعة بدون إرسال لأي حد.
// بيطبع اقتراح صباحي + مسائي + اقتراح مناسبة في الكونسول بس.
//
// لو GROQ_API_KEY موجود في .env: هيستخدم الموديل الحقيقي.
// لو مش موجود: هيستخدم مولّد وهمي (mock) عشان تشوف الشكل والتدفّق
// من غير ما تحتاج مفتاح. مفيش أي إرسال على تيليجرام خالص.
// =====================================================================

require('dotenv').config();

const llm = require('./llm');

// لو مفيش مفتاح Groq، نركّب مولّد وهمي بدل النداء الحقيقي.
if (!process.env.GROQ_API_KEY) {
  console.log('ℹ️  مفيش GROQ_API_KEY — هستخدم مولّد وهمي للعرض بس.\n');
  llm.complete = async () => {
    // نرجّع اقتراحين بنفس الصيغة اللي بيفهمها المحلّل.
    return [
      '١- صباحك فل يا أحلى نصيبة. ربنا يخليكي ليا ويسعدك زي ما بتسعديني كل يوم.',
      '٢- قومتي النهاردة ونفسي أقولك إني محظوظ بيكي. يومك يكون جميل قد ما إنتي جميلة.',
    ].join('\n');
  };
}

const { generateSuggestions } = require('./generateSuggestion');
const { getTodaysOccasion } = require('./occasions');

function printBlock(title, result) {
  console.log(`\n===== ${title} =====`);
  console.log(`المواضيع: ${result.themesShown.join(' / ')}`);
  console.log(`1️⃣ ${result.items[0].text}`);
  console.log(`2️⃣ ${result.items[1].text}`);
}

async function main() {
  console.log('🧪 تجربة بدون إرسال (test.js)\n');

  // 1) اقتراح الصباح.
  printBlock('اقتراح الصباح', await generateSuggestions({ slot: 'morning' }));

  // 2) اقتراح المساء.
  printBlock('اقتراح المساء', await generateSuggestions({ slot: 'evening' }));

  // 3) اقتراح مناسبة: لو فيه مناسبة النهاردة نستخدمها، وإلا نجرّب مناسبة وهمية.
  const occ = getTodaysOccasion() || { key: 'demo', label: 'عيد جوازنا' };
  printBlock(`اقتراح مناسبة (${occ.label})`, await generateSuggestions({ slot: 'occasion', occasion: occ }));

  console.log('\n✅ خلص. مفيش حاجة اتبعتت لأي حد.');
}

main().catch((err) => {
  console.error('❌ خطأ:', err.message);
  process.exit(1);
});
