import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Button from "../components/Button";
import { useRouter } from "expo-router";
import { supabase } from "../services/supabase";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AddMedicine() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [timesPerDay, setTimesPerDay] = useState("1");
  const [durationDays, setDurationDays] = useState("1");
  const [hours, setHours] = useState(["08:00"]); // array de horários

  const handleNext = () => {
    if (step === 1 && !name)
      return Alert.alert("Erro", "Informe o nome do medicamento");
    setStep(2);
  };

  const handleAdd = async () => {
    if (!dosage || !timesPerDay || !durationDays || hours.length === 0) {
      return Alert.alert("Erro", "Preencha todos os campos do agendamento");
    }

    const { error } = await supabase.from("medicines").insert({
      name,
      dosage,
      times_per_day: Number(timesPerDay),
      duration_days: Number(durationDays),
      schedule_hours: hours,
      user_id: "demo-user-id",
    });

    if (error) return Alert.alert("Erro", error.message);

    Alert.alert("Sucesso", "Medicamento adicionado!");
    router.push("/");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Header title="Adicionar Medicamento" />
        <View style={styles.form}>
          {step === 1 && (
            <>
              <Text style={styles.label}>Nome do medicamento</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Paracetamol"
                placeholderTextColor="#4b5563" // placeholder escuro iOS/Android
                value={name}
                onChangeText={setName}
              />
              <Button onPress={handleNext}>Próximo</Button>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.label}>Dosagem</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 500mg"
                placeholderTextColor="#4b5563"
                value={dosage}
                onChangeText={setDosage}
              />

              <Text style={styles.label}>Quantidade de vezes ao dia</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor="#4b5563"
                keyboardType="number-pad"
                value={timesPerDay}
                onChangeText={setTimesPerDay}
              />

              <Text style={styles.label}>Duração em dias</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 7"
                placeholderTextColor="#4b5563"
                keyboardType="number-pad"
                value={durationDays}
                onChangeText={setDurationDays}
              />

              <Text style={styles.label}>Horários (use vírgula)</Text>
              <TextInput
                style={styles.input}
                placeholder="08:00, 14:00, 20:00"
                placeholderTextColor="#4b5563"
                value={hours.join(", ")}
                onChangeText={(text) =>
                  setHours(text.split(",").map((t) => t.trim()))
                }
              />

              <Button onPress={handleAdd}>Salvar</Button>
            </>
          )}
        </View>
      </ScrollView>
      <Footer onNavigate={(screen) => router.push(screen)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  form: { padding: 16 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151", // gray-700
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  scroll: {
    paddingBottom: 80, // espaço para Footer
  },
});
