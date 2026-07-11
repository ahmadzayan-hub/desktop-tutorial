package com.wifeassistant.util

import android.content.Context
import android.provider.ContactsContract
import android.provider.ContactsContract.CommonDataKinds.Event
import android.provider.ContactsContract.CommonDataKinds.Phone

// قراءة جهات الاتصال اللي ليها عيد ميلاد مسجّل على الجهاز (بموافقة المستخدم).
// مصدر شرعي للمناسبات: البيانات على موبايل المستخدم نفسه، مش سحب من حد.
object ContactsReader {
    data class ContactBirthday(val name: String, val number: String, val mmdd: String)
    data class ContactNumber(val name: String, val number: String)

    // كل جهات الاتصال اللي ليها رقم (اسم + رقم) - للإرسال الجماعي المخصّص.
    fun allWithNumbers(context: Context): List<ContactNumber> {
        val out = mutableListOf<ContactNumber>()
        val seen = HashSet<String>()
        val nameCol = ContactsContract.Contacts.DISPLAY_NAME
        val projection = arrayOf(nameCol, Phone.NUMBER)
        context.contentResolver.query(Phone.CONTENT_URI, projection, null, null, nameCol)
            ?.use { c ->
                val nameIdx = c.getColumnIndex(nameCol)
                val numIdx = c.getColumnIndex(Phone.NUMBER)
                while (c.moveToNext()) {
                    val name = c.getString(nameIdx)?.trim().orEmpty()
                    val number = c.getString(numIdx)?.filter { it.isDigit() }.orEmpty()
                    if (name.isBlank() || number.isBlank()) continue
                    if (!seen.add(number)) continue // نتجنّب تكرار نفس الرقم
                    out.add(ContactNumber(name, number))
                }
            }
        return out
    }

    fun withBirthdays(context: Context): List<ContactBirthday> {
        val resolver = context.contentResolver
        val result = mutableListOf<ContactBirthday>()

        val projection = arrayOf(
            ContactsContract.Data.CONTACT_ID,
            ContactsContract.Data.DISPLAY_NAME,
            Event.START_DATE,
        )
        val selection = "${ContactsContract.Data.MIMETYPE} = ? AND ${Event.TYPE} = ?"
        val args = arrayOf(Event.CONTENT_ITEM_TYPE, Event.TYPE_BIRTHDAY.toString())

        val ids = mutableListOf<Long>()
        resolver.query(ContactsContract.Data.CONTENT_URI, projection, selection, args, null)?.use { c ->
            val idIdx = c.getColumnIndex(ContactsContract.Data.CONTACT_ID)
            val nameIdx = c.getColumnIndex(ContactsContract.Data.DISPLAY_NAME)
            val dateIdx = c.getColumnIndex(Event.START_DATE)
            while (c.moveToNext()) {
                val name = c.getString(nameIdx)?.trim().orEmpty()
                val mmdd = toMmDd(c.getString(dateIdx)) ?: continue
                if (name.isBlank()) continue
                val id = c.getLong(idIdx)
                ids.add(id)
                result.add(ContactBirthday(name, "", mmdd))
            }
        }

        // نجيب رقم أساسي لكل جهة اتصال لها عيد ميلاد (اختياري).
        if (ids.isNotEmpty()) {
            val phones = phonesFor(context, ids)
            for (i in result.indices) {
                val id = ids[i]
                phones[id]?.let { result[i] = result[i].copy(number = it) }
            }
        }
        // ترتيب أبجدي وإزالة التكرار بالاسم.
        return result.distinctBy { it.name }.sortedBy { it.name }
    }

    private fun phonesFor(context: Context, ids: List<Long>): Map<Long, String> {
        val map = mutableMapOf<Long, String>()
        val projection = arrayOf(Phone.CONTACT_ID, Phone.NUMBER)
        val selection = "${Phone.MIMETYPE} = ?"
        val args = arrayOf(Phone.CONTENT_ITEM_TYPE)
        context.contentResolver.query(
            ContactsContract.Data.CONTENT_URI, projection, selection, args, null,
        )?.use { c ->
            val idIdx = c.getColumnIndex(Phone.CONTACT_ID)
            val numIdx = c.getColumnIndex(Phone.NUMBER)
            val wanted = ids.toSet()
            while (c.moveToNext()) {
                val id = c.getLong(idIdx)
                if (id !in wanted || map.containsKey(id)) continue
                val num = c.getString(numIdx)?.filter { it.isDigit() }.orEmpty()
                if (num.isNotBlank()) map[id] = num
            }
        }
        return map
    }

    // START_DATE ممكن تكون "yyyy-MM-dd" أو "--MM-dd" (من غير سنة). نطلّع MM-DD.
    private fun toMmDd(raw: String?): String? {
        val s = raw?.trim() ?: return null
        val re = Regex(".*?(\\d{2})-(\\d{2})$")
        val m = re.find(s) ?: return null
        val mm = m.groupValues[1]
        val dd = m.groupValues[2]
        if (mm.toInt() !in 1..12 || dd.toInt() !in 1..31) return null
        return "$mm-$dd"
    }
}
