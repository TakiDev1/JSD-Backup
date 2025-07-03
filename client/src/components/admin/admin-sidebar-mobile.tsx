import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Settings, 
  ShoppingCart, 
  CreditCard, 
  Mail, 
  BarChart3, 
  FileText, 
  Shield, 
  Database, 
  Bell, 
  Palette, 
  Globe, 
  DollarSign, 
  Download, 
  MessageSquare, 
  Calendar, 
  Activity,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  Edit,
  List,
  Eye,
  Trash2,
  UserPlus,
  UserCog,
  PackagePlus,
  PackageSearch,
  SettingsIcon,
  Banknote,
  Webhook,
  Zap,
  X,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
  permissions?: string[];
}

// Permission mappings for menu items
const permissionMappings: Record<string, string[]> = {
  dashboard: ['view_dashboard'],
  analytics: ['view_analytics'],
  users: ['view_users', 'manage_users'],
  roles: ['view_roles', 'manage_roles'],
  products: ['view_mods', 'manage_mods'],
  orders: ['view_analytics'],
  payments: ['manage_system'],
  communications: ['manage_content'],
  settings: ['manage_system'],
  support: ['manage_content'],
  legal: ['manage_system'],
  database: ['manage_system']
};

const getAllSidebarItems = (): SidebarItem[] => [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: '/admin',
    permissions: permissionMappings.dashboard
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    permissions: permissionMappings.analytics,
    children: [
      { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" />, path: '/admin/analytics', permissions: permissionMappings.analytics },
      { id: 'sales', label: 'Sales Report', icon: <DollarSign className="w-4 h-4" />, path: '/admin/analytics/sales', permissions: permissionMappings.analytics },
      { id: 'users-analytics', label: 'User Analytics', icon: <Users className="w-4 h-4" />, path: '/admin/analytics/users', permissions: permissionMappings.analytics },
      { id: 'performance', label: 'Performance', icon: <Activity className="w-4 h-4" />, path: '/admin/analytics/performance', permissions: permissionMappings.analytics }
    ]
  },
  {
    id: 'users',
    label: 'User Management',
    icon: <Users className="w-5 h-5" />,
    permissions: permissionMappings.users,
    children: [
      { id: 'all-users', label: 'All Users', icon: <List className="w-4 h-4" />, path: '/admin/users', permissions: ['view_users'] },
      { id: 'create-user', label: 'Create User', icon: <UserPlus className="w-4 h-4" />, path: '/admin/users/create', permissions: ['manage_users'] },
      { id: 'banned-users', label: 'Banned Users', icon: <Shield className="w-4 h-4" />, path: '/admin/users/banned', permissions: ['manage_users'] }
    ]
  },
  {
    id: 'roles',
    label: 'Role Management',
    icon: <Shield className="w-5 h-5" />,
    path: '/admin/roles',
    permissions: permissionMappings.roles
  },
  {
    id: 'products',
    label: 'Product Management',
    icon: <Package className="w-5 h-5" />,
    permissions: permissionMappings.products,
    children: [
      { id: 'all-mods', label: 'All Mods', icon: <List className="w-4 h-4" />, path: '/admin/mods', permissions: ['view_mods'] },
      { id: 'create-mod', label: 'Create Mod', icon: <PackagePlus className="w-4 h-4" />, path: '/admin/mods/create', permissions: ['manage_mods'] },
      { id: 'featured-mods', label: 'Featured Mods', icon: <PackageSearch className="w-4 h-4" />, path: '/admin/mods/featured', permissions: ['manage_mods'] },
      { id: 'mod-categories', label: 'Categories', icon: <Palette className="w-4 h-4" />, path: '/admin/mods/categories', permissions: ['manage_mods'] },
      { id: 'mod-reviews', label: 'Reviews', icon: <MessageSquare className="w-4 h-4" />, path: '/admin/mods/reviews', permissions: ['manage_mods'] }
    ]
  },
  {
    id: 'orders',
    label: 'Order Management',
    icon: <ShoppingCart className="w-5 h-5" />,
    permissions: permissionMappings.orders,
    children: [
      { id: 'all-orders', label: 'All Orders', icon: <List className="w-4 h-4" />, path: '/admin/orders', permissions: permissionMappings.orders },
      { id: 'pending-orders', label: 'Pending Orders', icon: <Calendar className="w-4 h-4" />, path: '/admin/orders/pending', permissions: permissionMappings.orders },
      { id: 'completed-orders', label: 'Completed Orders', icon: <Download className="w-4 h-4" />, path: '/admin/orders/completed', permissions: permissionMappings.orders },
      { id: 'refunds', label: 'Refunds', icon: <Banknote className="w-4 h-4" />, path: '/admin/orders/refunds', permissions: permissionMappings.orders }
    ]
  },
  {
    id: 'payments',
    label: 'Payment Management',
    icon: <CreditCard className="w-5 h-5" />,
    permissions: permissionMappings.payments,
    children: [
      { id: 'payment-settings', label: 'Payment Settings', icon: <SettingsIcon className="w-4 h-4" />, path: '/admin/payments/settings', permissions: permissionMappings.payments },
      { id: 'stripe-config', label: 'Stripe Configuration', icon: <CreditCard className="w-4 h-4" />, path: '/admin/payments/stripe', permissions: permissionMappings.payments },
      { id: 'subscriptions', label: 'Subscriptions', icon: <Zap className="w-4 h-4" />, path: '/admin/payments/subscriptions', permissions: permissionMappings.payments },
      { id: 'webhooks', label: 'Webhooks', icon: <Webhook className="w-4 h-4" />, path: '/admin/payments/webhooks', permissions: permissionMappings.payments }
    ]
  },
  {
    id: 'communications',
    label: 'Communications',
    icon: <Mail className="w-5 h-5" />,
    permissions: permissionMappings.communications,
    children: [
      { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, path: '/admin/notifications', permissions: permissionMappings.communications },
      { id: 'email-templates', label: 'Email Templates', icon: <Mail className="w-4 h-4" />, path: '/admin/communications/templates', permissions: permissionMappings.communications },
      { id: 'newsletter', label: 'Newsletter', icon: <FileText className="w-4 h-4" />, path: '/admin/communications/newsletter', permissions: permissionMappings.communications },
      { id: 'discord-integration', label: 'Discord Integration', icon: <MessageSquare className="w-4 h-4" />, path: '/admin/communications/discord', permissions: permissionMappings.communications }
    ]
  },
  {
    id: 'settings',
    label: 'Site Settings',
    icon: <Settings className="w-5 h-5" />,
    permissions: permissionMappings.settings,
    children: [
      { id: 'general-settings', label: 'General Settings', icon: <SettingsIcon className="w-4 h-4" />, path: '/admin/settings', permissions: permissionMappings.settings },
      { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" />, path: '/admin/settings/appearance', permissions: permissionMappings.settings },
      { id: 'seo-settings', label: 'SEO Settings', icon: <Globe className="w-4 h-4" />, path: '/admin/settings/seo', permissions: permissionMappings.settings },
      { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" />, path: '/admin/settings/security', permissions: permissionMappings.settings },
      { id: 'maintenance', label: 'Maintenance Mode', icon: <Activity className="w-4 h-4" />, path: '/admin/settings/maintenance', permissions: permissionMappings.settings }
    ]
  },
  {
    id: 'support',
    label: 'Support Management',
    icon: <MessageSquare className="w-5 h-5" />,
    permissions: permissionMappings.support,
    children: [
      { id: 'support-tickets', label: 'Support Tickets', icon: <MessageSquare className="w-4 h-4" />, path: '/admin/support', permissions: permissionMappings.support },
      { id: 'support-analytics', label: 'Support Analytics', icon: <BarChart3 className="w-4 h-4" />, path: '/admin/support/analytics', permissions: permissionMappings.support },
      { id: 'faq-management', label: 'FAQ Management', icon: <FileText className="w-4 h-4" />, path: '/admin/support/faq', permissions: permissionMappings.support }
    ]
  },
  {
    id: 'legal',
    label: 'Legal & Policies',
    icon: <FileText className="w-5 h-5" />,
    permissions: permissionMappings.legal,
    children: [
      { id: 'terms-of-service', label: 'Terms of Service', icon: <FileText className="w-4 h-4" />, path: '/admin/legal/terms', permissions: permissionMappings.legal },
      { id: 'privacy-policy', label: 'Privacy Policy', icon: <Shield className="w-4 h-4" />, path: '/admin/legal/privacy', permissions: permissionMappings.legal },
      { id: 'cookie-policy', label: 'Cookie Policy', icon: <Globe className="w-4 h-4" />, path: '/admin/legal/cookies', permissions: permissionMappings.legal },
      { id: 'refund-policy', label: 'Refund Policy', icon: <Banknote className="w-4 h-4" />, path: '/admin/legal/refunds', permissions: permissionMappings.legal }
    ]
  },
  {
    id: 'database',
    label: 'Database',
    icon: <Database className="w-5 h-5" />,
    permissions: permissionMappings.database,
    children: [
      { id: 'database-backup', label: 'Backup', icon: <Download className="w-4 h-4" />, path: '/admin/database/backup', permissions: permissionMappings.database },
      { id: 'database-cleanup', label: 'Cleanup', icon: <Trash2 className="w-4 h-4" />, path: '/admin/database/cleanup', permissions: permissionMappings.database },
      { id: 'database-logs', label: 'Logs', icon: <FileText className="w-4 h-4" />, path: '/admin/database/logs', permissions: permissionMappings.database }
    ]
  }
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({ isCollapsed, setIsCollapsed, isMobile = false, onMobileClose }: AdminSidebarProps) {
  const [location] = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState<string[]>(['dashboard']);
  const [filteredItems, setFilteredItems] = useState<SidebarItem[]>([]);

  // Fetch user permissions
  const { data: userPermissions } = useQuery({
    queryKey: ['/api/auth/user/permissions'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user/permissions');
      if (!response.ok) throw new Error('Failed to fetch permissions');
      return response.json();
    }
  });

  // Filter sidebar items based on permissions
  useEffect(() => {
    if (!userPermissions) return;

    const { isAdmin, permissions } = userPermissions;
    const allItems = getAllSidebarItems();

    // If user is admin, show everything
    if (isAdmin) {
      setFilteredItems(allItems);
      return;
    }

    // Filter items based on permissions
    const filterItems = (items: SidebarItem[]): SidebarItem[] => {
      return items.filter(item => {
        // Check if user has any of the required permissions
        if (item.permissions && item.permissions.length > 0) {
          const hasPermission = item.permissions.some(permission => 
            permissions.includes(permission)
          );
          if (!hasPermission) return false;
        }

        // Filter children recursively
        if (item.children) {
          const filteredChildren = filterItems(item.children);
          if (filteredChildren.length === 0) return false;
          item.children = filteredChildren;
        }

        return true;
      });
    };

    setFilteredItems(filterItems(allItems));
  }, [userPermissions]);

  const toggleDropdown = (itemId: string) => {
    setOpenDropdowns(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (path: string) => {
    return location === path || location.startsWith(path + '/');
  };

  const isParentActive = (item: SidebarItem) => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => child.path && isActive(child.path));
    }
    return false;
  };

  const renderSidebarItem = (item: SidebarItem, isChild = false) => {
    const active = item.path ? isActive(item.path) : isParentActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openDropdowns.includes(item.id);

    return (
      <div key={item.id} className="mb-1">
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleDropdown(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                active 
                  ? "bg-gradient-to-r from-purple-600 to-green-600 text-white shadow-lg" 
                  : "text-gray-300 hover:text-white hover:bg-purple-900/30",
                isChild && "pl-8"
              )}
            >
              {item.icon}
              {(!isCollapsed || isMobile) && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </>
              )}
            </button>
            <AnimatePresence>
              {isOpen && (!isCollapsed || isMobile) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {item.children?.map(child => renderSidebarItem(child, true))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <Link 
            href={item.path || '#'}
            onClick={isMobile ? onMobileClose : undefined}
          >
            <a
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                active 
                  ? "bg-gradient-to-r from-purple-600 to-green-600 text-white shadow-lg" 
                  : "text-gray-300 hover:text-white hover:bg-purple-900/30",
                isChild && "pl-8"
              )}
            >
              {item.icon}
              {(!isCollapsed || isMobile) && <span>{item.label}</span>}
            </a>
          </Link>
        )}
      </div>
    );
  };

  return (
    <motion.aside
      className={cn(
        "h-screen bg-slate-900/95 backdrop-blur-xl border-r border-purple-800/30 flex flex-col transition-all duration-300",
        isMobile ? "w-72" : "",
        !isMobile && isCollapsed ? "w-16" : "w-64"
      )}
      animate={{ width: isMobile ? 288 : (isCollapsed ? 64 : 256) }}
    >
      {/* Header */}
      <div className="p-4 border-b border-purple-800/30">
        <div className="flex items-center justify-between">
          {(!isCollapsed || isMobile) && (
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              Admin Panel
            </h2>
          )}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-400 hover:text-white hover:bg-purple-800/20"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
          {isMobile && onMobileClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileClose}
              className="text-gray-400 hover:text-white hover:bg-purple-800/20"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        {filteredItems.map(item => renderSidebarItem(item))}
      </ScrollArea>

      {/* Footer */}
      {(!isCollapsed || isMobile) && (
        <div className="p-4 border-t border-purple-800/30">
          <p className="text-xs text-gray-500 text-center">
            JSD Mods Admin v2.0
          </p>
        </div>
      )}
    </motion.aside>
  );
}