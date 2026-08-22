'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

const dashboardsFilePath = path.join(process.cwd(), 'data', 'dashboards.json');

const defaultDashboards = [
  {
    id: "ledwalldocs",
    slug: "ledwalldocs",
    name: "LED Wall Docs",
    headerTitle: "LED Wall Docs",
    description: "LED Wall installation manuals, videos, drawings, and specs.",
    heroSubtitle: "All important documents, videos, drawings, images and support data in one place.",
    icon: "MonitorPlay",
    bgClass: "",
    bannerUrl: "",
    categories: [
      { id: "docs", name: "Docs", tag: "Documents", icon: "FileText", colorClass: "blue-icon", tagClass: "blue-tag", description: "Installation manuals, safety guidelines and specifications." },
      { id: "videos", name: "Videos", tag: "Videos", icon: "PlaySquare", colorClass: "purple-icon", tagClass: "purple-tag", description: "Installation & maintenance tutorial videos." },
      { id: "drawings", name: "Drawings", tag: "Drawings", icon: "PenTool", colorClass: "green-icon", tagClass: "green-tag", description: "Power wiring diagrams, frame structural drawings." },
      { id: "pictures", name: "Pictures", tag: "Images", icon: "ImageIcon", colorClass: "orange-icon", tagClass: "orange-tag", description: "Site photos, equipment imagery and references." },
      { id: "finance", name: "Finance Data", tag: "Finance", icon: "PieChart", colorClass: "yellow-icon", tagClass: "yellow-tag", description: "Budgets, purchase history and financial records." },
      { id: "support", name: "Support Data", tag: "Support", icon: "LifeBuoy", colorClass: "blue-icon", tagClass: "blue-tag", description: "Global contacts list, support tickets and references." }
    ]
  },
  {
    id: "wtp",
    slug: "wtp",
    name: "Water Treatment Plant",
    headerTitle: "Water Treatment Plant",
    description: "P&ID drawings, daily logs, safety guidelines and operational data.",
    heroSubtitle: "All essential operations data, P&ID drawings, maintenance videos, and plant documents in one place.",
    icon: "Hexagon",
    bgClass: "wtp-bg",
    bannerUrl: "",
    categories: [
      { id: "docs", name: "WTP Docs", tag: "Documents", icon: "FileText", colorClass: "blue-icon", tagClass: "blue-tag", description: "Plant manuals, safety guidelines and specifications." },
      { id: "videos", name: "WTP Videos", tag: "Videos", icon: "PlaySquare", colorClass: "purple-icon", tagClass: "purple-tag", description: "Plant operations and maintenance tutorial videos." },
      { id: "drawings", name: "WTP Drawings", tag: "Drawings", icon: "PenTool", colorClass: "green-icon", tagClass: "green-tag", description: "P&ID, plant layouts and structural drawings." },
      { id: "pictures", name: "WTP Pictures", tag: "Images", icon: "ImageIcon", colorClass: "orange-icon", tagClass: "orange-tag", description: "Site photos, equipment imagery and references." },
      { id: "operations", name: "Operations Data", tag: "Records", icon: "Activity", colorClass: "blue-icon", tagClass: "blue-tag", description: "Daily logs, chemical usage and efficiency data." }
    ]
  },
  {
    id: "1786707740068",
    slug: "network",
    name: "Network Server Rack1",
    headerTitle: "Network",
    description: "Network control system",
    heroSubtitle: "Your entire network, in one view",
    icon: "MonitorPlay",
    bgClass: "",
    bannerUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1920&q=80",
    categories: [
      { id: "docs", name: "Docs", tag: "Files", description: "Documents and records for Docs." },
      { id: "videos", name: "Videos", tag: "Files", description: "Documents and records for Videos." },
      { id: "drawings", name: "Drawings", tag: "Files", description: "Documents and records for Drawings." },
      { id: "pictures", name: "Pictures", tag: "Files", description: "Documents and records for Pictures." }
    ]
  },
  {
    id: "1786944641092",
    slug: "network-server-rack-2",
    name: "Network Server Rack 2",
    headerTitle: "Network Server Rack 2",
    description: "Network Server Rack 2 documents and media.",
    heroSubtitle: "Network Server Rack 2 operational view",
    icon: "MonitorPlay",
    bgClass: "",
    bannerUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1920&q=80",
    categories: [
      { id: "docs", name: "Docs", tag: "Files", description: "Documents and records for Docs." },
      { id: "videos", name: "Videos", tag: "Files", description: "Documents and records for Videos." },
      { id: "drawings", name: "Drawings", tag: "Files", description: "Documents and records for Drawings." },
      { id: "pictures", name: "Pictures", tag: "Files", description: "Documents and records for Pictures." }
    ]
  }
];

