import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import Animated, { SlideInLeft, SlideOutLeft } from "react-native-reanimated";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const menuItems = [
  {
    label: "Home",
    icon: <Ionicons name="home" size={22} color="#fff" />,
    route: "/",
  },
  {
    label: "Medicamentos",
    icon: <MaterialIcons name="medication" size={22} color="#fff" />,
    route: "/add",
  },
  {
    label: "Perfil",
    icon: <Ionicons name="person" size={22} color="#fff" />,
    route: "/profile",
  },
  {
    label: "Configurações",
    icon: <FontAwesome5 name="cog" size={22} color="#fff" />,
    route: "/config",
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SideMenu({ visible, onClose }: Props) {
  const router = useRouter();

  if (!visible) return null;

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Animated.View
        entering={SlideInLeft.duration(300)}
        exiting={SlideOutLeft.duration(300)}
        style={styles.container}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.item}
            onPress={() => {
              router.push(item.route);
              onClose();
            }}
          >
            {item.icon}
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 999,
  },
  container: {
    width: width * 0.7,
    height: "100%",
    position: "absolute",
    top: 0,
    backgroundColor: "#6366f1", // cor primária
    paddingTop: 120,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  label: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
  },
});
