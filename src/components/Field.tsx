import React from 'react';
import { View, TextInput, StyleSheet, Pressable, type KeyboardTypeOptions } from 'react-native';
import { useTheme } from './useTheme';
import { AppText } from './AppText';

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  required?: boolean;
  error?: string;
  rightIcon?: React.ReactNode;
}

export function Field({ label, value, onChangeText, placeholder, keyboardType, multiline, required, error, rightIcon }: FieldProps) {
  const theme = useTheme();
  const { colors, radius, spacing, typography } = theme;

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <AppText variant="label" color={colors.onSurfaceVariant} style={{ marginBottom: spacing.xs }}>
        {label} {required && <AppText color={colors.error}>*</AppText>}
      </AppText>
      <View style={[
        styles.inputWrap,
        {
          backgroundColor: colors.surfaceVariant,
          borderColor: error ? colors.error : colors.outline,
          borderRadius: radius.md,
        },
      ]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType={keyboardType}
          multiline={multiline}
          style={[
            typography.body,
            { fontFamily: 'Inter-Regular', color: colors.onSurface, paddingHorizontal: spacing.md, paddingVertical: multiline ? spacing.md : 14, flex: 1 },
          ]}
        />
        {rightIcon}
      </View>
      {error ? <AppText variant="caption" color={colors.error} style={{ marginTop: 4 }}>{error}</AppText> : null}
    </View>
  );
}

interface SelectProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  required?: boolean;
}

export function SelectField({ label, value, options, onSelect, required }: SelectProps) {
  const theme = useTheme();
  const { colors, radius, spacing } = theme;

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <AppText variant="label" color={colors.onSurfaceVariant} style={{ marginBottom: spacing.xs }}>
        {label} {required && <AppText color={colors.error}>*</AppText>}
      </AppText>
      <View style={[styles.chipRow, { gap: spacing.sm }]}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <React.Fragment key={opt}>
              <PressableChip
                label={opt}
                selected={selected}
                onPress={() => onSelect(opt)}
                color={colors.primary}
                selectedBg={colors.primaryContainer}
                selectedText={colors.onPrimaryContainer}
                text={colors.onSurfaceVariant}
              />
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

function PressableChip({ label, selected, onPress, color, selectedBg, selectedText, text }: {
  label: string; selected: boolean; onPress: () => void; color: string; selectedBg: string; selectedText: string; text: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: selected ? selectedBg : 'transparent', borderColor: selected ? color : '#D6DEE6', opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <AppText variant="bodySmall" color={selected ? selectedText : text} style={{ fontWeight: selected ? '600' : '400' }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderRadius: 999, marginBottom: 4 },
});
