export type ThemeMode = 'Dark' | 'Light' | 'Sepia' | 'Custom'

function hexToRgb(hex: string) {
  let c = (hex || '#6366f1').replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  const num = parseInt(c, 16) || 0
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

export function getAppTheme(theme: ThemeMode, customColor: string = '#6366f1') {
  if (theme === 'Light') {
    return {
      pageBg: '#f8fafc',
      sidebarBg: '#ffffff',
      headerBg: '#ffffff',
      cardBg: '#ffffff',
      innerBg: '#f1f5f9',
      textMain: '#0f172a',
      textMuted: '#64748b',
      border: 'rgba(0,0,0,0.08)',
      accent: '#2563eb',
      activeNav: '#2563eb',
      activeNavText: '#ffffff',
    }
  }

  if (theme === 'Sepia') {
    return {
      pageBg: '#fbf0d9',
      sidebarBg: '#f4e4c1',
      headerBg: '#f7e8c8',
      cardBg: '#fdf6e2',
      innerBg: '#faebd0',
      textMain: '#5c3d10',
      textMuted: '#8c6b39',
      border: 'rgba(92,61,16,0.15)',
      accent: '#b45309',
      activeNav: '#b45309',
      activeNavText: '#ffffff',
    }
  }

  if (theme === 'Custom') {
    const { r, g, b } = hexToRgb(customColor)
    return {
      pageBg: `radial-gradient(ellipse at top, rgba(${r}, ${g}, ${b}, 0.22) 0%, #06080f 80%)`,
      sidebarBg: `rgba(${Math.floor(r * 0.08)}, ${Math.floor(g * 0.08)}, ${Math.floor(b * 0.08)}, 0.95)`,
      headerBg: `rgba(${Math.floor(r * 0.06)}, ${Math.floor(g * 0.06)}, ${Math.floor(b * 0.06)}, 0.92)`,
      cardBg: `rgba(${Math.floor(r * 0.15 + 10)}, ${Math.floor(g * 0.15 + 14)}, ${Math.floor(b * 0.15 + 24)}, 0.75)`,
      innerBg: `rgba(${Math.floor(r * 0.08)}, ${Math.floor(g * 0.08)}, ${Math.floor(b * 0.08)}, 0.85)`,
      textMain: '#f8fafc',
      textMuted: `rgba(${Math.min(r + 60, 240)}, ${Math.min(g + 60, 240)}, ${Math.min(b + 60, 240)}, 0.8)`,
      border: `rgba(${r}, ${g}, ${b}, 0.35)`,
      accent: customColor,
      activeNav: customColor,
      activeNavText: '#ffffff',
    }
  }

  // Default: Dark
  return {
    pageBg: '#070b14',
    sidebarBg: '#070b14',
    headerBg: '#070b14',
    cardBg: '#0d1322',
    innerBg: '#070b14',
    textMain: '#f8fafc',
    textMuted: '#94a3b8',
    border: 'rgba(255,255,255,0.06)',
    accent: '#38bdf8',
    activeNav: '#1d4ed8',
    activeNavText: '#ffffff',
  }
      }
        
