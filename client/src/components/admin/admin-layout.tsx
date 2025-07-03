import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import AdminSidebar from './admin-sidebar';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sidebarWidth = isCollapsed ? 64 : 256;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex relative">
      {/* Mobile Menu Button - Header removed per user request */}

      {/* Desktop Sidebar */}
      <div className={`hidden md:block ${isMobile ? 'hidden' : ''}`}>
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
            >
              <AdminSidebar 
                isCollapsed={false} 
                setIsCollapsed={() => {}} 
                isMobile={true}
                onMobileClose={() => setIsMobileMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <motion.main 
        className="flex-1 overflow-hidden"
        animate={{ 
          marginLeft: isMobile ? 0 : (isCollapsed ? sidebarWidth : sidebarWidth),
          paddingTop: 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="h-full overflow-y-auto">
          <div className={`${isMobile ? 'p-4' : 'p-6'} min-h-full`}>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}