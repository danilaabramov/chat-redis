import {getServerSession} from "next-auth/next";
import {authOptions} from "@/lib/auth";
import {FC} from "react";

const Page: FC = async ({}) => {

    const session = await getServerSession(authOptions)

    return <pre>{JSON.stringify(session)}</pre>
}

export default Page