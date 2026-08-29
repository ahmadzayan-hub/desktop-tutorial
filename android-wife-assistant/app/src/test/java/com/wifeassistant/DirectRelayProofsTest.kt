package com.wifeassistant

import com.wifeassistant.data.pairing.DirectRelayProofs
import org.junit.Assert.assertEquals
import org.junit.Test

// النصوص دي لازم تتطابق حرفيًا مع wisal-direct-relay/lib/relay.js — أي
// اختلاف هنا يبوّظ كل طلب موقّع بين العميل والسيرفر بصمت (توقيع صحيح
// لنص غلط = رفض السيرفر). ثابتة عمدًا هنا كنسخة مرجعية.
class DirectRelayProofsTest {
    @Test fun matchesServerRegisterFormat() {
        assertEquals("wisal-direct-register:devA", DirectRelayProofs.register("devA"))
    }

    @Test fun matchesServerSubmitFormat() {
        assertEquals(
            "devA:devB:Y2lwaGVy:VODOZEMAC:1800003600",
            DirectRelayProofs.submit("devA", "devB", "Y2lwaGVy", "VODOZEMAC", 1_800_003_600L),
        )
    }

    @Test fun matchesServerFetchFormat() {
        assertEquals("fetch:devB:1800000005", DirectRelayProofs.fetch("devB", 1_800_000_005L))
    }

    @Test fun matchesServerAckFormat() {
        assertEquals("ack:env-123", DirectRelayProofs.ack("env-123"))
    }
}
