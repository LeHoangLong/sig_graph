import Decimal from "decimal.js";
import { Asset } from "../models/asset";
import { User } from "../models/user";

export type Assets = {[key: string]:Asset}
export interface AssetRepositoryI {
    GetAssetsByNamespace(iNamespace: string): Promise<Assets>
    TransferAsset(iSender: User, iRecipient: User, asset: Asset, relatedAncestorNodeIdsToTransfer: {[nodeId: string]: null}): Promise<[Asset, Asset]>
    FindAssetById(iId: string): Promise<Asset>
    CreateAsset(iProducer: User, iMaterialName: string, iQuantity: Decimal, iUnit: string): Promise<Asset>
    AddAssetToNamespace(iNamespace:string, iAsset: Asset): Promise<Asset>
}