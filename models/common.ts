export type ID = string;

export function extendFields(
  fields: string[],
  prefix: string
): string[] {
  return fields.map(field => prefix + field);
}