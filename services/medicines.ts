import AsyncStorage from "@react-native-async-storage/async-storage";
import { scheduleNotification, cancelNotification } from "./notifications";
import { supabase } from "./supabase";

// Função auxiliar: salvar notificações por medicamento
async function saveNotificationIds(medicineId: string, ids: string[]) {
  await AsyncStorage.setItem(`med_notifs_${medicineId}`, JSON.stringify(ids));
}

// Função auxiliar: recuperar IDs de notificações de um medicamento
async function getNotificationIds(medicineId: string) {
  const json = await AsyncStorage.getItem(`med_notifs_${medicineId}`);
  return json ? JSON.parse(json) : [];
}

// Função auxiliar: cancelar notificações antigas de um medicamento
async function cancelOldNotifications(medicineId: string) {
  const oldIds = await getNotificationIds(medicineId);
  for (const id of oldIds) {
    await cancelNotification(id);
  }
  await saveNotificationIds(medicineId, []); // limpa lista
}

// ADICIONAR MEDICAMENTO + HORÁRIOS
// ADICIONAR MEDICAMENTO + HORÁRIOS
export async function addMedicine(medicineData: {
  name: string;
  dosage: string;
  times_per_day: number;
  duration_days: number;
  start_date: string;
  schedule_hours: string[];
  userId: string;
}) {
  try {
    const { data: medData, error: medError } = await supabase
      .from("medicines")
      .insert([
        {
          name: medicineData.name,
          dosage: medicineData.dosage,
          times_per_day: medicineData.times_per_day,
          duration_days: medicineData.duration_days,
          start_date: medicineData.start_date,
          user_id: medicineData.userId,
          created_at: new Date(),
        },
      ])
      .select()
      .single();

    if (medError) throw medError;
    const medicineId = medData.id;

    const schedulesPayload = medicineData.schedule_hours.map((hour) => ({
      medicine_id: medicineId,
      time: hour,
    }));

    const { error: scheduleError } = await supabase
      .from("medicine_schedules")
      .insert(schedulesPayload);

    if (scheduleError) throw scheduleError;

    // Agenda notificações e salva IDs
    const notifIds: string[] = [];
    for (const hourStr of medicineData.schedule_hours) {
      const [h, m] = hourStr.split(":").map(Number);
      const trigger = new Date(medicineData.start_date);
      trigger.setHours(h);
      trigger.setMinutes(m - 5);
      trigger.setSeconds(0);

      if (trigger > new Date()) {
        const id = await scheduleNotification(
          `Hora do remédio: ${medicineData.name}`,
          `É hora de tomar ${medicineData.dosage}`,
          trigger
        );
        notifIds.push(id);
      }
    }
    await saveNotificationIds(medicineId, notifIds);

    return { success: true, data: medData };
  } catch (error) {
    console.error("Erro na função addMedicine:", error);
    return { success: false, error };
  }
}

// LISTAR MEDICAMENTOS
export async function getMedicines(userId: string) {
  try {
    const { data, error } = await supabase
      .from("medicines")
      .select(
        `
        *,
        schedules:medicine_schedules (*),
        history:medicine_history (*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, data: [], error };
  }
}

// BUSCAR MEDICAMENTO POR ID
export async function getMedicineById(medicineId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from("medicines")
      .select("*")
      .eq("id", medicineId)
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    // Buscar horários também
    const { data: schedules } = await supabase
      .from("medicine_schedules")
      .select("*")
      .eq("medicine_id", medicineId)
      .order("time", { ascending: true });

    return { success: true, data: { ...data, schedules } };
  } catch (error) {
    return { success: false, error };
  }
}

// REGISTRAR DOSE COMO TOMADA
export async function takeDose(medicineId: string, hour: string) {
  try {
    const now = new Date();

    const { data, error } = await supabase.from("medicine_history").insert([
      {
        medicine_id: medicineId,
        status: "taken",
        date: now,
        hour, // ← SALVAR O HORÁRIO DA DOSE
      },
    ]);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Erro ao registrar dose:", error);
    return { success: false, error };
  }
}

// EDITAR MEDICAMENTO
export async function updateMedicine(
  medicineId: string,
  medicineData: {
    name?: string;
    dosage?: string;
    times_per_day?: number;
    duration_days?: number;
    start_date?: string;
    schedule_hours?: string[];
  },
  userId: string
) {
  try {
    const { schedule_hours, ...medicineOnly } = medicineData;

    const { data, error } = await supabase
      .from("medicines")
      .update({
        ...medicineOnly,
        updated_at: new Date(),
      })
      .eq("id", medicineId)
      .eq("user_id", userId)
      .select();

    if (error) throw error;

    if (Array.isArray(schedule_hours)) {
      // 1 - Cancela notificações antigas
      await cancelOldNotifications(medicineId);

      // 2 - Atualiza horários no banco
      await supabase
        .from("medicine_schedules")
        .delete()
        .eq("medicine_id", medicineId);
      if (schedule_hours.length > 0) {
        const payload = schedule_hours.map((hour) => ({
          medicine_id: medicineId,
          time: hour,
        }));
        const { error: insError } = await supabase
          .from("medicine_schedules")
          .insert(payload);
        if (insError) throw insError;
      }

      // 3 - Agenda novas notificações
      const notifIds: string[] = [];
      for (const hourStr of schedule_hours) {
        const [h, m] = hourStr.split(":").map(Number);
        const trigger = new Date(medicineData.start_date || new Date());
        trigger.setHours(h);
        trigger.setMinutes(m - 5);
        trigger.setSeconds(0);

        if (trigger > new Date()) {
          const id = await scheduleNotification(
            `Hora do remédio: ${medicineData.name}`,
            `É hora de tomar ${medicineData.dosage}`,
            trigger
          );
          notifIds.push(id);
        }
      }
      await saveNotificationIds(medicineId, notifIds);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Erro em updateMedicine:", error);
    return { success: false, error };
  }
}

// DELETAR MEDICAMENTO + HORÁRIOS
export async function deleteMedicine(medicineId: string, userId: string) {
  try {
    // 1 - Cancela notificações antigas
    await cancelOldNotifications(medicineId);

    // 2 - Apagar horários primeiro
    await supabase
      .from("medicine_schedules")
      .delete()
      .eq("medicine_id", medicineId);

    // 3 - Apagar o medicamento
    const { error } = await supabase
      .from("medicines")
      .delete()
      .eq("id", medicineId)
      .eq("user_id", userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
