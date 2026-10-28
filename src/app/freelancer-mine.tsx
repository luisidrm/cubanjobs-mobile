import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Eye, Lock, Pencil, Plus, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useDeleteFreelancerPostMutation, useGetMyFreelancerPostsQuery } from "../../store/api/freelancerApi";
import { AlertDialog, Button, Card, EmptyState, Icon, IconButton, NavBar, Screen, Text } from "../components/ds";
import { getErrorMessage } from "../lib/errors";
import { useFreelancerAccess } from "../lib/freelancer";
import { showErrorToast, showSuccessToast } from "../lib/toast";
import { useTokens } from "../theme/use-tokens";
import { MAX_FREELANCER_POSTS } from "../types/freelancer";

export default function MyFreelancerPostsScreen() {
  const { t } = useTranslation();
  const p = useTokens();
  const router = useRouter();
  const { me, isLoading: accessLoading, canPost } = useFreelancerAccess();
  const { data: posts, isLoading } = useGetMyFreelancerPostsQuery(undefined, { skip: me?.role !== "employee" });
  const [deletePost] = useDeleteFreelancerPostMutation();
  const [toDelete, setToDelete] = useState<string | null>(null);

  const atLimit = (posts?.length ?? 0) >= MAX_FREELANCER_POSTS;

  async function doDelete() {
    if (!toDelete) return;
    const id = toDelete;
    setToDelete(null);
    try {
      await deletePost(id).unwrap();
      showSuccessToast(t("freelancers.form.deleted"));
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("freelancers.form.saveFailed")));
    }
  }

  return (
    <Screen safeTop={false}>
      <NavBar back title={t("freelancers.mine.title")} subtitle={t("freelancers.mine.subtitle")} />

      {accessLoading || isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={p.accent} />
        </View>
      ) : !canPost ? (
        <EmptyState icon={Lock} message={t("freelancers.postingLocked")} actionLabel={t("freelancers.upgrade")} onAction={() => router.push("/plans")} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 14 }}>
          {atLimit ? (
            <Text variant="footnote" tone="tertiary">
              {t("freelancers.mine.limit", { max: MAX_FREELANCER_POSTS })}
            </Text>
          ) : (
            <Button size="sm" icon={Plus} title={t("freelancers.newPost")} onPress={() => router.push("/freelancer-form")} />
          )}

          {posts?.length === 0 ? <EmptyState icon={Pencil} message={t("freelancers.mine.empty")} /> : null}

          {posts?.map((post) => (
            <Card
              key={post.id}
              padding={12}
              onPress={() => router.push({ pathname: "/freelancer/[id]", params: { id: post.id } })}
              accessibilityLabel={post.title}
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              {post.images[0] ? (
                <Image source={{ uri: post.images[0] }} style={{ width: 60, height: 60, borderRadius: 10, backgroundColor: p.fill2 }} contentFit="cover" />
              ) : (
                <View style={{ width: 60, height: 60, borderRadius: 10, backgroundColor: p.fill2 }} />
              )}
              <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                <Text weight="semibold" numberOfLines={1}>
                  {post.title}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Icon icon={Eye} size={14} color={p.text3} />
                  <Text variant="footnote" tone="tertiary">
                    {t("freelancers.viewers", { count: post.viewCount })}
                  </Text>
                </View>
              </View>
              <IconButton
                icon={Pencil}
                label={t("freelancers.editPost")}
                variant="plain"
                onPress={() => router.push({ pathname: "/freelancer-form", params: { id: post.id } })}
              />
              <IconButton icon={Trash2} label={t("freelancers.mine.deleteAction")} variant="plain" onPress={() => setToDelete(post.id)} />
            </Card>
          ))}
        </ScrollView>
      )}

      <AlertDialog
        open={toDelete !== null}
        title={t("freelancers.mine.confirmDelete")}
        message={t("freelancers.mine.confirmDeleteMessage")}
        onClose={() => setToDelete(null)}
        actions={[
          { label: t("jobDetails.cancel"), style: "cancel" },
          { label: t("freelancers.mine.deleteAction"), style: "destructive", onPress: () => void doDelete() },
        ]}
      />
    </Screen>
  );
}
