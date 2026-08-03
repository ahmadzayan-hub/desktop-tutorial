plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
}

android {
    namespace = "com.wifeassistant"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.wisal.app"
        minSdk = 26
        targetSdk = 35
        // رقم الإصدار بيزيد تلقائياً من رقم بناء الـ CI (VERSION_CODE) عشان
        // التحديثات تتثبّت فوق بعضها. محلياً بيرجع لـ 1.
        versionCode = System.getenv("VERSION_CODE")?.toIntOrNull() ?: 1
        versionName = System.getenv("VERSION_NAME") ?: "1.0"
    }

    // توقيع نسخة الـ release. بيقرأ من متغيّرات البيئة (بتتحط في الـ CI من
    // GitHub Secrets). لو مفيش keystore بنرجع لتوقيع الـ debug عشان الـ APK
    // يفضل بيتثبّت والـ CI يفضل أخضر من غير أسرار.
    signingConfigs {
        create("release") {
            val ksPath = System.getenv("KEYSTORE_FILE")
            if (!ksPath.isNullOrBlank() && file(ksPath).exists()) {
                storeFile = file(ksPath)
                storePassword = System.getenv("KEYSTORE_PASSWORD")
                keyAlias = System.getenv("KEY_ALIAS")
                keyPassword = System.getenv("KEY_PASSWORD")
            }
        }
    }

    buildFeatures {
        compose = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }

    buildTypes {
        release {
            // R8: يشيل الكود والموارد غير المستخدمة (منها آلاف أيقونات
            // material-icons-extended) — تصغير كبير للـ APK. قواعد الحفظ في
            // proguard-rules.pro بتحمي تخزين kotlinx.serialization المحلي.
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            val ksPath = System.getenv("KEYSTORE_FILE")
            signingConfig = if (!ksPath.isNullOrBlank() && file(ksPath).exists()) {
                signingConfigs.getByName("release")
            } else {
                signingConfigs.getByName("debug")
            }
        }
    }

    testOptions {
        unitTests.isReturnDefaultValues = true
        // Robolectric محتاج موارد أندرويد عشان يشغّل اختبارات طبقة البيانات على الـ JVM.
        unitTests.isIncludeAndroidResources = true
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.12.01")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    debugImplementation("androidx.compose.ui:ui-tooling")

    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")

    implementation("androidx.work:work-runtime-ktx:2.10.0")
    // تشفير مفتاح Groq على الجهاز (Android Keystore).
    implementation("androidx.security:security-crypto:1.1.0-alpha06")

    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")

    testImplementation("junit:junit:4.13.2")
    // اختبارات طبقة البيانات على الـ JVM (بدون emulator) — بتحرس دوران JSON اللي R8 ممكن يكسره.
    testImplementation("org.robolectric:robolectric:4.14.1")
    testImplementation("androidx.test:core-ktx:1.6.1")
}
