import {FC} from 'react'
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/lib/auth";
import {notFound} from "next/navigation";
import {db} from "@/lib/db";
import FriendRequests from "@/components/FriendRequests";

const Page: FC = async () => {
    const session = await getServerSession(authOptions)
    if (!session) notFound()

    // ids of people who sent current logged-in user a friend requests
    const incomingSenderIds = await db.smembers(`user:${session.user.id}:incoming_friend_requests`) as string[]

    const incomingFriendRequests = await Promise.all(incomingSenderIds.map(
        async (senderId) => {
            const sender = await db.get(`user:${senderId}`) as string
            const senderParsed = JSON.parse(sender) as User

            return {senderId, senderEmail: senderParsed.email}
        }))

    return <main className='pt-8'>
        <h1 className='font-bold text-5xl mb-8'>Добавляйте друзей</h1>
        <div className='flex flex-col gap-4'>
            <FriendRequests incomingFriendRequests={incomingFriendRequests} sessionId={session.user.id}/>
        </div>
    </main>
}

export default Page