import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";

@Injectable()
export class RedisService {

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
  }

  async get(key: any) {
    return this.cacheManager.get(key);
  }

  async add(key: any, val: any, ttl: number = 0, del: boolean = false) {
    if (del && !await this.get(key)) await this.del(key); // 存在先删除
    await this.cacheManager.set(key, val, { ttl: ttl });
  }

  async del(key: any) {
    await this.cacheManager.del(key);
  }

}