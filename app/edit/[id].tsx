import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "@/components/Header";
import Button from "@/components/Button";
import { getMedicineById, updateMedicine } from "@/services/medicines";

export default function EditMedicine() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Campos editáveis
  const [name, setName] = useState("");
  const [dosageValue, setDosageValue] = useState("");
  const [dosageUnit, setDosageUnit] = useState("mg");
  const [timesPerDay, setTimesPerDay] = useState("1");
  const [durationDays, setDurationDays] = useState("1");
  const [scheduleHours, setScheduleHours] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalData, setModalData] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const dosageUnits = ["mg", "ml", "g", "mcg", "gotas", "comprimido"];
  const timesOptions = ["1", "2", "3", "4", "5", "6"];
  const durationOptions = [...Array(30)].map((_, i) => `${i + 1}`);
  const hourOptions = [...Array(24)].map(
    (_, i) => `${String(i).padStart(2, "0")}:00`
  );

  useEffect(() => {
    (async () => {
      const session = await AsyncStorage.getItem("sessionUser");
      if (!session) return router.replace("login");

      const user = JSON.parse(session);
      setUserId(user.id);
    })();
  }, []);

  // Carregar dados
  useEffect(() => {
    if (!userId) return;

    (async () => {
      setLoading(true);
      const res = await getMedicineById(String(id), userId);

      if (!res.success) {
        Alert.alert("Erro", "Não foi possível carregar o medicamento");
        setLoading(false);
        return;
      }

      const med = res.data;

      setName(med.name || "");
      setStartDate(med.start_date || "");
      setTimesPerDay(String(med.times_per_day ?? 1));
      setDurationDays(String(med.duration_days ?? 1));

      // separa "500mg" em 500 e mg (tolerante)
      if (med.dosage && typeof med.dosage === "string") {
        const match = med.dosage.match(/^(\d+)([a-zA-Z]+)$/);
        if (match) {
          setDosageValue(match[1]);
          setDosageUnit(match[2]);
        } else {
          // fallback: tentar extrair números / texto
          const num = med.dosage.match(/\d+/)?.[0] ?? "";
          const unit = med.dosage.replace(num, "") || "mg";
          setDosageValue(num);
          setDosageUnit(unit);
        }
      }

      // <-- AQUI: aceita med.schedule_hours (quando existir) ou med.schedules (service)
      const loadedHours =
        (med.schedule_hours &&
          Array.isArray(med.schedule_hours) &&
          med.schedule_hours) ||
        (med.schedules &&
          Array.isArray(med.schedules) &&
          med.schedules.map((s: any) => s.time)) ||
        [];

      setScheduleHours(loadedHours);

      setLoading(false);
      setInitialized(true);
    })();
  }, [userId, id]);

  // ajustar qtde de horários ao mudar timesPerDay (só após inicialização)
  useEffect(() => {
    if (!initialized) return;

    setScheduleHours((prev) => {
      const count = Number(timesPerDay) || 1;
      const arr = [...prev];

      // se já tem exatamente a quantidade necessária, mantém
      if (arr.length === count) return arr;

      // se tem menos, adiciona valores padrão (preservando os existentes)
      while (arr.length < count) arr.push("08:00");

      // se tem mais, corta
      return arr.slice(0, count);
    });
  }, [timesPerDay, initialized]);

  const openModal = (type: string, index = 0) => {
    setModalType(type);
    setCurrentIndex(index);

    switch (type) {
      case "unit":
        setModalData(dosageUnits);
        break;
      case "times":
        setModalData(timesOptions);
        break;
      case "duration":
        setModalData(durationOptions);
        break;
      case "hour":
        setModalData(hourOptions);
        break;
    }

    setShowModal(true);
  };

  const handleSelect = (value: string) => {
    switch (modalType) {
      case "unit":
        setDosageUnit(value);
        break;
      case "times":
        setTimesPerDay(value);
        break;
      case "duration":
        setDurationDays(value);
        break;
      case "hour":
        const arr = [...scheduleHours];
        arr[currentIndex] = value;
        setScheduleHours(arr);
        break;
    }
    setShowModal(false);
  };

  const saveChanges = async () => {
    if (!name.trim()) {
      Alert.alert("Validação", "Nome é obrigatório");
      return;
    }

    const result = await updateMedicine(
      String(id),
      {
        name: name.trim(),
        dosage: `${dosageValue}${dosageUnit}`,
        times_per_day: Number(timesPerDay),
        duration_days: Number(durationDays),
        start_date: startDate,
        schedule_hours: scheduleHours,
      },
      userId
    );

    if (!result.success) {
      Alert.alert("Erro", "Falha ao atualizar");
      console.log("Erro ao atualizar:", result.error);
      return;
    }

    Alert.alert("Sucesso", "Medicamento atualizado!", [
      { text: "OK", onPress: () => router.replace(`../medicine/${id}`) },
    ]);
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "unit":
        return "Unidade da dosagem";
      case "times":
        return "Vezes ao dia";
      case "duration":
        return "Duração (dias)";
      case "hour":
        return "Selecione o horário";
      default:
        return "";
    }
  };

  const getCurrentValue = () => {
    switch (modalType) {
      case "unit":
        return dosageUnit;
      case "times":
        return timesPerDay;
      case "duration":
        return durationDays;
      case "hour":
        return scheduleHours[currentIndex] ?? "08:00";
      default:
        return "";
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Editar Medicamento" showBackButton />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Informações</Text>

        {/* Nome */}
        <Text style={styles.label}>Nome</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        {/* Dosagem */}
        <Text style={styles.label}>Dosagem</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 10 }]}
            keyboardType="numeric"
            value={dosageValue}
            onChangeText={setDosageValue}
          />

          <TouchableOpacity
            style={styles.select}
            onPress={() => openModal("unit")}
          >
            <Text>{dosageUnit}</Text>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Vezes ao dia */}
        <Text style={styles.label}>Vezes ao dia</Text>
        <TouchableOpacity
          style={styles.select}
          onPress={() => openModal("times")}
        >
          <Text>{timesPerDay}</Text>
          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>

        {/* Duração */}
        <Text style={styles.label}>Duração (dias)</Text>
        <TouchableOpacity
          style={styles.select}
          onPress={() => openModal("duration")}
        >
          <Text>{durationDays}</Text>
          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>

        {/* Horários */}
        <Text style={styles.sectionTitle}>Horários</Text>
        {scheduleHours.map((h, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.select, { marginBottom: 10 }]}
            onPress={() => openModal("hour", i)}
          >
            <Text>{h.slice(0, 5)}</Text>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
        ))}

        {/* Data */}
        <Text style={styles.sectionTitle}>Data de início</Text>
        <Calendar
          onDayPress={(d) => setStartDate(d.dateString)}
          markedDates={{
            [startDate]: { selected: true, selectedColor: "#4f46e5" },
          }}
        />

        <Button style={styles.save} onPress={saveChanges}>
          Salvar alterações
        </Button>
      </ScrollView>

      {/* Modal para seleções */}
      <Modal visible={showModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{getModalTitle()}</Text>

            <FlatList
              data={modalData}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    getCurrentValue() === item && styles.modalItemSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      getCurrentValue() === item &&
                        styles.modalItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ESTILOS (mantive os seus)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f5" },
  scroll: { padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    color: "#111827",
  },
  label: { fontSize: 14, marginBottom: 6, color: "#374151" },
  input: {
    backgroundColor: "white",
    padding: 12,
    fontSize: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  row: { flexDirection: "row", alignItems: "center" },
  select: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  arrow: { fontSize: 12, color: "#777" },
  save: { marginTop: 30, backgroundColor: "#4f46e5" },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalItemSelected: {
    backgroundColor: "#4f46e5",
  },
  modalItemText: {
    fontSize: 16,
    color: "#111827",
    textAlign: "center",
  },
  modalItemTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
});
