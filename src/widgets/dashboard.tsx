import { useEffect } from "react"
import { Link, Route, Routes } from "react-router-dom"
import UserCubit from "../bloc/user_cubit"
import { useBloc } from "../context"
import { AssetPage } from "./asset_page"
import styles from "./dashboard.module.scss"
import { FriendsPage } from "./friends_page"


export const Dashboard = () => {
    let [user, { setUser }] = useBloc(UserCubit)

    useEffect(() => {
        if (user === null) {
            window.location.href= "/"
        }
    }, [user])

    if (user == null) {
        return <div></div>
    }
    return <div className={ styles.dashboard }>
        <div className={ styles.header }>
            <h3 className={ styles.title }>Logged in as { user.Name }</h3>
            <button className={ styles.log_out } onClick={() => setUser(null)}>Log out</button>
        </div>
        <div className={ styles.main }>
            <ul className={ styles.side_bar}>
                <li>
                    <Link to="friends"><div className={ styles.side_bar_button }>Friends</div></Link>
                </li>
                <li>
                    <Link to="assets"><div className={ styles.side_bar_button }>Assets</div></Link>
                </li>
                <li>
                    <Link to="requests"><div className={ styles.side_bar_button }>Pending asset transfer requests</div></Link>
                </li>
            </ul>
            <Routes>
                <Route path="friends" element={ <FriendsPage/> }>
                </Route>
                <Route path="assets" element={ <AssetPage/> }>
                </Route>
            </Routes>
        </div>
    </div>
}