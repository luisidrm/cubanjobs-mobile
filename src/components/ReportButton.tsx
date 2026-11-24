import { Flag } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useCreateReportMutation } from "../../store/api/reportsApi";
import { showErrorToast, showSuccessToast } from "../lib/toast";
import { useTokens } from "../theme/use-tokens";
import { REPORT_REASONS, type ReportReason, type ReportTargetType } from "../types/report";
import { Button, IconButton, Sheet, Text, TextField } from "./ds";

/** Flag button + bottom sheet to report a job, freelancer post or company. */
export function ReportButton({ targetType, targetId, variant = "glass" }: { targetType: ReportTargetType; targetId: string; variant?: "glass" | "fill" }) {
  const { t } = useTranslation();
  const p = useTokens();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState("");
  const [createReport, { isLoading }] = useCreateReportMutation();

  async function submit() {
    if (!reason) return;
    try {
      const { alreadyReported } = await createReport({ targetType, targetId, reason, note: note.trim() || undefined }).unwrap();
      showSuccessToast(alreadyReported ? t("report.alreadySent") : t("report.sent"));
      setOpen(false);
      setReason(null);
      setNote("");
    } catch (err) {
      const message = typeof err === "object" && err && "data" in err ? (err.data as { message?: string } | undefined)?.message : undefined;
      showErrorToast(message?.includes("own content") ? t("report.own") : t("report.error"));
    }
  }

  return (
    <>
      <IconButton icon={Flag} label={t("report.button")} variant={variant} onPress={() => setOpen(true)} />
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={t("report.title")}
        detent="large"
        closeLabel={t("report.close")}
        footer={<Button title={t("report.submit")} block disabled={!reason} loading={isLoading} onPress={submit} />}
      >
        <View style={{ gap: 14 }}>
          <Text tone="secondary">{t("report.description")}</Text>
          <View style={{ gap: 8 }}>
            {REPORT_REASONS.map((r) => {
              const on = reason === r;
              return (
                <Pressable
                  key={r}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  onPress={() => setReason(r)}
                  style={{
                    minHeight: 48,
                    justifyContent: "center",
                    paddingHorizontal: 14,
                    borderRadius: 14,
                    borderWidth: on ? 2 : 1,
                    borderColor: on ? p.accent : p.separator,
                    backgroundColor: on ? p.accentSoft : "transparent",
                  }}
                >
                  <Text weight={on ? "semibold" : "regular"} style={on ? { color: p.accentText } : undefined}>
                    {t(`report.reasons.${r}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <TextField label={t("report.noteLabel")} value={note} onChangeText={setNote} placeholder={t("report.notePlaceholder")} multiline rows={3} maxLength={500} />
        </View>
      </Sheet>
    </>
  );
}
