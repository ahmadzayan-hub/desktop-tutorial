package com.wifeassistant

import com.wifeassistant.data.Lang
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

// اختبار اختيار لغة الرسالة (عربي/إنجليزي) — كشف نقي بدون I/O.
class LangTest {
    @Test fun detectsArabic() {
        assertEquals(Lang.AR, Lang.detect("ازيك يا حبيبي عامل ايه"))
    }

    @Test fun detectsEnglish() {
        assertEquals(Lang.EN, Lang.detect("Hey habibi how are you"))
    }

    @Test fun detectsByMajorityScript() {
        // خليط بأغلبية إنجليزية → إنجليزي.
        assertEquals(Lang.EN, Lang.detect("Hello أهلا there my friend welcome"))
    }

    @Test fun digitsOnlyIsNull() {
        assertNull(Lang.detect("12345 !!! ..."))
        assertNull(Lang.detect(""))
        assertNull(Lang.detect(null))
    }

    @Test fun resolvePrefersRecipientPreference() {
        assertEquals(Lang.EN, Lang.resolve("en", "اسم عربي"))
        assertEquals(Lang.AR, Lang.resolve("ar", "English Name"))
    }

    @Test fun resolveAutoDetectsFromSamples() {
        assertEquals(Lang.EN, Lang.resolve("auto", "John Smith"))
        assertEquals(Lang.AR, Lang.resolve("auto", "أحمد زيان"))
    }

    @Test fun resolveDefaultsToArabicWhenUnknown() {
        assertEquals(Lang.AR, Lang.resolve(null, "123", ""))
        assertEquals(Lang.AR, Lang.resolve("auto"))
    }

    @Test fun englishDirectiveIsNonEmptyArabicIsEmpty() {
        assert(Lang.promptDirective(Lang.EN).isNotBlank())
        assertEquals("", Lang.promptDirective(Lang.AR))
    }
}
