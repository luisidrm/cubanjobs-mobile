import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ImagePlus, Lock, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import {
  useAddFreelancerImageMutation,
  useCreateFreelancerPostMutation,
  useGetMyFreelancerPostsQuery,
  useRemoveFreelancerImageMutation,
  useUpdateFreelancerPostMutation,
} from "../../store/api/freelancerApi";
import { ACTION_BAR_CLEARANCE, Button, EmptyState, GlassActionBar, Icon, NavBar, Screen, Text, TextField } from "../components/ds";
import { getErrorMessage } from "../lib/errors";
import { useFreelancerAccess } from "../lib/freelancer";
import { showErrorToast, showSuccessToast } from "../lib/toast";
import { appendFilePart } from "../lib/upload";
import { useTokens } from "../theme/use-tokens";
import { MAX_FREELANCER_IMAGES } from "../types/freelancer";
import { goBack } from "../lib/navigation";

const blank = (v: string) => (v.trim() === "" ? null : v.trim());

function FieldLabel({ children }: { children: string }) {
  return (
    <Text variant="footnote" weight="medium" tone="secondary" style={{ paddingLeft: 4, marginBottom: 8 }}>
      {children}
    </Text>
  );
}

async function toFormData(asset: ImagePicker.ImagePickerAsset): Promise<FormData> {
  const ext = asset.mimeType?.split("/")[1] ?? "jpg";
  const formData = new FormData();
  await appendFilePart(formData, "file", {
    uri: asset.uri,
    name: asset.fileName ?? `photo.${ext}`,
    mimeType: asset.mimeType ?? "image/jpeg",
    webFile: asset.file,
  });
  return formData;
}

