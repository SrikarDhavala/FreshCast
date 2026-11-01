import { Text, View } from 'react-native';
import { expiryLabel, expiryStatus } from '@/utils/date';
import { colors } from '@/theme/colors';

const statusStyles = {
  fresh: { bg: 'rgba(43,255,156,0.16)', text: colors.status.fresh },
  soon: { bg: 'rgba(244,198,98,0.16)', text: colors.status.soon },
  urgent: { bg: 'rgba(242,144,92,0.18)', text: colors.status.urgent },
  expired: { bg: 'rgba(240,104,92,0.18)', text: colors.status.expired },
};

export function StatusBadge({ expiryDate }: { expiryDate: string }) {
  const status = expiryStatus(expiryDate);
  const s = statusStyles[status];
  return (
    <View
      style={{ backgroundColor: s.bg, borderRadius: 999 }}
      className="px-2.5 py-1 self-start"
    >
      <Text style={{ color: s.text }} className="text-xs font-semibold">
        {expiryLabel(expiryDate)}
      </Text>
    </View>
  );
}
