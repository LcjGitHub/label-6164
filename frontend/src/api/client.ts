import axios from 'axios';

import type {
  CityDirectoryResponse,
  Material,
  MaterialPayload,
  StatsOverview,
  StreetSign,
  StreetSignPayload,
} from '../types';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

/** 获取全部路名牌记录，可按城市筛选 */
export async function fetchSigns(city?: string): Promise<StreetSign[]> {
  const params = city ? { city } : undefined;
  const { data } = await client.get<StreetSign[]>('/signs', { params });
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

/** 双记录并行查询（对比页专用） */
export async function fetchSignsForComparison(
  idA: number,
  idB: number,
): Promise<[StreetSign, StreetSign]> {
  const [resA, resB] = await Promise.all([
    client.get<StreetSign>(`/signs/${idA}`),
    client.get<StreetSign>(`/signs/${idB}`),
  ]);
  return [resA.data, resB.data];
}

/** 获取全部材质词典记录 */
export async function fetchMaterials(): Promise<Material[]> {
  const { data } = await client.get<Material[]>('/materials');
  return data;
}

/** 新增材质词典记录 */
export async function createMaterial(payload: MaterialPayload): Promise<Material> {
  const { data } = await client.post<Material>('/materials', payload);
  return data;
}

/** 获取城市目录 */
export async function fetchCityDirectory(): Promise<CityDirectoryResponse> {
  const { data } = await client.get<CityDirectoryResponse>('/cities');
  return data;
}
