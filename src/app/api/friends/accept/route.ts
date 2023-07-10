import {z} from "zod";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/lib/auth";
import {db} from "@/lib/db";
import {pusherServer} from "@/lib/pusher";
import {toPusherKey} from "@/lib/utils";

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const {id: idToAdd} = z.object({id: z.string()}).parse(body)

        const session = await getServerSession(authOptions)

        if (!session) return new Response('Неавторизованный', {status: 401})

        // оба ли пользователя еще не являются друзьями
        const isAlreadyFriends = await db.sismember(`user:${session.user.id}:friends`, idToAdd)

        if (isAlreadyFriends) return new Response('Уже друзья', {status: 401})

        const hasFriendRequest = await db.sismember(`user:${session.user.id}:incoming_friend_requests`,
            idToAdd)

        if (!hasFriendRequest) return new Response('Никаких запросов в друзья', {status: 400})

        const [userRaw, friendRaw] = (await Promise.all([
            db.get(`user:${session.user.id}`),
            db.get(`user:${idToAdd}`),
        ])) as [string, string]

        const user = JSON.parse(userRaw) as User
        const friend = JSON.parse(friendRaw) as User

        // уведомление добавленного пользователя
        await Promise.all([
            pusherServer.trigger(toPusherKey(`user:${idToAdd}:friends`), 'new_friend', user),
            pusherServer.trigger(toPusherKey(`user:${session.user.id}:friends`), 'new_friend', friend),
            db.sadd(`user:${session.user.id}:friends`, idToAdd),
            db.sadd(`user:${idToAdd}:friends`, session.user.id),
            db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd),
        ])
        return new Response('OK')
    } catch (error) {
        console.log(error)

        if (error instanceof z.ZodError) return new Response('Недопустимая полезная нагрузка запроса',
            {status: 422})

        return new Response('Недопустимый запрос', {status: 400})
    }
}