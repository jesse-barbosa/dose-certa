import { supabase } from "../services/supabase";

// ADICIONAR MEDICAMENTO + HORÁRIOS
export async function addMedicine(medicineData: {
  name: string;
  dosage: string;
  times_per_day: number;
  duration_days: number;
  start_date: string;
  schedule_hours: string[]; // ["08:00", "12:00", ...]
  userId: string;
}) {
  try {
    // 1. Inserir o medicamento
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

    // 2. Inserir horários vinculados
    const schedulesPayload = medicineData.schedule_hours.map((hour) => ({
      medicine_id: medicineId,
      time: hour,
    }));

    const { error: scheduleError } = await supabase
      .from("medicine_schedules")
      .insert(schedulesPayload);

    if (scheduleError) throw scheduleError;

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
      .select("*")
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

// EDITAR MEDICAMENTO (horários editados em outra função)
export async function updateMedicine(
  medicineId: string,
  medicineData: {
    name?: string;
    dosage?: string;
    times_per_day?: number;
    duration_days?: number;
    start_date?: string;
  },
  userId: string
) {
  try {
    const { data, error } = await supabase
      .from("medicines")
      .update({
        ...medicineData,
        updated_at: new Date(),
      })
      .eq("id", medicineId)
      .eq("user_id", userId)
      .select();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

// DELETAR MEDICAMENTO + HORÁRIOS
export async function deleteMedicine(medicineId: string, userId: string) {
  try {
    // Apagar horários primeiro
    await supabase
      .from("medicine_schedules")
      .delete()
      .eq("medicine_id", medicineId);

    // Apagar o medicamento
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
