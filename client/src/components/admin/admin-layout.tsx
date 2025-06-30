import { useState } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from './admin-sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <motion.main 
        className="flex-1 overflow-hidden bg-slate-950"
        animate={{ marginLeft: isCollapsed ? 64 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ marginLeft: isCollapsed ? 64 : 256 }}
      >
        <div className="h-full overflow-y-auto bg-slate-950">
          <div className="p-6 bg-slate-950">
            {children}
          </div>
        </div>
      </motion.main>
    </div>
  );
}