export async function getDashboards() {
  try {
    const contents = await fs.readFile(dashboardsFilePath, 'utf8');
    return JSON.parse(contents);
  } catch (error) {
    try {
      await fs.mkdir(path.dirname(dashboardsFilePath), { recursive: true });
      await fs.writeFile(dashboardsFilePath, JSON.stringify(defaultDashboards, null, 2));
    } catch (e) {
      console.error("Failed to initialize dashboards.json", e);
    }
    return defaultDashboards;
  }
}

export async function getDashboardBySlug(slug) {
  const dashboards = await getDashboards();
  return dashboards.find(d => d.slug.toLowerCase() === slug.toLowerCase()) || null;
}

export async function addDashboard(formData) {
  const dashboards = await getDashboards();
  const rawSlug = formData.get('slug') || formData.get('name').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const slug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');

  let categories = [];
  try {
    const catsStr = formData.get('categories');
    if (catsStr) {
      categories = JSON.parse(catsStr);
    }
  } catch (e) {
    categories = [
      { id: 'docs', name: 'Docs', tag: 'Files', description: 'Documents and specifications.' }
    ];
  }

  const newDashboard = {
    id: Date.now().toString(),
    slug,
    name: formData.get('name'),
    headerTitle: formData.get('headerTitle') || formData.get('name'),
    description: formData.get('description') || '',
    heroSubtitle: formData.get('heroSubtitle') || '',
    icon: formData.get('icon') || 'MonitorPlay',
    bgClass: formData.get('bgClass') || '',
    bannerUrl: formData.get('bannerUrl') || '',
    categories
  };

  dashboards.push(newDashboard);
  await fs.writeFile(dashboardsFilePath, JSON.stringify(dashboards, null, 2));
  revalidatePath('/', 'layout');
  return newDashboard;
}

export async function updateDashboard(id, formData) {
  const dashboards = await getDashboards();
  const index = dashboards.findIndex(d => d.id === id);
  if (index === -1) return null;

  let categories = dashboards[index].categories;
  try {
    const catsStr = formData.get('categories');
    if (catsStr) {
      categories = JSON.parse(catsStr);
    }
  } catch (e) {}

  const rawSlug = formData.get('slug') || dashboards[index].slug;
  const slug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');

  dashboards[index] = {
    ...dashboards[index],
    slug,
    name: formData.get('name'),
    headerTitle: formData.get('headerTitle') || formData.get('name'),
    description: formData.get('description'),
    heroSubtitle: formData.get('heroSubtitle'),
    icon: formData.get('icon') || 'MonitorPlay',
    bgClass: formData.get('bgClass') || '',
    bannerUrl: formData.get('bannerUrl') || '',
    categories
  };

  await fs.writeFile(dashboardsFilePath, JSON.stringify(dashboards, null, 2));
  revalidatePath('/', 'layout');
  return dashboards[index];
}

export async function deleteDashboard(id) {
  const dashboards = await getDashboards();
  const filtered = dashboards.filter(d => d.id !== id);
  await fs.writeFile(dashboardsFilePath, JSON.stringify(filtered, null, 2));
  revalidatePath('/', 'layout');
}
