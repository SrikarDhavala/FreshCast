import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Product } from '@/data/mockData';
import { useInventory } from '@/store/inventory';
import { colors } from '@/theme/colors';
import { expiryStatus } from '@/utils/date';

type FilterTab = 'all' | 'alerts' | 'recent';

type NotificationItem = {
    id: string;
    product: Product;
    type: 'expired' | 'expiring' | 'added';
    title: string;
    subtitle: string;
    timeLabel: string;
    accentColor: string;
    icon: keyof typeof Ionicons.glyphMap;
};

function getDaysDiff(isoDate: string): number {
    const target = new Date(isoDate);
    if (Number.isNaN(target.getTime())) return 0;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
    return Math.round((startOfTarget - startOfToday) / (1000 * 60 * 60 * 24));
}

function formatRelativeAdded(isoDate?: string): string {
    if (!isoDate) return 'Recently';
    const added = new Date(isoDate);
    if (Number.isNaN(added.getTime())) return 'Recently';

    const diffMs = Date.now() - added.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return added.toLocaleDateString();
}

export default function NotificationsScreen() {
    const insets = useSafeAreaInsets();
    const { products, findCategory } = useInventory();
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    const notifications = useMemo<NotificationItem[]>(() => {
        const list: NotificationItem[] = [];

        // 1. Expired items (highest priority)
        const expired = products
            .filter((p) => expiryStatus(p.expiryDate) === 'expired')
            .sort((a, b) => b.expiryDate.localeCompare(a.expiryDate));

        for (const product of expired) {
            const daysAgo = Math.abs(getDaysDiff(product.expiryDate));
            list.push({
                id: `expired-${product.id}`,
                product,
                type: 'expired',
                title: `${product.name} has expired`,
                subtitle: `${product.quantity} · Check and discard if spoiled`,
                timeLabel: daysAgo === 0 ? 'Today' : `${daysAgo}d ago`,
                accentColor: colors.status.expired,
                icon: 'close-circle',
            });
        }

        // 2. Expiring soon / urgent items
        const expiring = products
            .filter((p) => ['urgent', 'soon'].includes(expiryStatus(p.expiryDate)))
            .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));

        for (const product of expiring) {
            const daysLeft = getDaysDiff(product.expiryDate);
            const timeLabel =
                daysLeft <= 0 ? 'Expires today' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft}d`;

            list.push({
                id: `expiring-${product.id}`,
                product,
                type: 'expiring',
                title: `${product.name} expiring soon`,
                subtitle: `${product.quantity} left · Use before it spoils`,
                timeLabel,
                accentColor: colors.status.soon,
                icon: 'alert-circle',
            });
        }

        // 3. Recently added items (latest 5)
        const recent = [...products]
            .filter((p) => Boolean(p.addedDate))
            .sort((a, b) => (b.addedDate || '').localeCompare(a.addedDate || ''))
            .slice(0, 5);

        for (const product of recent) {
            const category = findCategory(product.categoryId);
            list.push({
                id: `added-${product.id}`,
                product,
                type: 'added',
                title: `Added ${product.name}`,
                subtitle: `${product.quantity}${category ? ` · ${category.name}` : ''}`,
                timeLabel: formatRelativeAdded(product.addedDate),
                accentColor: colors.mint[400],
                icon: 'add-circle',
            });
        }

        return list;
    }, [products, findCategory]);

    const filteredNotifications = useMemo(() => {
        if (activeTab === 'alerts') {
            return notifications.filter((n) => n.type === 'expired' || n.type === 'expiring');
        }
        if (activeTab === 'recent') {
            return notifications.filter((n) => n.type === 'added');
        }
        return notifications;
    }, [notifications, activeTab]);

    const alertCount = notifications.filter(
        (n) => n.type === 'expired' || n.type === 'expiring',
    ).length;

    const handleOpenItem = (productId: string) => {
        router.replace({ pathname: '/item-details', params: { id: productId } });
    };

    return (
        <View style={{ flex: 1 }}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()}>
                <Animated.View
                    entering={FadeIn.duration(200)}
                    style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(2,6,3,0.95)' }]}
                />
            </Pressable>

            <View
                pointerEvents="box-none"
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    paddingHorizontal: 20,
                    paddingTop: insets.top + 12,
                    paddingBottom: insets.bottom + 12,
                }}
            >
                <Animated.View
                    entering={ZoomIn.duration(260).springify().damping(150)}
                    style={{ maxHeight: '84%', flexShrink: 1 }}
                >
                    <GlassCard radius={28} intensity={95} style={{ maxHeight: '100%', flexShrink: 1 }}>
                        <View style={{ padding: 20, flexShrink: 1 }}>
                            {/* Modal Header */}
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center gap-2.5">
                                    <View
                                        style={{ backgroundColor: `${colors.mint[400]}22` }}
                                        className="h-9 w-9 rounded-full items-center justify-center"
                                    >
                                        <Ionicons name="notifications" size={18} color={colors.mint[400]} />
                                    </View>
                                    <View>
                                        <Text className="text-white text-xl font-bold">Notifications</Text>
                                        <Text className="text-ink-300 text-xs">
                                            {alertCount > 0
                                                ? `${alertCount} expiry alert${alertCount > 1 ? 's' : ''} need attention`
                                                : 'Your kitchen is looking fresh'}
                                        </Text>
                                    </View>
                                </View>

                                <Pressable
                                    onPress={() => router.back()}
                                    className="h-8 w-8 rounded-full items-center justify-center"
                                    style={{ backgroundColor: colors.glass.fillStrong }}
                                >
                                    <Ionicons name="close" size={16} color={colors.text.primary} />
                                </Pressable>
                            </View>

                            {/* Filter Tabs */}
                            <View className="flex-row gap-2 mb-4">
                                {(
                                    [
                                        { key: 'all', label: `All (${notifications.length})` },
                                        { key: 'alerts', label: `Alerts (${alertCount})` },
                                        { key: 'recent', label: 'Recently Added' },
                                    ] as { key: FilterTab; label: string }[]
                                ).map((tab) => {
                                    const selected = activeTab === tab.key;
                                    return (
                                        <Pressable
                                            key={tab.key}
                                            onPress={() => setActiveTab(tab.key)}
                                            style={{
                                                backgroundColor: selected ? `${colors.mint[400]}26` : colors.glass.fill,
                                                borderColor: selected ? colors.mint[400] : colors.glass.border,
                                            }}
                                            className="px-3.5 py-2 rounded-full border"
                                        >
                                            <Text
                                                style={{
                                                    color: selected ? colors.mint[300] : colors.text.secondary,
                                                }}
                                                className="text-xs font-semibold"
                                            >
                                                {tab.label}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>

                            {/* Notification List */}
                            <ScrollView
                                style={{ flexShrink: 1 }}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
                            >
                                {filteredNotifications.length > 0 ? (
                                    filteredNotifications.map((item) => (
                                        <Pressable key={item.id} onPress={() => handleOpenItem(item.product.id)}>
                                            {({ pressed }) => (
                                                <GlassCard
                                                    radius={18}
                                                    style={{
                                                        opacity: pressed ? 0.85 : 1,
                                                        transform: [{ scale: pressed ? 0.99 : 1 }],
                                                        borderColor:
                                                            item.type !== 'added' ? `${item.accentColor}38` : colors.glass.border,
                                                        borderWidth: 1,
                                                    }}
                                                >
                                                    <View className="flex-row items-center gap-3 p-3.5">
                                                        <View
                                                            style={{ backgroundColor: `${item.accentColor}20` }}
                                                            className="h-11 w-11 rounded-2xl items-center justify-center relative"
                                                        >
                                                            <Text className="text-xl">{item.product.emoji}</Text>
                                                            <View
                                                                style={{ backgroundColor: '#0A1612' }}
                                                                className="absolute -bottom-1 -right-1 rounded-full p-0.5"
                                                            >
                                                                <Ionicons name={item.icon} size={13} color={item.accentColor} />
                                                            </View>
                                                        </View>

                                                        <View className="flex-1 gap-0.5 pr-1">
                                                            <Text className="text-white text-[14px] font-semibold" numberOfLines={1}>
                                                                {item.title}
                                                            </Text>
                                                            <Text className="text-ink-300 text-xs" numberOfLines={1}>
                                                                {item.subtitle}
                                                            </Text>
                                                        </View>

                                                        <View className="items-end gap-1">
                                                            <View
                                                                style={{ backgroundColor: `${item.accentColor}1E` }}
                                                                className="px-2.5 py-1 rounded-full"
                                                            >
                                                                <Text
                                                                    style={{ color: item.accentColor }}
                                                                    className="text-[11px] font-bold"
                                                                >
                                                                    {item.timeLabel}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </GlassCard>
                                            )}
                                        </Pressable>
                                    ))
                                ) : (
                                    <View className="items-center py-12 px-4">
                                        <Ionicons
                                            name="notifications-off-outline"
                                            size={34}
                                            color={colors.text.tertiary}
                                        />
                                        <Text className="text-white text-base font-semibold mt-3">
                                            All caught up
                                        </Text>
                                        <Text className="text-ink-300 text-xs text-center mt-1 leading-5">
                                            No notifications in this category right now.
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </GlassCard>
                </Animated.View>
            </View>
        </View>
    );
}