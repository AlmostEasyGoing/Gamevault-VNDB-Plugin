import { type ID, extendFields } from "./common.js";
import { type Tag, TagFields } from "./tag.js";
import { type Image, ImageFields } from "./image.js";
import { type ExtLink, ExtLinkFields } from "./extlink.js";

export interface VisualNovel {
  id: ID;
  title: string;
  aliases: string[];
  description: string | null;
  released: string | null;
  length_minutes: number | null;
  extlinks: ExtLink[];
  rating: number | null;
  tags: Tag[];
  image: Image | null;
  screenshots: Image[];
}
export const VisualNovelFields = ["id", "title", "aliases", "description", "released", "length_minutes", "rating"]
  .concat(extendFields(ExtLinkFields, "extlinks."))
  .concat(extendFields(TagFields, "tags."))
  .concat(extendFields(ImageFields, "image."))
  .concat(extendFields(ImageFields, "screenshots."))