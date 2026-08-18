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

# ============ libsignal (org.signal:libsignal-android) ============
# المكتبة مش بتوزّع consumer proguard rules بتاعتها (اتفحص جوّه الـ AAR).
# بتعتمد على JNI بيستدعي دوال Kotlin/Java internal بالاسم (lambdas زي
# lambda$encrypt$0) — لو R8 غيّر الاسم أو مسحها، الاستدعاء بيفشل وقت التشغيل
# من غير ما CI (اختبارات JVM بس، مفيش R8) يمسكها. احتياط آمن ومحافظ.
-keep class org.signal.libsignal.** { *; }
-dontwarn org.signal.libsignal.**

# ============ androidx.security-crypto (Google Tink) ============
# Tink بيشاور على أنوتيشنز errorprone وقت الترجمة بس، ومش موجودة وقت التشغيل،
# فـ R8 بيقع على "Missing class". آمن نتجاهلها لأنها أنوتيشنز فاضية.
-dontwarn com.google.errorprone.annotations.**
-dontwarn javax.annotation.**
-dontwarn com.google.auto.value.**
