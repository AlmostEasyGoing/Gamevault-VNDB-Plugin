import { ID } from "./common";

export interface Image {
  id: ID;
  url: string;
  thumbnail: string;
};
export const ImageFields = ["id", "url", "thumbnail"];