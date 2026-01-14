import { Injectable, NotFoundException } from "@nestjs/common";
import { MetadataProvider } from "../../../src/modules/metadata/providers/abstract.metadata-provider.service";
import { MinimalGameMetadataDto } from "../../../src/modules/metadata/games/minimal-game.metadata.dto";
import { GameMetadata } from "../../../src/modules/metadata/games/game.metadata.entity";
import { GenreMetadata } from "../../../src/modules/metadata/genres/genre.metadata.entity";
import { TagMetadata } from "../../../src/modules/metadata/tags/tag.metadata.entity";
import { VNDBClient } from "./client";
import type { VisualNovel, VisualNovelRelease } from "./models";
import configuration from "./configuration";
import { GamevaultGame } from "src/modules/games/gamevault-game.entity";

@Injectable()
export class VNDBMetadataProviderService extends MetadataProvider {
  enabled = configuration.ENABLED;
  request_interval_ms = configuration.REQUEST_INTERVAL_MS;
  readonly slug = "vndb";
  readonly name = "VNDB";
  readonly priority = configuration.PRIORITY;

  public override async search(
    query: string
  ): Promise<MinimalGameMetadataDto[]> {
    const client = this.getClient();
    const games = await client.searchVisualNovels(query, 50);
    if (games.more) {
      this.logger.warn(
        "Too many Visual Novels fit the search criteria. " +
        `Only showing the first ${games.items.length} entries.`
      );
    }
    return games.items.map(game => this.mapMinimalGameMetadata(game));
  }

  public override async getByProviderDataIdOrFail(
    provider_data_id: string
  ): Promise<GameMetadata> {
    const client = this.getClient();
    const game = await client.getVisualNovel(provider_data_id);
    const releases = await client.getVisualNovelReleases(
      provider_data_id, 100, configuration.INCLUDE_UNOFFICIAL_RELEASES
    );
    if (releases.more) {
      this.logger.warn(
        `Too many Releases belong to the Visual Novel with ID ${game.id}. ` +
        `Only taking the first ${releases.items.length} entries into consideration.`
      );
    }
    return this.mapGameMetadata(game, releases.items);
  }

  // Overriding this to allow for title regex matching.
  public override async getBestMatch(
    game: GamevaultGame
  ): Promise<MinimalGameMetadataDto> {
    let result: MinimalGameMetadataDto;
    const client = this.getClient();
    const titleRegex = new RegExp(/\[vndbid-(?<id>\d+)\]/);
    const titleMatch = game.title.match(titleRegex);
    if (titleMatch) {
      const { id } = titleMatch.groups;
      this.logger.debug(
        `Got ID ${id} from game titled ${game.title}. ` +
        `Attempting to use ID based search.`
      );
      try {
        result = this.mapMinimalGameMetadata(
          await client.getVisualNovel(id)
        );
      } catch (e) {
        if (e instanceof NotFoundException) {
          this.logger.warn(
            `Unable to use ID based search: '${e.message}'. ` +
            `Falling back to the default implementation.`
          );
        } else {
          throw e;
        }
      }
    }
    // Could alternatively use API search results as is and
    // not use super.getBestMatch here, as the API search also checks
    // for title aliases and thus may be better for matching in practice.
    return result || await super.getBestMatch(game);
  }

  private async mapGameMetadata(
    game: VisualNovel,
    releases: VisualNovelRelease[]
  ): Promise<GameMetadata> {
    // Collect age ratings of releases.
    const ages = releases
      .map(release => release.minage)
      .filter(age => age !== null);
    // Collect deduplicated release producers.
    const producers = [
      ...new Map(
        releases
          .map(release => release.producers).flat()
          .map(producer => [producer.id, producer])
      ).values()
    ];
    // Sort producers by languages.
    producers.sort((p, o) => {
      const langDiff =
        configuration.LANGUAGES.indexOf(p.lang) -
        configuration.LANGUAGES.indexOf(o.lang);
      return langDiff !== 0
        ? langDiff
        : p.lang.localeCompare(o.lang);
    });
    let metadata = {
      title: game.title,
      provider_slug: this.slug,
      provider_data_id: game.id,
      provider_data_url: VNDBClient.makeBrowserURL(game.id),
      url_screenshots: game.screenshots.map(image => image.url),
      url_websites: [VNDBClient.makeBrowserURL(game.id)]
        .concat(game.extlinks.map(link => link.url)),
      // E.g. Genres on VNDB count as tags too.
      // No filtering is done here, which shouldn't be too bad.
      tags: game.tags.map(tag => ({
        name: tag.name,
        provider_slug: this.slug,
        provider_data_id: tag.id
      }) as TagMetadata),
      publishers: producers
        .filter(producer => producer.publisher)
        .map(producer => ({
          name: producer.name,
          provider_slug: this.slug,
          provider_data_id: producer.id
        })),
      developers: producers
        .filter(producer => producer.developer)
        .map(producer => ({
          name: producer.name,
          provider_slug: this.slug,
          provider_data_id: producer.id
        })),
      /**
       * All entries on VNDB are Visual Novels.
       * We use a pseudo-id here not used by any other tag
       * (they are all prefixed with a "g" character).
       * Technically some gameplay tags exist as child tags
       * of the tag with id "g21", however the API does not
       * actually support fetching child tags yet.
       * I suppose querying the actual tag HTML page (which
       * lists all the child tags) could be a possibility,
       * but is not implemented here (yet).
       */
      genres: [{
        name: "Visual Novel",
        provider_slug: this.slug,
        provider_data_id: "1"
      } as GenreMetadata]
    } as GameMetadata;
    if (ages.length > 0) {
      // We use the maximum age rating of all releases here to be safe.
      metadata["age_rating"] = Math.max(...ages);
    }
    if (game.released !== null) {
      metadata["release_date"] = new Date(game.released);
    }
    if (game.description !== null) {
      metadata["description"] = game.description;
    }
    if (game.length_minutes !== null) {
      metadata["average_playtime"] = game.length_minutes;
    }
    if (game.image !== null) {
      metadata["cover"] = await this.mediaService.downloadByUrl(game.image.url);
    }
    if (game.rating !== null) {
      metadata["rating"] = game.rating;
    }
    return metadata;
  }

  private mapMinimalGameMetadata(
    game: VisualNovel
  ): MinimalGameMetadataDto {
    let metadata: MinimalGameMetadataDto = {
      title: game.title,
      provider_slug: this.slug,
      provider_data_id: game.id
    };
    if (game.released !== null) {
      metadata["release_date"] = new Date(game.released);
    }
    if (game.image !== null) {
      metadata["cover_url"] = game.image.url;
    }
    if (game.description !== null) {
      metadata["description"] = game.description;
    }
    return metadata;
  }

  private getClient(): VNDBClient {
    return new VNDBClient({
      delay: configuration.REQUEST_INTERVAL_MS,
      languages: configuration.LANGUAGES
    });
  }
}
