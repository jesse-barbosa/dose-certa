export function getNextDose(scheduleHours: string[]) {
  if (!scheduleHours || scheduleHours.length === 0) return null;

  const now = new Date();

  // converte para Date real do dia atual
  const scheduleDates = scheduleHours.map((h) => {
    const [hour, min] = h.split(":").map(Number);
    const d = new Date();
    d.setHours(hour, min, 0, 0);
    return d;
  });

  // 1. ver se existe um horário futuro
  const future = scheduleDates.find((d) => d > now);
  if (future) return future;

  // 2. se não existe → todas já passaram → a próxima é a primeira de amanhã
  const [firstHour, firstMin] = scheduleHours[0].split(":").map(Number);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(firstHour, firstMin, 0, 0);
  return tomorrow;
}
