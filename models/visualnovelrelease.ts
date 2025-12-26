import { type ID, extendFields } from "./common";
import { type Producer, ProducerFields } from "./producer";

export interface ReleaseLanguage {
  lang: string;
  title: string;
  main: boolean;
};
export const ReleaseLanguageFields = ["lang", "title", "main"];

export interface ReleaseProducer extends Producer {
  developer: boolean;
  publisher: boolean;
};
export const ReleaseProducerFields = ProducerFields.concat(["developer", "publisher"]);

export interface VisualNovelRelease {
  id: ID;
  title: string;
  minage: number | null;
  official: boolean;
  languages: ReleaseLanguage[];
  producers: ReleaseProducer[];
};
export const VisualNovelReleaseFields = ["id", "title", "minage", "official"]
  .concat(extendFields(ReleaseLanguageFields, "languages."))
  .concat(extendFields(ReleaseProducerFields, "producers."));