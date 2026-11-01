import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';

type StatPillProps = {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
};

export function StatPill({ label, value, icon, tint }: StatPillProps) {
  return (
    <GlassCard radius={20} className="flex-1">
      <View className="px-4 py-4 gap-2">
        <View
          style={{ backgroundColor: `${tint}26` }}
          className="h-9 w-9 rounded-full items-center justify-center"
        >
          <Ionicons name={icon} size={18} color={tint} />
        </View>
        <Text className="text-white text-xl font-bold">{value}</Text>
        <Text className="text-ink-300 text-xs">{label}</Text>
      </View>
    </GlassCard>
  );
}
