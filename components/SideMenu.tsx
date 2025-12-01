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
import { useNavigation } from "@react-navigation/native";
import Animated, { SlideInLeft, SlideOutLeft } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const menuItems = [
  {
    label: "Home",
    icon: "home-outline",
    route: "/home",
  },
  {
    label: "Medicamentos",
    icon: "medkit-outline",
    route: "/add",
  },
  {
    label: "Perfil",
    icon: "person-circle-outline",
    route: "/profile",
  },
];

export default function SideMenu({ visible, onClose }) {
  const router = useRouter();

  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    (async () => {
      const session = await AsyncStorage.getItem("sessionUser");
      if (!session) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(session);
      setUsername(user?.name ?? "");
      setEmail(user?.email ?? "");
      setLoading(false);
    })();
  }, []);

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
        {/* Fundo com blur (efeito vidro premium) */}
        <BlurView intensity={95} tint="dark" style={styles.blur}>
          {/* Header com Avatar */}
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={38} color="#fff" />
            </View>

            <View>
              <Text style={styles.userName}>{username}</Text>
              <Text style={styles.userEmail}>{email}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Items do menu */}
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              activeOpacity={0.6}
              onPress={() => {
                router.push(item.route);
                onClose();
              }}
            >
              <Ionicons
                name={item.icon as any}
                size={25}
                color="#fff"
                style={{ width: 32 }}
              />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.divider} />

          {/* Logout */}
          <TouchableOpacity
            style={styles.logout}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#ff6b6b" />
            <Text style={styles.logoutText}>Desconectar</Text>
          </TouchableOpacity>
        </BlurView>
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
    backgroundColor: "rgba(0,0,0,0.25)",
    backdropFilter: "blur(14px)",
    zIndex: 999,
  },

  container: {
    width: width * 0.78,
    height: "100%",
    backgroundColor: "rgba(99, 102, 241, 1)",
    opacity: 0.95,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },

  blur: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 80 : 60,
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  userName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },

  userEmail: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 20,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  menuLabel: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "JetBrainsMonoBold",
    letterSpacing: 0.3,
  },

  logout: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 32,
  },

  logoutText: {
    marginLeft: 12,
    fontSize: 17,
    fontWeight: "600",
    color: "#ff6b6b",
  },
});
