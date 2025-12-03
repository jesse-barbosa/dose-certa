import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import Button from "../components/Button";
import { supabase } from "../services/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const session = await AsyncStorage.getItem("sessionUser");

      if (!session) {
        setLoading(false);
        router.replace("/");
        return;
      }

      const parsedSession = JSON.parse(session);

      setEmail(parsedSession?.email || "");
      setName(parsedSession?.name || "");

      setLoading(false);
    })();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);

    // pega usuário atual
    const userString = await AsyncStorage.getItem("sessionUser");

    if (!userString) {
      Alert.alert("Erro", "Usuário não encontrado.");
      setLoading(false);
      return;
    }

    const user = JSON.parse(userString);

    console.log("User:", user);

    // Atualiza nome e email
    const { error } = await supabase
      .from("users")
      .update({ name, email })
      .eq("id", user.id);

    // Atualiza dados da sessão
    await AsyncStorage.setItem(
      "sessionUser",
      JSON.stringify({ ...user, name, email })
    );

    setLoading(false);

    if (error) {
      Alert.alert("Erro", "Não foi possível atualizar o perfil.");
      console.error("Error updating profile:", error);
      return;
    }

    Alert.alert("Sucesso", "Perfil atualizado!");
  };

  // pega a primeira letras para logo
  const getLettersForLogo = (name: string) => name.split(" ").map((l) => l[0]);

  return (
    <View style={styles.container}>
      <Header title="Perfil" />

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <View style={styles.scroll}>
          <View style={styles.form}>
            {/* avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatar}>
                  {/* primeira e segunda letra do nome */}
                  <Text style={styles.avatarText}>
                    {getLettersForLogo(name)}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.label}>Nome:</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
            />

            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Seu e-mail"
            />
          </View>
          <Button onPress={handleUpdate} style={styles.button}>
            <Text style={styles.buttonText}>Salvar Alterações</Text>
          </Button>
        </View>
      )}

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  scroll: {
    paddingBottom: 80,
    paddingHorizontal: 20,
    height: "100%",
  },
  form: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    height: "78%",
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 25,
  },
  avatarWrapper: {
    borderRadius: 80,
    padding: 2,
    borderWidth: 2,
    borderColor: "#6366f1",
    // shadows
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 80,
    backgroundColor: "#c2c2c2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
  label: { fontWeight: "600", marginBottom: 6, fontSize: 16 },
  input: {
    backgroundColor: "#fff",
    width: "100%",
    display: "flex",
    textAlign: "left",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#6366f1",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  loadingWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
