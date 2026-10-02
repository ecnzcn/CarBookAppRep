export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: '⌂' },
  { to: '/timeline', label: 'Timeline', icon: '📖' },
  { to: '/costs', label: 'Kosten', icon: '€' },
  { to: '/settings', label: 'Einstellungen', icon: '⚙' },
];
