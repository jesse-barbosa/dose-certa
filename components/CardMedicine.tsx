import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  GestureResponderEvent,
  Platform,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { format, formatDistanceToNowStrict } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { Ionicons } from "@expo/vector-icons";
import Button from "./Button";

type MaybeDate = Date | string | number | undefined;

interface Props {
  name: string;
  dosage: string;
  lastTaken?: MaybeDate; // último horário que o usuário tomou
  nextDose?: MaybeDate; // próximo horário que deve tomar
  frequency?: string; // texto curto: "8/8h", "Diário", etc.
  notes?: string; // observações rápidas
  remainingPills?: number; // contador
  onTake: (e?: GestureResponderEvent) => void; // ação ao tomar
  onSnooze?: (minutes?: number) => void; // adiar (ex.: 15 min)
  onOpenDetails?: () => void; // abrir tela de detalhes/editar
  color?: string; // cor do card/medicamento
}

/**
 * CardMedicine: card compacto, informativo e com várias ações.
 *
 * Recursos:
 * - Nome, dosagem
 * - Último horário que tomou (HH:mm) + "há X"
 * - Próxima dose: contagem regressiva (Atualiza a cada segundo)
 * - Barra de progresso entre lastTaken -> nextDose (quando possível)
 * - Status visual: A tempo / Agora / Atrasado
 * - Botões: Tomar (primário), Adiar (secundário), Detalhes (ícone)
 * - Indicador de pílulas restantes, notas curtas
 *
 * Nota: Recebe lastTaken/nextDose como Date | string | number. Converte internamente.
 */
