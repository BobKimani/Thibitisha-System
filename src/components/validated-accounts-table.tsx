import React, { useState } from 'react';
import { Trash2, Search, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Account, AccountStatus } from '../lib/types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ValidatedAccountsTableProps {
  accounts: Account[];
  isLoading?: boolean;
}

const ValidatedAccountsTable: React.FC<ValidatedAccountsTableProps> = ({ 
  accounts,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'all'>('all');
  
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.bankCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (account.holderName && account.holderName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (account.bankName && account.bankName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Display at most 100 accounts to prevent performance issues
  const displayedAccounts = filteredAccounts.slice(0, 100);
  
  const getStatusBadge = (status: AccountStatus, reason?: string) => {
    switch (status) {
      case AccountStatus.VALID:
        return <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Valid
        </Badge>;
      case AccountStatus.INVALID:
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          {reason || 'Invalid'}
        </Badge>;
      case AccountStatus.PENDING:
        return <Badge variant="warning" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
      default:
        return null;
    }
  };
  
  // Animation variants for the table rows
  const tableRowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };
  
  const filterButtonVariants = {
    active: { 
      backgroundColor: 'rgb(243 244 246)',
      color: 'rgb(17 24 39)',
      scale: 1.05,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    inactive: { 
      backgroundColor: 'transparent',
      color: 'rgb(107 114 128)',
      scale: 1
    }
  };
  
  return (
    <div className="w-full overflow-hidden">
      {/* Filter and search controls */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
        <div className="flex space-x-2">
          <motion.button
            onClick={() => setStatusFilter('all')}
            className="px-3 py-1.5 rounded-md text-sm font-medium"
            variants={filterButtonVariants}
            animate={statusFilter === 'all' ? 'active' : 'inactive'}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            All
          </motion.button>
          <motion.button
            onClick={() => setStatusFilter(AccountStatus.VALID)}
            className="px-3 py-1.5 rounded-md text-sm font-medium"
            variants={filterButtonVariants}
            animate={statusFilter === AccountStatus.VALID ? 'active' : 'inactive'}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            Valid
          </motion.button>
          <motion.button
            onClick={() => setStatusFilter(AccountStatus.INVALID)}
            className="px-3 py-1.5 rounded-md text-sm font-medium"
            variants={filterButtonVariants}
            animate={statusFilter === AccountStatus.INVALID ? 'active' : 'inactive'}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            Invalid
          </motion.button>
          <motion.button
            onClick={() => setStatusFilter(AccountStatus.PENDING)}
            className="px-3 py-1.5 rounded-md text-sm font-medium"
            variants={filterButtonVariants}
            animate={statusFilter === AccountStatus.PENDING ? 'active' : 'inactive'}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            Pending
          </motion.button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search accounts..."
            className="pl-10 pr-4 py-2 border border-border rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Account Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Bank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Holder Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                {statusFilter === AccountStatus.INVALID && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Error Reason
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-muted rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-muted rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-muted rounded w-40"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-muted rounded w-16"></div>
                    </td>
                    {statusFilter === AccountStatus.INVALID && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-muted rounded w-28"></div>
                      </td>
                    )}
                  </tr>
                ))
              ) : displayedAccounts.length > 0 ? (
                displayedAccounts.map((account, i) => (
                  <motion.tr 
                    key={account.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={tableRowVariants}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{account.accountNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{account.bankName || account.bankCode}</div>
                      {account.bankName && (
                        <div className="text-xs text-muted-foreground">{account.bankCode}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{account.holderName || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(account.status, account.reason)}
                    </td>
                    {statusFilter === AccountStatus.INVALID && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-error-600">{account.reason || 'Unknown Error'}</div>
                      </td>
                    )}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan={statusFilter === AccountStatus.INVALID ? 5 : 4} 
                    className="px-6 py-10 text-center text-muted-foreground"
                  >
                    No accounts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredAccounts.length > 100 && (
          <div className="px-6 py-3 bg-muted text-sm text-muted-foreground">
            Showing 100 of {filteredAccounts.length} accounts. Please refine your search to see more results.
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidatedAccountsTable;