import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useGetMyCompaniesQuery } from "../../../store/api/companiesApi";
import { useGetWorkerSkillsQuery, useSearchWorkersQuery } from "../../../store/api/usersApi";
import { WorkerCard } from "../../components/Jobs/WorkerCard";
import { FilterChip } from "../../components/tabs/FilterChip";
import { hasCandidateSearchAccess } from "../../lib/plans";
import { colors } from "../../theme/colors";
import type { WorkerSearchFilters } from "../../types/user";

export default function ExploreWorkersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeSkills, setActiveSkills] = useState<Set<string>>(new Set());

  const { data: companies, isLoading: companyLoading } = useGetMyCompaniesQuery();
  const company = companies?.[0];
  const hasAccess = !!company && hasCandidateSearchAccess(company.planTier);

  const { data: skillsList } = useGetWorkerSkillsQuery(undefined, { skip: !hasAccess });

  const toggleSkill = (skill: string) => {
    setActiveSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  };

  const filters = useMemo<WorkerSearchFilters>(() => {
    const f: WorkerSearchFilters = { limit: 20, offset: 0 };
    if (query.trim()) f.q = query.trim();
    if (activeSkills.size > 0) f.skills = Array.from(activeSkills).join(",");
    return f;
  }, [query, activeSkills]);

  const { data: workers, isLoading, isError, refetch } = useSearchWorkersQuery(filters, { skip: !hasAccess });

  if (!companyLoading && !hasAccess) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("exploreWorkers.title")}</Text>
        </View>
        <View style={styles.upgradePrompt}>
          <Ionicons name="lock-closed-outline" size={40} color={colors.textMuted} />
          <Text style={styles.upgradeTitle}>{t("exploreWorkers.upgradeTitle")}</Text>
          <Text style={styles.upgradeMessage}>{t("exploreWorkers.upgradeMessage")}</Text>
          <Pressable style={styles.upgradeButton} onPress={() => router.push("/billing")}>
            <Text style={styles.upgradeButtonText}>{t("exploreWorkers.upgradeButton")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("exploreWorkers.title")}</Text>
      </View>

      <FlatList
        data={workers ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Text style={styles.subtitle}>{t("exploreWorkers.subtitle")}</Text>

            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t("exploreWorkers.searchPlaceholder") as string}
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
              />
            </View>

            {skillsList && skillsList.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsRow}
                contentContainerStyle={styles.chipsRowContent}
              >
                {skillsList.map((skill) => (
                  <FilterChip
                    key={skill}
                    label={skill}
                    active={activeSkills.has(skill)}
                    onPress={() => toggleSkill(skill)}
                  />
                ))}
              </ScrollView>
            )}
          </>
        }
        renderItem={({ item }) => (
          <WorkerCard
            worker={item}
            onPress={() => router.push({ pathname: "/applicant-profile", params: { userId: item.id } })}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>
              {isError ? t("exploreWorkers.error") : t("exploreWorkers.empty")}
            </Text>
          ) : null
        }
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.surface,
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.textPrimary, fontFamily: "InstrumentSerif_400Regular" },
  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#EEEEF0",
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  chipsRow: { marginTop: 16, flexGrow: 0 },
  chipsRowContent: { paddingRight: 20 },
  emptyText: { textAlign: "center", color: colors.textSecondary, marginTop: 40, fontSize: 14 },
  upgradePrompt: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  upgradeTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary, textAlign: "center" },
  upgradeMessage: { fontSize: 14, color: colors.textSecondary, textAlign: "center" },
  upgradeButton: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 22, paddingVertical: 12, marginTop: 6 },
  upgradeButtonText: { color: colors.surface, fontWeight: "700", fontSize: 14 },
});
