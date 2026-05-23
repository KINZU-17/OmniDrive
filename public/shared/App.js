import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotifications } from './src/services/notifications';
import { api } from './src/services/api';
import { colors } from './src/theme';

export default function App() {
    const navigationRef = useRef(null);

    useEffect(() => {
        registerForPushNotifications().then(token => {
            if (token) api.registerPushToken(token).catch(() => {});
        });

        const sub = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            if (data?.vehicleId && navigationRef.current) {
                navigationRef.current.navigate('BrowseTab', {
                    screen: 'VehicleDetail',
                    params: { vehicle: { id: data.vehicleId } },
                });
            }
        });

        return () => sub.remove();
    }, []);

    return (
        <NavigationContainer
            ref={navigationRef}
            theme={{
                dark: true,
                colors: {
                    primary: colors.primary,
                    background: colors.bg,
                    card: colors.card,
                    text: colors.text,
                    border: colors.border,
                    notification: colors.primary,
                }
            }}
        >
            <StatusBar style="light" backgroundColor={colors.bg} />
            <AppNavigator />
        </NavigationContainer>
    );
}
