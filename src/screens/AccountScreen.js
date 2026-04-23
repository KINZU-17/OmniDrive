import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius } from '../theme';

export default function AccountScreen() {
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

    useFocusEffect(useCallback(() => {
        AsyncStorage.getItem('user').then(raw => raw && setUser(JSON.parse(raw)));
    }, []));

    const login = async () => {
        if (!form.email || !form.password) { Alert.alert('Error', 'Fill all fields'); return; }
        const u = { name: form.email.split('@')[0], email: form.email, since: new Date().getFullYear() };
        await AsyncStorage.setItem('user', JSON.stringify(u));
        setUser(u);
    };

    const register = async () => {
        if (!form.name || !form.email || !form.password) { Alert.alert('Error', 'Fill all fields'); return; }
        const u = { name: form.name, email: form.email, phone: form.phone, since: new Date().getFullYear() };
        await AsyncStorage.setItem('user', JSON.stringify(u));
        setUser(u);
    };

    const logout = async () => {
        await AsyncStorage.removeItem('user');
        setUser(null);
        setForm({ name: '', email: '', password: '', phone: '' });
    };

    if (user) return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
            <View style={styles.avatarWrap}>
                <Text style={{ fontSize: 64 }}>👤</Text>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>

            {[
                ['📧 Email', user.email],
                ['📱 Phone', user.phone || 'Not set'],
                ['📅 Member since', String(user.since)],
            ].map(([l, v]) => (
                <View key={l} style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{l}</Text>
                    <Text style={styles.infoVal}>{v}</Text>
                </View>
            ))}

            <TouchableOpacity style={styles.btnDanger} onPress={logout}>
                <Text style={styles.btnDangerText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
            <Text style={styles.title}>🔐 Account</Text>

            <View style={styles.tabs}>
                {['login', 'register'].map(t => (
                    <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
                        <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'login' ? 'Login' : 'Register'}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {tab === 'register' && (
                <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={colors.textMuted}
                    value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))} />
            )}
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.textMuted}
                keyboardType="email-address" autoCapitalize="none"
                value={form.email} onChangeText={v => setForm(p => ({ ...p, email: v }))} />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor={colors.textMuted}
                secureTextEntry value={form.password} onChangeText={v => setForm(p => ({ ...p, password: v }))} />
            {tab === 'register' && (
                <TextInput style={styles.input} placeholder="Phone (+2547...)" placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad" value={form.phone} onChangeText={v => setForm(p => ({ ...p, phone: v }))} />
            )}

            <TouchableOpacity style={styles.btn} onPress={tab === 'login' ? login : register}>
                <Text style={styles.btnText}>{tab === 'login' ? 'Login' : 'Create Account'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    avatarWrap: { alignItems: 'center', marginBottom: spacing.md },
    userName: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center' },
    userEmail: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: spacing.lg },
    infoRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    infoLabel: { color: colors.textMuted, fontSize: 14 },
    infoVal: { color: colors.text, fontSize: 14, fontWeight: '600' },
    btnDanger: {
        marginTop: spacing.xl, backgroundColor: '#2a1a1a',
        borderRadius: radius.md, padding: spacing.md, alignItems: 'center',
        borderWidth: 1, borderColor: colors.danger,
    },
    btnDangerText: { color: colors.danger, fontWeight: '700', fontSize: 15 },
    title: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing.lg },
    tabs: { flexDirection: 'row', marginBottom: spacing.lg, gap: spacing.sm },
    tabBtn: {
        flex: 1, padding: spacing.md, borderRadius: radius.md,
        backgroundColor: colors.card, alignItems: 'center',
        borderWidth: 1, borderColor: colors.border,
    },
    tabBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    tabText: { color: colors.textMuted, fontWeight: '600' },
    tabTextActive: { color: colors.bg },
    input: {
        backgroundColor: colors.card, borderRadius: radius.md,
        padding: spacing.md, color: colors.text,
        borderWidth: 1, borderColor: colors.border,
        fontSize: 15, marginBottom: spacing.md,
    },
    btn: {
        backgroundColor: colors.primary, borderRadius: radius.md,
        padding: spacing.md + 2, alignItems: 'center',
    },
    btnText: { color: colors.bg, fontSize: 16, fontWeight: '800' },
});
