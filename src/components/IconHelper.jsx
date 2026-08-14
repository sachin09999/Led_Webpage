'use client';

import { 
  MonitorPlay, Hexagon, FileText, PlaySquare, PenTool, Image as ImageIcon, 
  PieChart, LifeBuoy, Activity, Layers, Settings, Home, ShieldCheck, Clock, File
} from 'lucide-react';

export const availableIcons = [
  'MonitorPlay',
  'Hexagon',
  'FileText',
  'PlaySquare',
  'PenTool',
  'ImageIcon',
  'PieChart',
  'LifeBuoy',
  'Activity',
  'Layers',
  'ShieldCheck',
  'Clock'
];

const iconComponents = {
  MonitorPlay,
  Hexagon,
  FileText,
  PlaySquare,
  PenTool,
  ImageIcon,
  PieChart,
  LifeBuoy,
  Activity,
  Layers,
  Settings,
  Home,
  ShieldCheck,
  Clock,
  File
};

export default function DynamicIcon({ name, size = 24, className = "" }) {
  const IconComponent = iconComponents[name] || MonitorPlay;
  return <IconComponent size={size} className={className} />;
}
