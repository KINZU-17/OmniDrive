import React, { useState } from 'react';
import {
    View, Text, Image, ScrollView, TouchableOpacity,
    StyleSheet, Alert, Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, radius } from '../theme';

export default function VehicleDetailScreen({ route, navigation }) {
    const { vehicle: v } = route.params;
    const freight = v.category === 'Bike' ? 1000 : v.category === 'Bus' ? 7000 : 2000;
    const total = v.price + freight;
    const [wishlisted, setWishlisted] = useState(false);

    const toggleWishlist = async () => {
        try {
            const raw = await AsyncStorage.getItem('wishlist');
            let list = raw ? JSON.parse(raw) : [];
            if (list.includes(v.id)) {
                list = list.filter(id => id !== v.id);
                setWishlisted(false);
            } else {
                list.push(v.id);
                setWishlisted(true);
            }
            await AsyncStorage.setItem('wishlist', JSON.stringify(list));
        } catch (e) {}
    };

    const whatsapp = () => {
        const msg = encodeURIComponent(`Hi, I'm interested in the ${v.brand} ${v.model} listed on OmniDrive for $${v.price.toLocaleString()}. Is it still available?`);
        Linking.openURL(`https://wa.me/254700000000?text=${msg}`);
    };

    const specs = [
        ['Engine', v.engine || 'N/A'],
        ['Horsepower', v.horsepower ? `${v.horsepower} hp` : 'N/A'],
        ['Transmission', v.transmission || 'N/A'],
        ['Fuel', v.fuel],
        ['Drivetrain', v.drivetrain],
        ['Body Style', v.bodyStyle],
        ['Color', v.color],
        ['Mileage', v.mileage ? `${v.mileage.toLocaleString()} km` : '0 km'],
        ['Warranty', v.warranty || 'N/A'],
        ['Origin', v.nation],
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Image
                source={{ uri: v.img }}
                style={styles.hero}
                resizeMode="cover"
                defaultSource={{ uri: `https://placehold.co/800x400/161b22/febd69?text=${encodeURIComponent(v.brand)}` }}
            />

            <View style={styles.body}>
                <View style={styles.titleRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>{v.brand} {v.model}</Text>
                        <Text style={styles.sub}>{v.year} • {v.condition} • ⭐ {v.rating}</Text>
                    </View>
                    <TouchableOpacity onPress={toggleWishlist} style={styles.heartBtn}>
                        <Text style={{ fontSize: 26 }}>{wishlisted ? '❤️' : '🤍'}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.price}>${v.price.toLocaleString()}</Text>
                <Text style={styles.availability}>{v.availability === 'In Stock' ? '✓ In Stock' : v.availability}</Text>

                {/* Specs */}
                <Text style={styles.sectionTitle}>Specifications</Text>
                <View style={styles.specsGrid}>
                    {specs.map(([label, val]) => (
                        <View key={label} style={styles.specItem}>
                            <Text style={styles.specLabel}>{label}</Text>
                            <Text style={styles.specVal}>{val}</Text>
                        </View>
                    ))}
                </View>

                {/* Shipping */}
                <Text style={styles.sectionTitle}>Shipping & Import</Text>
                <View style={styles.shippingBox}>
                    {[
                        ['Vehicle Price', `$${v.price.toLocaleString()}`],
                        ['Freight', `$${freight.toLocaleString()}`],
                        ['Import Duty (est.)', `$${Math.round(v.price * 0.025).toLocaleString()}`],
                        ['Total', `$${(total + Math.round(v.price * 0.025)).toLocaleString()}`],
                    ].map(([l, val], i) => (
                        <View key={l} style={[styles.shippingRow, i === 3 && styles.shippingTotal]}>
                            <Text style={[styles.shippingLabel, i === 3 && { color: colors.primary, fontWeight: '700' }]}>{l}</Text>
                            <Text style={[styles.shippingVal, i === 3 && { color: colors.primary, fontWeight: '700' }]}>{val}</Text>
                        </View>
                    ))}
                </View>

                {/* Actions */}
                <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={() => navigation.navigate('Payment', { vehicle: v, amount: total })}
                >
                    <Text style={styles.btnPrimaryText}>💳 Buy with MPesa</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnWhatsapp} onPress={whatsapp}>
                    <Text style={styles.btnWhatsappText}>💬 Contact via WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnSecondary} onPress={toggleWishlist}>
                    <Text style={styles.btnSecondaryText}>{wishlisted ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    hero: { width: '100%', height: 260 },
    body: { padding: spacing.md },
    titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
    title: { color: colors.text, fontSize: 22, fontWeight: '800' },
    sub: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
    heartBtn: { padding: spacing.sm },
    price: { color: colors.primary, fontSize: 28, fontWeight: '900', marginBottom: 4 },
    availability: { color: colors.success, fontSize: 13, marginBottom: spacing.lg },
    sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm, marginTop: spacing.md },
    specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    specItem: {
        width: '47%',
        backgroundColor: colors.card,
        borderRadius: radius.md,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.sm,
    },
    specLabel: { color: colors.textMuted, fontSize: 11, marginBottom: 2 },
    specVal: { color: colors.text, fontSize: 13, fontWeight: '600' },
    shippingBox: {
        backgroundColor: colors.card,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        marginBottom: spacing.lg,
    },
    shippingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    shippingTotal: { backgroundColor: '#1a2332' },
    shippingLabel: { color: colors.textMuted, fontSize: 14 },
    shippingVal: { color: colors.text, fontSize: 14, fontWeight: '600' },
    btnPrimary: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        padding: spacing.md + 2,
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    btnPrimaryText: { color: colors.bg, fontSize: 16, fontWeight: '800' },
    btnWhatsapp: {
        backgroundColor: '#25D366',
        borderRadius: radius.md,
        padding: spacing.md + 2,
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    btnWhatsappText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    btnSecondary: {
        backgroundColor: colors.card,
        borderRadius: radius.md,
        padding: spacing.md + 2,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.xl,
    },
    btnSecondaryText: { color: colors.text, fontSize: 15, fontWeight: '600' },
});
