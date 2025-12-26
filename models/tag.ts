import { ID } from "./common";

export interface Tag {
  id: ID;
  name: string;
  aliases: string[];
};
export const TagFields = ["id", "name", "aliases"];