import { useContext, useEffect, useState } from "react"
import FriendsCubit from "../bloc/friends_cubit";
import UserCubit from "../bloc/user_cubit"
import { Status } from "../common/status";
import { FriendsGetterServiceContext, useBloc } from "../context"
import styles from "./friends_page.module.scss";

export const FriendsPage = () => {
    let friendssGetter = useContext(FriendsGetterServiceContext)
    let [user] = useBloc(UserCubit)
    let [friendsState] = useBloc(FriendsCubit)

    useEffect(() => {
        async function getFriends() {
            if (user !== null) {
                if (friendsState.status === Status.INIT) {
                    friendssGetter.getFriends(user)
                }
            }
        }

        getFriends()
    }, [friendssGetter, user, friendsState])

    
    let friendsElements = friendsState.friends.map<React.ReactNode>(friend => {
        return <li className={ styles.friend } key={ friend.PublicKey }>
            <img className={ styles.profile_picture } src={ process.env.PUBLIC_URL + "/user1.png" } alt="profile"></img>
            <p>{ friend.Name }</p>
        </li>
    })

    return  <ul className={ styles.friends_list }>
        { friendsElements }
    </ul>
}