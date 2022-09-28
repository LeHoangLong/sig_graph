import { Asset } from "../models/asset";
import { AssetRepositoryI, Assets } from "./asset_repository_i";
import { v4 } from 'uuid'
import { PublicKeyType, User } from "../models/user";
import Decimal from "decimal.js";
import { NodeType } from "../models/node";
import { NotFound } from "../common/error";

export class AssetRepositoryDemo implements AssetRepositoryI {
    private assets: {[key:string]: {[key: string]:Asset}} = {}

    constructor() {
        let assetsStr = localStorage.getItem("assets")
        if (assetsStr !== null) {
            this.assets = JSON.parse(assetsStr)
        }
        for (let namespace in this.assets) {
            for (let assetId in this.assets[namespace]) {
                this.assets[namespace][assetId].CreatedTime = new Date(this.assets[namespace][assetId].CreatedTime as unknown as string)
                this.assets[namespace][assetId].ProducedTime = new Date(this.assets[namespace][assetId].ProducedTime as unknown as string)
            }
        }
    }

    async AddAssetToNamespace(iNamespace: string, iAsset: Asset): Promise<Asset> {
        this.assets[iNamespace][iAsset.Id] = iAsset
        return {...iAsset}
    }

    async GetAssetsByNamespace(iNamespace: string): Promise<Assets> {
        let assets = this.assets[iNamespace]
        if (assets === undefined) {
            return {}
        } 

        return assets
    }

    async TransferAsset(iSender: User, iRecipient: User, iAsset: Asset, relatedAncestorNodeIdsToTransfer: {[nodeId: string]: null}): Promise<[Asset, Asset]> {
        if (!(iSender.PublicKey in this.assets)) {
            this.assets[iSender.PublicKey] = {}    
        }
        
        if (!(iRecipient.PublicKey in this.assets)) {
            this.assets[iRecipient.PublicKey] = {}    
        }

        let newAsset = this.draftNewAsset(iRecipient.PublicKey, iAsset.MaterialName, iAsset.Quantity, iAsset.Unit, iAsset.ProducedTime)
        let oldAsset : Asset = {
            ...iAsset,
            NextNodeIds: {
                ...iAsset.NextNodeIds,
                [newAsset.Id]: null,
            },
            IsFinalized: true,
        }
        newAsset.PreviousNodeIds[oldAsset.Id] = null
        newAsset.RelatedAncestorNodeIds = {...relatedAncestorNodeIdsToTransfer}
        newAsset.RelatedAncestorNodeIds[oldAsset.Id] = null

        for (let namespace in this.assets) {
            if (iAsset.Id in this.assets[namespace]) {
                this.assets[namespace][iAsset.Id] = oldAsset
            }
        }

        this.assets[iSender.PublicKey][newAsset.Id] = newAsset
        this.assets[iRecipient.PublicKey][newAsset.Id] = newAsset

        localStorage.setItem("assets", JSON.stringify(this.assets))

        return [oldAsset, newAsset]
    }


    async CreateAsset(iProducer: User, iMaterialName: string, iQuantity: Decimal, iUnit: string): Promise<Asset> {
        let newAsset = this.draftNewAsset(iProducer.PublicKey, iMaterialName, iQuantity, iUnit, new Date())
        if (!(iProducer.PublicKey in this.assets)) {
            this.assets[iProducer.PublicKey] = {}    
        }
        this.assets[iProducer.PublicKey][newAsset.Id] = newAsset
        localStorage.setItem("assets", JSON.stringify(this.assets))
        return newAsset
    }

    async FindAssetById(iId: string): Promise<Asset> {
        for (let namespace in this.assets) {
            if (iId in this.assets[namespace]) {
                return {...this.assets[namespace][iId]}
            }
        }
        throw new NotFound()
    }

    private draftNewAsset(iOwnerKey: PublicKeyType, iMaterialName: string, iQuantity: Decimal, iUnit: string, iProducedTime: Date) : Asset {
        let id = v4();
        return {
            Id: id,
            Type: NodeType.Asset,
            OwnerPublicKey: iOwnerKey,
            CreatedTime: new Date(),
            MaterialName: iMaterialName,
            Quantity: iQuantity,
            IsFinalized: false,
            PreviousNodeIds: {},
            NextNodeIds: {},
            RelatedAncestorNodeIds: {},
            Unit: iUnit,
            ProducedTime: iProducedTime,
        }
    }
}