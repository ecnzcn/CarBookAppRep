export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: '⌂' },
  { to: '/vehicles', label: 'Vehicles', icon: '🚗' },
];
