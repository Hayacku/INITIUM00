// Extended theme system with 15+ themes

export const themes = {
  // Original themes
  violet: {
    name: 'Violet',
    primary: '266 100% 60%',
    secondary: '280 90% 70%',
    accent: '270 80% 65%',
    background: '0 0% 7%',
    foreground: '0 0% 98%'
  },
  bleu: {
    name: 'Bleu',
    primary: '210 100% 55%',
    secondary: '200 90% 65%',
    accent: '220 80% 60%',
    background: '220 15% 10%',
    foreground: '0 0% 98%'
  },
  noir: {
    name: 'Noir',
    primary: '0 0% 90%',
    secondary: '0 0% 70%',
    accent: '0 0% 80%',
    background: '0 0% 5%',
    foreground: '0 0% 95%'
  },
  blanc: {
    name: 'Blanc',
    primary: '220 100% 50%',
    secondary: '210 90% 60%',
    accent: '200 80% 55%',
    background: '0 0% 98%',
    foreground: '0 0% 10%'
  },
  vert: {
    name: 'Vert',
    primary: '142 76% 45%',
    secondary: '152 70% 55%',
    accent: '135 80% 50%',
    background: '140 20% 8%',
    foreground: '0 0% 98%'
  },
  rouge: {
    name: 'Rouge',
    primary: '0 72% 55%',
    secondary: '10 80% 60%',
    accent: '355 75% 58%',
    background: '0 10% 9%',
    foreground: '0 0% 98%'
  },
  jaune: {
    name: 'Jaune',
    primary: '45 93% 55%',
    secondary: '40 90% 60%',
    accent: '50 85% 50%',
    background: '40 20% 10%',
    foreground: '0 0% 98%'
  },
  
  // New themes
  cyan: {
    name: 'Cyan',
    primary: '180 100% 50%',
    secondary: '175 90% 60%',
    accent: '185 85% 55%',
    background: '180 20% 8%',
    foreground: '0 0% 98%'
  },
  orange: {
    name: 'Orange',
    primary: '25 95% 55%',
    secondary: '30 90% 65%',
    accent: '20 85% 60%',
    background: '25 15% 10%',
    foreground: '0 0% 98%'
  },
  rose: {
    name: 'Rose',
    primary: '330 85% 60%',
    secondary: '340 80% 70%',
    accent: '320 90% 65%',
    background: '330 15% 10%',
    foreground: '0 0% 98%'
  },
  indigo: {
    name: 'Indigo',
    primary: '240 70% 60%',
    secondary: '245 65% 70%',
    accent: '235 75% 65%',
    background: '240 20% 10%',
    foreground: '0 0% 98%'
  },
  emerald: {
    name: '\u00c9meraude',
    primary: '160 84% 45%',
    secondary: '165 80% 55%',
    accent: '155 85% 50%',
    background: '160 18% 9%',
    foreground: '0 0% 98%'
  },
  sepia: {
    name: 'Sepia',
    primary: '30 40% 50%',
    secondary: '35 35% 60%',
    accent: '25 45% 55%',
    background: '30 25% 15%',
    foreground: '30 20% 90%'
  },
  navy: {
    name: 'Navy',
    primary: '220 80% 50%',
    secondary: '215 75% 60%',
    accent: '225 85% 55%',
    background: '220 30% 8%',
    foreground: '0 0% 98%'
  },
  cyberpunk: {
    name: 'Cyberpunk',
    primary: '300 100% 60%',
    secondary: '180 100% 50%',
    accent: '60 100% 50%',
    background: '0 0% 5%',
    foreground: '0 0% 95%'
  },
  forest: {
    name: 'For\u00eat',
    primary: '140 65% 40%',
    secondary: '145 60% 50%',
    accent: '135 70% 45%',
    background: '140 30% 7%',
    foreground: '0 0% 95%'
  },
  sunset: {
    name: 'Sunset',
    primary: '15 90% 55%',
    secondary: '340 85% 60%',
    accent: '25 95% 60%',
    background: '15 20% 10%',
    foreground: '0 0% 98%'
  },
  ocean: {
    name: 'Oc\u00e9an',
    primary: '200 90% 45%',
    secondary: '195 85% 55%',
    accent: '205 95% 50%',
    background: '200 25% 8%',
    foreground: '0 0% 98%'
  },
  lavender: {
    name: 'Lavande',
    primary: '270 60% 65%',
    secondary: '275 55% 75%',
    accent: '265 65% 70%',
    background: '270 18% 12%',
    foreground: '0 0% 98%'
  }
};

export const applyTheme = (themeName) => {
  const root = document.documentElement;
  const theme = themes[themeName] || themes.violet;
  
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--secondary', theme.secondary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--background', theme.background);
  root.style.setProperty('--foreground', theme.foreground);
};

export const getThemeList = () => {
  return Object.entries(themes).map(([key, value]) => ({
    id: key,
    name: value.name
  }));
};
