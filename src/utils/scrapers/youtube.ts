import { type PartialItem } from "./main";
import { load } from "cheerio";

export async function getYoutubeItem(link: string): Promise<PartialItem> {
  return await fetch(link).then(async (res) => {
    const $ = load(await res.text());

    const title = $("title").text().replace(" - YouTube", "");
    const vidId = link.split("v=").pop()?.split("?")[0];
    const thumbnail = vidId
      ? `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`
      : undefined;

    return {
      title,
      link,
      image: thumbnail,
    };
  });
}
