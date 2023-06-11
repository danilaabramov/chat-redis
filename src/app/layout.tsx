import Providers from '@/components/Providers'
import './globals.css'
import {ReactNode} from "react";

// Done after the video and optional: add page metadata
export const metadata = {
    title: 'Chat | Home',
    description: 'Welcome to the Chat',
}

export default function RootLayout({children}: { children: ReactNode }) {
    return (
        <html lang='ru'>
        <body>
        <Providers>{children}</Providers>
        </body>
        </html>
    )
}