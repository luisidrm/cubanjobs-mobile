import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGetSkillsCatalogQuery } from "../../store/api/usersApi";

/**
 * Shows a skill in the app's language. Skills are stored under one canonical
 * (English) name; in Spanish this returns the catalog's Spanish name for it.
 * A skill that is not in the catalog (typed freely) is shown as written.
 */
export function useSkillLabel() {
  const { i18n } = useTranslation();
  const { data: catalog } = useGetSkillsCatalogQuery();
  const spanish = i18n.language?.startsWith("es") ?? false;
  const names = useMemo(() => new Map((catalog ?? []).map((c) => [c.name.toLowerCase(), c.nameEs])), [catalog]);
  return useCallback((skill: string) => (spanish ? (names.get(skill.toLowerCase()) ?? skill) : skill), [spanish, names]);
}

/** True when `text` appears in a catalog entry's English or Spanish name. */
export function skillMatches(c: { name: string; nameEs: string | null }, text: string): boolean {
  const q = text.trim().toLowerCase();
  return !q || c.name.toLowerCase().includes(q) || (c.nameEs ?? "").toLowerCase().includes(q);
}
