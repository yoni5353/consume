import { type PartialItem } from "./main";
import { load } from "cheerio";

export async function getSteamItem(steamLink: string): Promise<PartialItem> {
  // When dragging a game from steam the pasted format is: "<game name>: <link>"
  // (Notice: The name of the game can also contain ':')
  const link = steamLink.split(": ").pop();

  if (!link) {
    throw new Error("Invalid link");
  }

  return await fetch(link).then(async (res) => {
    const $ = load(await res.text());

    const title = $("title").text().replace(" on Steam", "");
    const headerImage = $("img.game_header_image_full").attr("src");

    return {
      title,
      link,
      image: headerImage,
    };
  });
}
