import { Ionicons } from '@expo/vector-icons';
import { Pressable, Switch, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

type ProfileMenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tint?: string;
  isLast?: boolean;
  right?: 'chevron' | 'switch';
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
};

export function ProfileMenuItem({
  icon,
  label,
  tint = colors.mint[300],
  isLast,
  right = 'chevron',
  switchValue,
  onSwitchChange,
  onPress,
  danger,
}: ProfileMenuItemProps) {
  return (
    <Pressable onPress={onPress} disabled={right === 'switch'}>
      {({ pressed }) => (
        <View
          className="flex-row items-center gap-3 px-4 py-3.5"
          style={{
            opacity: pressed ? 0.7 : 1,
            borderBottomWidth: isLast ? 0 : 1,
            borderBottomColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <View
            style={{ backgroundColor: `${tint}22` }}
            className="h-9 w-9 rounded-full items-center justify-center"
          >
            <Ionicons name={icon} size={17} color={danger ? colors.status.expired : tint} />
          </View>
          <Text
            className="flex-1 text-[15px] font-medium"
            style={{ color: danger ? colors.status.expired : colors.text.primary }}
          >
            {label}
          </Text>
          {right === 'switch' ? (
            <Switch
              value={switchValue}
              onValueChange={onSwitchChange}
              trackColor={{ false: 'rgba(255,255,255,0.14)', true: colors.mint[500] }}
              thumbColor="#F3FAF8"
            />
          ) : (
            <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
          )}
        </View>
      )}
    </Pressable>
  );
}
