import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { inventory } from '../data/inventory';
import { colors, spacing, radius } from '../theme';

export default function WishlistScreen({ navigation }) {
    const [items, setItems] = useState([]);

    useFocusEffect(useCallback(() => {
        AsyncStorage.getItem('wishlist').then(raw => {
            const ids = raw ? JSON.parse(raw) : [];
            setItems(inventory.filter(v => ids.includes(v.id)));
        });
    }, []));

    const remove = async (id) => {
        const raw = await AsyncStorage.getItem('wishlist');
        const ids = raw ? JSON.parse(raw).filter(i => i !== id) : [];
        await AsyncStorage.setItem('wishlist', JSON.stringify(ids));
        setItems(prev => prev.filter(v => v.id !== id));
    };

    if (!items.length) return (
        <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>🤍</Text>
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
            <Text style={styles.emptySub}>Tap the heart on any vehicle to save it</Text>
        </View>
    );

    return (
        <FlatList
            style={{ backgroundColor: colors.bg }}
            data={items}
            keyExtractor={i => String(i.id)}
            contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
            renderItem={({ item: v }) => (
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('VehicleDetail', { vehicle: v })}
                    activeOpacity={0.85}
                >
                    <Image source={{ uri: v.img }} style={styles.img} resizeMode="cover" />
                    <View style={styles.info}>
                        <Text style={styles.name}>{v.brand} {v.model}</Text>
                        <Text style={styles.sub}>{v.year} • {v.fuel}</Text>
                        <Text style={styles.price}>${v.price.toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity onPress={() => remove(v.id)} style={styles.removeBtn}>
                        <Text style={{ color: colors.danger, fontSize: 20 }}>✕</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            )}
        />
    );
}

const styles = StyleSheet.create({
    empty: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
    emptyText: { color: colors.text, fontSize: 18, fontWeight: '700' },
    emptySub: { color: colors.textMuted, fontSize: 14 },
    card: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: radius.md,
        marginBottom: spacing.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    img: { width: 100, height: 80 },
    info: { flex: 1, padding: spacing.md },
    name: { color: colors.text, fontSize: 15, fontWeight: '700' },
    sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    price: { color: colors.primary, fontSize: 16, fontWeight: '800', marginTop: 4 },
    removeBtn: { padding: spacing.md },
});
