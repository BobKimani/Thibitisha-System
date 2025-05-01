import React from 'react';
import { motion } from 'framer-motion';
import { FileBarChart, Bell, User, Menu, X } from 'lucide-react';
import { Button } from '../ui/button';

interface HeaderProps {
  title: string;
  description?: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  description, 
  isSidebarOpen, 
  toggleSidebar 
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-border px-4 sm:px-6">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 md:hidden" 
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          
          <div className="hidden md:flex md:items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-primary-100 text-primary-700 p-2 rounded-md mr-3"
            >
              <FileBarChart className="h-5 w-5" />
            </motion.div>
          </div>
          
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground hidden sm:block">{description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <div className="border-l border-border h-6 mx-2" />
          
          <div className="flex items-center">
            <div className="hidden sm:block mr-3 text-right">
              <div className="text-sm font-medium">Admin User</div>
              <div className="text-xs text-muted-foreground">admin@pesalink.co.ke</div>
            </div>
            <Button variant="ghost" size="icon" className="bg-muted rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;