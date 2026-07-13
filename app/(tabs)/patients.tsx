import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Search, UserPlus, ChevronRight, Phone, MapPin } from 'lucide-react-native';
import { useTheme } from '@/src/components/useTheme';
import { AppText, AppTextBold } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { usePatients } from '@/src/providers/PatientsProvider';
import { EmptyState } from '@/src/components/States';

export default function PatientsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { patients, loading, refresh } = usePatients();
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const filtered = useMemo(() => {
    if (!query.trim()) return patients;
    const q = query.toLowerCase();
    return patients.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.uhid.toLowerCase().includes(q) ||
      p.doctorName.toLowerCase().includes(q) ||
      p.diagnosis.toLowerCase().includes(q)
    );
  }, [patients, query]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <AppTextBold variant="h1">Patients</AppTextBold>
        <AppText variant="bodySmall" color={theme.colors.muted}>{patients.length} registered</AppText>
      </View>

      <View style={{ paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md }}>
        <View style={[styles.searchWrap, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}>
          <Search size={18} color={theme.colors.muted} strokeWidth={2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, UHID, doctor, diagnosis…"
            placeholderTextColor={theme.colors.muted}
            style={{ fontFamily: 'Inter-Regular', fontSize: 15, color: theme.colors.onSurface, flex: 1, marginLeft: 10 }}
          />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={<UserPlus size={40} color={theme.colors.muted} />}
            title={query ? "No matching patients" : "No patients yet"}
            message={query ? "Try a different search term." : "Register your first patient to get started."}
          />
        ) : (
          filtered.map((p, i) => (
            <Animated.View key={p.id} entering={FadeInDown.delay(i * 40).duration(theme.animations.normal)}>
              <Card onPress={() => router.push(`/patient/${p.id}`)} elevation="sm" style={{ marginBottom: theme.spacing.md }}>
                <View style={styles.row}>
                  <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
                    <AppTextBold variant="h3" color={theme.colors.onPrimaryContainer}>
                      {p.name.charAt(0).toUpperCase() || '?'}
                    </AppTextBold>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <AppTextBold variant="title">{p.name || 'Unnamed'}</AppTextBold>
                      {p.dischargeDate ? (
                        <View style={[styles.tag, { backgroundColor: theme.colors.successContainer }]}>
                          <AppText variant="caption" color={theme.colors.successText}>Discharged</AppText>
                        </View>
                      ) : (
                        <View style={[styles.tag, { backgroundColor: theme.colors.infoContainer }]}>
                          <AppText variant="caption" color={theme.colors.info}>Active</AppText>
                        </View>
                      )}
                    </View>
                    <AppText variant="caption" color={theme.colors.muted} style={{ marginTop: 2 }}>UHID: {p.uhid || '—'}</AppText>
                    {p.diagnosis ? <AppText variant="bodySmall" color={theme.colors.onSurfaceVariant} style={{ marginTop: 2 }}>{p.diagnosis}</AppText> : null}
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                      {p.doctorName ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><StethoscopeMini color={theme.colors.muted} /><AppText variant="caption" color={theme.colors.muted}>{p.doctorName}</AppText></View> : null}
                      {p.mobile ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Phone size={11} color={theme.colors.muted} /><AppText variant="caption" color={theme.colors.muted}>{p.mobile}</AppText></View> : null}
                    </View>
                  </View>
                  <ChevronRight size={20} color={theme.colors.muted} strokeWidth={2} />
                </View>
              </Card>
            </Animated.View>
          ))
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/patient/register')}
        style={({ pressed }) => [styles.fab, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.88 : 1 }]}
        android_ripple={{ color: theme.colors.primaryDark, radius: 28 }}
      >
        <UserPlus size={26} color="#FFFFFF" strokeWidth={2} />
      </Pressable>
    </SafeAreaView>
  );
}

function StethoscopeMini({ color }: { color: string }) {
  return <MapPin size={11} color={color} />;
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  fab: { position: 'absolute', bottom: 90, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
});
