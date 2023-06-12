import {NextAuthOptions} from 'next-auth';
import {db} from "@/lib/db";
import {RedisAdapter} from '@pridestalkerr/adapter-redis'
import GoogleProvider from "next-auth/providers/google";

function getGoogleCredentials() {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!clientId?.length) throw new Error('Missing GOOGLE_CLIENT_ID')

    if (!clientSecret?.length) throw new Error('Missing GOOGLE_CLIENT_SECRET')

    return {clientId, clientSecret}
}

export const authOptions: NextAuthOptions = {
    adapter: RedisAdapter(db),
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/login',
        error: '/',
    },
    providers: [
        GoogleProvider({
            clientId: getGoogleCredentials().clientId,
            clientSecret: getGoogleCredentials().clientSecret,
        }),
    ],
    callbacks: {
        async jwt({token, user}) {
            const dbUserResult = (await db.get(`user:${token.id}`)) as string | null

            if (!dbUserResult) {
                token.id = user!.id
                return token
            }

            const dbUser = JSON.parse(dbUserResult) as User

            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
            }
        },
        async session({session, token}) {
            if (token) session.user = {
                id: token.id,
                name: token.name,
                email: token.email,
                image: token.picture
            }
            return session
        },
        redirect() {
            return '/dashboard'
        }
    }
};