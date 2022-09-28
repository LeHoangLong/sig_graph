export type PublicKeyType = string 
export interface User {
    PublicKey: PublicKeyType
    Name: string
    Friends: PublicKeyType[]
}