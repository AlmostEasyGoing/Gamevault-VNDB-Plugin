import { type ID, extendFields } from "./common";
import { type Tag, TagFields } from "./tag";
import { type Image, ImageFields } from "./image";
import { type ExtLink, ExtLinkFields } from "./extlink";

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