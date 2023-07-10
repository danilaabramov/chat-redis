import Providers from '@/components/Providers'
import './globals.css'
import {ReactNode} from "react";
import Head from "next/head";

// Done after the video and optional: add page metadata
export const metadata = {
    title: 'Chat | Home',
    description: 'Welcome to the Chat',
}

export default function RootLayout({children}: { children: ReactNode }) {
    return (
        <html lang='ru'>
        <head>
            <meta charSet="UTF-8"/>
            <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <link rel="icon" type='image/svg' sizes='32x32' href="/favicon.ico"/>
            <title>Chat</title>
        </head>
        <body>
        <Providers>{children}</Providers>
        </body>
        </html>
    )
}