import { ID } from "./common";

// Company, Individual or Amateur Group.
type ProducerType = "co" | "in" | "ng";

export interface Producer {
  id: ID;
  name: string;
  aliases: string[];
  lang: string;
  type: ProducerType;
};
export const ProducerFields = ["id", "name", "aliases", "lang", "type"];