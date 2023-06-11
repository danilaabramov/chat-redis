import Redis from 'ioredis'

export const db = new Redis(String(process.env.REDIS_URL))