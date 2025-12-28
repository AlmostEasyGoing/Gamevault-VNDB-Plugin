import { NotFoundException, NotImplementedException } from "@nestjs/common";
import {
  type ID,
  VNDBQuery,
  type Tag,
  TagFields,
  type VisualNovel,
  VisualNovelFields,
  type VisualNovelRelease,
  VisualNovelReleaseFields,
  type VNDBQueryResult,
  type VNDBQueryResultRaw
} from "./models";

/**
 * API Client to query VNDB API v2 (Kana) as RESTful API.
 * 
 * Note: This is a very minimal implementation and focuses only
 * on retrieving data for visual novels and their releases.
 */
export class VNDBClient {
  public static readonly HOME = "https://vndb.org/";
  public static readonly ENDPOINT = "https://api.vndb.org/kana/";

  private settings: VNDBSettings;

  constructor(
    settings: VNDBSettings = { delay: 700 }
  ) {
    this.settings = settings;
  }

  public static makeBrowserURL(
    id: ID
  ): string {
    return VNDBClient.HOME + id;
  }

  public static makeAPIURL(
    route: VNDBRoute
  ): string {
    return VNDBClient.ENDPOINT + route;
  }

  public static calcPageCount(
    itemCount: number
  ) {
    return Math.ceil(itemCount / VNDBQuery.MAXRESULTS);
  }

  public async request(
    route: VNDBRoute,
    query: VNDBQuery,
    pageCount: number = 1
  ): Promise<Paged<VNDBQueryResultRaw>> {
    let more = false;
    let page = query.page;
    let pageTo = query.page + pageCount;
    let finished = false;
    let results: Record<string, any>[] = [];

    while (!finished) {
      // Make new query for next page.
      const pageQuery = query.clone();
      pageQuery.page = page;

      // Perform the query and extract results.
      const result = await this.requestAPI(route, pageQuery);
      more = result.more;
      results = results.concat(result.results);

      // Check termination criteria.
      page++;
      finished = !more || page > pageTo;

      // Sleep between paged requests.
      if (!finished) {
        await new Promise(r => setTimeout(r, this.settings.delay));
      }
    }

    return {
      more: more,
      pageFrom: query.page,
      pageTo: pageTo,
      items: results
    };
  }

  public async requestAPI(
    route: VNDBRoute,
    query: VNDBQuery
  ): Promise<VNDBQueryResult> {
    const response = await fetch(VNDBClient.makeAPIURL(route), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: query.serialize()
    });
    return response.json();
  }

  public async getVisualNovel(
    id: ID
  ): Promise<VisualNovel> {
    const query = new VNDBQuery({
      filters: ["id", "=", id],
      fields: VisualNovelFields,
      results: 1
    });
    const result = await this.request(VNDBRoute.VN, query);

    if (result.items.length === 0) {
      throw new NotFoundException(
        `VisualNovel with id ${id} not found on VNDB.`
      );
    }
    return result.items[0] as VisualNovel;
  }

  public async getVisualNovelReleases(
    id: ID,
    itemLimit: number
  ): Promise<Paged<VisualNovelRelease>> {
    const query = new VNDBQuery({
      filters: ["vn", "=", ["id", "=", id]],
      fields: VisualNovelReleaseFields,
      results: VNDBQuery.MAXRESULTS
    });
    const result = await this.request(VNDBRoute.RELEASE, query, VNDBClient.calcPageCount(itemLimit));
    return {
      ...result,
      items: result.items.slice(0, itemLimit) as VisualNovelRelease[]
    }
  }

  public async searchVisualNovels(
    search: string,
    itemLimit: number
  ): Promise<Paged<VisualNovel>> {
    const query = new VNDBQuery({
      filters: ["search", "=", search],
      fields: VisualNovelFields,
      results: VNDBQuery.MAXRESULTS
    });
    const result = await this.request(VNDBRoute.VN, query, VNDBClient.calcPageCount(itemLimit));
    return {
      ...result,
      items: result.items.slice(0, itemLimit) as VisualNovel[]
    }
  }

  public async getChildTags(
    id: ID,
    itemLimit: number
  ): Promise<Paged<Tag>> {
    throw new NotImplementedException(
      "VNDB does not currently support fetching child tags."
    )
  }
}

interface Paged<T> {
  more: boolean;
  pageFrom: number;
  pageTo: number;
  items: T[];
}

enum VNDBRoute {
  VN      = "vn",
  RELEASE = "release"
}

export interface VNDBSettings {
  // Delay in ms between paged requests.
  delay: number;
}
