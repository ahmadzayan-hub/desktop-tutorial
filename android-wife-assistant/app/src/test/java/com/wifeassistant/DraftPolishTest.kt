package com.wifeassistant

import com.wifeassistant.data.DraftPolish
import org.junit.Assert.assertEquals
import org.junit.Test

// اختبار تنظيف المسوّدة (دالة نقية بدون شبكة): فراغات زيادة، أسطر فاضية متكررة،
// تشذيب أطراف كل سطر، ومسوّدة فاضية.
class DraftPolishTest {
    @Test
    fun collapsesExtraSpacesAndTrims() {
        assertEquals("يا حبيبي وحشتني", DraftPolish.cleanDraft("  يا   حبيبي    وحشتني  "))
    }

    @Test
    fun collapsesThreeOrMoreBlankLinesToOne() {
        assertEquals("سطر\n\nسطر تاني", DraftPolish.cleanDraft("سطر\n\n\n\nسطر تاني"))
    }

    @Test
    fun keepsSingleBlankLineBetweenParagraphs() {
        assertEquals("فقرة\n\nفقرة", DraftPolish.cleanDraft("فقرة\n\nفقرة"))
    }

    @Test
    fun trimsEachLineIndentation() {
        assertEquals("أول\nتاني", DraftPolish.cleanDraft("   أول\n\t تاني  "))
    }

    @Test
    fun emptyStaysEmpty() {
        assertEquals("", DraftPolish.cleanDraft("   \n\n  \n"))
    }
}
