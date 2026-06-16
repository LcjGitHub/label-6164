/** 路名牌字体记录类型 */

export interface StreetSign {
  id: number;
  city: string;
  font_description: string;
  background_color: string;
  material: string;
  is_unified_standard: boolean;
}

/** 创建/更新表单字段 */
export type StreetSignPayload = Omit<StreetSign, 'id'>;
