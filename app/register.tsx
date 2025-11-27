import React, { useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Image, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Button from "../components/Button";
import { useRouter } from "expo-router";
import { supabase } from "../services/supabase";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return Alert.alert('Erro', error.message);
    Alert.alert('Sucesso', 'Conta criada! Verifique seu email.');
    router.replace('/login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "start" }}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Image source={require("@/assets/images/icon.png")} style={styles.logo} />

          <View>
            <Text style={styles.appName}>Dose Certa</Text>
          </View>
        </View>

        <View style={{ marginBottom: 32 }}>
          <Text style={styles.screenTitle}>Registro</Text>
          <Text style={styles.subtitle}>Seja bem vindo 👋{"\n"}Crie sua conta para começar.</Text>
        </View>

        {/* Formulário */}
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          placeholderTextColor="#525252ff"
          value={name}
          onChangeText={setName}
          keyboardType="default"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#525252ff"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <View
          style={[styles.input, { position: "relative", height: 48, paddingRight: 40, paddingLeft: 10, paddingVertical: 0, }]}
        >
          <TextInput
            placeholder="Senha"
            placeholderTextColor="#525252ff"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={{ flex: 1, position: 'relative', display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#080808ff' }}
          />
          <TouchableOpacity
            style={{
              position: "absolute",
              right: 12,
              top: Platform.OS === "ios" ? 12 : 10,
            }}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <MaterialIcons name="visibility" size={24} color="#9ca3af" />
            ) : (
              <MaterialIcons name="visibility-off" size={24} color="#9ca3af" />
            )}
          </TouchableOpacity>
        </View>

        <Button onPress={handleRegister}>Registrar</Button>

        <View style={styles.registerLink}>
          <Text>Já registrou antes?</Text>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Text style={styles.registerText}> Entrar em conta existente</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 100,
    width: "100%",
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
    fontFamily: "JetBrainsMonoBold",
    color: "#4f46e5",
    marginBottom: 2,
  },

  screenTitle: {
    fontSize: 26,
    color: "#111827",
    fontFamily: "JetBrainsMono",
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