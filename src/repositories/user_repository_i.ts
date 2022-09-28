import { PublicKeyType, User } from "../models/user";

export interface UserRepositoryI {
    GetUsers(): Promise<User[]>
    GetCurrentUser(): Promise<User|null>
    SetCurrentUser(user: User|null): Promise<void>
    GetUserByPublicKey(publicKey: PublicKeyType): Promise<User>
}

