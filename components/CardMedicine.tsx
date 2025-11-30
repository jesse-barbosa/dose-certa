import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useMemo, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { parseLocalDate } from "@/utils/parseLocalDate";

export default function CardMedicine({
  name,
  dosage,
  schedules = [], // <- NOVO!
  startDate,
  notStarted,
  onTake,
  onOpenDetails,
  onEdit,
  onDelete,
}) {
  const [openMenu, setOpenMenu] = useState(false);

  const today = new Date();

  const start = startDate ? parseLocalDate(startDate) : null;

  const formattedSchedules = useMemo(() => {
    return schedules.map((hour, index) => {
      const [h, m] = hour.split(":").map(Number);

      const doseTime = new Date();
      doseTime.setHours(h, m, 0, 0);

      const canTake =
        !notStarted && (!start || start <= today) && doseTime <= today;

      return {
        label: `${index + 1}° Dose`,
        hour,
        canTake,
      };
    });
  }, [schedules, notStarted, startDate]);

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.card}
        onPress={onOpenDetails}
        activeOpacity={0.9}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.dosage}>{dosage}</Text>
          </View>

          <TouchableOpacity onPress={() => setOpenMenu(!openMenu)}>
            <MaterialIcons name="more-vert" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Se ainda não começou */}
        {notStarted && start && (
          <Text style={[styles.statusText, { color: "#4b5563" }]}>
            Começa dia {start.getDate()} de{" "}
            {start.toLocaleString("pt-BR", { month: "long" })}
          </Text>
        )}

        {/* LISTA DE DOSES */}
        <View style={{ marginTop: 10 }}>
          <Text style={styles.doseTitle}>Hoje:</Text>
          {formattedSchedules.map((item, index) => (
            <View key={index} style={styles.doseRow}>
              <Text style={styles.doseLabel}>
                {item.label} — {item.hour.slice(0, 5)}
              </Text>

              <TouchableOpacity
                onPress={() => item.canTake && onTake(item.hour)}
                style={[
                  styles.takeButton,
                  !item.canTake && styles.disabledButton,
                  item.canTake
                    ? styles.availableButton
                    : item.hour <= today
                    ? styles.takenButton
                    : styles.blockedButton,
                ]}
                disabled={!item.canTake}
              >
                {item.hour <= today ? (
                  <MaterialIcons name="check-circle" size={18} color="#fff" />
                ) : item.canTake ? (
                  <MaterialIcons name="schedule" size={18} color="#fff" />
                ) : (
                  <MaterialIcons name="lock" size={18} color="#fff" />
                )}
                <Text style={styles.takeButtonText}>Tomar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      {/* DROPDOWN */}
      {openMenu && (
        <View style={styles.dropdown}>
          <TouchableOpacity style={styles.dropdownItem} onPress={onEdit}>
            <MaterialIcons name="edit" size={18} color="#374151" />
            <Text style={styles.dropdownText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dropdownItem} onPress={onDelete}>
            <MaterialIcons name="delete" size={18} color="#b91c1c" />
            <Text style={[styles.dropdownText, { color: "#b91c1c" }]}>
              Deletar
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  dosage: {
    fontSize: 15,
    color: "#6b7280",
  },

  statusText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
  },

  doseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },

  doseTitle: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "600",
    color: "#777c81ff",
  },

  doseLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },

  takeButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  disabledButton: {
    backgroundColor: "#9ca3af",
  },

  takeButtonText: {
    color: "#fff",
    fontFamily: "JetBrainsMonoBold",
    fontSize: 16,
  },

  actions: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  detailsButton: {
    padding: 6,
  },

  dropdown: {
    position: "absolute",
    right: 6,
    top: 32,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minWidth: 110,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    zIndex: 999,
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },

  dropdownText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
});
