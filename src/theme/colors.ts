export const colors = {
  bg: {
    base: '#040603',
    top: '#0A0F09',
    mid: '#060906',
    bottom: '#020302',
  },
  glass: {
    fill: 'rgba(255,255,255,0.045)',
    fillStrong: 'rgba(43,255,156,0.16)',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(43,255,156,0.4)',
  },
  mint: {
    100: '#DFFFEE',
    200: '#A8FFD9',
    300: '#6BFFB8',
    400: '#2BFF9C',
    500: '#0DED84',
    600: '#0BC46C',
    700: '#0A9758',
  },
  text: {
    primary: '#F5FAF7',
    secondary: '#A9B7AF',
    tertiary: '#6E7D73',
  },
  status: {
    fresh: '#2BFF9C',
    soon: '#F4C662',
    urgent: '#F2905C',
    expired: '#F0685C',
  },
} as const;

export const gradients = {
  screen: ['#080B07', '#050704', '#010201'] as const,
  brand: ['#6BFFB8', '#0BC46C'] as const,
  card: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.01)'] as const,
  fab: ['#6BFFB8', '#0BC46C'] as const,
};
