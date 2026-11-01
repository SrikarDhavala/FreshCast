import { Ionicons } from '@expo/vector-icons';
import { TextInput, View, TextInputProps } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { colors } from '@/theme/colors';

interface SearchBarProps extends TextInputProps {
  placeholder?: string;
}

export function SearchBar({ placeholder = 'Search your kitchen...', ...props }: SearchBarProps) {
  return (
    <GlassCard radius={18}>
      <View className="flex-row items-center gap-2.5 px-4 py-3">
        <Ionicons name="search" size={18} color={colors.text.tertiary} />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          className="flex-1 text-white text-[15px]"
          {...props}
        />
      </View>
    </GlassCard>
  );
}