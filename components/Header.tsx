import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useMenu } from "../app/_layout"; // importa contexto do menu

interface Props {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: Props) {
  const menu = useMenu(); // pega funções open/close do menu

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={menu.open}>
        <Ionicons name="menu" size={28} color="#6366f1" />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
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
  menuButton: { width: 40, alignItems: "center", justifyContent: "center" },
  titleContainer: { flex: 1, alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700", color: "#252525ff" },
  subtitle: { fontSize: 12, fontWeight: "500", color: "#fff", marginTop: 2 },
});
