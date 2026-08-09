package com.wifeassistant

import com.wifeassistant.data.Streak
import java.time.LocalDate
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

// اختبار «سلسلة الدفء» — منطق نقي بتاريخ ثابت عشان الاختبار ما يبقاش هشّ.
class StreakTest {
    private val today = LocalDate.of(2026, 8, 9)

    @Test fun emptyIsZero() {
        assertEquals(0, Streak.compute(emptyList(), today))
    }

    @Test fun todayOnlyIsOne() {
        assertEquals(1, Streak.compute(listOf("2026-08-09"), today))
    }

    @Test fun consecutiveDaysCount() {
        assertEquals(3, Streak.compute(listOf("2026-08-09", "2026-08-08", "2026-08-07"), today))
    }

    @Test fun yesterdayGraceKeepsStreakAlive() {
        // آخر إرسال امبارح — السلسلة لسه عايشة (سماحية يوم).
        assertEquals(2, Streak.compute(listOf("2026-08-08", "2026-08-07"), today))
    }

    @Test fun gapBreaksStreak() {
        // آخر إرسال من 3 أيام — السلسلة اتقطعت.
        assertEquals(0, Streak.compute(listOf("2026-08-06", "2026-08-05"), today))
        // فجوة في النص: بيتحسب من النهاردة لحد الفجوة بس.
        assertEquals(2, Streak.compute(listOf("2026-08-09", "2026-08-08", "2026-08-06"), today))
    }

    @Test fun duplicatesAndGarbageIgnored() {
        assertEquals(1, Streak.compute(listOf("2026-08-09", "2026-08-09", "garbage", ""), today))
    }

    @Test fun messagesMatchTiers() {
        assertTrue(Streak.message(1).isNotBlank())
        assertTrue(Streak.message(7).contains("أسبوع"))
        assertTrue(Streak.message(30).contains("شهر"))
    }
}
