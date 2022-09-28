import React, { useContext, useEffect, useState } from "react"
import UserCubit from "../bloc/user_cubit";
import { useBloc, UserRepositoryContext } from "../context";
import { User } from "../models/user"
import styles from './select_user_page.module.scss';

export const SelectUserPage = () => {
    let [users, setUsers] = useState<User[]>([])
    let [, { setUser }] = useBloc(UserCubit)

    let userRepository = useContext(UserRepositoryContext)

    useEffect(() => {
        let getUsers = async () => {
            let users = await userRepository.GetUsers()
            setUsers(users)
        }

        getUsers()
    }, [userRepository])

    function userClickHandler(user: User) {
        userRepository?.SetCurrentUser(user)
        setUser(user)
        window.location.hash = "/dashboard"
    }

    let userElements: React.ReactNode[] = []
    for (let i = 0; i < users.length; i++) {
        userElements.push(
            <li key={ i } className={ styles.user } onClick={() => userClickHandler(users[i])}>
                <div>{ users[i].Name }</div>
            </li>
        )
    }

    return (
        <React.Fragment>
            <h1>Select user</h1>
            <ul className={ styles.users }>
                { userElements }
            </ul>
        </React.Fragment>
    )
}