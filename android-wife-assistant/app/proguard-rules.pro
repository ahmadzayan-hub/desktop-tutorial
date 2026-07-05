# kotlinx.serialization — الحفاظ على الـ serializers.
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers class com.wifeassistant.data.** {
    *** Companion;
}
-keepclasseswithmembers class com.wifeassistant.data.** {
    kotlinx.serialization.KSerializer serializer(...);
}
