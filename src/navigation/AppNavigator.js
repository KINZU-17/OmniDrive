import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { colors } from '../theme';

import BrowseScreen from '../screens/BrowseScreen';
import VehicleDetailScreen from '../screens/VehicleDetailScreen';
import PaymentScreen from '../screens/PaymentScreen';
import WishlistScreen from '../screens/WishlistScreen';
import AccountScreen from '../screens/AccountScreen';

const Tab = createBottomTabNavigator();
const BrowseStack = createStackNavigator();

function BrowseNavigator() {
    return (
        <BrowseStack.Navigator screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700' },
        }}>
            <BrowseStack.Screen name="Browse" component={BrowseScreen} options={{ title: 'OmniDrive' }} />
            <BrowseStack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{ title: 'Vehicle Details' }} />
            <BrowseStack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
        </BrowseStack.Navigator>
    );
}

const icon = (emoji) => ({ focused }) => (
    <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

export default function AppNavigator() {
    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, height: 60 },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: { fontSize: 11, marginBottom: 4 },
        }}>
            <Tab.Screen name="BrowseTab" component={BrowseNavigator}
                options={{ title: 'Browse', tabBarIcon: icon('🏠') }} />
            <Tab.Screen name="Wishlist" component={WishlistScreen}
                options={{ title: 'Saved', tabBarIcon: icon('❤️'),
                    headerStyle: { backgroundColor: colors.bg },
                    headerTintColor: colors.text,
                    headerShown: true,
                    headerTitle: 'My Wishlist',
                }} />
            <Tab.Screen name="Account" component={AccountScreen}
                options={{ title: 'Account', tabBarIcon: icon('👤'),
                    headerStyle: { backgroundColor: colors.bg },
                    headerTintColor: colors.text,
                    headerShown: true,
                    headerTitle: 'Account',
                }} />
        </Tab.Navigator>
    );
}
