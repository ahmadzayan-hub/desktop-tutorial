package com.wifeassistant

import com.wifeassistant.data.DateUtil
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

// اختبار حساب أيام المناسبة السنوية (يعتمد عليه اقتراح «اللفتة الجاية»).
// invariants بدل تثبيت «النهاردة» عشان الاختبار ما يبقاش هشّ.
class DateUtilTest {
    @Test fun todayIsZero() {
        assertEquals(0, DateUtil.daysUntilMMDD(DateUtil.todayMMDD()))
    }

    @Test fun invalidReturnsNull() {
        assertNull(DateUtil.daysUntilMMDD("13-40")) // شهر/يوم غلط
        assertNull(DateUtil.daysUntilMMDD("garbage"))
        assertNull(DateUtil.daysUntilMMDD(""))
    }

    @Test fun validIsWithinAYear() {
        val d = DateUtil.daysUntilMMDD("12-25")
        assertTrue(d != null && d in 0..366)
    }

    // daysUntilYMD: تاريخ ثابت YYYY-MM-DD (للمناسبات العامة القريّبة).
    @Test fun ymdTodayIsZero() {
        assertEquals(0, DateUtil.daysUntilYMD(DateUtil.todayISO()))
    }

    @Test fun ymdPastReturnsNull() {
        assertNull(DateUtil.daysUntilYMD("2000-01-01")) // عدّى خلاص
    }

    @Test fun ymdFutureIsPositive() {
        val d = DateUtil.daysUntilYMD("2999-12-31")
        assertTrue(d != null && d > 0)
    }

    @Test fun ymdInvalidReturnsNull() {
        assertNull(DateUtil.daysUntilYMD("2026-13-40"))
        assertNull(DateUtil.daysUntilYMD("garbage"))
        assertNull(DateUtil.daysUntilYMD(""))
    }
}
