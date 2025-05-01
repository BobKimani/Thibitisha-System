import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { 
  FileBarChart, UploadCloud, ArrowRight, RefreshCw, 
  CheckCircle, AlertTriangle, Ban
} from 'lucide-react';
import FileUpload from '../components/file-upload';
import ValidatedAccountsTable from '../components/validated-accounts-table';
import ValidationSummary from '../components/validation-summary';
import BankAPIStatus from '../components/bank-api-status';
import Layout from '../components/layout/layout';
import useValidationStore from '../store/validationStore';
import { Account, AccountStatus, ValidationMode } from '../lib/types';

const ValidatorPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Omit<Account, 'status' | 'reason' | 'timestamp'>[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');
  const [validationMode, setValidationMode] = useState<ValidationMode>(ValidationMode.REAL_TIME);
  
  const { 
    validationResult, 
    isValidating, 
    progress, 
    error, 
    bankAPIs,
    validateAccounts, 
    resetValidation, 
    abortValidation,
    downloadResults
  } = useValidationStore();
  
  const handleFileLoaded = (loadedAccounts: any[]) => {
    setAccounts(loadedAccounts);
  };
  
  const handleValidate = () => {
    validateAccounts(accounts);
  };
  
  const handleReset = () => {
    setAccounts([]);
    resetValidation();
    setActiveTab('upload');
  };
  
  const handleDownload = (type: 'valid' | 'invalid' | 'all' | 'report') => {
    downloadResults(type);
  };
  
  // Main content animations
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { 
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };
  
  return (
    <Layout
      title="Account Validation"
      description="Validate accounts in bulk before initiating transactions"
    >
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8">
          <Tabs value={activeTab} className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger 
                  isActive={activeTab === 'upload'} 
                  onClick={() => setActiveTab('upload')}
                  disabled={isValidating}
                >
                  Upload & Validate
                </TabsTrigger>
                <TabsTrigger 
                  isActive={activeTab === 'results'} 
                  onClick={() => setActiveTab('results')}
                  disabled={!validationResult}
                >
                  Results & Analysis
                </TabsTrigger>
              </TabsList>
              
              {validationResult && (
                <Button variant="outline" onClick={handleReset} disabled={isValidating}>
                  New Validation
                </Button>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={contentVariants}
              >
                {activeTab === 'upload' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileBarChart className="mr-2 h-5 w-5 text-primary-500" />
                        Account Validation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!accounts.length && (
                        <FileUpload 
                          onFileLoaded={handleFileLoaded} 
                          isProcessing={isValidating}
                        />
                      )}
                      
                      {accounts.length > 0 && !validationResult && (
                        <div className="space-y-6">
                          <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{accounts.length} accounts loaded</h3>
                              <p className="text-sm text-muted-foreground">Ready for validation</p>
                            </div>
                            <Button 
                              variant="ghost"
                              size="sm"
                              onClick={() => setAccounts([])}
                              disabled={isValidating}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Clear
                            </Button>
                          </div>
                          
                          <div className="border-t border-border pt-4">
                            <h3 className="font-medium mb-2">Validation Mode</h3>
                            <div className="flex space-x-2 mb-4">
                              <Button
                                variant={validationMode === ValidationMode.REAL_TIME ? "default" : "outline"}
                                onClick={() => setValidationMode(ValidationMode.REAL_TIME)}
                                disabled={isValidating}
                                className="flex-1"
                              >
                                Real-Time
                              </Button>
                              <Button
                                variant={validationMode === ValidationMode.SIMULATED ? "default" : "outline"}
                                onClick={() => setValidationMode(ValidationMode.SIMULATED)}
                                disabled={isValidating}
                                className="flex-1"
                              >
                                Simulated
                              </Button>
                            </div>
                            
                            <div className="mb-6 text-sm text-muted-foreground">
                              {validationMode === ValidationMode.REAL_TIME ? (
                                <p>Real-Time mode will validate accounts using live bank APIs where available.</p>
                              ) : (
                                <p>Simulated mode will use predefined rules to validate account formats without calling APIs.</p>
                              )}
                            </div>
                            
                            <div className="flex justify-end gap-3">
                              <Button 
                                onClick={() => setAccounts([])} 
                                variant="outline"
                                disabled={isValidating}
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleValidate}
                                disabled={isValidating || accounts.length === 0}
                                className="flex items-center gap-2"
                              >
                                {isValidating ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Validating...
                                  </>
                                ) : (
                                  <>
                                    Validate Accounts
                                    <ArrowRight className="h-4 w-4" />
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          {isValidating && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Validation in progress...</span>
                                <span>{progress}%</span>
                              </div>
                              <Progress value={progress} />
                              <div className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={abortValidation}
                                  className="text-error-600 hover:text-error-700"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {error && (
                            <div className="bg-error-50 text-error-700 px-4 py-3 rounded-md mt-4">
                              {error}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {validationResult && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <div className="mb-4">
                            {validationResult.validCount === validationResult.totalRecords ? (
                              <CheckCircle className="h-16 w-16 text-success-500 mx-auto" />
                            ) : validationResult.invalidCount > 0 ? (
                              <AlertTriangle className="h-16 w-16 text-warning-500 mx-auto" />
                            ) : (
                              <UploadCloud className="h-16 w-16 text-primary-500 mx-auto" />
                            )}
                          </div>
                          <h2 className="text-2xl font-bold mb-2">Validation Complete</h2>
                          <p className="text-muted-foreground mb-6">
                            {validationResult.validCount} of {validationResult.totalRecords} accounts are valid
                          </p>
                          <Button onClick={() => setActiveTab('results')}>
                            View Results
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {activeTab === 'results' && validationResult && (
                  <div className="space-y-6">
                    <ValidationSummary 
                      result={validationResult} 
                      onDownload={handleDownload}
                    />
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Accounts</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ValidatedAccountsTable 
                          accounts={validationResult.accounts}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
        
        <div className="col-span-12 xl:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank API Status</CardTitle>
            </CardHeader>
            <CardContent>
              <BankAPIStatus apis={bankAPIs} />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ValidatorPage;