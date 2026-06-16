const colorNameMap: Record<string, string> = {
  蓝色: '#1E4D8C',
  深蓝: '#0A2463',
  浅蓝: '#5B9BD5',
  绿色: '#2E7D32',
  深绿: '#1B5E20',
  浅绿: '#81C784',
  红色: '#C62828',
  深红: '#B71C1C',
  浅红: '#EF9A9A',
  黄色: '#F9A825',
  金黄: '#FFB300',
  橙色: '#E65100',
  棕色: '#5D4037',
  黑色: '#212121',
  白色: '#FAFAFA',
  灰色: '#757575',
  深灰: '#424242',
  浅灰: '#E0E0E0',
  紫色: '#6A1B9A',
  青色: '#006064',
  粉色: '#AD1457',
};

export function parseColor(input: string): string {
  if (!input || input.trim() === '') {
    return '#1E4D8C';
  }

  const trimmed = input.trim();

  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed)) {
    return trimmed;
  }

  if (/^rgb/i.test(trimmed)) {
    return trimmed;
  }

  if (colorNameMap[trimmed]) {
    return colorNameMap[trimmed];
  }

  for (const [name, hex] of Object.entries(colorNameMap)) {
    if (trimmed.includes(name)) {
      return hex;
    }
  }

  return '#1E4D8C';
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }

  const shortResult = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
  if (shortResult) {
    return {
      r: parseInt(shortResult[1] + shortResult[1], 16),
      g: parseInt(shortResult[2] + shortResult[2], 16),
      b: parseInt(shortResult[3] + shortResult[3], 16),
    };
  }

  return null;
}

function parseRgbString(rgbStr: string): { r: number; g: number; b: number } | null {
  const match = rgbStr.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    };
  }
  return null;
}

export function getContrastColor(bgColor: string): string {
  let rgb = hexToRgb(bgColor);
  if (!rgb) {
    rgb = parseRgbString(bgColor);
  }
  if (!rgb) {
    return '#FFFFFF';
  }

  const { r, g, b } = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#212121' : '#FFFFFF';
}

const commonStreetSuffixes = ['路', '街', '道', '巷', '胡同', '大街', '大道', '弄', '里'];

export function extractStreetName(fontDescription: string, city: string): string {
  if (fontDescription && fontDescription.trim()) {
    const lines = fontDescription.split(/[，。；\n、,;]/).filter((s) => s.trim());
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length >= 2 && trimmed.length <= 10) {
        for (const suffix of commonStreetSuffixes) {
          if (trimmed.includes(suffix)) {
            return trimmed;
          }
        }
      }
    }
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.length <= 12) {
        return firstLine;
      }
      return firstLine.slice(0, 10) + '...';
    }
  }

  if (city) {
    return `${city}路`;
  }

  return '示例路';
}
