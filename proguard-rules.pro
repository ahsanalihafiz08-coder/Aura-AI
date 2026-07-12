# ProGuard/R8 Rules for Aura AI Studio (Production Hardening)

# Keep Kotlin-specific reflections and metadata
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod,SourceFile,LineNumberTable

# Firestore and Firebase SDK Keep Rules
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Keep models to prevent obfuscation from breaking JSON/Firestore serialization
-keep class com.aura.ai.chat.model.** { *; }
-keep class com.aura.ai.crm.model.** { *; }
-keep class com.aura.ai.billing.model.** { *; }
-keep class com.aura.ai.voice.model.** { *; }

# Keep Jackson/Moshi/JSON serialization models
-keepclassmembers class * {
    @com.google.firebase.firestore.PropertyName <fields>;
    @com.google.firebase.firestore.PropertyName <methods>;
}

# Coroutines Keep Rules
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keepnames class kotlinx.coroutines.android.AndroidExceptionPreHandler {}
-dontwarn kotlinx.coroutines.**

# OkHttp Keep Rules
-keepattributes Signature, InnerClasses, EnclosingMethod
-keepclassmembers class okhttp3.internal.publicsuffix.PublicSuffixDatabase {
    *** publicSuffixListBytes;
    *** publicSuffixExceptionListBytes;
}
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**

# Keep Jetpack Compose runtime classes
-keep class androidx.compose.** { *; }
-dontwarn androidx.compose.**

# Keep standard Android Architecture components
-keep class androidx.lifecycle.ViewModel { *; }
-keep class androidx.navigation.** { *; }
