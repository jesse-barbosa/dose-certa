import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import Button from "../components/Button";
import { supabase } from "../services/supabase";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Profile() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    (async () => {
      const user = supabase.auth.getUser();
      setEmail((await user).data.user?.email || "");
    })();
  }, []);

  const handleUpdate = async () => {
    Alert.alert("Sucesso", "Perfil atualizado!");
  };

  return (
    <View style={styles.container}>
      <Header title="Perfil" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.form}>
          <Text style={styles.label}>Email:</Text>
          <TextInput style={styles.input} value={email} editable={false} />
          <Button onPress={handleUpdate}>
            <Text>Atualizar</Text>
          </Button>
        </View>
      </ScrollView>
      <Footer onNavigate={(screen) => navigation.navigate(screen as never)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  form: { padding: 16 },
  label: { fontWeight: "600", marginBottom: 4 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  scroll: {
    paddingBottom: 80,
  },
});
