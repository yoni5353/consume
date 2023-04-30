import { type PartialItem } from "./main";
import { load } from "cheerio";

export async function getShoryStoryProject(link: string): Promise<PartialItem> {
  return await fetch(link).then(async (res) => {
    const $ = load(await res.text());

    const title = $("meta[property='og:image:alt']").attr("content") ?? $("title").text();
    const image = $("meta[property='og:image']").attr("content");

    return {
      title,
      link,
      image,
      mediaType: { name: "Book" },
    };
  });
}
