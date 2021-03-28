import Redis, { Redis as RedisClient } from 'ioredis'

import dotenv from 'dotenv'

import cacheConfig from '@config/cache'

import ICacheProvider from '../models/ICacheProvider'

dotenv.config()
export default class RedisCacheProvider implements ICacheProvider {
  private client: RedisClient

  constructor() {
    console.log(process.env.REDIS_URL, process.env.REDIS_TLS_URL)
    this.client =
      process.env.NODE_ENV === 'production' && !!process.env.REDIS_URL
        ? new Redis(decodeURI(`${process.env.REDIS_URL}`), {
            enableOfflineQueue: true,
          })
        : new Redis(cacheConfig.config.redis)
  }

  public async save(key: string, value: any): Promise<void> {
    await this.client.set(key, JSON.stringify(value))
  }

  public async recover<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key)

    if (!data) {
      return null
    }

    const parsedData = JSON.parse(data) as T

    return parsedData
  }

  public async invalidate(key: string): Promise<void> {
    await this.client.del(key)
  }

  public async invalidatePrefix(prefix: string): Promise<void> {
    const keys = await this.client.keys(`${prefix}:*`)

    const pipeline = this.client.pipeline()

    keys.forEach(key => {
      pipeline.del(key)
    })

    await pipeline.exec()
  }
}
