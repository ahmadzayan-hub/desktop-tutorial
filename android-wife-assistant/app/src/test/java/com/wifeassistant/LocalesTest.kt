package com.wifeassistant

import com.wifeassistant.data.I18n
import com.wifeassistant.data.LocalePackEs
import com.wifeassistant.data.Locales
import com.wifeassistant.data.t
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

// بنية اللغات القابلة للتوسّع (Level C): سجل + حزم بمفتاح النص الإنجليزي + fallback آمن.
class LocalesTest {
    @After fun reset() {
        I18n.lang = "ar"
    }

    @Test fun registryHasThreeLocalesWithCorrectDirection() {
        assertEquals(listOf("ar", "en", "es"), Locales.registered.map { it.code })
        assertTrue(Locales.isRtl("ar"))
        assertFalse(Locales.isRtl("en"))
        assertFalse(Locales.isRtl("es"))
        // لغة غير مسجلة → RTL (الافتراضي العربي الآمن للتطبيق الحالي).
        assertTrue(Locales.isRtl("xx"))
    }

    @Test fun spanishResolvesFromPack() {
        I18n.lang = "es"
        assertEquals("Ajustes", t("الإعدادات", "Settings"))
        assertEquals("Personas", t("الأشخاص", "People"))
        assertEquals("Empecemos 💗", t("يلا نبدأ 💗", "Let's start 💗"))
    }

    @Test fun spanishFallsBackToEnglishForMissingKey() {
        I18n.lang = "es"
        assertEquals("Some brand-new string", t("نص جديد", "Some brand-new string"))
    }

    @Test fun arabicAndEnglishStillResolveInline() {
        I18n.lang = "ar"
        assertEquals("الإعدادات", t("الإعدادات", "Settings"))
        I18n.lang = "en"
        assertEquals("Settings", t("الإعدادات", "Settings"))
    }

    @Test fun settingsRejectsUnregisteredLocale() {
        // الحارس في Settings بيستخدم Locales.isRegistered — نتأكد من مصدر الحقيقة نفسه.
        assertTrue(Locales.isRegistered("es"))
        assertFalse(Locales.isRegistered("fr"))
    }

    @Test fun packHasNoInterpolatedKeysAndNoEmptyValues() {
        // النصوص اللي فيها ${...} بتتقيّم قبل النداء فمفتاحها عمره ما هيتطابق —
        // وجودها في الحزمة يبقى ميت. والقيم الفاضية معناها نص مقصوص.
        for ((k, v) in LocalePackEs.strings) {
            assertFalse("interpolated key would never match: $k", k.contains("\${") || k.contains("\$"))
            assertTrue("empty translation for: $k", v.isNotBlank())
        }
    }
}
