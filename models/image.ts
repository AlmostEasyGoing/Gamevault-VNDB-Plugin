import type { ID } from "./common.js";

export interface Image {
  id: ID;
  url: string;
  thumbnail: string;
};
export const ImageFields = ["id", "url", "thumbnail"];