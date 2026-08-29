package com.wifeassistant.data.pairing

// نصوص الإثبات الموقّعة اللي wisal-direct-relay بيتحقق منها — لازم تتطابق
// حرفيًا مع lib/relay.js على الباك-إند. مركّزة هنا في مكان واحد عشان أي
// تغيير مستقبلي في الصيغة يتعمل مرة واحدة ويتحقق منه بالاختبارات، مش
// يتفرّق في كل نداء HTTP على حدة.
object DirectRelayProofs {
    fun register(deviceId: String): String = "wisal-direct-register:$deviceId"

    // backend داخل في الإثبات عمدًا: هو الحقل اللي بيوصف بروتوكول التشفير
    // المنتج للمحتوى، وأي تلاعب بيه بعد التوقيع لازم يبوّظ التوقيع —
    // مفيش وصف كاذب لحالة التشفير حتى من طرف على المسار.
    fun submit(senderDeviceId: String, recipientDeviceId: String, ciphertextB64: String, backend: String, expiresAtEpochSec: Long): String =
        "$senderDeviceId:$recipientDeviceId:$ciphertextB64:$backend:$expiresAtEpochSec"

    fun fetch(deviceId: String, timestamp: Long): String = "fetch:$deviceId:$timestamp"

    fun ack(envelopeId: String): String = "ack:$envelopeId"
}
