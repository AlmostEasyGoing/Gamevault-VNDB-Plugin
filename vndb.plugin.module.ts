import { Module } from "@nestjs/common";
import {
  GameVaultPluginModule,
  GameVaultPluginModuleMetadataV1,
} from "../../../src/globals";
import { MetadataModule } from "src/modules/metadata/metadata.module";
import { MediaModule } from "src/modules/media/media.module";
import { VNDBMetadataProviderService } from "./vndb.metadata-provider.service";

@Module({
  imports: [MetadataModule, MediaModule],
  providers: [VNDBMetadataProviderService],
})
export default class VNDBPluginModule implements GameVaultPluginModule {
  metadata: GameVaultPluginModuleMetadataV1 = {
    name: "VNDB Metadata Provider",
    author: "AlmostEasyGoing",
    version: "1.1.1",
    description:
      "A plugin to provide metadata using VNDB (The Visual Novel Database).",
    keywords: ["vndb", "visual", "novel", "visual novel", "vn", "metadata"],
    license: "MIT"
  };
}
