import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ExternalLink, Eye, Lock, Mail, MessageCircle, Pencil, Phone, SearchX, Send } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useGetFreelancerPostQuery } from "../../../store/api/freelancerApi";
import { Button, EmptyState, IconButton, NavBar, Screen, Text } from "../../components/ds";
import { type ContactLink, authorName, contactLinks } from "../../lib/freelancer";
import { openExternal } from "../../lib/openExternal";
import { useTokens } from "../../theme/use-tokens";

const CONTACT_ICONS = { phone: Phone, whatsapp: MessageCircle, email: Mail, telegram: Send } as const;

export default function FreelancerPostScreen() {
  const { t } = useTranslation();
  const p = useTokens();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: post, isLoading, error } = useGetFreelancerPostQuery(id);
  const [active, setActive] = useState(0);

  const status = error && "status" in error ? error.status : undefined;

  const open = (url: string) => openExternal(url, t("common.cantOpenLink"));

  const contacts: ContactLink[] = post ? contactLinks(post) : [];

  return (
    <Screen safeTop={false}>
      <NavBar
        back
        title={t("freelancers.title")}
        trailing={
          post?.isOwner ? (
            <IconButton
              icon={Pencil}
              label={t("freelancers.editPost")}
              variant="fill"
              onPress={() => router.push({ pathname: "/freelancer-form", params: { id: post.id } })}
            />
          ) : undefined
        }
      />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={p.accent} />
        </View>
      ) : null}

      {status === 402 ? (
        <EmptyState icon={Lock} message={t("freelancers.lockedTitle")} actionLabel={t("freelancers.upgrade")} onAction={() => router.push("/plans")} />
      ) : null}

      {error && status !== 402 ? <EmptyState icon={SearchX} message={t("freelancers.detail.notFound")} /> : null}

      {post ? (
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 18 }}>
          {post.images.length > 0 ? (
            <View style={{ gap: 8 }}>
              <Image
                source={{ uri: post.images[Math.min(active, post.images.length - 1)] }}
                style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: 16, backgroundColor: p.fill2 }}
                contentFit="cover"
              />
              {post.images.length > 1 ? (
                <ScrollView showsVerticalScrollIndicator={false} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {post.images.map((url, i) => (
                    <Pressable key={url} onPress={() => setActive(i)} accessibilityLabel={`${i + 1}/${post.images.length}`}>
                      <Image
                        source={{ uri: url }}
                        style={{ width: 64, height: 64, borderRadius: 10, borderWidth: 2, borderColor: i === active ? p.accent : "transparent" }}
                        contentFit="cover"
                      />
                    </Pressable>
                  ))}
                </ScrollView>
              ) : null}
            </View>
          ) : null}

          <View style={{ gap: 6 }}>
            <Text variant="title2" weight="bold">
              {post.title}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 14, rowGap: 4 }}>
              <Text variant="footnote" tone="tertiary">
                {t("freelancers.detail.by", { name: authorName(post.author) })}
              </Text>
              {post.author.location ? (
                <Text variant="footnote" tone="tertiary">
                  {post.author.location}
                </Text>
              ) : null}
              <Text variant="footnote" tone="tertiary">
                <Eye size={13} color={p.text3} /> {t("freelancers.viewers", { count: post.viewCount })}
              </Text>
            </View>
          </View>

          <Text variant="body">{post.description}</Text>

          {post.linkUrl ? (
            <Button size="sm" variant="secondary" icon={ExternalLink} title={t("freelancers.detail.openLink")} onPress={() => void open(post.linkUrl as string)} />
          ) : null}

          <View style={{ gap: 10 }}>
            <Text variant="headline" weight="semibold">
              {t("freelancers.detail.contact")}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {contacts.map((c) => (
                <Button key={c.key} size="sm" variant="secondary" icon={CONTACT_ICONS[c.key]} title={c.value} onPress={() => void open(c.url)} />
              ))}
            </View>
          </View>
        </ScrollView>
      ) : null}
    </Screen>
  );
}
