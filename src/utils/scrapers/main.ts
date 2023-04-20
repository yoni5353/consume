import { type Progress, type Item } from "@prisma/client";
import { load } from "cheerio";
import { getMalItem } from "./mal";

export type PartialItem = { title: string; progress?: Partial<Progress> } & Partial<
  Omit<Item, "id" | "createdById" | "createdAt" | "createdBy" | "progressId">
>;

export async function getItemFromLink(link: string): Promise<PartialItem> {
  for (const scraper of scrapers) {
    if (scraper.regex.test(link)) {
      return scraper.func(link);
    }
  }
  return getItemFromGenericLink(link);
}

async function getItemFromGenericLink(link: string): Promise<PartialItem> {
  return await fetch(link).then(async (res) => {
    const $ = load(await res.text());
    return { title: $("title").text(), link };
  });
}

export const scrapers: {
  name: string;
  regex: RegExp;
  func: (url: string) => Promise<PartialItem>;
}[] = [
  {
    name: "MAL",
    regex: /myanimelist\.net/,
    func: getMalItem,
  },
];
