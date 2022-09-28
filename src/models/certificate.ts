import { Node } from "./node";

export interface Certificate extends Node {
    CreatedTime: Date
    ExpiryTime: Date
}