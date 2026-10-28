import { Search } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import {
  useDeleteOrphanedUserMutation,
  useLazyLookupUserQuery,
  useSearchCompaniesQuery,
  useUpdateUserRoleMutation,
  useVerifyCompanyMutation,
  type AdminUserRole,
} from "../../../store/api/adminApi";
import { Badge, Button, Card, IconButton, List, ListRow, SegmentedControl, Text, TextField } from "../ds";
import { confirmAction } from "../../lib/confirm";
import { getErrorMessage } from "../../lib/errors";
import { showErrorToast, showSuccessToast } from "../../lib/toast";
import { useTokens } from "../../theme/use-tokens";

const ROLE_OPTIONS: { value: AdminUserRole; label: string }[] = [
  { value: "employee", label: "Employee" },
  { value: "employer", label: "Employer" },
  { value: "admin", label: "Admin" },
];

export function CompanySection() {
  const { t } = useTranslation();
  const p = useTokens();
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
    <View style={{ gap: 12 }}>
      <Text variant="title3" style={{ paddingHorizontal: 4 }}>
        {t("admin.companies.title")}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
        <TextField
          containerStyle={{ flex: 1 }}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => setSubmittedQuery(query.trim())}
          placeholder={t("admin.companies.searchPlaceholder")}
          autoCapitalize="none"
          returnKeyType="search"
        />
        <IconButton icon={Search} label="Search" variant="primary" size={48} onPress={() => setSubmittedQuery(query.trim())} />
      </View>

      {isFetching ? <ActivityIndicator color={p.accent} /> : null}

      {companies && companies.length > 0 ? (
        <List>
          {companies.map((company) => (
            <ListRow
              key={company.id}
              title={company.name}
              subtitle={company.isVerified ? t("admin.companies.verified") : t("admin.companies.unverified")}
              accessory={
                <Button
                  size="sm"
                  variant={company.isVerified ? "tinted" : "secondary"}
                  title={company.isVerified ? t("admin.companies.unverify") : t("admin.companies.verify")}
                  disabled={verifying}
                  onPress={() => handleToggleVerified(company.id, !company.isVerified)}
                />
              }
            />
          ))}
        </List>
      ) : null}

      {submittedQuery && !isFetching && companies?.length === 0 ? (
        <Text variant="subhead" tone="tertiary" style={{ textAlign: "center" }}>
          {t("admin.companies.empty")}
        </Text>
      ) : null}
    </View>
  );
}

export function UserSection() {
  const { t } = useTranslation();
  const p = useTokens();
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
    const ok = await confirmAction(t("admin.users.confirmCleanupTitle"), t("admin.users.confirmCleanupMessage"), {
      confirm: t("admin.users.cleanup"),
      cancel: t("admin.users.cancel"),
    });
    if (!ok) return;
    try {
      await deleteOrphan(lookup.supertokensUserId).unwrap();
      showSuccessToast(t("admin.users.cleanedUp"));
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("admin.users.error")));
    }
  }

  return (
    <View style={{ gap: 12 }}>
      <Text variant="title3" style={{ paddingHorizontal: 4 }}>
        {t("admin.users.title")}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
        <TextField
          containerStyle={{ flex: 1 }}
          value={email}
          onChangeText={setEmail}
          onSubmitEditing={handleSearch}
          placeholder={t("admin.users.searchPlaceholder")}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="search"
        />
        <IconButton icon={Search} label="Search" variant="primary" size={48} onPress={handleSearch} />
      </View>

      {isFetching ? <ActivityIndicator color={p.accent} /> : null}

      {lookup && !isFetching ? (
        <Card>
          {lookup.localUser ? (
            <View style={{ gap: 12 }}>
              <View>
                <Text variant="headline">{lookup.localUser.email}</Text>
                <Text variant="subhead" tone="secondary">
                  {[lookup.localUser.firstName, lookup.localUser.lastName].filter(Boolean).join(" ") || "—"}
                </Text>
              </View>
              <SegmentedControl<AdminUserRole>
                options={ROLE_OPTIONS}
                value={lookup.localUser.role}
                onChange={handleRoleChange}
              />
              {updatingRole ? <ActivityIndicator color={p.accent} /> : null}
            </View>
          ) : lookup.supertokensUserId ? (
            <View style={{ gap: 12 }}>
              <Badge tone="warning" dot>
                {t("admin.users.orphanedTitle")}
              </Badge>
              <Text variant="subhead" tone="secondary">
                {t("admin.users.orphanedMessage")}
              </Text>
              <Button
                block
                variant="destructive"
                title={t("admin.users.cleanup")}
                loading={deletingOrphan}
                onPress={handleCleanupOrphan}
              />
            </View>
          ) : (
            <Text variant="subhead" tone="tertiary" style={{ textAlign: "center" }}>
              {t("admin.users.notFound")}
            </Text>
          )}
        </Card>
      ) : null}
    </View>
  );
}

