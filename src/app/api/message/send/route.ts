import {authOptions} from '@/lib/auth'
import {db} from '@/lib/db'
import {toPusherKey} from '@/lib/utils'
import {Message, messageValidator} from '@/lib/validations/message'
import {nanoid} from 'nanoid'
import {getServerSession} from 'next-auth'
import {pusherServer} from "@/lib/pusher";

export async function POST(req: Request) {
    try {
        const {text, chatId}: { text: string; chatId: string } = await req.json()
        const session = await getServerSession(authOptions)

        if (!session) return new Response('Неавторизованный', {status: 401})

        const [userId1, userId2] = chatId.split('--')

        if (session.user.id !== userId1 && session.user.id !== userId2) return new Response('Неавторизованный',
            {status: 401})

        const friendId = session.user.id === userId1 ? userId2 : userId1

        const friendList = await db.smembers(`user:${session.user.id}:friends`) as string[]
        const isFriend = friendList.includes(friendId)

        if (!isFriend) return new Response('Неавторизованный', {status: 401})

        const rawSender = await db.get(`user:${session.user.id}`) as string
        const sender = JSON.parse(rawSender) as User

        const timestamp = Date.now()

        const messageData: Message = {id: nanoid(), senderId: session.user.id, text, timestamp,}

        const message = messageValidator.parse(messageData)

        // уведомление всех подключенных клиентов комнаты чата
        await pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'incoming-message', message)

        await pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
            ...message, senderImg: sender.image, senderName: sender.name
        })

        // всё верно, отправка сообщения
        await db.zadd(`chat:${chatId}:messages`, timestamp, JSON.stringify(message));

        return new Response('OK')
    } catch (error) {
        if (error instanceof Error) return new Response(error.message, {status: 500})

        return new Response('Внутренняя ошибка сервера', {status: 500})
    }
}