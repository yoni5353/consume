import { type ItemTemplate } from "@prisma/client";

const templateMetadtaFields: (keyof ItemTemplate)[] = [
  "id",
  "createdById",
  "createdAt",
  "updatedAt",
];

type TemplateMetadtaTypes = "id" | "createdById" | "createdAt" | "createdBy";

export function exludeTemplateMetadta(
  template: ItemTemplate
): Omit<ItemTemplate, TemplateMetadtaTypes> {
  for (const key of templateMetadtaFields) {
    delete template[key];
  }
  return template;
}
