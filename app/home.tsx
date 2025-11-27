import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CardMedicine from "../components/CardMedicine";
import Button from "../components/Button";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "../services/supabase";

export default function Home() {
  const navigation = useNavigation();
  const userId = "demo-user-id";

  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["medicines", userId],
    queryFn: async () => {
      // const { data } = await supabase
      //   .from("medicines")
      //   .select("*")
      //   .eq("user_id", userId);

      /* mock data */
      const data = [
        {
          id: "1",
          name: "Paracetamol",
          dosage: "500mg",
        },
        {
          id: "2",
          name: "Ibuprofeno",
          dosage: "500mg",
        },
        {
          id: "3",
          name: "Dipirona",
          dosage: "500mg",
        },
        {
          id: "4",
          name: "Dipirona",
          dosage: "500mg",
        },
        {
          id: "5",
          name: "Dipirona",
          dosage: "500mg",
        },
        {
          id: "6",
          name: "Dipirona",
          dosage: "500mg",
        },
      ];
      return data || [];
    },
  });

  return (
    <View style={styles.container}>
      <Header title="Olá, Jessé Barbosa!" />

      {data && data.length > 0 ? (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {data.map((item) => (
            <CardMedicine
              key={item.id}
              name={item.name}
              dosage={item.dosage}
              onTake={() => alert(`Tomou ${item.name}`)}
              onOpenDetails={() => router.push(`/edit/${item.id}`)}
            />
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
          <Button onPress={() => router.push("/add")} style={styles.addButton}>
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
    paddingBottom: 100, // espaço extra para footer
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
