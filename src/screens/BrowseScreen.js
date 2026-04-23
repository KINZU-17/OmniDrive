import React, { useState, useMemo } from 'react';
import {
    View, Text, FlatList, TextInput, TouchableOpacity,
    Image, StyleSheet, ScrollView, StatusBar
} from 'react-native';
import { colors, spacing, radius } from '../theme';
import { inventory } from '../data/inventory';

const CATEGORIES = ['All', 'Car', 'Bike', 'Bus'];
const FUELS = ['All', 'Gasoline', 'Diesel', 'Electric', 'Hybrid'];

export default function BrowseScreen({ navigation }) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [fuel, setFuel] = useState('All');

    const filtered = useMemo(() => {
        return inventory.filter(v => {
            const matchSearch = `${v.brand} ${v.model}`.toLowerCase().includes(search.toLowerCase());
            const matchCat = category === 'All' || v.category === category;
            const matchFuel = fuel === 'All' || v.fuel === fuel;
            return matchSearch && matchCat && matchFuel;
        });
    }, [search, category, fuel]);

    const renderVehicle = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('VehicleDetail', { vehicle: item })}
            activeOpacity={0.85}
        >
            <Image
                source={{ uri: item.img }}
                style={styles.cardImage}
                resizeMode="cover"
                defaultSource={{ uri: `https://placehold.co/400x220/161b22/febd69?text=${encodeURIComponent(item.brand)}` }}
            />
            <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.brand} {item.model}</Text>
                <Text style={styles.cardSub}>{item.year} • {item.fuel} • {item.condition}</Text>
                <View style={styles.cardRow}>
                    <Text style={styles.cardPrice}>${item.price.toLocaleString()}</Text>
                    <View style={[styles.badge, item.availability === 'In Stock' ? styles.badgeGreen : styles.badgeOrange]}>
                        <Text style={styles.badgeText}>{item.availability}</Text>
                    </View>
                </View>
                <Text style={styles.cardRating}>⭐ {item.rating} • {item.nation}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

            {/* Search */}
            <View style={styles.searchWrap}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search brands or models..."
                    placeholderTextColor={colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Category filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: spacing.md }}>
                {CATEGORIES.map(c => (
                    <TouchableOpacity
                        key={c}
                        style={[styles.pill, category === c && styles.pillActive]}
                        onPress={() => setCategory(c)}
                    >
                        <Text style={[styles.pillText, category === c && styles.pillTextActive]}>{c}</Text>
                    </TouchableOpacity>
                ))}
                {FUELS.map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.pill, fuel === f && styles.pillActive]}
                        onPress={() => setFuel(f)}
                    >
                        <Text style={[styles.pillText, fuel === f && styles.pillTextActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={styles.resultsCount}>{filtered.length} vehicles</Text>

            <FlatList
                data={filtered}
                keyExtractor={item => String(item.id)}
                renderItem={renderVehicle}
                contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    searchWrap: { padding: spacing.md, paddingBottom: spacing.sm },
    searchInput: {
        backgroundColor: colors.card,
        borderRadius: radius.md,
        padding: spacing.md,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: 15,
    },
    filterRow: { maxHeight: 48, marginBottom: spacing.sm },
    pill: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: radius.full,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: spacing.sm,
    },
    pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    pillText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
    pillTextActive: { color: colors.bg },
    resultsCount: { color: colors.textMuted, fontSize: 13, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
    card: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardImage: { width: '100%', height: 200 },
    cardBody: { padding: spacing.md },
    cardTitle: { color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 4 },
    cardSub: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.sm },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    cardPrice: { color: colors.primary, fontSize: 20, fontWeight: '800' },
    badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
    badgeGreen: { backgroundColor: '#1a3a2a' },
    badgeOrange: { backgroundColor: '#3a2a1a' },
    badgeText: { color: colors.success, fontSize: 11, fontWeight: '600' },
    cardRating: { color: colors.textMuted, fontSize: 12 },
});
