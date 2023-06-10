import { type PartialItem } from "./main";
import { load } from "cheerio";

export async function getAudibleItem(link: string): Promise<PartialItem> {
  return await fetch(link).then(async (res) => {
    const $ = load(await res.text());

    const titleElement = $("h1.bc-heading").first();
    const title = titleElement.text();
    const description = "";
    const image = "";

    return {
      title,
      link,
      description,
      mediaType: { name: "Book" },
    };
  });
}
