// =====================================================================
// ecosystem.config.js — إعداد pm2 للتشغيل الدائم.
// بيخلّي التشغيل والمتابعة بأمر واحد، مع إعادة تشغيل تلقائي ولوجات منظّمة.
//
// الاستخدام:
//   pm2 start ecosystem.config.js     # تشغيل
//   pm2 logs wife-assistant           # متابعة اللوجات
//   pm2 restart wife-assistant        # إعادة تشغيل
//   pm2 stop wife-assistant           # إيقاف
//   pm2 save && pm2 startup           # يشتغل تلقائي مع إقلاع الجهاز
// =====================================================================

module.exports = {
  apps: [
    {
      name: 'wife-assistant', // اسم العملية في pm2
      script: 'index.js', // نقطة التشغيل
      cwd: __dirname, // يشتغل من مجلد المشروع مهما اتنادى منين

      // إعادة التشغيل التلقائي لو وقع.
      autorestart: true,
      // ننتظر ثانية قبل إعادة التشغيل عشان ما يعملش loop سريع.
      restart_delay: 1000,
      // لو وقع 10 مرات بسرعة، يوقف ويسيبلك تشوف اللوج (حماية من loop).
      max_restarts: 10,
      min_uptime: '30s',

      // ما نعملش watch — مش عايزينه يعيد التشغيل مع كل تعديل ملف بيانات.
      watch: false,

      // سقف ذاكرة احتياطي (البوت خفيف جداً، بس للأمان).
      max_memory_restart: '200M',

      // لوجات بتاريخ مقروء.
      time: true,
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      merge_logs: true,

      // المتغيّرات بتتقرا من .env عبر dotenv داخل index.js،
      // فمش بنحط أي أسرار هنا.
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
