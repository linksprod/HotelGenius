import { LayoutDashboard, Building2 } from 'lucide-react';
import React from 'react';

export interface AENavItemConfig {
  title: string;
  url: string;
  icon: React.ElementType;
}

export const aeNavigation: AENavItemConfig[] = [
  { title: 'Dashboard', url: '/ae/dashboard', icon: LayoutDashboard },
  { title: 'Hotel Management', url: '/ae/hotels', icon: Building2 },
];
