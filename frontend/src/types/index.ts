/** 路名牌字体记录类型 */

export interface StreetSign {
  id: number;
  city: string;
  font_description: string;
  background_color: string;
  material: string;
  is_unified_standard: boolean;
}

/** 材质词典记录类型 */
export interface Material {
  id: number;
  name: string;
  description: string;
}

/** 创建材质词典字段 */
export type MaterialPayload = Omit<Material, 'id'>;

/** 创建/更新表单字段 */
export type StreetSignPayload = Omit<StreetSign, 'id'>;

/** 单个城市统计数据 */
export interface CityStats {
  city: string;
  total_count: number;
  unified_count: number;
  unified_rate: number;
}

/** 统计概览数据 */
export interface StatsOverview {
  total_cities: number;
  total_records: number;
  total_unified: number;
  overall_unified_rate: number;
  city_stats: CityStats[];
}
