package com.wifeassistant

import com.wifeassistant.util.Phone
import org.junit.Assert.assertEquals
import org.junit.Test

// اختبار تطبيع الأرقام: محلي، +دولي، بادئة 00 (كانت بتتفسد قبل الإصلاح)، وفاضي.
class PhoneTest {
    @Test fun localGetsCountryCode() {
        assertEquals("201001234567", Phone.normalize("01001234567", "20"))
        assertEquals("201001234567", Phone.normalize("1001234567", "20"))
    }

    @Test fun plusInternationalKept() {
        assertEquals("201001234567", Phone.normalize("+20 100 123 4567", "20"))
        assertEquals("966501112222", Phone.normalize("+966 50 111 2222", "20"))
    }

    @Test fun doubleZeroInternationalNotCorrupted() {
        // الباج القديم كان بيطلّع "20966..." — دلوقتي بيفضل دولي صحيح.
        assertEquals("966501112222", Phone.normalize("00966501112222", "20"))
    }

    @Test fun alreadyHasCountryCode() {
        assertEquals("201001234567", Phone.normalize("201001234567", "20"))
    }

    @Test fun emptyStaysEmpty() {
        assertEquals("", Phone.normalize("", "20"))
        assertEquals("", Phone.normalize("abc", "20"))
    }
}
