import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette, spacing, radius, borderWidth, shadow, fontSize } from '@/theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Search for shirts…',
  autoFocus = false,
}: Props) {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  function handleFocus() {
    setFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false, // borderColor can't use native driver
    }).start();
  }

  function handleBlur() {
    setFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, palette.neonGreen],
  });

  const iconColor = focused ? palette.neonGreen : colors.textSecondary;

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={styles.pressable}>
      <Animated.View
        style={[
          styles.container,
          { borderColor },
          focused && shadow.glow,
        ]}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={iconColor}
          style={styles.icon}
        />

        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          selectionColor={palette.neonGreen}
          cursorColor={palette.neonGreen}
        />

        {value.length > 0 && (
          <Pressable
            onPress={() => onChangeText('')}
            hitSlop={12}
            style={styles.clearBtn}
          >
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderRadius: radius.full,
    borderWidth: borderWidth.thin,
    paddingHorizontal: spacing[4],
    height: 52,
  },
  icon: {
    marginRight: spacing[2],
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSize.md,
    paddingVertical: 0, // remove Android default vertical padding
  },
  clearBtn: {
    marginLeft: spacing[2],
    padding: spacing[1],
  },
});
