export default {
  expo: {
    name: "dose-agil",
    slug: "dose-agil",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "doseagil",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY,

      eas: {
        projectId: "89e9c8fe-9ffa-4e35-8ba2-e49e714e8f5c",
      },
    },

    ios: {
      supportsTablet: true,
    },

    android: {
      package: "com.jessebarbosa.doseagil",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },

    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};
