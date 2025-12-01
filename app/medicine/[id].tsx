import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Header from "@/components/Header";
import { getMedicineById, deleteMedicine } from "@/services/medicines";

export default function MedicineDetails() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [medicine, setMedicine] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const session = await AsyncStorage.getItem("sessionUser");

      if (!session) {
        navigation.navigate("login");
        setLoading(false);
        return;
      }

      const user = JSON.parse(session);

      setUserId(user?.id || "");
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const result = await getMedicineById(id as string, userId);

      if (result.success) {
        setMedicine(result.data);
      } else {
        console.log("Erro ao buscar medicamento:", result.error);
      }

      setLoading(false);
    }

    if (userId) load();
  }, [userId]);

  const handleDeleteMedicine = (medicineId: string, medicineName: string) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja deletar ${medicineName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            const result = await deleteMedicine(medicineId, userId);
            if (!result.success) {
              Alert.alert("Erro", "Não foi possível deletar o medicamento");
              return;
            }

            Alert.alert("Sucesso", "Medicamento deletado com sucesso!");
            router.replace("/"); // volta para home
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!medicine) {
    return (
      <>
        <Header title="Detalhes do medicamento" showBackButton />
        <View style={styles.container}>
          <Text style={styles.errorText}>Erro ao carregar o medicamento.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Header
        title="Detalhes do medicamento"
        showBackButton
        rightSide="delete"
        rightPress={() => handleDeleteMedicine(medicine.id, medicine.name)}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{medicine.name}</Text>
            <Text style={styles.subtitle}>{medicine.dosage}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push(`edit/${id}`)}>
            <MaterialCommunityIcons
              name="square-edit-outline"
              size={34}
              color="#4f46e5"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <InfoRow label="Início do tratamento" value={medicine.start_date} />
          <InfoRow label="Vezes por dia" value={`${medicine.times_per_day}x`} />
          <InfoRow label="Duração" value={`${medicine.duration_days} dias`} />
        </View>

        <Text style={styles.sectionTitle}>Horários de tomada</Text>

        <View style={styles.card}>
          {medicine.schedules.map((s: any, i: number) => (
            <Text key={i} style={styles.scheduleItem}>
              • {i + 1}° Dose — {s.time.slice(0, 5)}
            </Text>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 22,
    backgroundColor: "#f9fafb",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    fontSize: 18,
    color: "#4b5563",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 28,
    marginBottom: 6,
    color: "#111827",
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 20,
    elevation: 1,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },

  infoLabel: {
    fontSize: 16,
    color: "#6b7280",
  },

  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  scheduleItem: {
    fontSize: 16,
    paddingVertical: 6,
    color: "#374151",
  },

  errorText: {
    fontSize: 18,
    textAlign: "center",
    color: "#b91c1c",
  },
});
