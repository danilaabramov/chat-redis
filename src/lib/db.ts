import Redis from 'ioredis'

export const db = new Redis(process.env.REDIS_URL || '')