import { PublicKeyType } from "./user"

type NodeId = string

export enum NodeType {
    Asset,
    Info,
}

export interface Node {
    Id: NodeId
    Type: NodeType
    CreatedTime: Date
    IsFinalized: boolean
    OwnerPublicKey: PublicKeyType
    PreviousNodeIds: {[key: NodeId]: null}
    NextNodeIds: {[key: NodeId]: null}
    RelatedAncestorNodeIds: {[key: NodeId]: null}
}