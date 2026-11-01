import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { colors } from '@/theme/colors';

type FormFieldProps = TextInputProps & {
  label: string;
};

export function FormField({ label, ...inputProps }: FormFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-ink-300 text-xs font-semibold uppercase ml-1">{label}</Text>
      <GlassCard radius={16}>
        <TextInput
          placeholderTextColor={colors.text.tertiary}
          className="text-white text-[15px] px-4 py-3.5"
          {...inputProps}
        />
      </GlassCard>
    </View>
  );
}
