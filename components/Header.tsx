import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";

interface Props {
  title: string;
  subtitle?: string;
  showMenuButton?: boolean;
}

export default function Header({
  title,
  subtitle,
  showMenuButton = true,
}: Props) {
  const router = useRouter();

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.container}>
      {/* Menu Button */}
      {showMenuButton ? (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => alert("Menu clicado!")}
        >
          <Ionicons name="menu" size={28} color="#4f46e5" />
        </TouchableOpacity>
      ) : (
        <View style={styles.menuButton} /> // placeholder para centralizar
      )}

      {/* Título */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* Right placeholder para balancear layout */}
      <View style={styles.menuButton} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  menuButton: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#252525ff",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280", // gray-500
    marginTop: 2,
  },
});
