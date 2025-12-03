import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import CardMedicine from "../components/CardMedicine";
import Button from "../components/Button";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getNextDose } from "@/utils/getNextDose";
import { getMedicines, takeDose, deleteMedicine } from "@/services/medicines";

export default function Home() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const session = await AsyncStorage.getItem("sessionUser");

      if (!session) {
        router.replace("/");
        setLoading(false);
        return;
      }

      const user = JSON.parse(session);

      setUsername(user?.name || "");
      setUserId(user?.id || "");
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["medicines", userId] });
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, [userId]);

  // BUSCAR MEDICAMENTOS
  const { data, isLoading } = useQuery({
    queryKey: ["medicines", userId],
    enabled: !!userId, // só roda quando userId existir
    queryFn: async () => {
      const result = await getMedicines(userId);
      return result.success ? result.data : [];
    },
  });

  const enriched = data?.map((m) => {
    const scheduleHours = m.schedules?.map((s) => s.time) || [];
    const nextTime = getNextDose(scheduleHours);

    const takenToday = (hour: string) => {
      const todayLocal = new Date().toLocaleDateString("pt-BR");

      return m.history?.some((h) => {
        return (
          h.status === "taken" &&
          new Date(h.date).toLocaleDateString("pt-BR") === todayLocal &&
          h.hour === hour
        );
      });
    };

    const now = new Date();
    const hasDoseNow = m.schedules.some((s) => {
      const [h, m2] = s.time.split(":").map(Number);
      const scheduled = new Date();
      scheduled.setHours(h, m2, 0, 0);

      return (
        scheduled <= now && !takenToday(s.time) && new Date(m.start_date) <= now
      );
    });

    return {
      ...m,
      nextTime,
      hasDoseNow,
      takenToday,
      notStarted: new Date(m.start_date) > new Date(),
      startDate: m.start_date,
    };
  });

  const takeMutation = useMutation({
    mutationFn: async ({ medicineId, hour }: any) => {
      return await takeDose(medicineId, hour);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines", userId] });
    },
    onError: () => {
      Alert.alert("Erro", "Não foi possível registrar a dose.");
    },
  });

  // DELETAR MEDICAMENTO
  const deleteMutation = useMutation({
    mutationFn: async (medicineId: string) => {
      const result = await deleteMedicine(medicineId, userId);
      if (!result.success) {
        throw new Error("Erro ao deletar medicamento");
      }
      return result;
    },
    onSuccess: () => {
      // Atualiza a lista de medicamentos após deletar
      queryClient.invalidateQueries({ queryKey: ["medicines", userId] });
      Alert.alert("Sucesso", "Medicamento deletado com sucesso!");
    },
    onError: (error) => {
      Alert.alert("Erro", "Erro ao deletar medicamento: " + error.message);
    },
  });

  // FUNÇÃO PARA DELETAR
  const handleDeleteMedicine = (medicineId: string, medicineName: string) => {
    Alert.alert(
      "Confirmar Exclusão",
      ` Tem certeza que deseja deletar ${medicineName}?`,
      [
        {
          text: "Cancelar",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Deletar",
          onPress: () => {
            deleteMutation.mutate(medicineId);
          },
          style: "destructive",
        },
      ]
    );
  };

  // FUNÇÃO PARA EDITAR
  const handleEditMedicine = (medicineId: string) => {
    router.push(`edit/${medicineId}`);
  };

  const handleTake = (medicineId: string, hour: string) => {
    Alert.alert(
      "Confirmar dose",
      `Deseja registrar a dose das ${hour.slice(0, 5)} como tomada?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sim, tomar agora",
          style: "default",
          onPress: () => {
            takeMutation.mutate({ medicineId, hour });
          },
        },
      ]
    );
  };

  // FUNÇÃO PARA ADICIONAR
  const handleAddMedicine = () => {
    router.push("/add");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["medicines", userId] });
    setRefreshing(false);
  };

  // ORDENAR MEDICAMENTOS
  const sorted = enriched?.sort((a, b) => {
    // 1 — prioridade máxima: tem dose para tomar AGORA
    if (a.hasDoseNow && !b.hasDoseNow) return -1;
    if (!a.hasDoseNow && b.hasDoseNow) return 1;

    // 2 — já começou vs não começou
    if (!a.notStarted && b.notStarted) return -1;
    if (a.notStarted && !b.notStarted) return 1;

    // 3 — ambos já começaram → ordenar pela nextTime
    return a.nextTime - b.nextTime;
  });

  return (
    <View style={styles.container}>
      <Header title={`Olá, ${username}!`} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando medicamentos...</Text>
        </View>
      ) : data && data.length > 0 ? (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {sorted.map((item: any) => (
            <CardMedicine
              key={item.id}
              name={item.name}
              dosage={item.dosage}
              nextTime={item.nextTime}
              schedules={item.schedules.map((s) => ({
                time: s.time,
                taken: item.takenToday(s.time),
              }))}
              startDate={item.startDate}
              notStarted={item.notStarted}
              onTake={(hour) => handleTake(item.id, hour)}
              onOpenDetails={() => router.push(`/medicine/${item.id}`)}
              onEdit={() => handleEditMedicine(item.id)}
              onDelete={() => handleDeleteMedicine(item.id, item.name)}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyBox}>
            <MaterialIcons name="check-circle" size={56} color="#4f46e5" />
            <Text style={styles.emptyTitle}>
              Você não tem medicamentos para tomar!
            </Text>
            <Text style={styles.emptySubtitle}>
              Adicione um medicamento para começar a utilizar a aplicação
            </Text>
          </View>
          <Button onPress={handleAddMedicine} style={styles.addButton}>
            <View style={styles.addButtonContent}>
              <Text style={styles.addButtonText}>
                Adicione seu primeiro medicamento
              </Text>
              <MaterialIcons
                name="add-circle"
                size={20}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </View>
          </Button>
        </View>
      )}

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  list: {
    padding: 10,
    paddingBottom: 100,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#4f46e5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  deleteButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginBottom: 120,
  },
  emptyBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e6e6e6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 28,
    marginBottom: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4f46e5",
    marginBottom: 6,
    textAlign: "center",
    opacity: 0.9,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#1a1a1aff",
    textAlign: "center",
    opacity: 0.5,
  },
  addButton: {
    padding: 12,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.9,
  },
});
