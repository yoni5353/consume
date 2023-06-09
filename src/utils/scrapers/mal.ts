import { type PartialItem } from "./main";
import { load } from "cheerio";

export async function getMalItem(link: string): Promise<PartialItem> {
  return await fetch(link).then(async (res) => {
    const $ = load(await res.text());

    const title = $("title").text().replace(" - MyAnimeList.net", "");
    const image = $("meta[property='og:image']").attr("content");
    const episodesNumber = parseInt($("#curEps").first().text());

    return {
      title,
      description: `${episodesNumber} episodes; ${image ?? "No image unfo"}`,
      link,
      image,
      progress: {
        currentValue: 0,
        maxValue: episodesNumber,
      },
      mediaType: { name: "Anime" },
    };
  });
}
