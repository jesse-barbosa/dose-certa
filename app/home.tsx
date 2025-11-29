import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import CardMedicine from "../components/CardMedicine";
import Button from "../components/Button";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "../services/supabase";
import {
  getMedicines,
  deleteMedicine,
  addMedicine,
  updateMedicine,
} from "@/services/medicine";

export default function Home() {
  const navigation = useNavigation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

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

  // BUSCAR MEDICAMENTOS
  const { data, isLoading } = useQuery({
    queryKey: ["medicines", userId],
    enabled: !!userId, // só roda quando userId existir
    queryFn: async () => {
      const result = await getMedicines(userId);
      return result.success ? result.data : [];
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
    router.push(`/edit/${medicineId}`);
  };

  // FUNÇÃO PARA ADICIONAR
  const handleAddMedicine = () => {
    router.push("/add");
  };

  return (
    <View style={styles.container}>
      <Header title="Olá, Jessé Barbosa!" />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando medicamentos...</Text>
        </View>
      ) : data && data.length > 0 ? (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {data.map((item: any) => (
            <View key={item.id} style={styles.medicineCard}>
              <CardMedicine
                name={item.name}
                dosage={item.dosage}
                onTake={() => alert(`Tomou ${item.name}`)}
                onOpenDetails={() => handleEditMedicine(item.id)}
              />
              <View style={styles.actionButtons}>
                <Button
                  onPress={() => handleEditMedicine(item.id)}
                  style={styles.editButton}
                >
                  <MaterialIcons name="edit" size={18} color="#fff" />
                  <Text style={styles.buttonText}>Editar</Text>
                </Button>
                <Button
                  onPress={() => handleDeleteMedicine(item.id, item.name)}
                  style={styles.deleteButton}
                >
                  <MaterialIcons name="delete" size={18} color="#fff" />
                  <Text style={styles.buttonText}>Deletar</Text>
                </Button>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyBox}>
            <MaterialIcons name="check-circle" size={56} color="#34C759" />
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
                Adicionar meu primeiro medicamento
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

      <Footer
        onNavigate={(screen: string) => navigation.navigate(screen as never)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  medicineCard: {
    marginBottom: 12,
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
