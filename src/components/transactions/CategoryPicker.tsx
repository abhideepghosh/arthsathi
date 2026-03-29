import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { MagnifyingGlass, Plus } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing, borderRadius } from '../../constants/typography';
import { Category } from '../../types/category';
import { getIconComponent } from './TransactionCard';

interface CategoryPickerProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  onSelect: (categoryId: string) => void;
}

interface CategoryTile {
  type: 'category' | 'new';
  category?: Category;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  visible,
  onClose,
  categories,
  onSelect,
}) => {
  const { colors } = useTheme();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [search, setSearch] = useState('');
  const snapPoints = useMemo(() => ['60%', '85%'], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
      setSearch('');
    }
  }, [visible]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  const tiles: CategoryTile[] = useMemo(() => {
    const items: CategoryTile[] = filteredCategories.map((c) => ({
      type: 'category' as const,
      category: c,
    }));
    items.push({ type: 'new' });
    return items;
  }, [filteredCategories]);

  const handleSelect = useCallback(
    (categoryId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(categoryId);
    },
    [onSelect],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const renderTile = ({ item }: { item: CategoryTile }) => {
    if (item.type === 'new') {
      return (
        <Pressable
          style={({ pressed }) => [
            styles.tile,
            { backgroundColor: colors.bgSecondary, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelect('__new__');
          }}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.bgTertiary },
            ]}
          >
            <Plus size={24} color={colors.textSecondary} weight="bold" />
          </View>
          <Text
            style={[
              typography.bodyMedium,
              { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
            ]}
            numberOfLines={1}
          >
            New Category
          </Text>
        </Pressable>
      );
    }

    const cat = item.category!;
    const IconComponent = getIconComponent(cat.icon);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.tile,
          { backgroundColor: colors.bgSecondary, opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => handleSelect(cat.id)}
      >
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: `${cat.color}26` },
          ]}
        >
          <IconComponent size={24} color={cat.color} weight="fill" />
        </View>
        <Text
          style={[
            typography.bodyMedium,
            { color: colors.textPrimary, marginTop: spacing.sm, textAlign: 'center' },
          ]}
          numberOfLines={1}
        >
          {cat.name}
        </Text>
      </Pressable>
    );
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.bgPrimary }}
      handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
    >
      <View style={styles.content}>
        {/* Header */}
        <Text
          style={[
            typography.titleMedium,
            { color: colors.textPrimary, marginBottom: spacing.md },
          ]}
        >
          Select Category
        </Text>

        {/* Search */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.bgSecondary },
          ]}
        >
          <MagnifyingGlass size={18} color={colors.textTertiary} />
          <TextInput
            style={[
              typography.bodyMedium,
              styles.searchInput,
              { color: colors.textPrimary },
            ]}
            placeholder="Search categories..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
        </View>

        {/* Grid */}
        <FlatList
          data={tiles}
          keyExtractor={(item, index) =>
            item.type === 'new' ? '__new__' : item.category!.id
          }
          renderItem={renderTile}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
        />
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    padding: 0,
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  gridContent: {
    paddingBottom: spacing.xxl,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CategoryPicker;
