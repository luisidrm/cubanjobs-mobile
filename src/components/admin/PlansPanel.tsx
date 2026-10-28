import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import {
  useGetAdminPlansQuery,
  useGetPaymentSettingsQuery,
  useSetPlanPriceMutation,
  useUpdatePaymentSettingsMutation,
  useUpdatePlanMutation,
} from "../../../store/api/adminPaymentsApi";
import { getErrorMessage } from "../../lib/errors";
import { showErrorToast, showSuccessToast } from "../../lib/toast";
import type { AdminPlan } from "../../types/admin-payments";
import { Badge, Button, Card, CardSkeletons, Text, TextField, Toggle } from "../ds";

const DURATIONS = [1, 3, 6] as const;

function PriceRow({ plan, months }: { plan: AdminPlan; months: number }) {
  const { t } = useTranslation();
  const current = plan.prices.find((x) => x.months === months);
  const [price, setPrice] = useState(current ? String(current.priceCup) : "");
  const [saving, setSaving] = useState(false);
  const [setPriceMutation] = useSetPlanPriceMutation();

  const parsed = Number(price);
  const dirty = price !== (current ? String(current.priceCup) : "");
  const valid = Number.isInteger(parsed) && parsed >= 1;

  async function save(next?: { priceCup?: number; isActive?: boolean }) {
    setSaving(true);
    try {
      await setPriceMutation({
        id: plan.id,
        months,
        priceCup: next?.priceCup ?? parsed,
        isActive: next?.isActive ?? current?.isActive ?? true,
      }).unwrap();
      showSuccessToast(t("adminPay.plans.saved"));
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("adminPay.plans.saveError")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Text weight="medium" style={{ width: 78 }}>
        {t("plans.month", { count: months })}
      </Text>
      <TextField
        containerStyle={{ flex: 1, minWidth: 0 }}
        value={price}
        onChangeText={setPrice}
        keyboardType="number-pad"
        placeholder={t("adminPay.plans.price")}
        accessibilityLabel={`${t("adminPay.plans.price")} ${t("plans.month", { count: months })}`}
      />
      {dirty ? (
        <Button size="sm" title={t("adminPay.accounts.save")} loading={saving} disabled={!valid} onPress={() => void save()} />
      ) : current ? (
        <Toggle
          label={t("adminPay.plans.available")}
          value={current.isActive}
          disabled={saving}
          onValueChange={(v) => void save({ priceCup: current.priceCup, isActive: v })}
        />
      ) : (
        <View style={{ width: 52 }} />
      )}
    </View>
  );
}

function PlanCard({ plan }: { plan: AdminPlan }) {
  const { t } = useTranslation();
  const [updatePlan] = useUpdatePlanMutation();
  const [limit, setLimit] = useState(plan.jobLimit === null ? "" : String(plan.jobLimit));
  const limitDirty = limit !== (plan.jobLimit === null ? "" : String(plan.jobLimit));
  const limitValid = limit === "" || (Number.isInteger(Number(limit)) && Number(limit) >= 0);

  async function patch(p: Parameters<typeof updatePlan>[0]["patch"]) {
    try {
      await updatePlan({ id: plan.id, patch: p }).unwrap();
      showSuccessToast(t("adminPay.plans.saved"));
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("adminPay.plans.saveError")));
    }
  }

  return (
    <Card padding={16} style={{ gap: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text variant="title3">{plan.name}</Text>
          <Text mono tone="tertiary" style={{ fontSize: 12 }}>
            {plan.code}
          </Text>
        </View>
        <Badge tone={plan.audience === "employer" ? "info" : "accent"}>{t(`adminPay.accounts.${plan.audience}`)}</Badge>
        <Toggle label={t("adminPay.plans.available")} value={plan.isActive} onValueChange={(v) => void patch({ isActive: v })} />
      </View>

      {plan.audience === "employer" ? (
        <>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
            <TextField
              containerStyle={{ flex: 1 }}
              label={t("adminPay.plans.jobLimit")}
              value={limit}
              onChangeText={setLimit}
              keyboardType="number-pad"
            />
            {limitDirty ? (
              <Button
                title={t("adminPay.accounts.save")}
                disabled={!limitValid}
                onPress={() => void patch({ jobLimit: limit === "" ? null : Number(limit) })}
                style={{ height: 48 }}
              />
            ) : null}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text weight="medium">{t("adminPay.plans.candidateSearch")}</Text>
            <Toggle label={t("adminPay.plans.candidateSearch")} value={plan.candidateSearch} onValueChange={(v) => void patch({ candidateSearch: v })} />
          </View>
        </>
      ) : null}

      <View style={{ gap: 10 }}>
        {DURATIONS.map((m) => (
          <PriceRow key={`${plan.id}-${m}-${plan.prices.find((x) => x.months === m)?.priceCup ?? "new"}`} plan={plan} months={m} />
        ))}
      </View>
    </Card>
  );
}

const SETTING_FIELDS = [
  { key: "destination_card", label: "plans.card", multiline: false },
  { key: "destination_phone", label: "plans.phone", multiline: false },
  { key: "destination_holder", label: "plans.holder", multiline: false },
  { key: "instructions_es", label: "adminPay.plans.instrEs", multiline: true },
  { key: "instructions_en", label: "adminPay.plans.instrEn", multiline: true },
  { key: "reminder_days_before", label: "adminPay.plans.reminderDays", multiline: false },
] as const;

function SettingsCard({ initial }: { initial: Record<string, string> }) {
  const { t } = useTranslation();
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [save, { isLoading }] = useUpdatePaymentSettingsMutation();
  const dirty = SETTING_FIELDS.some((f) => (values[f.key] ?? "") !== (initial[f.key] ?? ""));

  async function submit() {
    const changed: Record<string, string> = {};
    for (const f of SETTING_FIELDS) if ((values[f.key] ?? "") !== (initial[f.key] ?? "")) changed[f.key] = values[f.key] ?? "";
    try {
      await save(changed).unwrap();
      showSuccessToast(t("adminPay.plans.saved"));
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("adminPay.plans.saveError")));
    }
  }

  return (
    <Card padding={16} style={{ gap: 14 }}>
      <Text variant="title3">{t("adminPay.plans.settings")}</Text>
      {SETTING_FIELDS.map((f) => (
        <TextField
          key={f.key}
          label={t(f.label)}
          value={values[f.key] ?? ""}
          onChangeText={(v) => setValues((prev) => ({ ...prev, [f.key]: v }))}
          multiline={f.multiline}
          rows={f.multiline ? 3 : undefined}
          keyboardType={f.key === "reminder_days_before" ? "number-pad" : "default"}
        />
      ))}
      <Button block title={t("adminPay.plans.saveSettings")} loading={isLoading} disabled={!dirty} onPress={submit} />
    </Card>
  );
}

/** Prices, limits and the Transfermóvil details: everything the admin changes without a deploy. */
export function PlansPanel() {
  const { data: plans, isLoading } = useGetAdminPlansQuery();
  const { data: settings } = useGetPaymentSettingsQuery();

  return (
    <View style={{ gap: 14 }}>
      {isLoading ? <CardSkeletons height={220} /> : null}
      {plans?.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
      {/* keyed on the saved values so the form resets to what the server now holds */}
      {settings ? <SettingsCard key={JSON.stringify(settings)} initial={settings} /> : null}
    </View>
  );
}
