import { Cubit } from "blac";
import Decimal from "decimal.js";
import { Asset } from "../models/asset";
import { User } from "../models/user";
import { AssetRepositoryI, Assets } from "../repositories/asset_repository_i";
import UserCubit from "./user_cubit";

export interface AssetsByNamespace {
    [namespace: string]: Assets
}

export default class AssetCubit extends Cubit<Assets> {
    private assets: Assets
    private user: User | null = null

    constructor(
        private userCubit: UserCubit,
        private repository: AssetRepositoryI,
        initialValue: Assets,
    ) {
        super(initialValue)
        this.assets = initialValue

        this.userCubit.addValueChangeListener((user: any) => {
            this.user = user 
        })
    }

    FetchAssetsOfCurrentUser = async () => {
        if (this.user !== null) {       
            this.assets = await this.repository.GetAssetsByNamespace(this.user.PublicKey)
            this.emit({...this.assets})
        }
    }

    fetchAssetsById = async (ids: {[key: string]: null}) => {
        if (this.user !== null) {       
            for (let id in ids) {
                let asset = await this.repository.FindAssetById(id)
                asset = await this.repository.AddAssetToNamespace(this.user.PublicKey, asset)
                this.assets[asset.Id] = asset
            }

            this.emit({...this.assets})
        }
    }

    createAsset = async (iProducer: User, iMaterialName: string, iQuantity: Decimal, iUnit: string) => {
        let asset = await this.repository.CreateAsset(iProducer, iMaterialName, iQuantity, iUnit)
        this.assets[asset.Id] = asset
        this.emit({...this.assets})
    }

    transferAsset = async (iSender: User, iRecipient: User, iAsset: Asset, relatedAncestorNodeIdsToTransfer: {[nodeId: string]: null}) => {
        let [oldAsset, newAsset] = await this.repository.TransferAsset(iSender, iRecipient, iAsset, relatedAncestorNodeIdsToTransfer)

        this.assets[oldAsset.Id] = oldAsset
        this.assets[newAsset.Id] = newAsset

        this.emit({...this.assets})
    }
}