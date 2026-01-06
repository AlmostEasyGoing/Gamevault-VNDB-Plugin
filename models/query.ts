import {
  IsInt,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  Min,
  Max
} from "class-validator";

export class VNDBQuery {
  constructor(init?: Partial<VNDBQuery>) {
    Object.assign(this, init);
  }

  public static readonly MAXRESULTS = 100;
  public filters: VNDBQueryFilter = [];
  public fields: VNDBQueryField[] = [];

  @IsNotEmpty()
  public sort: string = "id";

  @IsBoolean()
  public reverse: boolean = false;

  @IsInt()
  @Min(0)
  @Max(VNDBQuery.MAXRESULTS)
  public results: number = 10;

  @IsInt()
  @Min(1)
  public page: number = 1;

  public clone(): VNDBQuery {
    return new VNDBQuery({
      filters: structuredClone(this.filters),
      fields: structuredClone(this.fields),
      sort: this.sort,
      reverse: this.reverse,
      results: this.results,
      page: this.page
    })
  }

  public serialize(): string {
    return JSON.stringify({
      filters: this.filters,
      fields: this.fields.join(","),
      sort: this.sort,
      reverse: this.reverse,
      results: this.results,
      page: this.page
    });
  }
}

export class VNDBQueryFilterBuilder {
  constructor(
    value: VNDBQueryFilter = []
  ) {
    this.value = value;
  }

  @IsArray()
  private value: VNDBQueryFilter;

  public reduce(
    op: VNDBQueryFilterReductor,
    filters: VNDBQueryFilter[]
  ): VNDBQueryFilterBuilder {
    let allFilters = [this.value].concat(filters)
      .filter(filter => isVNDBQueryFilterNormal(filter));
    return new VNDBQueryFilterBuilder(
      allFilters.length > 1
        ? [op, allFilters[0], ...allFilters.slice(1)]
        : allFilters.length === 1
          ? allFilters[0]
          : []
    );
  }

  public get(): VNDBQueryFilter {
    return this.value;
  }
}

export type VNDBQueryFilter = [] | VNDBQueryFilterNormal;

export type VNDBQueryFilterNormal = VNDBQueryFilterPredicate
  | [VNDBQueryFilterReductor, VNDBQueryFilterNormal, ...VNDBQueryFilterNormal[]];

export function isVNDBQueryFilterNormal(
  filter: VNDBQueryFilter
): filter is VNDBQueryFilterNormal {
  return filter.length > 0;
}

export type VNDBQueryField = string;

type VNDBQueryFilterPredicate = [
  VNDBQueryFilterField,
  VNDBQueryFilterOperator,
  VNDBQueryFilterValue | VNDBQueryFilterNormal
];

type VNDBQueryFilterReductor = "or" | "and";

type VNDBQueryFilterField = string;

type VNDBQueryFilterOperator = "=" | "!=" | ">" | ">=" | "<" | "<=";

type VNDBQueryFilterValue = string | null;

export type VNDBQueryResultRaw = Record<string, any>

export type VNDBQueryResult = {
  results: VNDBQueryResultRaw[];
  more: boolean;
};