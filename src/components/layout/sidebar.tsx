import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  FileText,
  BarChart3,
  Settings,
  Users,
  Server,
  HelpCircle,
  LogOut,
  FileBarChart
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentPath: string;
}

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, currentPath }) => {
  const sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Validate Accounts', path: '/validate', icon: <FileText size={20} /> },
    { name: 'API Status', path: '/api-status', icon: <Server size={20} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} /> },
    { name: 'User Management', path: '/users', icon: <Users size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];
  
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5 }
  };
  
  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 }
  };
  
  const handleItemClick = () => {
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };
  
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background z-30 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isOpen ? "visible" : "hidden"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed inset-y-0 left-0 w-64 z-40 bg-white border-r border-border pt-16 flex flex-col",
          !isOpen && "hidden md:flex"
        )}
      >
        {/* Logo */}
        <div className="px-6 mb-6 flex items-center">
          <div className="bg-primary-100 text-primary-700 p-2 rounded-md mr-3">
            <FileBarChart className="h-5 w-5" />
          </div>
          <div className="font-semibold text-lg text-primary-700">
            Account Validator
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                currentPath === item.path
                  ? "bg-primary-50 text-primary-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              onClick={handleItemClick}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        
        {/* Footer */}
        <div className="mt-auto border-t border-border py-4 px-3">
          <Link
            to="/help"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <HelpCircle size={20} className="mr-3" />
            Help & Support
          </Link>
          <Link
            to="/logout"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-error-50 hover:text-error-700"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </Link>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;