import { Module } from "@nestjs/common";
import {
  type GameVaultPluginModule,
  type GameVaultPluginModuleMetadataV1,
} from "../../../src/globals.js";
import { MetadataModule } from "../../../src/modules/metadata/metadata.module.js";
import { MediaModule } from "../../../src/modules/media/media.module.js";
import { VNDBMetadataProviderService } from "./vndb.metadata-provider.service.js";

@Module({
  imports: [MetadataModule, MediaModule],
  providers: [VNDBMetadataProviderService],
})
export default class VNDBPluginModule implements GameVaultPluginModule {
  metadata: GameVaultPluginModuleMetadataV1 = {
    name: "VNDB Metadata Provider",
    author: "AlmostEasyGoing",
    version: "1.2.0",
    description:
      "A plugin to provide metadata using VNDB (The Visual Novel Database).",
    keywords: ["vndb", "visual", "novel", "visual novel", "vn", "metadata"],
    license: "MIT"
  };
}
