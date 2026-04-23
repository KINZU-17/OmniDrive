import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { api } from '../services/api';
import { colors, spacing, radius } from '../theme';

export default function PaymentScreen({ route, navigation }) {
    const { vehicle, amount } = route.params;
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // null | 'waiting' | 'paid' | 'failed'
    const [receipt, setReceipt] = useState('');

    const pay = async () => {
        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('0')) cleaned = '254' + cleaned.slice(1);
        if (cleaned.length < 12) { Alert.alert('Invalid phone', 'Enter a valid Kenyan number e.g. 0712345678'); return; }

        setLoading(true);
        setStatus(null);
        try {
            const res = await api.initiateMpesa({
                phone: cleaned,
                amount,
                vehicleName: `${vehicle.brand} ${vehicle.model}`,
                vehicleId: vehicle.id,
            });
            if (!res.success) throw new Error(res.error || 'STK push failed');

            setStatus('waiting');
            setLoading(false);

            // Poll for confirmation
            let attempts = 0;
            const poll = setInterval(async () => {
                attempts++;
                if (attempts > 20) {
                    clearInterval(poll);
                    setStatus('failed');
                    return;
                }
                const s = await api.pollMpesaStatus(res.checkoutRequestId);
                if (s.status === 'paid') {
                    clearInterval(poll);
                    setReceipt(s.receipt || '');
                    setStatus('paid');
                } else if (s.status === 'failed') {
                    clearInterval(poll);
                    setStatus('failed');
                }
            }, 3000);
        } catch (e) {
            setLoading(false);
            Alert.alert('Error', e.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>💳 MPesa Payment</Text>
            <View style={styles.summary}>
                <Text style={styles.summaryLabel}>Vehicle</Text>
                <Text style={styles.summaryVal}>{vehicle.brand} {vehicle.model}</Text>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryPrice}>${amount.toLocaleString()}</Text>
            </View>

            {status === null && (
                <>
                    <Text style={styles.label}>MPesa Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0712 345 678"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />
                    <TouchableOpacity style={styles.btn} onPress={pay} disabled={loading}>
                        {loading
                            ? <ActivityIndicator color={colors.bg} />
                            : <Text style={styles.btnText}>Send MPesa Prompt</Text>
                        }
                    </TouchableOpacity>
                </>
            )}

            {status === 'waiting' && (
                <View style={styles.statusBox}>
                    <ActivityIndicator color={colors.primary} size="large" />
                    <Text style={styles.statusTitle}>📱 Check Your Phone</Text>
                    <Text style={styles.statusSub}>Enter your MPesa PIN to complete payment</Text>
                    <Text style={styles.statusSub}>Waiting for confirmation...</Text>
                </View>
            )}

            {status === 'paid' && (
                <View style={styles.statusBox}>
                    <Text style={{ fontSize: 48 }}>✅</Text>
                    <Text style={[styles.statusTitle, { color: colors.success }]}>Payment Confirmed!</Text>
                    {receipt ? <Text style={styles.statusSub}>Receipt: {receipt}</Text> : null}
                    <Text style={styles.statusSub}>Amount: ${amount.toLocaleString()}</Text>
                    <TouchableOpacity style={styles.btn} onPress={() => navigation.popToTop()}>
                        <Text style={styles.btnText}>Back to Browse</Text>
                    </TouchableOpacity>
                </View>
            )}

            {status === 'failed' && (
                <View style={styles.statusBox}>
                    <Text style={{ fontSize: 48 }}>❌</Text>
                    <Text style={[styles.statusTitle, { color: colors.danger }]}>Payment Failed</Text>
                    <Text style={styles.statusSub}>Please try again</Text>
                    <TouchableOpacity style={styles.btn} onPress={() => setStatus(null)}>
                        <Text style={styles.btnText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
    title: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing.lg },
    summary: {
        backgroundColor: colors.card,
        borderRadius: radius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.lg,
    },
    summaryLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 2 },
    summaryVal: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.sm },
    summaryPrice: { color: colors.primary, fontSize: 24, fontWeight: '900' },
    label: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.sm },
    input: {
        backgroundColor: colors.card,
        borderRadius: radius.md,
        padding: spacing.md,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: 16,
        marginBottom: spacing.md,
    },
    btn: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        padding: spacing.md + 2,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    btnText: { color: colors.bg, fontSize: 16, fontWeight: '800' },
    statusBox: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.md },
    statusTitle: { color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center' },
    statusSub: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
});
