import {db} from "@/lib/db";


export const getFriendsByUserId = async (userId: string) => {
    // retrieve friends for current user
    const friendIds = await db.smembers(`user:${userId}:friends`) as string[]

    return await Promise.all(
        friendIds.map(async (friendId) => {
            const friend = await db.get(`user:${friendId}`) as string
            return JSON.parse(friend) as User
        })
    )
}