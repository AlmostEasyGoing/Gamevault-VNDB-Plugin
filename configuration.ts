import { toLower } from "lodash";

// Copy from src/configuration.ts as this utility is not exported.
function parseBooleanEnvVariable(
  environmentVariable: string,
  defaultCase: boolean = false
): boolean {
  switch (toLower(environmentVariable)) {
    case "0":
    case "false":
    case "no":
    case "off":
    case "disable":
    case "disabled":
      return false;
    case "1":
    case "true":
    case "yes":
    case "on":
    case "enable":
    case "enabled":
      return true;
    default:
      return defaultCase;
  }
}
function parseNumber(
  environmentVariable: string,
  defaultValue?: number,
): number | undefined {
  const number = Number(environmentVariable);
  if (isNaN(number) || number < 0 || number > Number.MAX_SAFE_INTEGER) {
    return defaultValue ?? undefined;
  }
  return number;
}
function parseList(
  environmentVariable: string,
  defaultList: string[] = [],
): string[] {
  return environmentVariable
    ? environmentVariable.split(",").map((item) => item.trim())
    : defaultList;
}

const configuration = {
  ENABLED: parseBooleanEnvVariable(process.env.PLUGIN_ALMOSTEASYGOING_VNDB_ENABLED, true),
  PRIORITY: parseNumber(process.env.PLUGIN_ALMOSTEASYGOING_VNDB_PRIORITY, 5),
  // See "Usage Terms" in https://api.vndb.org/kana. About 200 requests per 5 minutes.
  // Note that one query may lead to multiple requests due to related object fetching.
  REQUEST_INTERVAL_MS: parseNumber(process.env.PLUGIN_ALMOSTEASYGOING_VNDB_REQUEST_INTERVAL_MS, 700),
  // Languages (two letter language codes, see https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes).
  // Used for filtering and ordering vns and releases. Does NOT affect the title.
  // An empty list means no filtering is done (all languages included).
  LANGUAGES: parseList(process.env.PLUGIN_ALMOSTEASYGOING_VNDB_LANGUAGES),
  // Whether to include unofficial releases (e.g. machine TL) for vns or not.
  INCLUDE_UNOFFICIAL_RELEASES: parseBooleanEnvVariable(process.env.PLUGIN_ALMOSTEASYGOING_VNDB_INCLUDE_UNOFFICIAL_RELEASES, true)
}
export default configuration;
