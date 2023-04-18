import { type Item } from "@prisma/client";
import * as cheerio from "cheerio";

export type PartialItem = { title: string } & Partial<
  Omit<Item, "id" | "createdById" | "createdAt" | "createdBy" | "progressId">
>;

export async function getItemFromLink(link: string): Promise<PartialItem> {
  return getItemFromGenericLink(link);
}

async function getItemFromGenericLink(link: string): Promise<PartialItem> {
  return await fetch(link).then(async (res) => {
    const $ = cheerio.load(await res.text());
    return { title: $("title").text(), link };
  });
}
