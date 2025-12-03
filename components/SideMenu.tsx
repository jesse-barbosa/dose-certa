import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
  Platform,
} from "react-native";
import Animated, { SlideInLeft, SlideOutLeft } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const menuItems = [
  { label: "Home", icon: "home-outline", route: "/home" },
  { label: "Medicamentos", icon: "medkit-outline", route: "/add" },
  { label: "Perfil", icon: "person-circle-outline", route: "/profile" },
];

export default function SideMenu({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    (async () => {
      const session = await AsyncStorage.getItem("sessionUser");
      if (!session) {
        router.push("/");
        return;
      }
      const user = JSON.parse(session);
      setUsername(user?.name ?? "");
      setEmail(user?.email ?? "");
      setLoading(false);
    })();
  }, [visible]);

  if (!visible) return null;

  const handleLogout = () => {
    onClose();
    AsyncStorage.removeItem("sessionUser");
    router.push("/");
  };

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Animated.View
        entering={SlideInLeft.duration(280)}
        exiting={SlideOutLeft.duration(260)}
        style={styles.container}
      >
        {/* 1) Blur preenchendo o painel */}
        <BlurView intensity={85} tint="light" style={StyleSheet.absoluteFill} />

        {/* 2) Tint layer — cor roxa suave sobre o blur (ajuste alpha para mais/menos saturação) */}
        <View style={styles.tintLayer} />

        {/* 3) Sutil highlight (linha branca translúcida no topo) */}
        <View style={styles.topHighlight} />

        {/* 4) Conteúdo por cima do vidro */}
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={38} color="#333" />
            </View>

            <View>
              <Text style={styles.userName}>{username || "Olá"}</Text>
              <Text style={styles.userEmail}>
                {email || "usuário@exemplo.com"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                router.push(item.route);
                onClose();
              }}
            >
              <Ionicons
                name={item.icon as any}
                size={24}
                color="rgba(0,0,0,0.75)"
                style={{ width: 32 }}
              />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.logout}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#d33" />
            <Text style={styles.logoutText}>Desconectar</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: "rgba(0,0,0,0.05)",
    zIndex: 999,
  },

  container: {
    width: width * 0.78,
    height: "100%",
    // container must be transparent so blur shows the background
    backgroundColor: "transparent",
    overflow: "hidden", // important for rounded corners + blur
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 20,
    opacity: 0.98,
  },

  // tintLayer: purple tint on top of the blur that gives the "liquid glass" hue
  tintLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(99,102,241,0.10)", // adjust alpha 0.08 - 0.20 for stronger/weaker color
  },

  // top highlight: very subtle white streak to create depth
  topHighlight: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 62,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },

  contentWrapper: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 80 : 60,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 30,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderColor: "rgba(0,0,0,0.06)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  userName: {
    color: "#222",
    fontSize: 18,
    fontWeight: "700",
  },

  userEmail: {
    color: "rgba(0,0,0,0.6)",
    fontSize: 13,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 18,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  menuLabel: {
    color: "rgba(0,0,0,0.85)",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },

  logout: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 28,
  },

  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#d33",
  },
});
