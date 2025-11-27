import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { Layout, FadeIn, FadeOut } from "react-native-reanimated";
import { BlurView } from "expo-blur";

const tabs = [
  { name: "Home", icon: <Ionicons name="home" size={28} />, route: "/" },
  {
    name: "Medicamentos",
    icon: <MaterialIcons name="medication" size={28} />,
    route: "/add",
  },
  {
    name: "Config",
    icon: <FontAwesome5 name="cog" size={28} />,
    route: "/profile",
  },
];

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.wrapper}>
      <BlurView intensity={70} tint="light" style={styles.container}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.route;

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.button}
              onPress={() => router.push(tab.route)}
              activeOpacity={0.8}
            >
              <Animated.View
                layout={Layout.springify()}
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={[
                  styles.iconContainer,
                  isActive && styles.activeBackground,
                ]}
              >
                {React.cloneElement(tab.icon, {
                  color: isActive ? "#fff" : "#6366f1",
                })}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 20,
    zIndex: 999,
    width: "100%",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.50)", // semitransparente para efeito vidro
    overflow: "hidden", // garante que cantos arredondados funcionem com BlurView
    shadowColor: "#000",
    borderWidth: 1,
    borderColor: "#dadadaff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  button: {
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  activeBackground: {
    backgroundColor: "#6366f1",
  },
});
