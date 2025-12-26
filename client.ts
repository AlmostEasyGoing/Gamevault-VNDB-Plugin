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
  type VNDBQueryResult
} from "./models";
import configuration from "./configuration";

enum VNDBRoute {
  VN      = "vn",
  RELEASE = "release"
}

/**
 * API Client to query VNDB API v2 (Kana) as RESTful API.
 * 
 * Note: This is a very minimal implementation and focuses only
 * on retrieving data for visual novels and their releases.
 */
export class VNDBClient {
  public static readonly HOME = "https://vndb.org/";
  public static readonly ENDPOINT = "https://api.vndb.org/kana/";

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

  public async request(
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

  public async requestAll(
    route: VNDBRoute,
    query: VNDBQuery,
    pageLimit: number = 3
  ): Promise<VNDBQueryResult> {
    let page = 1;
    let finished = false;
    let results: Record<string, any>[] = [];
    while (!finished) {
      const pageQuery = query.clone();
      pageQuery.page = page;
      const result = await this.request(route, pageQuery);
      results = results.concat(result.results);
      page++;
      finished = !result.more || page > pageLimit;
      if (!finished) {
        // Sleep between paged requests.
        await new Promise(r => setTimeout(r, configuration.REQUEST_INTERVAL_MS));
      }
    }
    return {
      more: false,
      results: results
    };
  }

  public async getChildTags(
    id: ID
  ): Promise<Tag[]> {
    throw new NotImplementedException(
      "VNDB does not currently support fetching child tags."
    )
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

    if (result.results.length === 0) {
      throw new NotFoundException(
        `VisualNovel with id ${id} not found on VNDB.`
      );
    }
    return result.results[0] as VisualNovel;
  }

  public async searchVisualNovels(
    search: string
  ): Promise<VisualNovel[]> {
    const query = new VNDBQuery({
      filters: ["search", "=", search],
      fields: VisualNovelFields,
      results: VNDBQuery.MAXRESULTS
    });
    const result = await this.requestAll(VNDBRoute.VN, query);
    return result.results as VisualNovel[];
  }

  public async getVisualNovelReleases(
    id: ID
  ): Promise<VisualNovelRelease[]> {
    const query = new VNDBQuery({
      filters: ["vn", "=", ["id", "=", id]],
      fields: VisualNovelReleaseFields,
      results: VNDBQuery.MAXRESULTS
    });
    const result = await this.requestAll(VNDBRoute.RELEASE, query);
    return result.results as VisualNovelRelease[];
  }
}
