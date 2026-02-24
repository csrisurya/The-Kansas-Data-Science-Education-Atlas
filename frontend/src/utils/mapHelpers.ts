// Returns a hex color on a blue-yellow-red gradient based on normalized value
export function getColorForValue(value: number, min: number, max: number): string {
  if (max === min) return '#cccccc';
  const t = normalizeValue(value, min, max);
  // Blue (low): #2563eb, Yellow (mid): #facc15, Red (high): #dc2626
  if (t < 0.5) {
    // Interpolate blue to yellow
    return interpolateColor('#2563eb', '#facc15', t * 2);
  } else {
    // Interpolate yellow to red
    return interpolateColor('#facc15', '#dc2626', (t - 0.5) * 2);
  }
}

// Normalizes value to 0-1 range
export function normalizeValue(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

// Converts snake_case to Title Case
export function formatMetricLabel(metric: string): string {
  return metric
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper: interpolate between two hex colors
function interpolateColor(hex1: string, hex2: string, t: number): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string) {
  const match = hex.replace('#', '').match(/.{1,2}/g);
  if (!match) return { r: 0, g: 0, b: 0 };
  const [r, g, b] = match.map(x => parseInt(x, 16));
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')
  );
}
