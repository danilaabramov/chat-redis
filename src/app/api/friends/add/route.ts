import {z} from "zod";
import {addFriendValidator} from "@/lib/validations/add-friends";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/lib/auth";
import {fetchRedis} from "@/helpers/redis";
import {db} from "@/lib/db";

export async function POST(req: Request) {

    try {
        const body = await req.json()

        const {email: emailToAdd} = addFriendValidator.parse(body.email)

        const idToAdd = await db.get(`user:email:${emailToAdd}`, function (err, reply) {
            if (err) console.error(err)
            else console.log(reply);
        })

        if (!idToAdd) return new Response('Этого человека не существует', {status: 400})

        const session = await getServerSession(authOptions)

        if (!session) return new Response('Неавторизованный', {status: 401})

        if (idToAdd === session.user.id) return new Response('Вы не можете добавить себя в друзья',
            {status: 400})

        // check if user is already added


        const friendRequests = await db.smembers(
            `user:${idToAdd}:incoming_friend_requests`, function (err, reply) {
                if (err) console.error(err)
                else console.log(reply);
            })

        if (friendRequests.includes(session.user.id)) return new Response('Уже добавлен этот пользователь', {status: 400})

        const friends = (await db.smembers(
            `user:${session.user.id}:friends`))

        if (friends.includes(idToAdd)) return new Response('Уже дружите с этим пользователем', {status: 400})

        //valid request

        db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

        return new Response('OK')
    } catch (error) {
        if (error instanceof z.ZodError) return new Response('Недопустимая полезная нагрузка запроса', {status: 422})

        return new Response('Недопустимый запрос', {status: 400})
    }
}