import { NotFound } from "../common/error";
import { PublicKeyType, User } from "../models/user";
import { UserRepositoryI } from "./user_repository_i";

const demoUsers: User[] = [
    {
        PublicKey: "farmer-1-key",
        Name: "farmer-1",
        Friends: ["distributor-1-1-key"]
    },
    {
        PublicKey: "farmer-2-key",
        Name: "farmer-2",
        Friends: ["distributor-1-1-key", "distributor-1-2-key"]
    },
    {
        PublicKey: "distributor-1-1-key",
        Name: "distributor-1",
        Friends: ["distributor-2-1-key"]
    },
    {
        PublicKey: "distributor-1-2-key",
        Name: "distributor-2",
        Friends: ["distributor-2-1-key"]
    },
    {
        PublicKey: "distributor-2-1-key",
        Name: "distributor-3",
        Friends: ["user-1-key", "user-2-key"]
    },
    {
        PublicKey: "user-1-key",
        Name: "user-1",
        Friends: []
    },
    {
        PublicKey: "user-2-key",
        Name: "user-2",
        Friends: []
    },
    
]

const currentUserKey = "currentUser"
export class UserRepositoryDemo implements UserRepositoryI {
    async GetUsers(): Promise<User[]> {
        return demoUsers
    }

    async GetCurrentUser(): Promise<User | null> {
        let userStr = localStorage.getItem(currentUserKey)
        if (userStr === null) {
            return null
        }

        let user = JSON.parse(userStr)
        return user 
    }

    async SetCurrentUser(user: User | null): Promise<void> {
        if (user === null) {
            localStorage.removeItem(currentUserKey)
        }

        let userStr = JSON.stringify(user)
        localStorage.setItem(currentUserKey, userStr)
    }

    async GetUserByPublicKey(publicKey: PublicKeyType): Promise<User> {
        let user =  demoUsers.find(e => e.PublicKey === publicKey)
        if (user === undefined) {
            throw new NotFound()
        }

        return user
    }

}

