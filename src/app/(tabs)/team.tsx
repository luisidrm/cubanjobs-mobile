import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Copy, RefreshCw, Share2, UserMinus, Users, WifiOff } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Share, View } from "react-native";
import {
  useCreateInviteMutation,
  useGetMyCompaniesQuery,
  useGetTeamQuery,
  useRemoveTeamMemberMutation,
  useRevokeInviteMutation,
} from "../../../store/api/companiesApi";
import { useGetMeQuery } from "../../../store/api/usersApi";
import {
  AlertDialog,
  Badge,
  Button,
  Card,
  CardSkeletons,
  Chip,
  EmptyState,
  Icon,
  List,
  ListRow,
  NavBar,
  Screen,
  Text,
} from "../../components/ds";
import { NotificationBell } from "../../components/notifications/NotificationBell";
import { JoinCompany } from "../../components/team/JoinCompany";
import { getErrorMessage } from "../../lib/errors";
import { showErrorToast, showInfoToast } from "../../lib/toast";
import { TAB_BAR_CLEARANCE } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import type { TeamMember } from "../../types/company";

function memberName(m: TeamMember) {
  return [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email;
}

function Avatar({ m }: { m: TeamMember }) {
  const p = useTokens();
  return (
    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: p.accentSoft, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {m.profilePictureUrl ? (
        <Image source={{ uri: m.profilePictureUrl }} style={{ width: "100%", height: "100%" }} accessibilityIgnoresInvertColors />
      ) : (
        <Text weight="bold" tone="accent" style={{ fontSize: 14, lineHeight: 18 }}>
          {memberName(m).charAt(0).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

export default function TeamScreen() {
  const { t, i18n } = useTranslation();
  const p = useTokens();
  const router = useRouter();
  const { data: me } = useGetMeQuery();
  const { data: companies, isLoading: companiesLoading } = useGetMyCompaniesQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const company = companies?.find((c) => c.id === selectedId) ?? companies?.[0];

  const { data: team, isLoading, isError, refetch } = useGetTeamQuery(company?.id ?? "", { skip: !company });
  const [createInvite, { isLoading: creating }] = useCreateInviteMutation();
  const [revokeInvite, { isLoading: revoking }] = useRevokeInviteMutation();
  const [removeMember] = useRemoveTeamMemberMutation();
  const [target, setTarget] = useState<TeamMember | null>(null);

  const full = team ? team.seatLimit !== null && team.seatsUsed >= team.seatLimit : false;

  async function handleGenerate() {
    if (!company) return;
    try {
      await createInvite(company.id).unwrap();
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("team.inviteError")));
    }
  }

  async function handleRevoke() {
    if (!company) return;
    try {
      await revokeInvite(company.id).unwrap();
      showInfoToast(t("team.revoked"));
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("team.inviteError")));
    }
  }

  async function handleCopy(code: string) {
    await Clipboard.setStringAsync(code);
    showInfoToast(t("team.copied"));
  }

  async function handleShare(code: string) {
    if (!company) return;
    try {
      await Share.share({ message: t("team.shareMessage", { company: company.name, code }) });
    } catch {
      // Dismissing the share sheet is not an error.
    }
  }

  async function confirmRemove() {
    if (!company || !target) return;
    const member = target;
    setTarget(null);
    try {
      await removeMember({ companyId: company.id, userId: member.userId }).unwrap();
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("team.removeError")));
    }
  }

  const expiresLabel = team?.invite
    ? t("team.inviteExpires", { date: new Date(team.invite.expiresAt).toLocaleDateString(i18n.language, { day: "numeric", month: "short" }) })
    : "";
  const leaving = target?.userId === me?.id;

  return (
    <Screen safeTop={false}>
      <NavBar large title={t("team.title")} trailing={<NotificationBell />} />

      {companiesLoading ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
          <CardSkeletons />
        </View>
      ) : null}

      {!companiesLoading && !company ? (
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: TAB_BAR_CLEARANCE, gap: 16 }}>
          <EmptyState icon={Users} message={t("team.noCompany")} actionLabel={t("myJobs.createCompany")} onAction={() => router.push("/company-profile")} />
          <JoinCompany />
        </ScrollView>
      ) : null}

      {company ? (
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: TAB_BAR_CLEARANCE, gap: 16 }}>
          {companies && companies.length > 1 ? (
            <ScrollView showsVerticalScrollIndicator={false} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {companies.map((c) => (
                <Chip key={c.id} variant="filter" label={c.name} selected={c.id === company.id} onPress={() => setSelectedId(c.id)} />
              ))}
            </ScrollView>
          ) : null}

          {isLoading ? <CardSkeletons /> : null}
          {isError && !isLoading ? (
            <EmptyState icon={WifiOff} tone="danger" message={t("team.error")} actionLabel={t("jobDetails.retry")} onAction={() => refetch()} />
          ) : null}

          {team ? (
            <>
              <Card padding={16} style={{ gap: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <Text variant="headline">{t("team.seats")}</Text>
                  <Badge tone={full ? "warning" : "accent"}>
                    {team.seatLimit === null
                      ? t("team.seatsUnlimited", { used: team.seatsUsed })
                      : t("team.seatsOf", { used: team.seatsUsed, limit: team.seatLimit })}
                  </Badge>
                </View>
                {team.seatLimit !== null ? (
                  <View style={{ height: 8, borderRadius: 4, backgroundColor: p.fill2, overflow: "hidden" }}>
                    <View
                      style={{
                        width: `${Math.min(100, (team.seatsUsed / team.seatLimit) * 100)}%`,
                        height: "100%",
                        backgroundColor: full ? p.warning : p.accent,
                      }}
                    />
                  </View>
                ) : null}
              </Card>

              {team.canManage ? (
                <Card padding={16} style={{ gap: 12 }}>
                  <Text variant="headline">{t("team.inviteTitle")}</Text>
                  {full ? (
                    <>
                      <Text variant="subhead" tone="secondary">
                        {t("team.seatLimitMessage", { plan: t(`billing.tiers.${team.planTier}.name`), limit: team.seatLimit })}
                      </Text>
                      <Button block variant="tinted" title={t("team.seatLimitUpgrade")} onPress={() => router.push("/billing")} />
                    </>
                  ) : team.invite ? (
                    <>
                      <Text variant="subhead" tone="secondary">
                        {t("team.inviteHelp")}
                      </Text>
                      <View style={{ alignItems: "center", paddingVertical: 14, borderRadius: 14, backgroundColor: p.accentSoft, gap: 2 }}>
                        <Text mono weight="bold" tone="accent" selectable style={{ fontSize: 28, lineHeight: 34, letterSpacing: 4 }}>
                          {team.invite.code}
                        </Text>
                        <Text variant="footnote" tone="tertiary">
                          {expiresLabel}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <Button style={{ flex: 1 }} variant="secondary" icon={Copy} title={t("team.copy")} onPress={() => handleCopy(team.invite!.code)} />
                        <Button style={{ flex: 1 }} icon={Share2} title={t("team.share")} onPress={() => handleShare(team.invite!.code)} />
                      </View>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <Button style={{ flex: 1 }} variant="plain" icon={RefreshCw} title={t("team.regenerate")} loading={creating} onPress={handleGenerate} />
                        <Button style={{ flex: 1 }} variant="plain" title={t("team.revoke")} loading={revoking} onPress={handleRevoke} />
                      </View>
                    </>
                  ) : (
                    <>
                      <Text variant="subhead" tone="secondary">
                        {t("team.inviteHelp")}
                      </Text>
                      <Button block title={t("team.generate")} loading={creating} onPress={handleGenerate} />
                    </>
                  )}
                </Card>
              ) : (
                <Text variant="footnote" tone="tertiary" style={{ paddingHorizontal: 4 }}>
                  {t("team.ownerOnly")}
                </Text>
              )}

              <View style={{ gap: 8 }}>
                <Text variant="caps" tone="tertiary" style={{ paddingLeft: 4 }}>
                  {t("team.membersTitle")}
                </Text>
                <List>
                  {team.members.map((m) => {
                    const isYou = m.userId === me?.id;
                    const actionable = m.role !== "owner" && (team.canManage || isYou);
                    return (
                      <ListRow
                        key={m.userId}
                        leading={<Avatar m={m} />}
                        title={isYou ? `${memberName(m)} · ${t("team.you")}` : memberName(m)}
                        subtitle={m.email}
                        accessory={
                          m.role === "owner" ? (
                            <Badge tone="accent">
                              {t("team.owner")}
                            </Badge>
                          ) : actionable ? (
                            <Icon icon={UserMinus} size={18} color={p.danger} />
                          ) : (
                            <Badge tone="neutral">{t("team.member")}</Badge>
                          )
                        }
                        onPress={actionable ? () => setTarget(m) : undefined}
                      />
                    );
                  })}
                </List>
              </View>
            </>
          ) : null}
        </ScrollView>
      ) : null}

      <AlertDialog
        open={target !== null}
        title={leaving ? t("team.leaveTitle") : t("team.removeTitle", { name: target ? memberName(target) : "" })}
        message={leaving ? t("team.leaveMessage") : t("team.removeMessage")}
        onClose={() => setTarget(null)}
        actions={[
          { label: t("profile.cancel"), style: "cancel" },
          { label: leaving ? t("team.leave") : t("team.remove"), style: "destructive", onPress: confirmRemove },
        ]}
      />
    </Screen>
  );
}
