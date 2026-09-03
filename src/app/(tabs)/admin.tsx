import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  useDeleteOrphanedUserMutation,
  useLazyLookupUserQuery,
  useSearchCompaniesQuery,
  useUpdateUserRoleMutation,
  useVerifyCompanyMutation,
  type AdminUserRole,
} from "../../../store/api/adminApi";
import { SegmentedControl } from "../../components/application/SegmentedControl";
import { confirmAction } from "../../lib/confirm";
import { getErrorMessage } from "../../lib/errors";
import { showErrorToast, showSuccessToast } from "../../lib/toast";
import { colors } from "../../theme/colors";

const ROLE_OPTIONS: { key: AdminUserRole; label: string }[] = [
  { key: "employee", label: "Employee" },
  { key: "employer", label: "Employer" },
  { key: "admin", label: "Admin" },
];

function CompanySection() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const { data: companies, isFetching } = useSearchCompaniesQuery(submittedQuery, {
    skip: !submittedQuery,
  });
  const [verifyCompany, { isLoading: verifying }] = useVerifyCompanyMutation();

  async function handleToggleVerified(id: string, next: boolean) {
    try {
      await verifyCompany({ id, isVerified: next }).unwrap();
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("admin.companies.error")));
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("admin.companies.title")}</Text>
      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => setSubmittedQuery(query.trim())}
          placeholder={t("admin.companies.searchPlaceholder") as string}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCapitalize="none"
        />
        <Pressable style={styles.searchButton} onPress={() => setSubmittedQuery(query.trim())}>
          <Ionicons name="search" size={18} color={colors.surface} />
        </Pressable>
      </View>

      {isFetching && <ActivityIndicator color={colors.accent} style={{ marginTop: 12 }} />}

      {companies?.map((company) => (
        <View key={company.id} style={styles.resultRow}>
          <View style={styles.resultInfo}>
            <Text style={styles.resultTitle}>{company.name}</Text>
            <Text style={styles.resultSubtitle}>
              {company.isVerified ? t("admin.companies.verified") : t("admin.companies.unverified")}
            </Text>
          </View>
          <Pressable
            style={[styles.toggleButton, company.isVerified && styles.toggleButtonActive]}
            onPress={() => handleToggleVerified(company.id, !company.isVerified)}
            disabled={verifying}
          >
            <Text style={[styles.toggleButtonText, company.isVerified && styles.toggleButtonTextActive]}>
              {company.isVerified ? t("admin.companies.unverify") : t("admin.companies.verify")}
            </Text>
          </Pressable>
        </View>
      ))}

      {submittedQuery && !isFetching && companies?.length === 0 && (
        <Text style={styles.emptyText}>{t("admin.companies.empty")}</Text>
      )}
    </View>
  );
}

function UserSection() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [lookupUser, { data: lookup, isFetching }] = useLazyLookupUserQuery();
  const [updateRole, { isLoading: updatingRole }] = useUpdateUserRoleMutation();
  const [deleteOrphan, { isLoading: deletingOrphan }] = useDeleteOrphanedUserMutation();

  async function handleSearch() {
    if (!email.trim()) return;
    try {
      await lookupUser(email.trim()).unwrap();
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("admin.users.error")));
    }
  }

  async function handleRoleChange(role: AdminUserRole) {
    if (!lookup?.localUser) return;
    try {
      await updateRole({ id: lookup.localUser.id, role }).unwrap();
      showSuccessToast(t("admin.users.roleUpdated"));
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("admin.users.error")));
    }
  }

  async function handleCleanupOrphan() {
    if (!lookup?.supertokensUserId) return;
    const ok = await confirmAction(
      t("admin.users.confirmCleanupTitle"),
      t("admin.users.confirmCleanupMessage"),
      { confirm: t("admin.users.cleanup"), cancel: t("admin.users.cancel") }
    );
    if (!ok) return;
    try {
      await deleteOrphan(lookup.supertokensUserId).unwrap();
      showSuccessToast(t("admin.users.cleanedUp"));
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("admin.users.error")));
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("admin.users.title")}</Text>
      <View style={styles.searchRow}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          onSubmitEditing={handleSearch}
          placeholder={t("admin.users.searchPlaceholder") as string}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={18} color={colors.surface} />
        </Pressable>
      </View>

      {isFetching && <ActivityIndicator color={colors.accent} style={{ marginTop: 12 }} />}

      {lookup && !isFetching && (
        <View style={styles.userResult}>
          {lookup.localUser ? (
            <>
              <Text style={styles.resultTitle}>{lookup.localUser.email}</Text>
              <Text style={styles.resultSubtitle}>
                {[lookup.localUser.firstName, lookup.localUser.lastName].filter(Boolean).join(" ") || "—"}
              </Text>
              <View style={{ marginTop: 12 }}>
                <SegmentedControl
                  options={ROLE_OPTIONS}
                  value={lookup.localUser.role}
                  onChange={(k) => handleRoleChange(k as AdminUserRole)}
                />
              </View>
              {updatingRole && <ActivityIndicator color={colors.accent} style={{ marginTop: 8 }} />}
            </>
          ) : lookup.supertokensUserId ? (
            <>
              <Text style={styles.resultTitle}>{t("admin.users.orphanedTitle")}</Text>
              <Text style={styles.resultSubtitle}>{t("admin.users.orphanedMessage")}</Text>
              <Pressable
                style={styles.cleanupButton}
                onPress={handleCleanupOrphan}
                disabled={deletingOrphan}
              >
                {deletingOrphan ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.cleanupButtonText}>{t("admin.users.cleanup")}</Text>
                )}
              </Pressable>
            </>
          ) : (
            <Text style={styles.emptyText}>{t("admin.users.notFound")}</Text>
          )}
        </View>
      )}
    </View>
  );
}

export default function AdminScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoLetter}>B</Text>
          </View>
          <Text style={styles.headerTitle}>{t("tabs.admin")}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <CompanySection />
        <UserSection />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.surface },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBadge: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: colors.textPrimary,
    alignItems: "center", justifyContent: "center",
  },
  logoLetter: { color: colors.accent, fontWeight: "800", fontSize: 16, fontFamily: "InstrumentSerif_400Regular" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.textPrimary, fontFamily: "InstrumentSerif_400Regular" },
  body: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 28 },
  section: {},
  sectionTitle: { fontSize: 15, fontWeight: "800", color: colors.textPrimary, marginBottom: 12 },
  searchRow: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.chipBorder,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.textPrimary,
  },
  searchButton: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: colors.accent,
    alignItems: "center", justifyContent: "center",
  },
  resultRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginTop: 10,
    borderWidth: 1, borderColor: colors.chipBorder,
  },
  resultInfo: { flex: 1, marginRight: 10 },
  resultTitle: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  resultSubtitle: { fontSize: 12.5, color: colors.textSecondary, marginTop: 2 },
  toggleButton: {
    borderWidth: 1, borderColor: colors.chipBorder, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  toggleButtonActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  toggleButtonText: { fontSize: 12.5, fontWeight: "700", color: colors.textSecondary },
  toggleButtonTextActive: { color: colors.accentStrong },
  emptyText: { fontSize: 13, color: colors.textMuted, marginTop: 12, textAlign: "center" },
  userResult: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginTop: 12,
    borderWidth: 1, borderColor: colors.chipBorder,
  },
  cleanupButton: {
    backgroundColor: colors.error, borderRadius: 999, paddingVertical: 12,
    alignItems: "center", marginTop: 14,
  },
  cleanupButtonText: { color: colors.surface, fontWeight: "700", fontSize: 14 },
});
