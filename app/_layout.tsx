import React, { useState, useEffect, createContext, useContext } from "react";
import { requestPermissions } from "@/services/notifications";
import { Slot } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SideMenu from "../components/SideMenu";
import { StyleSheet } from "react-native";
import { useFonts } from "expo-font";

const queryClient = new QueryClient();

const MenuContext = createContext({
  open: () => {},
  close: () => {},
});

export const useMenu = () => useContext(MenuContext);

export default function Layout() {
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    // pedir permissão de notificações assim que o app inicia
    (async () => {
      const granted = await requestPermissions();
      if (!granted) {
        console.warn("Usuário não concedeu permissão para notificações");
      }
    })();
  }, []);

  const [fontsLoaded] = useFonts({
    JetBrainsMono: require("@/assets/fonts/JetBrainsMono-Regular.ttf"),
    JetBrainsMonoBold: require("@/assets/fonts/JetBrainsMono-Bold.ttf"),
  });

  if (!fontsLoaded) return null; // evita piscar

  const contextValue = {
    open: () => setMenuVisible(true),
    close: () => setMenuVisible(false),
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <MenuContext.Provider value={contextValue}>
          <SafeAreaView style={styles.container} edges={["top"]}>
            <Slot />
          </SafeAreaView>

          {/* Colocado fora do SafeAreaView para ocupar toda a tela */}
          <SideMenu
            visible={menuVisible}
            onClose={() => setMenuVisible(false)}
          />
        </MenuContext.Provider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
