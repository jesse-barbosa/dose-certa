import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configuração inicial: como a notificação será exibida
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Solicita permissão do usuário para receber notificações
export async function requestPermissions() {
  if (Platform.OS === "android") {
    await Notifications.requestPermissionsAsync();
  } else {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }
}

// Agenda uma notificação local única
export async function scheduleNotification(
  title: string,
  body: string,
  triggerDate: Date
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: triggerDate,
  });

  return notificationId;
}

// Agenda notificação diária (por exemplo, todo dia no mesmo horário)
export async function scheduleDailyNotification(
  title: string,
  body: string,
  hour: number,
  minute: number
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });

  return notificationId;
}

// Cancela uma notificação agendada
export async function cancelNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Cancela todas as notificações agendadas
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
