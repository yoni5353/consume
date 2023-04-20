import { type Progress, type Item } from "@prisma/client";
import { load } from "cheerio";
import { getMalItem } from "./mal";
import { getNetflixItem } from "./netflix";

export type PartialItem = { title: string; progress?: Partial<Progress> } & Partial<
  Omit<
    Item,
    "id" | "createdById" | "createdAt" | "createdBy" | "progressId" | "mediaTypeId"
  >
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
    regex: /myanimelist\.net\/anime\/\d/,
    func: getMalItem,
  },
  {
    name: "Netflix",
    regex: /(netflix\.com\/title\/\d)|(netflix\.com\/browse?)/,
    func: getNetflixItem,
  },
];