export default function CardMedicine({
  name,
  dosage,
  lastTaken,
  nextDose,
  frequency,
  notes,
  remainingPills,
  onTake,
  onSnooze,
  onOpenDetails,
  color = "#2563EB", // azul padrão
}: Props) {
  // normalize dates
  const last = useMemo(
    () => (lastTaken ? new Date(lastTaken as any) : undefined),
    [lastTaken]
  );
  const next = useMemo(
    () => (nextDose ? new Date(nextDose as any) : undefined),
    [nextDose]
  );

  // ticking "now" to update countdown/progress
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const msToNext = useMemo(
    () => (next ? next.getTime() - now : undefined),
    [next, now]
  );
  const msSinceLast = useMemo(
    () => (last ? now - last.getTime() : undefined),
    [last, now]
  );

  // status: upcoming, now, overdue
  const status = useMemo(() => {
    if (!next) return "sem-agendamento";
    if (msToNext === undefined) return "sem-agendamento";
    if (msToNext <= 0) return "agora/atrasado";
    // se faltar menos de 60s, "agora"
    if (msToNext > 0 && msToNext <= 60_000) return "agora";
    return "a-tempo";
  }, [msToNext, next]);

  // friendly countdown string
  const countdown = useMemo(() => {
    if (!next) return null;
    if (msToNext! <= 0) {
      // overdue: quanto tempo passou desde o horário da dose
      const overdueMs = Math.abs(msToNext!);
      return `Atrasado • ${formatDistanceToNowStrict(next, {
        addSuffix: true,
        locale: ptBR,
      })}`; // ex: "há 5 minutos"
    } else {
      // tempo restante: usar formatDistanceToNowStrict (mais humano)
      return `Falta ${formatDistanceToNowStrict(next, {
        addSuffix: false,
        locale: ptBR,
      })}`; // ex: "5 minutos"
    }
  }, [next, msToNext]);

  // progress percent between last and next (0..1). Only when both exist and next>last.
  const progress = useMemo(() => {
    if (!last || !next) return 0;
    const total = next.getTime() - last.getTime();
    if (total <= 0) return 1;
    const elapsed = now - last.getTime();
    const p = Math.max(0, Math.min(1, elapsed / total));
    return p;
  }, [last, next, now]);

  // formatted times
  const lastTimeFormatted = last ? format(last, "HH:mm") : null;
  const nextTimeFormatted = next ? format(next, "HH:mm, dd/MM") : null;

  // colored accent depending on status
  const accentColor =
    status === "a-tempo" ? color : status === "agora" ? "#f59e0b" : "#ef4444";

  // small helper actions
  const handleSnooze = () => {
    if (onSnooze) onSnooze(15); // adia 15 min por padrão
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(80)}
      style={[styles.card, { borderLeftColor: accentColor }]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${dosage}. ${countdown ?? ""}`}
    >
      {/* Header: left badge + title + pill stock */}
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: `${accentColor}20` }]}>
          <Ionicons name="medkit-outline" size={20} color={accentColor} />
        </View>

        <View style={styles.titleBlock}>
          <Text
            style={[styles.title, { color: accentColor }]}
            numberOfLines={1}
          >
            {name}
          </Text>
          <View style={styles.subtitleRow}>
            <Text style={styles.dosage}>{dosage}</Text>
            {frequency ? <Text style={styles.dot}>•</Text> : null}
            {frequency ? (
              <Text style={styles.frequency}>{frequency}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.rightActions}>
          {typeof remainingPills === "number" && (
            <View style={styles.pillBadge}>
              <Text style={styles.pillBadgeText}>{remainingPills}</Text>
              <Text style={styles.pillBadgeLabel}>píl</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={onOpenDetails}
            style={styles.iconButton}
            accessibilityLabel="Detalhes do medicamento"
          >
            <Ionicons name="ellipsis-vertical" size={18} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Middle: countdown / last taken / next time */}
      <View style={styles.middle}>
        <View style={styles.timeColumn}>
          <Text style={styles.smallLabel}>Próxima dose</Text>
          <View style={styles.nextRow}>
            <Text
              style={[
                styles.nextTime,
                status === "agora/atrasado" || status === "agora"
                  ? styles.nextTimeAlert
                  : null,
              ]}
            >
              {next ? (msToNext! <= 0 ? "Agora" : nextTimeFormatted) : "—"}
            </Text>
            <Text style={styles.countdown}>{countdown}</Text>
          </View>
        </View>

        <View style={styles.sep} />

        <View style={styles.timeColumn}>
          <Text style={styles.smallLabel}>Última vez</Text>
          <Text style={styles.lastTakenText}>
            {last
              ? `${lastTimeFormatted} • ${formatDistanceToNowStrict(last, {
                  addSuffix: true,
                  locale: ptBR,
                })}`
              : "—"}
          </Text>
          {notes ? (
            <Text style={styles.notes} numberOfLines={1}>
              {notes}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Progress bar */}
      <View
        style={styles.progressWrap}
        accessible
        accessibilityLabel={`Progresso até próxima dose ${Math.round(
          progress * 100
        )} por cento`}
      >
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%`, backgroundColor: accentColor },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {progress >= 1
            ? "Pronto para tomada"
            : `${Math.round(progress * 100)}% do intervalo`}
        </Text>
      </View>

      {/* Actions row */}
      <View style={styles.actions}>
        <Button
          onPress={onTake}
          style={styles.primaryButton}
          accessibilityLabel="Tomar remédio agora"
        >
          <View style={styles.btnContent}>
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.btnText}>Tomar</Text>
          </View>
        </Button>

        <TouchableOpacity
          onPress={handleSnooze}
          style={styles.secondaryButton}
          accessibilityLabel="Adiar 15 minutos"
        >
          <Ionicons name="time-outline" size={18} color="#374151" />
          <Text style={styles.secondaryText}>Adiar 15m</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenDetails}
          style={styles.ghostButton}
          accessibilityLabel="Ver detalhes"
        >
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#374151"
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: Platform.OS === "ios" ? 0.06 : 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  dosage: {
    fontSize: 13,
    color: "#6b7280",
  },
  dot: {
    marginHorizontal: 8,
    color: "#d1d5db",
  },
  frequency: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  rightActions: {
    marginLeft: 8,
    alignItems: "flex-end",
  },
  pillBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  pillBadgeText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#111827",
  },
  pillBadgeLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: -2,
  },
  iconButton: {
    padding: 6,
  },

  middle: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
  },
  timeColumn: {
    flex: 1,
  },
  smallLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 6,
  },
  nextRow: {
    flexDirection: "column",
  },
  nextTime: {
    fontSize: 16,
    fontWeight: "700",
  },
  nextTimeAlert: {
    color: "#b91c1c",
  },
  countdown: {
    marginTop: 6,
    fontSize: 13,
    color: "#6b7280",
  },
  sep: {
    width: 12,
  },
  lastTakenText: {
    fontSize: 14,
    color: "#374151",
    marginTop: 2,
  },
  notes: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
  },

  progressWrap: {
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    width: "0%",
    borderRadius: 8,
  },
  progressLabel: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
    textAlign: "right",
  },

  actions: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  primaryButton: {
    flex: 1,
    marginRight: 10,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
  },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  secondaryText: {
    marginLeft: 8,
    fontWeight: "700",
    color: "#374151",
  },
  ghostButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eef2f7",
  },
});
