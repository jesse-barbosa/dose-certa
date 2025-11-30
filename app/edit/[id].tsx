// app/edit/[id].tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "@/components/Button";
import Header from "@/components/Header";
import { getMedicineById, updateMedicine } from "@/services/medicines";

export default function EditMedicine() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [timesPerDay, setTimesPerDay] = useState<string | number>("");
  const [durationDays, setDurationDays] = useState<string | number>("");
  const [startDate, setStartDate] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const session = await AsyncStorage.getItem("sessionUser");
      if (!session) {
        router.replace("login");
        return;
      }
      const user = JSON.parse(session);
      setUserId(user?.id || "");
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const res = await getMedicineById(String(id), userId);
      if (!res.success) {
        Alert.alert("Erro", "Não foi possível carregar o medicamento.");
        setLoading(false);
        return;
      }
      const med = res.data;
      setName(med.name || "");
      setDosage(med.dosage || "");
      setTimesPerDay(med.times_per_day ?? "");
      setDurationDays(med.duration_days ?? "");
      setStartDate(med.start_date ?? "");
      setLoading(false);
    })();
  }, [userId, id]);

  const handleSave = async () => {
    // validações simples
    if (!name.trim()) {
      Alert.alert("Validação", "Nome é obrigatório");
      return;
    }
    setLoading(true);
    const result = await updateMedicine(
      String(id),
      {
        name: name.trim(),
        dosage: dosage.trim(),
        times_per_day: Number(timesPerDay) || undefined,
        duration_days: Number(durationDays) || undefined,
        start_date: startDate || undefined,
      },
      userId
    );

    setLoading(false);

    if (!result.success) {
      Alert.alert("Erro", "Não foi possível atualizar o medicamento");
      return;
    }

    Alert.alert("Sucesso", "Medicamento atualizado", [
      {
        text: "OK",
        onPress: () => router.replace(`../medicine/${id}`), // volta para detalhes
      },
    ]);
  };

  return (
    <>
      <Header title="Editar medicamento" showBackButton />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Nome</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Dosagem</Text>
        <TextInput
          style={styles.input}
          value={dosage}
          onChangeText={setDosage}
        />

        <Text style={styles.label}>Vezes por dia</Text>
        <TextInput
          style={styles.input}
          value={String(timesPerDay)}
          onChangeText={(t) => setTimesPerDay(t.replace(/\D/g, ""))}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Duração (dias)</Text>
        <TextInput
          style={styles.input}
          value={String(durationDays)}
          onChangeText={(t) => setDurationDays(t.replace(/\D/g, ""))}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Data de início (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
        />

        <View style={styles.buttonsRow}>
          <Button
            onPress={handleSave}
            style={[styles.button, styles.saveButton]}
          >
            Salvar
          </Button>

          <Button
            onPress={() => router.replace(`../medicine/${id}`)}
            style={[styles.button, styles.cancelButton]}
          >
            Cancelar
          </Button>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  label: {
    fontSize: 14,
    color: "#374151",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  button: { flex: 1 },
  saveButton: { backgroundColor: "#4f46e5" },
  cancelButton: { backgroundColor: "#6b7280" },
});
