import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import Button from "./Button";

interface Props {
  name: string;
  dosage: string;
  onTake: () => void;
}

export default function CardMedicine({ name, dosage, onTake }: Props) {
  return (
    <Animated.View entering={FadeInUp.delay(100)} style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.dosage}>{dosage}</Text>
        </View>
        <Button onPress={onTake}>Tomar</Button>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  dosage: {
    color: "#6b7280",
    marginTop: 4,
  },
});
