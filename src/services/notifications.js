import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export async function registerForPushNotifications() {
    if (!Device.isDevice) return null;

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('omnidrive', {
            name: 'OmniDrive',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#febd69',
        });
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await AsyncStorage.setItem('pushToken', token);
    return token;
}

export function usePushNotifications(onNotification) {
    const { useEffect } = require('react');
    useEffect(() => {
        const sub = Notifications.addNotificationReceivedListener(onNotification);
        return () => sub.remove();
    }, []);
}

export async function sendLocalNotification(title, body) {
    await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: null,
    });
}
