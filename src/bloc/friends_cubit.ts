import { Cubit } from "blac";
import { Status } from "../common/status";
import { User } from "../models/user";

export interface FriendsState {
    status: Status,
    friends: User[]
}

export default class FriendsCubit extends Cubit<FriendsState> {
    setFriends = (friends: User[]) => this.emit({
        friends:[...friends],
        status: Status.IDLE,
    })
}