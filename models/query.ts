import {
  IsInt,
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

type VNDBQueryFilter = []
  | VNDBQueryFilterPredicate
  | [VNDBQueryFilterReductor, ...VNDBQueryFilterPredicate[]];

type VNDBQueryField = string;

type VNDBQueryFilterPredicate = [
  VNDBQueryFilterField,
  VNDBQueryFilterOperator,
  VNDBQueryFilterValue | VNDBQueryFilter
];

type VNDBQueryFilterReductor = "or" | "and";

type VNDBQueryFilterField = string;

type VNDBQueryFilterOperator = "=" | "!=" | ">" | ">=" | "<" | "<=";

type VNDBQueryFilterValue = string | null;

export type VNDBQueryResult = {
  results: Record<string, any>[];
  more: boolean;
};