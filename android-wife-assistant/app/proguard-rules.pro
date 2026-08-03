# ============ kotlinx.serialization ============
# التطبيق بيخزّن كل بياناته محليًا كـ JSON عبر kotlinx.serialization،
# فلازم نحافظ على الموديلات والـ serializers بتاعتها بالكامل تحت R8.
-keepattributes RuntimeVisibleAnnotations, AnnotationDefault, InnerClasses, *Annotation*
-dontnote kotlinx.serialization.**

# احفظ كل موديلات البيانات كما هي (أأمن ضمان إن الـ JSON يفضل يشتغل).
-keep class com.wifeassistant.data.** { *; }

# القواعد الرسمية لـ kotlinx.serialization تحت R8:
-if @kotlinx.serialization.Serializable class **
-keepclassmembers class <1> {
    static <1>$Companion Companion;
}
-if @kotlinx.serialization.Serializable class ** {
    static **$* *;
}
-keepclassmembers class <2>$<3> {
    kotlinx.serialization.KSerializer serializer(...);
}
-if @kotlinx.serialization.Serializable class ** {
    public static ** INSTANCE;
}
-keepclassmembers class <1> {
    public static <1> INSTANCE;
    kotlinx.serialization.KSerializer serializer(...);
}

# ============ OkHttp ============
-dontwarn okhttp3.**
-dontwarn okio.**

# ============ androidx.security-crypto (Google Tink) ============
# Tink بيشاور على أنوتيشنز errorprone وقت الترجمة بس، ومش موجودة وقت التشغيل،
# فـ R8 بيقع على "Missing class". آمن نتجاهلها لأنها أنوتيشنز فاضية.
-dontwarn com.google.errorprone.annotations.**
-dontwarn javax.annotation.**
-dontwarn com.google.auto.value.**
