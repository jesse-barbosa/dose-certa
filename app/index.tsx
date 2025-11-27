import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Image, Platform } from "react-native";
import Button from "../components/Button";
import { useRouter } from "expo-router";
import { supabase } from "../services/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return Alert.alert("Erro", error.message);
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Image source={require("@/assets/images/icon.png")} style={styles.logo} />

        <View>
          <Text style={styles.appName}>Dose Certa</Text>
        </View>
      </View>

      <View style={{ marginBottom: 32 }}>
        <Text style={styles.screenTitle}>Login</Text>
        <Text style={styles.subtitle}>Bem-vindo de volta 👋{"\n"}Faça login para continuar.</Text>
      </View>

      {/* Formulário */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button onPress={handleLogin}>Entrar</Button>

      <View style={styles.registerLink}>
        <Text>Não possui uma conta?</Text>
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.registerText}> Criar conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f9fafb",
  },

  /* ---------- HEADER ---------- */
  header: {
    position: "absolute",
    top: 60,
    left: 18,
    marginBottom: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },

  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
  },

  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4f46e5",
    marginBottom: 2,
  },

  screenTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    lineHeight: 18,
  },

  /* ---------- Form ---------- */
  input: {
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 16,
  },

  registerLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },

  registerText: {
    color: "#4f46e5",
    fontWeight: "600",
  },
});