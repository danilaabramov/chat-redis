const redisRestUrl = process.env.REDIS_URL

type Commands = 'zrange' | 'sismember' | 'get' | 'smembers'

export async function fetchRedis(
    command: Commands,
    ...args: (string | number)[]
){
    const commandUrl = `${redisRestUrl}/${command}/${args.join('/')}`

    const response = await fetch(commandUrl, {cache: 'no-cache'})

    if(!response.ok) throw new Error(`Ошибка при выполнении команды Redis: ${response.statusText}`)

    const data = await response.json()
    return data.result
}