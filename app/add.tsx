import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { supabase } from "../services/supabase";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AddMedicine() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const totalSteps = 2;

  // Dados
  const [name, setName] = useState("");
  const [dosageValue, setDosageValue] = useState("1");
  const [dosageUnit, setDosageUnit] = useState("mg");
  const [timesPerDay, setTimesPerDay] = useState("1");
  const [durationDays, setDurationDays] = useState("1");

  const formatDate = (date) => date.toISOString().split("T")[0];

  // Horários
  const [selectedHours, setSelectedHours] = useState(["08:00"]);

  // Calendário
  const [selectedDate, setSelectedDate] = useState("");

  const progress = step / totalSteps;

  const dosageUnits = ["mg", "ml", "g", "mcg", "gotas", "comprimido"];

  const hourOptions = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  // Garante que os horários sempre tenham o tamanho correto
  React.useEffect(() => {
    const count = Number(timesPerDay);

    // Horários padrão espaçados
    const defaultHours = ["08:00", "12:00", "16:00", "20:00", "22:00", "06:00"];

    // Ajusta o array para ter exatamente "count" itens
    setSelectedHours((prev) => {
      const newArr = [...prev];

      // Aumenta se precisar
      while (newArr.length < count) {
        newArr.push(defaultHours[newArr.length] || "08:00");
      }

      // Diminui se tiver itens demais
      return newArr.slice(0, count);
    });
  }, [timesPerDay]);

  const handleNext = () => {
    if (!name) return Alert.alert("Erro", "Informe o nome do medicamento");
    if (!dosageValue) return Alert.alert("Erro", "Informe a dosagem");

    setStep(2);
  };

  const handleAdd = async () => {
    if (!selectedDate)
      return Alert.alert("Erro", "Selecione a data de início");

    const { error } = await supabase.from("medicines").insert({
      name,
      dosage: `${dosageValue}${dosageUnit}`,
      times_per_day: Number(timesPerDay),
      duration_days: Number(durationDays),
      schedule_hours: selectedHours,
      start_date: selectedDate,
      user_id: "demo-user-id",
    });

    if (error) return Alert.alert("Erro", error.message);

    Alert.alert("Sucesso", "Medicamento adicionado!");
    router.push("/");
  };

  // Gera marcações do calendário
  const getMarkedDates = () => {
    if (!selectedDate) return {};

    const marks = {};
    const totalDays = Number(durationDays);

    const start = new Date(selectedDate);

    // Primeiro dia
    marks[selectedDate] = {
      startingDay: true,
      endingDay: totalDays === 1,
      color: "#4f46e5",
      textColor: "white",
    };

    // Demais dias
    for (let i = 1; i < totalDays; i++) {
      const next = new Date(start);
      next.setDate(start.getDate() + i);

      const key = formatDate(next);

      marks[key] = {
        startingDay: i === 0,
        endingDay: i === totalDays - 1,
        color: "#8885d2ff",
        textColor: "white",
      };
    }

    return marks;
  };

  return (
    <View style={styles.container}>
      <Header title="Adicionar Medicamento" />

      {/* Barra de progresso */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      {/* Botão voltar etapa */}
      {step > 1 && (
        <TouchableOpacity
          style={styles.backStepButton}
          onPress={() => setStep(step - 1)}
        >
          <Text style={styles.backStepText}>← Voltar etapa</Text>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.form}>
          {/* === ETAPA 1 === */}
          {step === 1 && (
            <>
              <Text style={styles.sectionTitle}>Informações básicas</Text>

              {/* Nome */}
              <Text style={styles.label}>Nome do medicamento</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Ibuprofeno"
                value={name}
                onChangeText={setName}
              />

              {/* Dosagem */}
              <Text style={styles.label}>Dosagem</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 10 }]}
                  keyboardType="numeric"
                  placeholder="Ex: 500"
                  value={dosageValue}
                  onChangeText={setDosageValue}
                />
                <View style={[styles.input, { flex: 1, padding: 0 }]}>
                  <Picker
                    selectedValue={dosageUnit}
                    onValueChange={(v) => setDosageUnit(v)}
                    style={{ width: "100%", height: 56 }}
                  >
                    {dosageUnits.map((u) => (
                      <Picker.Item key={u} label={u} value={u} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Vezes ao dia */}
              <Text style={styles.label}>Vezes ao dia</Text>
              <View style={[styles.input, { padding: 0 }]}>
                <Picker
                  selectedValue={timesPerDay}
                  onValueChange={(v) => setTimesPerDay(v)}
                  style={{ width: "100%", height: 56 }}
                >
                  {[1,2,3,4,5,6].map((n) => (
                    <Picker.Item key={n} label={`${n}`} value={`${n}`} />
                  ))}
                </Picker>
              </View>

              {/* Duração */}
              <Text style={styles.label}>Duração (dias)</Text>
              <View style={[styles.input, { padding: 0 }]}>
                <Picker
                  selectedValue={durationDays}
                  onValueChange={(v) => setDurationDays(v)}
                  style={{ width: "100%", height: 56 }}
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                    <Picker.Item key={n} label={`${n}`} value={`${n}`} />
                  ))}
                </Picker>
              </View>

              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Próximo →</Text>
              </TouchableOpacity>
            </>
          )}

          {/* === ETAPA 2 === */}
          {step === 2 && (
            <>
              <Text style={styles.sectionTitle}>Horários e datas</Text>

              {/* Gera automaticamente a quantidade de horários */}
              {Array.from({ length: Number(timesPerDay) }).map((_, index) => (
                <View key={index} style={{ marginBottom: 20 }}>
                  <Text style={styles.label}>Horário {index + 1}</Text>

                  <View
                    style={[
                      styles.wheelContainer,
                      Platform.OS === "android" && styles.wheelAndroidFix,
                    ]}
                  >
                    <Picker
                      selectedValue={selectedHours[index] ?? hourOptions[0]}
                      onValueChange={(value) => {
                        const updated = [...selectedHours];
                        updated[index] = value;
                        setSelectedHours(updated);
                      }}
                      style={{
                        width: "100%",
                        height: 56,
                      }}
                      itemStyle={{
                        fontSize: 20,
                        color: "#111827",
                      }}
                    >
                      {hourOptions.map((h) => (
                        <Picker.Item key={h} label={h} value={h} />
                      ))}
                    </Picker>
                  </View>
                </View>
              ))}

              {/* Calendário */}
              <Text style={styles.label}>Selecione a data de início</Text>

              <Calendar
                minDate={new Date().toISOString().split("T")[0]}
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={getMarkedDates()}
                markingType="period"
                theme={{
                  todayTextColor: "#4f46e5",
                  arrowColor: "#4f46e5",
                  textSectionTitleColor: "#374151",
                  selectedDayBackgroundColor: "#4f46e5",
                  dayTextColor: "#111827",
                }}
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
                <Text style={styles.saveButtonText}>Salvar medicamento</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },

  scroll: { paddingBottom: 120 },

  form: {
    flex: 1,
    display: "flex",
    minHeight: "100%",
    padding: 16,
  },

  progressContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "#e5e7eb",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#4f46e5",
  },

  backStepButton: {
    padding: 12,
    paddingLeft: 20,
  },
  backStepText: {
    fontSize: 14,
    color: "#4f46e5",
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
    color: "#374151",
  },
  input: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    height: 56,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  wheelContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },

  wheelAndroidFix: {
    backgroundColor: "#fff",
  },

  nextButton: {
    marginTop: 32,
    marginBottom: 42,
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  saveButton: {
    marginTop: 24,
    backgroundColor: "#4f46e5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});