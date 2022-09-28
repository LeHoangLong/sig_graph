import { Cubit } from "blac";
import { User } from "../models/user";

export default class UserCubit extends Cubit<User | null> {
    setUser = (user: User | null) => this.emit(user)
}