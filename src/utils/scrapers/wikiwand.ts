import { type PartialItem } from "./main";
import { load } from "cheerio";

export async function getWikiwandItem(link: string): Promise<PartialItem> {
  return await fetch(link).then(async (res) => {
    const $ = load(await res.text());

    const title = $("title").text().replace(" - Wikiwand", "");
    const image = $("meta[property='og:image']").attr("content");

    return {
      title,
      link,
      image,
    };
  });
}
