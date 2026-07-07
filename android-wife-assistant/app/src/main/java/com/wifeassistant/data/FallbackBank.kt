package com.wifeassistant.data

// بنك رسائل جاهزة بيشتغل من غير نت أو من غير مفتاح Groq. عشان التطبيق ما يقفش أبداً:
// لو التوليد فشل، بنرجّع رسالتين دافئتين يقدر يعدّلهم ويبعتهم. مصري بسيط وصادق.
object FallbackBank {

    // نجمّع العلاقات في فئات عشان النبرة تبقى مناسبة.
    private fun category(relation: String): String = when {
        relation.startsWith("partner") -> "partner"
        relation == "son" || relation == "daughter" -> "child"
        relation == "mother" || relation == "father" -> "parent"
        relation == "brother" || relation == "sister" -> "sibling"
        relation.startsWith("group") -> "group"
        else -> "partner"
    }

    // رسائل حسب النيّة (مستقلة عن العلاقة تقريباً) - أولوية لو المستخدم اختار نيّة.
    private val byIntent: Map<String, List<String>> = mapOf(
        "apology" to listOf(
            "آسف بجد لو زعّلتك، مكانش قصدي أبداً. إنت أغلى من أي خناقة، تعالى نصالح 🕊️",
            "غلطت وأنا عارف، بس قلبي معاك. سامحني وننسى اللي فات ونكمّل مع بعض ❤️",
        ),
        "congrats" to listOf(
            "مبروك من قلبي! إنت تستاهل كل خير وأنا فرحان لك بجد 🎉",
            "فرحان لك أوي، تستاهل اللحظة الحلوة دي وأكتر. ألف مبروك 🌟",
        ),
        "comfort" to listOf(
            "أنا معاك، متكونش لوحدك في اللي بتعدّي فيه. خد وقتك وأنا جنبك 🤍",
            "عارف إنها صعبة، بس إنت أقوى. أنا هنا في أي وقت تحتاجني 🫂",
        ),
        "thanks" to listOf(
            "شكراً من قلبي على كل حاجة بتعملها، واللي بتعمله واصل ومقدّر جداً 🙏",
            "متشكر ليك بجد، وجودك في حياتي نعمة مش بشكر ربنا عليها كفاية ❤️",
        ),
        "longing" to listOf(
            "وحشتني بجد، بفكّر فيك وأنا عايز أطمّن عليك وبس 💭",
            "قلبي معاك حتى وإنت بعيد، وحشتني وعايز أشوفك قريب ❤️",
        ),
        "reassure" to listOf(
            "متقلقش، كل حاجة هتبقى تمام وأنا جنبك خطوة بخطوة 🫂",
            "خد نفس، إنت مش لوحدك وأنا معاك مهما حصل. هنعدّيها سوا 🤍",
        ),
        "support" to listOf(
            "إنت قدها وقدود، ثقتي فيك كبيرة. اعمل اللي عليك وربنا معاك 💪",
            "قلبي معاك النهاردة، إنت أقوى مما تتخيل وهتنجح بإذن الله ✨",
        ),
        "dua" to listOf(
            "ربنا يحفظك ويسعدك ويبعد عنك كل وحشة، ويديمك في عافية 🤲",
            "دعوة من قلبي إن ربنا يوفّقك ويفرح قلبك ويكون معاك في كل خطوة 🌙",
        ),
    )

    // رسائل عامة حسب العلاقة - لو مفيش نيّة مختارة.
    private val byCategory: Map<String, List<String>> = mapOf(
        "partner" to listOf(
            "وجودك في حياتي أحلى حاجة حصلتلي، بحبك وبشكر ربنا عليك كل يوم ❤️",
            "فاكرك دايماً وقلبي معاك، ربنا يخليكي ليا ويسعد قلبك 💗",
        ),
        "child" to listOf(
            "فخور بيك جداً يا حبيبي، ربنا يحفظك ويوفّقك في كل حاجة 🌟",
            "إنت فرحة قلبي، مهما كبرت هتفضل غالي عليا. بحبك ❤️",
        ),
        "parent" to listOf(
            "ربنا يخليك ليا ويطوّل في عمرك، إنت سندي وتاج راسي 🤍",
            "بشكرك على كل حاجة عملتها عشاني، محدش يعوّض تعبك. بحبك 🙏",
        ),
        "sibling" to listOf(
            "إنت سندي وضهري، مهما بعدنا فاكرك دايماً. ربنا يخليك ليا 🤝",
            "وحشتني يا أخويا، نفسي أطمّن عليك ونتكلم زمان. بحبك ❤️",
        ),
        "group" to listOf(
            "بفكّر فيكم كلكم وبتمنالكم كل خير، ربنا يجمعنا دايماً على خير 🤍",
            "وحشتوني بجد، قلبي معاكم وبتمنى نكون قريّبين من بعض دايماً ❤️",
        ),
    )

    // رسالتين مناسبتين للشخص (وللنية لو موجودة).
    fun two(recipient: Recipient?, intent: Intents.Intent?): List<Suggestion> {
        val theme = intent?.label ?: "كلمة من القلب"
        val texts = intent?.let { byIntent[it.id] }
            ?: byCategory[category(recipient?.relation ?: "partner_wife")]
            ?: byCategory.getValue("partner")
        return texts.take(2).map { Suggestion(personalize(it, recipient), theme) }
    }

    // لمسة بسيطة: نضيف اسم الشخص لو موجود، بشكل طبيعي في الأول.
    private fun personalize(text: String, recipient: Recipient?): String {
        val name = recipient?.name?.trim().orEmpty()
        return if (name.isNotBlank()) "يا $name، $text" else text
    }
}
