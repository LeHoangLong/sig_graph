import { BlacReact } from "blac";
import { createContext } from "react";
import AssetCubit from "./bloc/asset_cubit";
import FriendsCubit from "./bloc/friends_cubit";
import UserCubit from "./bloc/user_cubit";
import { Status } from "./common/status";
import { AssetRepositoryDemo } from "./repositories/asset_repository_demo";
import { AssetRepositoryI } from "./repositories/asset_repository_i";
import { UserRepositoryDemo } from "./repositories/user_repository_demo";
import { UserRepositoryI } from "./repositories/user_repository_i";
import { FriendsGetter } from "./services/friends_getter";

export const userDemoRepository = new UserRepositoryDemo()
export const assetRepository = new AssetRepositoryDemo()

export const userCubit = new UserCubit(null)
export const friendsCubit = new FriendsCubit({
    status: Status.INIT,
    friends: [],
})
export const assetCubit = new AssetCubit(userCubit, assetRepository, {})
const state = new BlacReact([
    userCubit,
    friendsCubit,
    assetCubit,
]);  

export const { useBloc } = state; 

export const friendsGetterService = new FriendsGetter(userDemoRepository, friendsCubit)

export const UserRepositoryContext = createContext<UserRepositoryI>(userDemoRepository);
export const FriendsGetterServiceContext = createContext<FriendsGetter>(friendsGetterService);
export const AssetRepositoryContext = createContext<AssetRepositoryI>(assetRepository)


 
  