package com.wifeassistant

import com.wifeassistant.data.Intents
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

// اختبار نيّات الرسالة — بما فيها «إعادة تواصل» الجديدة (بتغذّي لفتة إعادة التواصل).
class IntentsTest {
    @Test fun reconnectIntentExists() {
        val i = Intents.byId("reconnect")
        assertNotNull(i)
        assertEquals("إعادة تواصل", i!!.label)
        assertTrue(i.hint.isNotBlank())
    }

    @Test fun allIntentsHaveUniqueIds() {
        val ids = Intents.ALL.map { it.id }
        assertEquals(ids.size, ids.toSet().size)
    }

    @Test fun unknownIdReturnsNull() {
        assertNull(Intents.byId("nope"))
        assertNull(Intents.byId(null))
    }
}
