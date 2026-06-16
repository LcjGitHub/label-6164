import axios from 'axios';

import type { StatsOverview, StreetSign, StreetSignPayload } from '../types';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

/** 获取全部路名牌记录 */
export async function fetchSigns(): Promise<StreetSign[]> {
  const { data } = await client.get<StreetSign[]>('/signs');
  return data;
}

/** 获取单条记录 */
export async function fetchSign(id: number): Promise<StreetSign> {
  const { data } = await client.get<StreetSign>(`/signs/${id}`);
  return data;
}

/** 创建记录 */
export async function createSign(payload: StreetSignPayload): Promise<StreetSign> {
  const { data } = await client.post<StreetSign>('/signs', payload);
  return data;
}

/** 更新记录 */
export async function updateSign(
  id: number,
  payload: StreetSignPayload,
): Promise<StreetSign> {
  const { data } = await client.put<StreetSign>(`/signs/${id}`, payload);
  return data;
}

/** 删除记录 */
export async function deleteSign(id: number): Promise<void> {
  await client.delete(`/signs/${id}`);
}

/** 获取统计概览 */
export async function fetchStatsOverview(): Promise<StatsOverview> {
  const { data } = await client.get<StatsOverview>('/stats/overview');
  return data;
}
