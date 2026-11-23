import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Eye, Lock, Plus, Search, SearchX, WifiOff } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useListFreelancerPostsQuery } from "../../../store/api/freelancerApi";
import { Button, Card, CardSkeletons, EmptyState, Icon, NavBar, Screen, Text, TextField } from "../../components/ds";
import { authorName, useFreelancerAccess } from "../../lib/freelancer";
import { TAB_BAR_CLEARANCE } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import type { FreelancerPostSummary } from "../../types/freelancer";
import { usePagedOffset } from "../../lib/use-paged-offset";
import { ListFooter } from "../../components/ds/ListFooter";

function PostCard({ post, onPress }: { post: FreelancerPostSummary; onPress: () => void }) {
  const { t } = useTranslation();
  const p = useTokens();
  const name = authorName(post.author);

  return (
    <Card onPress={onPress} accessibilityLabel={post.title} padding={0} style={{ marginBottom: 14, overflow: "hidden" }}>
      {post.images[0] ? (
        <Image source={{ uri: post.images[0] }} style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: p.fill2 }} contentFit="cover" />
      ) : null}
      <View style={{ padding: 16, gap: 10 }}>
        <Text weight="semibold" numberOfLines={2} style={{ fontSize: 17, lineHeight: 22 }}>
          {post.title}
        </Text>
        <Text variant="subhead" tone="secondary" numberOfLines={3}>
          {post.description}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, overflow: "hidden", backgroundColor: p.accentSoft, alignItems: "center", justifyContent: "center" }}>
            {post.author.profilePictureUrl ? (
              <Image source={{ uri: post.author.profilePictureUrl }} style={{ width: 28, height: 28 }} contentFit="cover" />
            ) : (
              <Text weight="bold" tone="accent" style={{ fontSize: 13, lineHeight: 16 }}>
                {name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text variant="footnote" weight="medium" numberOfLines={1} style={{ flex: 1 }}>
            {name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Icon icon={Eye} size={14} color={p.text3} />
            <Text variant="footnote" tone="tertiary">
              {t("freelancers.viewers", { count: post.viewCount })}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const PAGE_SIZE = 30;

/** Freelancer board: paying employees and paid companies browse offers; paying employees can also post. */
export default function FreelancersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { me, isLoading: accessLoading, canBrowse } = useFreelancerAccess();
  const [query, setQuery] = useState("");

  const paging = usePagedOffset(query.trim());
  const { data: posts = [], isLoading, isFetching, isError, refetch } = useListFreelancerPostsQuery(
    { q: query.trim() || undefined, limit: PAGE_SIZE, offset: paging.offset },
    { skip: !canBrowse }
  );

  if (!accessLoading && me && !canBrowse) {
    return (
      <Screen safeTop={false}>
        <NavBar large title={t("freelancers.title")} />
        <EmptyState
          icon={Lock}
          message={`${t("freelancers.lockedTitle")}. ${me.role === "employer" ? t("freelancers.lockedEmployer") : t("freelancers.lockedEmployee")}`}
          actionLabel={t("freelancers.upgrade")}
          onAction={() => router.push(me.role === "employer" ? "/billing" : "/plans")}
        />
      </Screen>
    );
  }

  return (
    <Screen safeTop={false}>
      <NavBar large title={t("freelancers.title")} subtitle={t("freelancers.subtitle")} />

      <FlatList showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: TAB_BAR_CLEARANCE }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: 14, paddingBottom: 12 }}>
            {me?.role === "employee" ? (
              <Button size="sm" variant="secondary" icon={Plus} title={t("freelancers.myPosts")} onPress={() => router.push("/freelancer-mine")} />
            ) : null}
            <TextField
              value={query}
              onChangeText={setQuery}
              icon={Search}
              placeholder={t("freelancers.searchPlaceholder")}
              returnKeyType="search"
            />
            {isLoading || accessLoading ? <CardSkeletons /> : null}
          </View>
        }
        renderItem={({ item }) => (
          <PostCard post={item} onPress={() => router.push({ pathname: "/freelancer/[id]", params: { id: item.id } })} />
        )}
        ListEmptyComponent={
          isLoading || accessLoading ? null : isError ? (
            <EmptyState icon={WifiOff} tone="danger" message={t("freelancers.error")} actionLabel={t("freelancers.retry")} onAction={() => refetch()} />
          ) : (
            <EmptyState icon={SearchX} message={query.trim() ? t("freelancers.emptySearch") : t("freelancers.empty")} />
          )
        }
        onEndReached={() => {
          if (!isFetching && posts.length >= paging.offset + PAGE_SIZE) paging.loadMore(posts.length);
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={<ListFooter loading={isFetching && !isLoading && posts.length > 0} />}
        onRefresh={() => (paging.offset > 0 ? paging.reset() : refetch())}
        refreshing={false}
      />
    </Screen>
  );
}
