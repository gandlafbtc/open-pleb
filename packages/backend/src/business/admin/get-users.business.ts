import * as repo from "../../repository/admin/user.admin.repository";

export const getUsers = async (limit: number = 100, beforeCreatedAt?: number) => {
    const users = await repo.getRecentUsers(limit, beforeCreatedAt);
    const usedCount = await repo.getUsedCount();
    const unusedCount = await repo.getUnusedCount();
    return {users, usedCount, unusedCount}
}
