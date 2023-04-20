import { type PartialItem } from "./main";
import { load } from "cheerio";

export async function getNetflixItem(link: string): Promise<PartialItem> {
  return await fetch(link).then(async (res) => {
    const $ = load(await res.text());

    const title = $("title").text().replace("Watch ", "").replace(" | Netflix", "");
    return {
      title,
      link,
    };
  });
}
