import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
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
    router.replace("/"); // direciona para Home
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
      <Button
        onPress={() => router.push("/register")}
        style={styles.registerBtn}
      >
        Cadastrar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f3f4f6",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    color: "#4f46e5",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
  },
  registerBtn: { backgroundColor: "#10b981", marginTop: 12 },
});
