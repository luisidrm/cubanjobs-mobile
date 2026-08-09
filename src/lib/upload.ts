import { Platform } from "react-native";

interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  /** Web only — expo-image-picker/expo-document-picker return this alongside `uri` on web. */
  webFile?: File;
}

/**
 * Appends a picked file to a FormData for upload. React Native's FormData
 * takes a { uri, name, type } descriptor for native platforms, but on web
 * fetch expects a real Blob/File — the platforms aren't interchangeable.
 */
export async function appendFilePart(
  formData: FormData,
  fieldName: string,
  file: PickedFile
): Promise<void> {
  if (Platform.OS === "web") {
    const blob = file.webFile ?? (await (await fetch(file.uri)).blob());
    formData.append(fieldName, blob, file.name);
  } else {
    formData.append(fieldName, {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
    } as unknown as Blob);
  }
}
