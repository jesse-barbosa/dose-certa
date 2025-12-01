import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { addMedicine } from "@/services/medicines";

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

  const medicineSuggestions = [
    "Ibuprofeno",
    "Paracetamol",
    "Amoxicilina",
    "Dipirona",
    "Omeprazol",
    "Metformina",
    "Sinvastatina",
    "Losartana",
    "Azitromicina",
    "Cetirizina",
  ];

  const [placeholderName, setPlaceholderName] = useState("");

  const formatDate = (date) => date.toISOString().split("T")[0];

  // Horários
  const [selectedHours, setSelectedHours] = useState(["08:00"]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'dosageUnit', 'timesPerDay', 'durationDays', 'time'
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [modalData, setModalData] = useState([]);

  // Calendário
  const [selectedDate, setSelectedDate] = useState("");

  const progress = step / totalSteps;

  const dosageUnits = ["mg", "ml", "g", "mcg", "gotas", "comprimido"];
  const timesOptions = ["1", "2", "3", "4", "5", "6"];
  const durationOptions = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
  const hourOptions = Array.from(
    { length: 24 },
    (_, i) => `${i.toString().padStart(2, "0")}:00`
  );

  // Garante que os horários sempre tenham o tamanho correto
  React.useEffect(() => {
    const count = Number(timesPerDay);
    const defaultHours = ["08:00", "12:00", "16:00", "20:00", "22:00", "06:00"];

    setSelectedHours((prev) => {
      const newArr = [...prev];
      while (newArr.length < count) {
        newArr.push(defaultHours[newArr.length] || "08:00");
      }
      return newArr.slice(0, count);
    });
  }, [timesPerDay]);

  // get a random placeholder on load
  React.useEffect(() => {
    const random = Math.floor(Math.random() * medicineSuggestions.length);
    setPlaceholderName(medicineSuggestions[random]);
  }, []);

  // Funções para o Modal
  const openModal = (type, index = null) => {
    setModalType(type);

    switch (type) {
      case "dosageUnit":
        setModalData(dosageUnits);
        break;
      case "timesPerDay":
        setModalData(timesOptions);
        break;
      case "durationDays":
        setModalData(durationOptions);
        break;
      case "time":
        setModalData(hourOptions);
        setCurrentTimeIndex(index);
        break;
    }

    setShowModal(true);
  };

  const handleModalSelect = (value) => {
    switch (modalType) {
      case "dosageUnit":
        setDosageUnit(value);
        break;
      case "timesPerDay":
        setTimesPerDay(value);
        break;
      case "durationDays":
        setDurationDays(value);
        break;
      case "time":
        const updated = [...selectedHours];
        updated[currentTimeIndex] = value;
        setSelectedHours(updated);
        break;
    }
    setShowModal(false);
  };

  const getCurrentValue = () => {
    switch (modalType) {
      case "dosageUnit":
        return dosageUnit;
      case "timesPerDay":
        return timesPerDay;
      case "durationDays":
        return durationDays;
      case "time":
        return selectedHours[currentTimeIndex];
      default:
        return "";
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "dosageUnit":
        return "Selecionar Unidade";
      case "timesPerDay":
        return "Vezes ao dia";
      case "durationDays":
        return "Duração (dias)";
      case "time":
        return `Horário ${currentTimeIndex + 1}`;
      default:
        return "Selecionar";
    }
  };

  const handleNext = () => {
    if (!name) return Alert.alert("Erro", "Informe o nome do medicamento");
    if (!dosageValue) return Alert.alert("Erro", "Informe a dosagem");

    setStep(2);
  };

  const handleAdd = async () => {
    try {
      if (!selectedDate) {
        Alert.alert("Erro", "Selecione a data de início");
        return;
      }

      const userString = await AsyncStorage.getItem("sessionUser");

      if (!userString) {
        Alert.alert("Erro", "Usuário não encontrado.");
        console.log("sessionUser vazio");
        return;
      }

      let user;
      try {
        user = JSON.parse(userString);
      } catch (err) {
        console.log("Erro ao parsear sessionUser:", err);
        Alert.alert("Erro", "Falha ao carregar dados do usuário.");
        return;
      }

      if (!user?.id) {
        console.log("user.id ausente:", user);
        Alert.alert("Erro", "ID do usuário inválido.");
        return;
      }

      // Validação de UUID
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(user.id)) {
        console.log("ID inválido:", user.id);
        Alert.alert("Erro", "ID do usuário malformado.");
        return;
      }

      // Montar payload para o service
      const medicineData = {
        name: name.trim(),
        dosage: `${dosageValue}${dosageUnit}`,
        times_per_day: Number(timesPerDay),
        duration_days: Number(durationDays),
        start_date: selectedDate,
        schedule_hours: selectedHours,
        userId: user.id,
      };

      console.log("Enviando para addMedicine:", medicineData);

      // Chamada ao service
      const result = await addMedicine(medicineData);

      if (!result.success) {
        console.log("Erro addMedicine:", result.error);
        Alert.alert("Erro", result.error?.message || "Falha ao adicionar.");
        return;
      }

      Alert.alert("Sucesso", "Medicamento adicionado!");
      router.push("/home");
    } catch (err) {
      console.log("Erro inesperado em handleAdd:", err);
      Alert.alert("Erro", "Ocorreu um erro inesperado.");
    }
  };

  // Gera marcações do calendário
  const getMarkedDates = () => {
    if (!selectedDate) return {};

    const marks = {};
    const totalDays = Number(durationDays);
    const start = new Date(selectedDate);

    marks[selectedDate] = {
      startingDay: true,
      endingDay: totalDays === 1,
      color: "#4f46e5",
      textColor: "white",
    };

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
                placeholder={`Ex: ${placeholderName}`}
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
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => openModal("dosageUnit")}
                >
                  <Text style={styles.selectButtonText}>{dosageUnit}</Text>
                  <Text style={styles.selectButtonIcon}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* Vezes ao dia */}
              <Text style={styles.label}>Vezes ao dia</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => openModal("timesPerDay")}
              >
                <Text style={styles.selectButtonText}>{timesPerDay}</Text>
                <Text style={styles.selectButtonIcon}>▼</Text>
              </TouchableOpacity>

              {/* Duração */}
              <Text style={styles.label}>Duração (dias)</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => openModal("durationDays")}
              >
                <Text style={styles.selectButtonText}>{durationDays}</Text>
                <Text style={styles.selectButtonIcon}>▼</Text>
              </TouchableOpacity>

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
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => openModal("time", index)}
                  >
                    <Text style={styles.selectButtonText}>
                      {selectedHours[index] || "Selecionar horário"}
                    </Text>
                    <Text style={styles.selectButtonIcon}>▼</Text>
                  </TouchableOpacity>
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
                  onPress={() => handleModalSelect(item)}
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

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  scroll: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  form: {
    flex: 1,
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
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  // Botões de seleção (substituem os Pickers)
  selectButton: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: 16,
    color: "#111827",
  },
  selectButtonIcon: {
    fontSize: 12,
    color: "#666",
  },
  nextButton: {
    marginTop: 32,
    marginBottom: 42,
    backgroundColor: "#4f46e5",
    padding: 16,
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
