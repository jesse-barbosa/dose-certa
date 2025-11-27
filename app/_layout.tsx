import React, { useState, createContext, useContext } from "react";
import { Slot } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SideMenu from "../components/SideMenu";
import { StyleSheet, View } from "react-native";
import { useFonts } from "expo-font";

const queryClient = new QueryClient();

const MenuContext = createContext({
  open: () => {},
  close: () => {},
});

export const useMenu = () => useContext(MenuContext);

export default function Layout() {
  const [menuVisible, setMenuVisible] = useState(false);

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
