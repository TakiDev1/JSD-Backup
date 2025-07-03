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

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
  permissions?: string[];
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: '/admin',
    permissions: ['view_dashboard']
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    permissions: ['view_analytics'],
    children: [
      { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" />, path: '/admin/analytics', permissions: ['view_analytics'] },
      { id: 'sales', label: 'Sales Report', icon: <DollarSign className="w-4 h-4" />, path: '/admin/analytics/sales', permissions: ['view_analytics'] },
      { id: 'users-analytics', label: 'User Analytics', icon: <Users className="w-4 h-4" />, path: '/admin/analytics/users', permissions: ['view_analytics'] },
      { id: 'performance', label: 'Performance', icon: <Activity className="w-4 h-4" />, path: '/admin/analytics/performance', permissions: ['view_analytics'] }
    ]
  },
  {
    id: 'users',
    label: 'User Management',
    icon: <Users className="w-5 h-5" />,
    children: [
      { id: 'all-users', label: 'All Users', icon: <List className="w-4 h-4" />, path: '/admin/users' },
      { id: 'create-user', label: 'Create User', icon: <UserPlus className="w-4 h-4" />, path: '/admin/users/create' },
      { id: 'banned-users', label: 'Banned Users', icon: <Shield className="w-4 h-4" />, path: '/admin/users/banned' }
    ]
  },
  {
    id: 'roles',
    label: 'Role Management',
    icon: <Shield className="w-5 h-5" />,
    path: '/admin/roles'
  },
  {
    id: 'products',
    label: 'Product Management',
    icon: <Package className="w-5 h-5" />,
    children: [
      { id: 'all-mods', label: 'All Mods', icon: <List className="w-4 h-4" />, path: '/admin/products/all-mods' },
      { id: 'create-mod', label: 'Create Mod', icon: <PackagePlus className="w-4 h-4" />, path: '/admin/products/create-mod' },
      { id: 'featured-mods', label: 'Featured Mods', icon: <PackageSearch className="w-4 h-4" />, path: '/admin/products/featured-mods' },
      { id: 'mod-categories', label: 'Categories', icon: <Palette className="w-4 h-4" />, path: '/admin/products/categories' }
    ]
  },
  {
    id: 'orders',
    label: 'Order Management',
    icon: <ShoppingCart className="w-5 h-5" />,
    path: '/admin/order-management'
  },
  {
    id: 'payments',
    label: 'Payment Management',
    icon: <CreditCard className="w-5 h-5" />,
    children: [
      { id: 'payment-settings', label: 'Payment Settings', icon: <SettingsIcon className="w-4 h-4" />, path: '/admin/payments/settings' },
      { id: 'stripe-config', label: 'Stripe Configuration', icon: <CreditCard className="w-4 h-4" />, path: '/admin/payments/stripe' },
      { id: 'subscriptions', label: 'Subscriptions', icon: <Zap className="w-4 h-4" />, path: '/admin/payments/subscriptions' },
      { id: 'webhooks', label: 'Webhooks', icon: <Webhook className="w-4 h-4" />, path: '/admin/payments/webhooks' }
    ]
  },
  {
    id: 'communications',
    label: 'Communications',
    icon: <Mail className="w-5 h-5" />,
    children: [
      { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, path: '/admin/notifications' },
      { id: 'email-templates', label: 'Email Templates', icon: <Mail className="w-4 h-4" />, path: '/admin/communications/templates' },
      { id: 'newsletter', label: 'Newsletter', icon: <FileText className="w-4 h-4" />, path: '/admin/communications/newsletter' },
      { id: 'discord-integration', label: 'Discord Integration', icon: <MessageSquare className="w-4 h-4" />, path: '/admin/communications/discord' }
    ]
  },
  {
    id: 'settings',
    label: 'Site Settings',
    icon: <Settings className="w-5 h-5" />,
    children: [
      { id: 'general-settings', label: 'General Settings', icon: <SettingsIcon className="w-4 h-4" />, path: '/admin/settings' },
      { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" />, path: '/admin/settings/appearance' },
      { id: 'seo-settings', label: 'SEO Settings', icon: <Globe className="w-4 h-4" />, path: '/admin/settings/seo' },
      { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" />, path: '/admin/settings/security' },
      { id: 'maintenance', label: 'Maintenance Mode', icon: <Activity className="w-4 h-4" />, path: '/admin/settings/maintenance' }
    ]
  },
  {
    id: 'support',
    label: 'Support Management',
    icon: <MessageSquare className="w-5 h-5" />,
    children: [
      { id: 'support-tickets', label: 'Support Tickets', icon: <MessageSquare className="w-4 h-4" />, path: '/admin/support' },
      { id: 'support-analytics', label: 'Support Analytics', icon: <BarChart3 className="w-4 h-4" />, path: '/admin/support/analytics' },
      { id: 'faq-management', label: 'FAQ Management', icon: <FileText className="w-4 h-4" />, path: '/admin/support/faq' }
    ]
  },
  {
    id: 'legal',
    label: 'Legal & Policies',
    icon: <FileText className="w-5 h-5" />,
    children: [
      { id: 'terms-of-service', label: 'Terms of Service', icon: <FileText className="w-4 h-4" />, path: '/admin/legal/terms' },
      { id: 'privacy-policy', label: 'Privacy Policy', icon: <Shield className="w-4 h-4" />, path: '/admin/legal/privacy' },
      { id: 'cookie-policy', label: 'Cookie Policy', icon: <Globe className="w-4 h-4" />, path: '/admin/legal/cookies' },
      { id: 'refund-policy', label: 'Refund Policy', icon: <Banknote className="w-4 h-4" />, path: '/admin/legal/refunds' }
    ]
  },
  {
    id: 'database',
    label: 'Database',
    icon: <Database className="w-5 h-5" />,
    children: [
      { id: 'database-backup', label: 'Backup', icon: <Download className="w-4 h-4" />, path: '/admin/database/backup' },
      { id: 'database-cleanup', label: 'Cleanup', icon: <Trash2 className="w-4 h-4" />, path: '/admin/database/cleanup' },
      { id: 'database-logs', label: 'Logs', icon: <FileText className="w-4 h-4" />, path: '/admin/database/logs' }
    ]
  }
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function AdminSidebar({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const [location] = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState<string[]>(['dashboard']);

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

  return (
    <motion.div
      className={`bg-slate-900 border-r border-slate-700 h-screen transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      animate={{ width: isCollapsed ? 64 : 256 }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-white"
              >
                Admin Panel
              </motion.h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className={`w-5 h-5 transition-transform ${!isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-2">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <div key={item.id}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => !isCollapsed && toggleDropdown(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                        isParentActive(item)
                          ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon}
                        {!isCollapsed && (
                          <span className="font-medium">{item.label}</span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <ChevronDown className={`w-4 h-4 transition-transform ${
                          openDropdowns.includes(item.id) ? 'rotate-180' : ''
                        }`} />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {!isCollapsed && openDropdowns.includes(item.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4 mt-1 space-y-1"
                        >
                          {item.children.map((child) => (
                            <Link key={child.id} to={child.path || '#'}>
                              <motion.div
                                whileHover={{ x: 4 }}
                                className={`flex items-center space-x-3 p-2 rounded-lg text-sm transition-all duration-200 ${
                                  child.path && isActive(child.path)
                                    ? 'bg-green-600/20 text-green-400 border-l-2 border-green-400'
                                    : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                                }`}
                              >
                                {child.icon}
                                <span>{child.label}</span>
                              </motion.div>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link to={item.path || '#'}>
                    <motion.div
                      whileHover={{ x: isCollapsed ? 0 : 4 }}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        item.path && isActive(item.path)
                          ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {item.icon}
                      {!isCollapsed && (
                        <span className="font-medium">{item.label}</span>
                      )}
                    </motion.div>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <Globe className="w-4 h-4" />
              {!isCollapsed && <span>View Site</span>}
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}