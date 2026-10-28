import { Redirect, useRouter } from "expo-router";
import { Search, SearchX, WifiOff } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { setLanguage } from "../../i18n/i18n";
import { useGetMeQuery } from "../../store/api/usersApi";
import { useSearchJobsQuery } from "../../store/api/jobsApi";
import {
  ACTION_BAR_CLEARANCE,
  AlertDialog,
  BrandLogo,
  Button,
  EmptyState,
  GlassActionBar,
  Screen,
  SegmentedControl,
  Skeleton,
  Text,
  TextField,
} from "../components/ds";
import { JobCard } from "../components/Jobs/JobCard";
import { useSession } from "../lib/session";
import { homeFor } from "../lib/home";
import { useTokens } from "../theme/use-tokens";

/**
 * First screen for signed-out users ("Browse-first"): real jobs before sign-up.
 * Opening a job works as a guest; applying or saving prompts sign-in.
 */
export default function WelcomeScreen() {
  const { t, i18n } = useTranslation();
  const p = useTokens();
  const router = useRouter();
  const { status } = useSession();
  const [query, setQuery] = useState("");
  const [guestOpen, setGuestOpen] = useState(false);

  const { data: me } = useGetMeQuery(undefined, { skip: status !== "authenticated" });
  const { data: jobs, isLoading, isError, refetch } = useSearchJobsQuery({ limit: 20, offset: 0, ...(query.trim() ? { q: query.trim() } : {}) });

  // Already logged in on app launch — skip to the role's home tab.
  if (status === "authenticated") {
    if (!me) return null;
    return <Redirect href={homeFor(me.role)} />;
  }

  const lang = i18n.language?.startsWith("es") ? "es" : "en";

  return (
    <Screen>
      <View style={{ height: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20 }}>
        <BrandLogo size={22} />
        <SegmentedControl<"es" | "en">
          size="sm"
          value={lang}
          onChange={(l) => void setLanguage(l)}
          options={[
            { value: "es", label: "ES" },
            { value: "en", label: "EN" },
          ]}
        />
      </View>

      <FlatList showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
        data={jobs ?? []}
        keyExtractor={(j) => j.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: ACTION_BAR_CLEARANCE + 40 }}
        ListHeaderComponent={
          <View style={{ gap: 16, paddingTop: 20, paddingBottom: 12 }}>
            <View style={{ gap: 6, paddingHorizontal: 4 }}>
              <Text accessibilityRole="header" weight="bold" style={{ fontSize: 34, lineHeight: 38, letterSpacing: -0.03 * 34 }}>
                {t("explore.headline")} <Text weight="bold" tone="accent" style={{ fontSize: 34, lineHeight: 38, letterSpacing: -0.03 * 34 }}>{t("explore.headlineAccent")}</Text>
              </Text>
              <Text variant="callout" tone="secondary">
                {t("explore.opportunitiesNear", { count: jobs?.length ?? 0 })}
              </Text>
            </View>
            <TextField value={query} onChangeText={setQuery} icon={Search} placeholder={t("explore.searchPlaceholder")} returnKeyType="search" />
            <Text variant="caps" tone="tertiary" style={{ paddingHorizontal: 4 }}>
              {t("explore.latest")}
            </Text>
            {isLoading ? (
              <View style={{ gap: 14 }}>
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} height={110} radius={20} />
                ))}
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={() => router.push({ pathname: "/job/[id]", params: { id: item.id } })}
            isSaved={false}
            onToggleSave={() => setGuestOpen(true)}
          />
        )}
        ListEmptyComponent={
          isLoading ? null : isError ? (
            <EmptyState icon={WifiOff} tone="danger" message={t("explore.error")} actionLabel={t("jobDetails.retry")} onAction={() => refetch()} />
          ) : (
            <EmptyState icon={SearchX} message={t("explore.empty")} actionLabel={t("explore.clearFilters")} onAction={() => setQuery("")} />
          )
        }
      />

      <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0 }}>
        <GlassActionBar inset={16}>
          <View style={{ gap: 12, paddingTop: 6, paddingHorizontal: 4 }}>
            <Text weight="medium" style={{ fontSize: 15, lineHeight: 21, textAlign: "center" }}>
              {t("welcome.barText")}
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button
                variant="tinted"
                title={t("login.signIn")}
                onPress={() => router.push("/login")}
                style={{ flex: 1, alignSelf: "auto" }}
              />
              <Button title={t("signUp.title")} onPress={() => router.push("/sign-up")} style={{ flex: 1, alignSelf: "auto" }} />
            </View>
          </View>
        </GlassActionBar>
      </View>

      <AlertDialog
        open={guestOpen}
        title={t("welcome.guestTitle")}
        message={t("welcome.guestMessage")}
        onClose={() => setGuestOpen(false)}
        actions={[
          { label: t("jobDetails.cancel"), style: "cancel" },
          { label: t("login.signIn"), onPress: () => router.push("/login") },
        ]}
      />
    </Screen>
  );
}
