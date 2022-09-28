import React, { useCallback, useContext, useEffect, useState } from "react"
import styles from './asset_page.module.scss'
import Decimal from "decimal.js";
import { Modal } from "./modal";
import { NumericInput } from './numeric_input'
import { AssetRepositoryContext, FriendsGetterServiceContext, useBloc } from "../context";
import UserCubit from "../bloc/user_cubit";
import AssetCubit from "../bloc/asset_cubit";
import { User } from "../models/user";
import FriendsCubit from "../bloc/friends_cubit";
import { Status } from "../common/status";
import { Asset, nodeIsAsset } from "../models/asset";
import { Node } from "../models/node";
import internal from "stream";


interface TreeNode {
    node: Node
    parents: TreeNode[]
}

export const AssetPage = () => {
    let [materialName, setMaterialName] = useState("")
    let [unit, setUnit] = useState("")
    let [quantity, setQuantity] = useState(new Decimal(0))
    let [displayNewAssetForm, setDisplayNewAssetForm] = useState(false)
    let assetRepository = useContext(AssetRepositoryContext)
    let [user] = useBloc(UserCubit)
    let [assets, {FetchAssetsOfCurrentUser, createAsset, transferAsset, fetchAssetsById}] = useBloc(AssetCubit)
    let [friendsState] = useBloc(FriendsCubit)
    let [selectedTransferToFriend, setSelectedTransferToFriend] = useState<User|null>(null)
    let [assetToTransfer, setAssetToTransfer] = useState<Asset|null>(null)
    let [displayTransferAssetForm, setDisplayTransferAssetForm] = useState(false)
    let friendGetterService = useContext(FriendsGetterServiceContext)

    useEffect(() => {
        if (user !== null) {
            if (friendsState.status === Status.INIT) {
                friendGetterService.getFriends(user)
            }
        }
    }, [friendsState, friendGetterService, user])

    useEffect(() => {
        let getAsset = async (user: User | null) => {
            if (user !== null) {
                FetchAssetsOfCurrentUser()
            }
        }

        getAsset(user)
    }, [user, assetRepository, FetchAssetsOfCurrentUser])

    useEffect(() => {
        let fetchRelatedAncestorAssets = async () => {
            if (assetToTransfer !== null) {
                await fetchAssetsById(assetToTransfer.RelatedAncestorNodeIds)
            }
        }

        fetchRelatedAncestorAssets()
    }, [assetToTransfer, assetRepository, fetchAssetsById])

    async function okButtonClickHandler(e: React.ChangeEvent<HTMLFormElement>) {
        e.preventDefault()
        await createAsset(user!, materialName, quantity, unit)
        setDisplayNewAssetForm(false)
    }

    function transferButtonClickHandler(asset: Asset) {
        setAssetToTransfer(asset)
        setDisplayTransferAssetForm(true)
    }

    async function transferAssetButtonClickHandler() {
        if (user !== null && selectedTransferToFriend !== null && assetToTransfer !== null) {
            await transferAsset(user, selectedTransferToFriend, assetToTransfer, selectedRelatedNodeToTransfer)
            setDisplayTransferAssetForm(false)
        }
    }

    function recipientChangeHandler(iRecipientKey: string) {
        if (iRecipientKey === "") {
            setSelectedTransferToFriend(null)
        }
        let recipient = friendsState.friends.find(friend => friend.PublicKey === iRecipientKey)
        if (recipient !== undefined) {
            setSelectedTransferToFriend(recipient)
        }
    }


    let ownedAssetElements : React.ReactNode[] = []
    let othersAssetElements : React.ReactNode[] = []
    for (let id in assets) {
        let asset = assets[id]
        if (asset.OwnerPublicKey === user!.PublicKey) {
            if (Object.keys(asset.NextNodeIds).length === 0) {
                ownedAssetElements.push(
                    <div className={ styles.asset } key={ asset.Id }>
                        <h3>{ asset.MaterialName }</h3>
                        <p>ID: { asset.Id }</p>
                        <p>Q.ty: { asset.Quantity.toString() }</p>
                        <p>Unit: { asset.Unit }</p>
                        <p>Created time: { asset.ProducedTime.toLocaleDateString() }</p>
                        <button onClick={() => transferButtonClickHandler(asset)} className={ styles.transfer_button }>Transfer</button>
                    </div>
                )
            }
        } else if (Object.keys(asset.NextNodeIds).length === 0) {
            let friend = friendsState.friends.find(e => e.PublicKey === asset.OwnerPublicKey)
            othersAssetElements.push(
                <div className={ styles.asset } key={ asset.Id }>
                    <h3>{ asset.MaterialName }</h3>
                    <p>Q.ty: { asset.Quantity.toString() }</p>
                    <p>Unit: { asset.Unit }</p>
                    <p>Created time: { asset.ProducedTime.toLocaleDateString() }</p>
                    <p>Owned by: { friend === undefined ? "Unknown" : friend.Name }</p>
                </div>
            )
        }
    }

    let relatedNodesToTransfer : React.ReactNode[] = []

    let [allAssetsFetched, setAllAssetsFetched] = useState(true)
    let [nodeTree, setNodeTree] = useState<TreeNode[]>([])

    const FetchTree = useCallback((root: Node, nodesToFetch: {[nodeId: string]: null}) => {
        for (let ancestorId in root.RelatedAncestorNodeIds) {
            if (!(ancestorId in assets)) {
                nodesToFetch[ancestorId] = null
            }
        }
    }, [assets])

    useEffect(() => {
        let assetsToTraverseQueue : Asset[] = []
        let nodeMap: {[nodeId: string]: TreeNode} = {}
        let nodesToFetch : {[nodeId: string]: null} = {}
        let nodeTree : TreeNode[] = []
        if (assetToTransfer !== null) {
            FetchTree(assetToTransfer, nodesToFetch)

            if (Object.keys(nodesToFetch).length > 0) {
                fetchAssetsById(nodesToFetch)
            } else {
                let allAssetsFetched = true
                for (let previousNodeId in assetToTransfer.PreviousNodeIds) {
                    if (previousNodeId in assets) {
                        assetsToTraverseQueue.push(assets[previousNodeId])
                        let node = assets[previousNodeId]
                        let treeNode : TreeNode = {
                            node: node,
                            parents: [],
                        }
                        nodeTree.push(treeNode)
                        nodeMap[previousNodeId] = treeNode
                    } else {
                        allAssetsFetched = false
                        break
                    }
                }

                while (assetsToTraverseQueue.length > 0 && allAssetsFetched) {
                    let node = assetsToTraverseQueue.pop()!

                    for (let parentId in node.PreviousNodeIds) {
                        if (parentId in assets) {
                            let parentNode = assets[parentId]
                            let parentTreeNode : TreeNode = {
                                node: parentNode,
                                parents: [],
                            }
                            assetsToTraverseQueue.push(assets[parentId])
                            nodeMap[parentId] = parentTreeNode
                        } else {
                            allAssetsFetched = false
                            break
                        }

                        if (parentId in assetToTransfer.RelatedAncestorNodeIds) {
                            nodeMap[node.Id].parents.push(nodeMap[parentId])
                        }
                    }
                }

                setAllAssetsFetched(allAssetsFetched)
                setNodeTree(nodeTree)
            }
        }   
    }, [assetToTransfer, FetchTree, assets, fetchAssetsById])

    let [selectedRelatedNodeToTransfer, setSelectedRelatedNodeToTransfer] = useState<{[nodeId: string]:null}>({})

    const BuildTreeElement = (level: number, root: TreeNode) : React.ReactNode => {
        let node = root.node
        let childrenElements: React.ReactNode[] = []
        for (let i = 0; i < root.parents.length; i++) {
            childrenElements.push(BuildTreeElement(level + 1, root.parents[i]))
        }

        if (nodeIsAsset(node)) {
            return (
                <div key={ node.Id } style={{marginLeft: `${level*10}px`}}>
                    <input type="checkbox" readOnly onClick={(evt) => {
                        setSelectedRelatedNodeToTransfer(e => {
                            e = {...e}
                            if (node.Id in e) {
                                delete e[node.Id]
                            } else {
                                e[node.Id] = null
                            }
                            return e
                        }) 
                        return false
                    }} checked={ node.Id in selectedRelatedNodeToTransfer }></input>
                    <label htmlFor={ node.Id }>{ node.MaterialName } from { node.OwnerPublicKey }</label>
                    { childrenElements }
                </div>
            )
        }
    }


    for (let i = 0; i < nodeTree.length; i++) {
        relatedNodesToTransfer.push(BuildTreeElement(0, nodeTree[i]))
    }

    return <React.Fragment>
        <Modal display={ displayNewAssetForm }>
            <h2 className={ styles.form_title }>New asset</h2>
            <form className={ styles.form_body } onSubmit={ okButtonClickHandler }>
                <label className={ styles.label} htmlFor="material_name">Material name</label>
                <input className={ styles.input} name="material_name" value={ materialName } onChange={e => setMaterialName(e.target.value)}></input>

                <label className={ styles.label} htmlFor="unit">Unit</label>
                <input className={ styles.input} name="unit" value={ unit } onChange={e => setUnit(e.target.value.toLocaleLowerCase())}></input>

                <label className={ styles.label} htmlFor="quantity">Quantity</label>
                <NumericInput name='quantity' className={ styles.input } value={ quantity } onChanged={ setQuantity }></NumericInput>
                <div className={ styles.buttons }>
                    <button className={ styles.button + " " + styles.primary_button }>Ok</button>
                    <button className={ styles.button } type="button" onClick={() => setDisplayNewAssetForm(false)}>Close</button>
                </div>
            </form>
        </Modal>

        <Modal display={ displayTransferAssetForm }>
            <div className={ styles.transfer_asset_form }>
                <h2 className={ styles.form_title }>Transfer asset</h2>
                <div className={ styles.select_container }>
                    <label className={ styles.selct_label } htmlFor="transfer_to">Transfer to</label>
                    <select defaultValue="" onChange={e => recipientChangeHandler(e.target.value)} className={ styles.select } name="transfer_to">
                        <option value=""></option>
                        { friendsState.friends.map(friend => <option value={ friend.PublicKey } key={ friend.PublicKey }>{ friend.Name }</option>) }
                    </select>

                    <div>
                        <p className={ styles.info_to_share }>Info to share</p>
                        { relatedNodesToTransfer }
                    </div>
                </div>
                <div className={ styles.buttons }>
                    <button onClick={ transferAssetButtonClickHandler } className={ styles.button + " " + styles.primary_button }>Ok</button>
                    <button className={ styles.button } type="button" onClick={() => setDisplayTransferAssetForm(false)}>Close</button>
                </div>
            </div>
        </Modal>

        <div className={ styles.main }>
            <button className={ styles.add_asset_button } onClick={() => setDisplayNewAssetForm(true)}>New asset</button>
            <div style={{ display: ownedAssetElements.length === 0? 'none' : 'block' }}>
                <h1>Owned by me</h1>
                <div className={ styles.assets }>
                    { ownedAssetElements }
                </div>
            </div>
            <div style={{ display: othersAssetElements.length === 0? 'none' : 'block' }}>
                <h1>Owned by others</h1>
                <div className={ styles.assets }>
                    { othersAssetElements }
                </div>
            </div>
        </div>
    </React.Fragment>
}