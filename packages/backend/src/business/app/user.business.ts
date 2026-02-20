import * as repo from "../../repository/app/user.repository"

export const isUserInvited = async (pubkey:string) =>{
    return await repo.isUserInvited(pubkey)
}