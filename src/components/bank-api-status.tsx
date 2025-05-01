import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BankAPI } from '../lib/types';

interface BankAPIStatusProps {
  apis: BankAPI[];
}

const BankAPIStatus: React.FC<BankAPIStatusProps> = ({ apis }) => {
  // Calculate overall status
  const onlineCount = apis.filter(api => api.status === 'online').length;
  const degradedCount = apis.filter(api => api.status === 'degraded').length;
  const offlineCount = apis.filter(api => api.status === 'offline').length;
  
  const getOverallStatus = () => {
    if (offlineCount > 0) return 'critical';
    if (degradedCount > 0) return 'warning';
    return 'operational';
  };
  
  const overallStatus = getOverallStatus();
  
  const getStatusIcon = (status: BankAPI['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-warning-500" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-error-500" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = (status: BankAPI['status']) => {
    switch (status) {
      case 'online':
        return 'bg-success-500';
      case 'degraded':
        return 'bg-warning-500';
      case 'offline':
        return 'bg-error-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const translateStatuses = (status: BankAPI['status']) => {
    switch (status) {
      case 'online':
        return 'Operational';
      case 'degraded':
        return 'Degraded';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };
  
  return (
    <div>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>API System Health</CardTitle>
          {overallStatus === 'operational' && <CheckCircle className="h-5 w-5 text-success-500" />}
          {overallStatus === 'warning' && <AlertTriangle className="h-5 w-5 text-warning-500" />}
          {overallStatus === 'critical' && <XCircle className="h-5 w-5 text-error-500" />}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-success-600">{onlineCount}</div>
              <div className="text-sm text-muted-foreground">Operational</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning-600">{degradedCount}</div>
              <div className="text-sm text-muted-foreground">Degraded</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-error-600">{offlineCount}</div>
              <div className="text-sm text-muted-foreground">Offline</div>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {apis.map((api) => (
          <motion.div 
            key={api.id}
            variants={itemVariants}
          >
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(api.status)} mr-2`}></div>
                  <span className="font-medium">{api.name}</span>
                </div>
                {getStatusIcon(api.status)}
              </div>
              <div className="px-4 py-2 bg-muted border-t border-border flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {api.code}
                </span>
                <span className="text-xs font-medium">
                  {translateStatuses(api.status)}
                </span>
              </div>
              <div className="px-4 py-2 border-t border-border">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Avg. Response Time</span>
                  <span>{api.status === 'offline' ? 'N/A' : `${api.averageResponseTime}ms`}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default BankAPIStatus;