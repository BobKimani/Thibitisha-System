import React, { useState, useEffect } from 'react';
import Header from './header';
import Sidebar from './sidebar';
import { cn } from '../../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, description }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={title} 
        description={description} 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        currentPath="/validate" 
      />
      
      <main 
        className={cn(
          "transition-all duration-300 min-h-[calc(100vh-4rem)]",
          isSidebarOpen ? "md:ml-64" : "ml-0"
        )}
      >
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;