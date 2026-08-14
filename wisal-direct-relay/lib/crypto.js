// تحقق توقيعات هوية الجهاز (ADR-002 §5.2): EC P-256 / ECDSA-SHA256، مفتاح عام
// بصيغة X.509 SubjectPublicKeyInfo (SPKI/DER) — نفس الصيغة اللي بيرجعها
// KeyPairGenerator.getInstance("EC") على أندرويد (android-wife-assistant's
// DeviceIdentityCodec)، عشان توقيع اتعمل على الجهاز يتحقق منه هنا من غير أي
// تحويل صيغة إضافي.
//
// كل دالة هنا نقية (bytes/base64 داخلة → boolean) — قابلة للاختبار من غير سيرفر.

const { createPublicKey, createVerify } = require('crypto');

function verifySignature(publicKeyB64, data, signatureB64) {
  try {
    const publicKey = createPublicKey({
      key: Buffer.from(String(publicKeyB64 || ''), 'base64'),
      format: 'der',
      type: 'spki',
    });
    const verifier = createVerify('SHA256');
    verifier.update(data instanceof Buffer ? data : Buffer.from(String(data), 'utf8'));
    verifier.end();
    return verifier.verify(publicKey, Buffer.from(String(signatureB64 || ''), 'base64'));
  } catch {
    return false;
  }
}

module.exports = { verifySignature };