/** Create or edit a freelancer post (`?id=` edits). Photos are added/removed on the spot when editing; when creating they upload right after the post exists. */
export default function FreelancerFormScreen() {
  const { t } = useTranslation();
  const p = useTokens();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const { isLoading: accessLoading, canPost } = useFreelancerAccess();
  const { data: myPosts, isLoading: postsLoading } = useGetMyFreelancerPostsQuery(undefined, { skip: !canPost });
  const existing = isEdit ? myPosts?.find((x) => x.id === id) : undefined;

  const [createPost, { isLoading: creating }] = useCreateFreelancerPostMutation();
  const [updatePost, { isLoading: updating }] = useUpdateFreelancerPostMutation();
  const [addImage] = useAddFreelancerImageMutation();
  const [removeImage] = useRemoveFreelancerImageMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [pending, setPending] = useState<ImagePicker.ImagePickerAsset[]>([]);

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setDescription(existing.description);
    setLinkUrl(existing.linkUrl ?? "");
    setPhone(existing.contactPhone ?? "");
    setWhatsapp(existing.contactWhatsapp ?? "");
    setEmail(existing.contactEmail ?? "");
    setTelegram(existing.contactTelegram ?? "");
    // Seed once per post; later image changes come from the query, not these fields.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id]);

  const savedImages = existing?.images ?? [];
  const slotsLeft = MAX_FREELANCER_IMAGES - savedImages.length - pending.length;
  const saving = creating || updating;

  async function handlePick() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(slotsLeft, 1),
      quality: 0.8,
    });
    if (result.canceled) return;
    const assets = result.assets.slice(0, Math.max(slotsLeft, 0));

    if (!isEdit || !existing) {
      setPending((prev) => [...prev, ...assets]);
      return;
    }
    for (const asset of assets) {
      try {
        await addImage({ id: existing.id, formData: await toFormData(asset) }).unwrap();
      } catch (err) {
        showErrorToast(getErrorMessage(err, t("freelancers.form.imageFailed")));
      }
    }
  }

  async function handleRemoveSaved(url: string) {
    if (!existing) return;
    try {
      await removeImage({ id: existing.id, url }).unwrap();
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("freelancers.form.imageFailed")));
    }
  }

  async function handleSave() {
    const link = blank(linkUrl);
    if (link && !/^https?:\/\/\S+$/i.test(link)) return showErrorToast(t("freelancers.form.linkInvalid"));
    const contacts = {
      contactPhone: blank(phone),
      contactWhatsapp: blank(whatsapp),
      contactEmail: blank(email),
      contactTelegram: blank(telegram),
    };
    if (!Object.values(contacts).some(Boolean)) return showErrorToast(t("freelancers.form.contactRequired"));
    if (title.trim().length < 3 || description.trim().length < 10) return showErrorToast(t("freelancers.form.saveFailed"));

    const body = { title: title.trim(), description: description.trim(), linkUrl: link, ...contacts };
    try {
      if (isEdit && existing) {
        await updatePost({ id: existing.id, ...body }).unwrap();
        showSuccessToast(t("freelancers.form.saved"));
      } else {
        const created = await createPost(body).unwrap();
        let failed = false;
        for (const asset of pending) {
          try {
            await addImage({ id: created.id, formData: await toFormData(asset) }).unwrap();
          } catch {
            failed = true;
          }
        }
        if (failed) showErrorToast(t("freelancers.form.createdImagesFailed"));
        else showSuccessToast(t("freelancers.form.created"));
      }
      goBack(router);
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("freelancers.form.saveFailed")));
    }
  }

  const loading = accessLoading || (isEdit && postsLoading);

  return (
    <Screen safeTop={false}>
      <NavBar back title={isEdit ? t("freelancers.editPost") : t("freelancers.newPost")} />

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={p.accent} />
        </View>
      ) : !canPost ? (
        <EmptyState icon={Lock} message={t("freelancers.postingLocked")} actionLabel={t("freelancers.upgrade")} onAction={() => router.push("/plans")} />
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: ACTION_BAR_CLEARANCE, gap: 20 }}>
            <TextField label={t("freelancers.form.title")} value={title} onChangeText={setTitle} placeholder={t("freelancers.form.titlePlaceholder")} maxLength={120} />
            <TextField
              label={t("freelancers.form.description")}
              value={description}
              onChangeText={setDescription}
              placeholder={t("freelancers.form.descriptionPlaceholder")}
              multiline
              rows={6}
              maxLength={5000}
            />
            <TextField
              label={t("freelancers.form.link")}
              value={linkUrl}
              onChangeText={setLinkUrl}
              placeholder={t("freelancers.form.linkPlaceholder")}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={500}
            />

            <View style={{ gap: 12 }}>
              <View>
                <FieldLabel>{t("freelancers.form.contact")}</FieldLabel>
                <Text variant="footnote" tone="tertiary" style={{ paddingLeft: 4 }}>
                  {t("freelancers.form.contactHint")}
                </Text>
              </View>
              <TextField label={t("freelancers.form.phone")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={32} />
              <TextField label={t("freelancers.form.whatsapp")} value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" maxLength={32} />
              <TextField label={t("freelancers.form.email")} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} maxLength={255} />
              <TextField label={t("freelancers.form.telegram")} value={telegram} onChangeText={setTelegram} autoCapitalize="none" autoCorrect={false} maxLength={64} />
            </View>

            <View>
              <FieldLabel>{t("freelancers.form.images")}</FieldLabel>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {savedImages.map((url) => (
                  <Thumb key={url} uri={url} label={t("freelancers.form.removeImage")} onRemove={() => void handleRemoveSaved(url)} />
                ))}
                {pending.map((asset, i) => (
                  <Thumb key={asset.uri} uri={asset.uri} label={t("freelancers.form.removeImage")} onRemove={() => setPending((prev) => prev.filter((_, j) => j !== i))} />
                ))}
              </View>
              {slotsLeft > 0 ? (
                <Button
                  size="sm"
                  variant="secondary"
                  icon={ImagePlus}
                  title={t("freelancers.form.addImage")}
                  onPress={handlePick}
                  style={{ alignSelf: "flex-start", marginTop: savedImages.length + pending.length > 0 ? 10 : 0 }}
                />
              ) : null}
              <Text variant="footnote" tone="tertiary" style={{ paddingLeft: 4, marginTop: 6 }}>
                {t("freelancers.form.imagesHint", { max: MAX_FREELANCER_IMAGES })}
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {canPost && !loading ? (
        <GlassActionBar>
          <Button block size="lg" title={isEdit ? t("freelancers.form.save") : t("freelancers.form.create")} loading={saving} onPress={handleSave} />
        </GlassActionBar>
      ) : null}
    </Screen>
  );
}

function Thumb({ uri, label, onRemove }: { uri: string; label: string; onRemove: () => void }) {
  const p = useTokens();
  return (
    <View style={{ width: 84, height: 84 }}>
      <Image source={{ uri }} style={{ width: 84, height: 84, borderRadius: 12, backgroundColor: p.fill2 }} contentFit="cover" />
      <Pressable
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel={label}
        hitSlop={8}
        style={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" }}
      >
        <Icon icon={X} size={14} color="#fff" />
      </Pressable>
    </View>
  );
}
