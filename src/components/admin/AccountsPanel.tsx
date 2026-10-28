import { Search, Users } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import {
  useGetExpiringAccountsQuery,
  useGetPlanHistoryQuery,
  useSearchAccountsQuery,
  useSetAccountPlanMutation,
} from "../../../store/api/adminPaymentsApi";
import { getErrorMessage } from "../../lib/errors";
import { showErrorToast, showSuccessToast } from "../../lib/toast";
import { useTokens } from "../../theme/use-tokens";
import type { AccountPlanState } from "../../types/admin-payments";
import { Badge, Button, Card, CardSkeletons, EmptyState, IconButton, SegmentedControl, Sheet, Text, TextField } from "../ds";

const DAY = 86_400_000;

type ExpiryChoice = "keep" | "none" | "d30" | "d90" | "d180";

function AccountRow({ account, onPress }: { account: AccountPlanState; onPress: () => void }) {
  const { t, i18n } = useTranslation();
  const paid = account.plan !== "free";
  return (
    <Card onPress={onPress} accessibilityLabel={account.label} padding={14} style={{ gap: 6, marginBottom: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <Text weight="semibold" numberOfLines={1} style={{ flex: 1 }}>
          {account.label}
        </Text>
        <Badge tone={paid ? "success" : "neutral"} dot={paid}>
          {account.plan}
        </Badge>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text variant="footnote" tone="tertiary">
          {t(`adminPay.accounts.${account.kind === "user" ? "employee" : "employer"}`)} · {t(`adminPay.source.${account.planSource}`)}
        </Text>
        {account.planExpiresAt ? (
          <Text variant="footnote" tone="secondary" tabular>
            {new Date(account.planExpiresAt).toLocaleDateString(i18n.language, { day: "numeric", month: "short", year: "numeric" })}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

/** Edit one account's plan by hand: plan, expiry preset, optional note. Shows the change history. */
function AccountSheet({ account, onClose }: { account: AccountPlanState | null; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const p = useTokens();
  const [setPlan, { isLoading }] = useSetAccountPlanMutation();
  const [plan, setPlanValue] = useState<string | null>(null);
  const [expiry, setExpiry] = useState<ExpiryChoice | null>(null);
  const [note, setNote] = useState("");

  const target = account ? { kind: account.kind, id: account.id } : { kind: "user" as const, id: "" };
  const { data: history } = useGetPlanHistoryQuery(target, { skip: !account });

  const futureExpiry = account?.planExpiresAt && new Date(account.planExpiresAt).getTime() > Date.now() ? account.planExpiresAt : null;
  const currentPlan = plan ?? account?.plan ?? "free";
  const choice: ExpiryChoice = expiry ?? (futureExpiry ? "keep" : "d30");
  const paid = currentPlan !== "free";

  const planOptions = useMemo(
    () =>
      account?.kind === "user"
        ? [
            { value: "free", label: t("adminPay.accounts.free") },
            { value: "paid", label: "Paid" },
          ]
        : [
            { value: "free", label: t("adminPay.accounts.free") },
            { value: "basic", label: "Basic" },
            { value: "pro", label: "Pro" },
          ],
    [account?.kind, t],
  );

  const expiryOptions: { value: ExpiryChoice; label: string }[] = [
    ...(futureExpiry ? [{ value: "keep" as const, label: new Date(futureExpiry).toLocaleDateString(i18n.language, { day: "numeric", month: "short" }) }] : []),
    { value: "none", label: t("adminPay.accounts.noExpiry") },
    { value: "d30", label: t("adminPay.accounts.d30") },
    { value: "d90", label: t("adminPay.accounts.d90") },
    { value: "d180", label: t("adminPay.accounts.d180") },
  ];

  async function save() {
    if (!account) return;
    let expiresAt: string | null = null;
    if (paid) {
      if (choice === "keep" && futureExpiry) expiresAt = futureExpiry;
      else if (choice === "d30") expiresAt = new Date(Date.now() + 30 * DAY).toISOString();
      else if (choice === "d90") expiresAt = new Date(Date.now() + 90 * DAY).toISOString();
      else if (choice === "d180") expiresAt = new Date(Date.now() + 180 * DAY).toISOString();
    }
    try {
      await setPlan({ kind: account.kind, id: account.id, plan: currentPlan, expiresAt, note: note.trim() || undefined }).unwrap();
      showSuccessToast(t("adminPay.accounts.saved"));
      handleClose();
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("adminPay.plans.saveError")));
    }
  }

  function handleClose() {
    setPlanValue(null);
    setExpiry(null);
    setNote("");
    onClose();
  }

  return (
    <Sheet
      open={!!account}
      onClose={handleClose}
      detent="large"
      title={account?.label ?? ""}
      footer={<Button block title={t("adminPay.accounts.save")} loading={isLoading} onPress={save} />}
    >
      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 14, paddingBottom: 8 }}>
        <SegmentedControl<string> value={currentPlan} onChange={setPlanValue} options={planOptions} />

        {paid ? (
          <View style={{ gap: 8 }}>
            <Text variant="footnote" weight="medium" tone="secondary" style={{ paddingLeft: 4 }}>
              {t("adminPay.accounts.expiryLabel")}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {expiryOptions.map((o) => (
                <Button
                  key={o.value}
                  size="sm"
                  variant={choice === o.value ? "primary" : "tinted"}
                  title={o.label}
                  onPress={() => setExpiry(o.value)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <TextField value={note} onChangeText={setNote} placeholder={t("adminPay.accounts.note")} />

        {history && history.length > 0 ? (
          <View style={{ gap: 8 }}>
            <Text variant="caps" tone="tertiary" style={{ paddingHorizontal: 4 }}>
              {t("adminPay.accounts.history")}
            </Text>
            {history.slice(0, 6).map((e) => (
              <View key={e.id} style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                <Text variant="footnote" style={{ flex: 1 }} numberOfLines={2}>
                  {e.fromPlan} → {e.toPlan} · {t(`adminPay.accounts.reason.${e.reason}`)}
                  {e.note ? ` · ${e.note}` : ""}
                </Text>
                <Text variant="footnote" tone="tertiary">
                  {new Date(e.createdAt).toLocaleDateString(i18n.language, { day: "numeric", month: "short" })}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        <View style={{ height: 1, backgroundColor: p.separator }} />
      </ScrollView>
    </Sheet>
  );
}

export function AccountsPanel() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [selected, setSelected] = useState<AccountPlanState | null>(null);

  const searching = submitted.length >= 2;
  const { data: found, isFetching: searchingNow } = useSearchAccountsQuery(submitted, { skip: !searching });
  const { data: expiring, isLoading: expiringLoading } = useGetExpiringAccountsQuery(7, { skip: searching });

  const list = searching ? found : expiring;

  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
        <TextField
          containerStyle={{ flex: 1 }}
          value={query}
          onChangeText={(v) => {
            setQuery(v);
            if (v.trim().length < 2) setSubmitted("");
          }}
          onSubmitEditing={() => setSubmitted(query.trim())}
          placeholder={t("adminPay.accounts.search")}
          autoCapitalize="none"
          returnKeyType="search"
        />
        <IconButton icon={Search} label="Search" variant="primary" size={48} onPress={() => setSubmitted(query.trim())} />
      </View>

      {!searching ? (
        <Text variant="caps" tone="tertiary" style={{ paddingHorizontal: 4 }}>
          {t("adminPay.accounts.expiring")}
        </Text>
      ) : null}

      {(searching && searchingNow) || (!searching && expiringLoading) ? <CardSkeletons count={2} height={80} /> : null}

      {list && list.length === 0 ? (
        <EmptyState icon={Users} message={searching ? t("adminPay.accounts.noResults") : t("adminPay.accounts.nobodyExpiring")} />
      ) : null}

      <View>
        {list?.map((a) => (
          <AccountRow key={`${a.kind}-${a.id}`} account={a} onPress={() => setSelected(a)} />
        ))}
      </View>

      <AccountSheet account={selected} onClose={() => setSelected(null)} />
    </View>
  );
}
