import {db} from "@/lib/db";


export const getFriendsByUserId = async (userId: string) => {
    // retrieve friends for current user
    console.log("userid", userId)
    const friendIds = (await db.smembers(`user:${userId}:friends`)) as string[]
    console.log("friend ids", friendIds)

    const friends = await Promise.all(
        friendIds.map(async (friendId) => {
            const friend = await db.get(`user:${friendId}`) as string
            const parsedFriend = JSON.parse(friend) as User
            return parsedFriend
        })
    )

    return friends
}