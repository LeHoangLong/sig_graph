import { createContext } from "react";
import FriendsCubit from "../bloc/friends_cubit";
import { User } from "../models/user";
import { UserRepositoryI } from "../repositories/user_repository_i";

export class FriendsGetter {
    constructor(
        private userRepository: UserRepositoryI,
        private friendsCubit: FriendsCubit,
    ) {}

    async getFriends(user: User) : Promise<User[]> {
        let friends: User[] = []
        for (let i = 0; i < user.Friends.length; i++) {
            let key = user.Friends[i]
            let friend = await this.userRepository.GetUserByPublicKey(key)
            friends.push(friend)
        }

        this.friendsCubit.setFriends(friends)

        return friends
    }
}
