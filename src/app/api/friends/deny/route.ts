import {z} from "zod";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/lib/auth";
import {db} from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const session = await getServerSession(authOptions)

        if (!session) return new Response('Неавторизованный', {status: 401})

        const {id: idToDeny} = z.object({id: z.string()}).parse(body)

        await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToDeny)

        return new Response('OK')
    } catch (error) {
        console.log(error)

        if (error instanceof z.ZodError) return new Response('Недопустимая полезная нагрузка запроса',
            {status: 422})

        return new Response('Недопустимый запрос', {status: 400})
    }
}