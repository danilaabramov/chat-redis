import {z} from "zod";
import {addFriendValidator} from "@/lib/validations/add-friends";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/lib/auth";
import {db} from "@/lib/db";
import {toPusherKey} from "@/lib/utils";
import {pusherServer} from "@/lib/pusher";

export async function POST(req: Request) {

    try {
        const body = await req.json()

        const {email: emailToAdd} = addFriendValidator.parse(body.email)

        const idToAdd = await db.get(`user:email:${emailToAdd}`)

        if (!idToAdd) return new Response('Этого человека не существует', {status: 400})

        const session = await getServerSession(authOptions)

        if (!session) return new Response('Неавторизованный', {status: 401})

        if (idToAdd === session.user.id) return new Response('Вы не можете добавить себя в друзья',
            {status: 400})

        // check if user is already added
        const isAlreadyAdded = await db.sismember(`user:${idToAdd}:incoming_friend_requests`,
            session.user.id)

        if (isAlreadyAdded) return new Response('Уже добавлен этот пользователь', {status: 400})

        const isAlreadyFriends = await db.sismember(`user:${session.user.id}:friends`, idToAdd)

        if (isAlreadyFriends) return new Response('Уже дружите с этим пользователем', {status: 400})

        // valid request, send friend request

        await pusherServer.trigger(toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
            'incoming_friend_requests', {senderId: session.user.id, senderEmail: session.user.email})

        db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

        return new Response('OK')
    } catch (error) {
        if (error instanceof z.ZodError) return new Response('Недопустимая полезная нагрузка запроса',
            {status: 422})

        return new Response('Недопустимый запрос', {status: 400})
    }
}