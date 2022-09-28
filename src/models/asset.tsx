import Decimal from "decimal.js";
import { Node, NodeType } from "./node";

export interface Asset extends Node {
    MaterialName: string
    Quantity: Decimal
    Unit: string
    ProducedTime: Date
}

export function nodeIsAsset(node: Node): node is Asset {
    if (node.Type === NodeType.Asset) {
        return true
    } else {
        return false
    }
}