import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Activity, Database, Download } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ValidationResult } from '../lib/types';
import { formatNumber, formatPercentage } from '../lib/utils';

// Import Chart JS components
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart JS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

interface ValidationSummaryProps {
  result: ValidationResult;
  onDownload: (type: 'valid' | 'invalid' | 'all' | 'report') => void;
}

const ValidationSummary: React.FC<ValidationSummaryProps> = ({ result, onDownload }) => {
  const { totalRecords, validCount, invalidCount, pendingCount, errorBreakdown, processingTime, cacheHits } = result;
  
  // Data for pie chart
  const pieData = {
    labels: ['Valid', 'Invalid', 'Pending'],
    datasets: [
      {
        data: [validCount, invalidCount, pendingCount],
        backgroundColor: [
          'rgba(22, 163, 74, 0.8)',   // success-600
          'rgba(220, 38, 38, 0.8)',   // error-600
          'rgba(217, 119, 6, 0.8)',   // warning-600
        ],
        borderColor: [
          'rgb(21, 128, 61)',         // success-700
          'rgb(185, 28, 28)',         // error-700
          'rgb(180, 83, 9)',          // warning-700
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Data for error breakdown bar chart
  const errorLabels = Object.keys(errorBreakdown);
  const errorValues = Object.values(errorBreakdown);
  
  const barData = {
    labels: errorLabels,
    datasets: [
      {
        label: 'Error Count',
        data: errorValues,
        backgroundColor: 'rgba(220, 38, 38, 0.6)',
        borderColor: 'rgb(220, 38, 38)',
        borderWidth: 1,
      },
    ],
  };
  
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-12 gap-6"
    >
      {/* Summary Cards - Top Row */}
      <motion.div variants={itemVariants} className="md:col-span-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalRecords)}</div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants} className="md:col-span-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valid Accounts</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-2xl font-bold text-success-600">{formatNumber(validCount)}</div>
            <div className="text-xl font-semibold">{formatPercentage(validCount, totalRecords)}</div>
            <CheckCircle className="h-8 w-8 text-success-500" />
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants} className="md:col-span-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Invalid Accounts</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-2xl font-bold text-error-600">{formatNumber(invalidCount)}</div>
            <div className="text-xl font-semibold">{formatPercentage(invalidCount, totalRecords)}</div>
            <XCircle className="h-8 w-8 text-error-500" />
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants} className="md:col-span-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cache Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-2xl font-bold">{formatNumber(cacheHits)}</div>
            <div className="text-xl font-semibold">{formatPercentage(cacheHits, totalRecords)}</div>
            <Database className="h-8 w-8 text-primary-500" />
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Pie Chart - Middle */}
      <motion.div variants={itemVariants} className="md:col-span-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <Pie 
                data={pieData} 
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                }} 
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onDownload('all')}>
              Download All
            </Button>
            <Button variant="success" size="sm" onClick={() => onDownload('valid')}>
              Valid Accounts
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDownload('invalid')}>
              Invalid Accounts
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      
      {/* Performance Metrics - Middle Right */}
      <motion.div variants={itemVariants} className="md:col-span-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Processing Time</span>
              <span className="text-sm">{(processingTime / 1000).toFixed(2)} seconds</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Records per Second</span>
              <span className="text-sm">
                {formatNumber(Math.round(totalRecords / (processingTime / 1000)))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cache Hit Rate</span>
              <span className="text-sm">{formatPercentage(cacheHits, totalRecords)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">API Calls Made</span>
              <span className="text-sm">{formatNumber(totalRecords - cacheHits)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2"
              onClick={() => onDownload('report')}
            >
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      
      {/* Error Breakdown - Bottom */}
      {invalidCount > 0 && (
        <motion.div variants={itemVariants} className="md:col-span-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Error Breakdown</CardTitle>
              <AlertTriangle className="h-5 w-5 text-warning-500" />
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar data={barData} options={barOptions} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ValidationSummary;