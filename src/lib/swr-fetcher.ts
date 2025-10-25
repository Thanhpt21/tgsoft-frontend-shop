// lib/swr-fetcher.ts
import { api } from './axios'

export const swrFetcher = (url: string) => api.get(url).then(res => res.data)
