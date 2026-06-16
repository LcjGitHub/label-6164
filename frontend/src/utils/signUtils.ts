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

const streetSuffixes = ['大街', '大道', '胡同', '路', '街', '道', '巷', '弄', '里'];

const noisePrefixes = ['用于', '常见于', '多见于', '适用于', '主要用于', '一般用于', '通常用于'];

function stripNoisePrefix(text: string): string {
  let result = text;
  for (const prefix of noisePrefixes) {
    if (result.startsWith(prefix)) {
      result = result.slice(prefix.length);
      break;
    }
  }
  return result.trimStart();
}

export function extractStreetName(fontDescription: string, city: string): string {
  if (fontDescription && fontDescription.trim()) {
    const cleaned = stripNoisePrefix(fontDescription.trim());
    const segments = cleaned.split(/[，。；\n、,;\s]+/).filter((s) => s.trim());

    for (const suffix of streetSuffixes) {
      for (const seg of segments) {
        const trimmed = seg.trim();
        const idx = trimmed.lastIndexOf(suffix);
        if (idx === -1) continue;
        if (idx === 0) continue;
        const end = idx + suffix.length;
        let start = idx;
        while (start > 0 && /[\u4e00-\u9fff]/.test(trimmed[start - 1])) {
          start--;
        }
        const name = trimmed.slice(start, end);
        if (name === suffix) continue;
        if (name.length >= 2 && name.length <= 10) {
          return name;
        }
      }
    }

    for (const suffix of streetSuffixes) {
      const regex = new RegExp(`[\u4e00-\u9fff]{1,6}${suffix}`);
      const match = cleaned.match(regex);
      if (match) {
        const name = match[0];
        if (name.length >= 2 && name.length <= 10) {
          return name;
        }
      }
    }
  }

  if (city && city.trim()) {
    return `${city.trim()}路`;
  }

  return '示例路';
}
