import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { categories } from '@/data/mockData';
import { colors } from '@/theme/colors';

type CategoryPickerProps = {
  value: string;
  onChange: (categoryId: string) => void;
};

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
      <View className="flex-row gap-2 px-1">
        {categories.map((category) => {
          const selected = category.id === value;
          return (
            <Pressable
              key={category.id}
              onPress={() => onChange(category.id)}
              style={{
                backgroundColor: selected ? `${category.color}26` : colors.glass.fill,
                borderColor: selected ? category.color : colors.glass.border,
              }}
              className="flex-row items-center gap-1.5 rounded-full border px-3.5 py-2.5"
            >
              <Ionicons name={category.icon} size={14} color={selected ? category.color : colors.text.tertiary} />
              <Text
                style={{ color: selected ? colors.text.primary : colors.text.secondary }}
                className="text-xs font-semibold"
              >
                {category.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
