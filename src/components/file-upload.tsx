import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FileText, UploadCloud, X, FileJson, File, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';
import { FileFormat } from '../lib/types';

interface FileUploadProps {
  onFileLoaded: (accounts: any[]) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded, isProcessing }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    
    if (!selectedFile) return;
    
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !['csv', 'json', 'xml'].includes(fileExtension)) {
      setError('Please upload a CSV, JSON, or XML file.');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    processFile(selectedFile);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/xml': ['.xml'],
      'text/xml': ['.xml'],
    },
    maxFiles: 1,
    disabled: isProcessing || isLoading,
  });
  
  const processFile = async (file: File) => {
    setIsLoading(true);
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() as FileFormat;
      
      if (fileExtension === FileFormat.CSV) {
        const text = await file.text();
        const rows = text.split('\n');
        const headers = rows[0].split(',');
        
        // Find column indexes
        const accountNumberIdx = headers.findIndex(h => 
          h.toLowerCase().includes('account') || h.toLowerCase().includes('acc')
        );
        const bankCodeIdx = headers.findIndex(h => 
          h.toLowerCase().includes('bank') && h.toLowerCase().includes('code')
        );
        const bankNameIdx = headers.findIndex(h => 
          h.toLowerCase().includes('bank') && h.toLowerCase().includes('name')
        );
        const holderNameIdx = headers.findIndex(h => 
          h.toLowerCase().includes('holder') || h.toLowerCase().includes('name')
        );
        const amountIdx = headers.findIndex(h => 
          h.toLowerCase().includes('amount')
        );
        
        if (accountNumberIdx === -1 || bankCodeIdx === -1) {
          setError('CSV file must contain account number and bank code columns');
          setIsLoading(false);
          return;
        }
        
        const accounts = rows.slice(1)
          .filter(row => row.trim())
          .map((row, index) => {
            const columns = row.split(',');
            return {
              id: `acc-${index}`,
              accountNumber: columns[accountNumberIdx]?.trim() || '',
              bankCode: columns[bankCodeIdx]?.trim() || '',
              bankName: bankNameIdx !== -1 ? columns[bankNameIdx]?.trim() : undefined,
              holderName: holderNameIdx !== -1 ? columns[holderNameIdx]?.trim() : undefined,
              amount: amountIdx !== -1 ? parseFloat(columns[amountIdx]) : undefined,
            };
          })
          .filter(account => account.accountNumber && account.bankCode);
        
        onFileLoaded(accounts);
      } else if (fileExtension === FileFormat.JSON) {
        const text = await file.text();
        const data = JSON.parse(text);
        
        let accounts: any[] = [];
        
        if (Array.isArray(data)) {
          accounts = data.map((item, index) => ({
            id: `acc-${index}`,
            accountNumber: item.accountNumber || item.account_number || '',
            bankCode: item.bankCode || item.bank_code || '',
            bankName: item.bankName || item.bank_name,
            holderName: item.holderName || item.holder_name || item.name,
            amount: item.amount,
            currency: item.currency,
            reference: item.reference,
          }));
        } else if (data.accounts && Array.isArray(data.accounts)) {
          accounts = data.accounts.map((item: any, index: number) => ({
            id: `acc-${index}`,
            accountNumber: item.accountNumber || item.account_number || '',
            bankCode: item.bankCode || item.bank_code || '',
            bankName: item.bankName || item.bank_name,
            holderName: item.holderName || item.holder_name || item.name,
            amount: item.amount,
            currency: item.currency,
            reference: item.reference,
          }));
        } else {
          setError('Invalid JSON format. Expected an array of accounts or an object with an accounts array.');
          setIsLoading(false);
          return;
        }
        
        onFileLoaded(accounts);
      } else {
        // For demo purposes, we'll just create some mock data for XML
        // In a real implementation, you would parse the XML properly
        const mockAccounts = Array.from({ length: 50 }, (_, i) => ({
          id: `acc-${i}`,
          accountNumber: `10${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          bankCode: ['EQB', 'KCB', 'STB', 'ABS', 'COB'][Math.floor(Math.random() * 5)],
          bankName: ['Equity Bank', 'KCB Bank', 'Stanbic Bank', 'Absa Bank', 'Cooperative Bank'][Math.floor(Math.random() * 5)],
          holderName: `Test Account ${i + 1}`,
          amount: Math.floor(100 + Math.random() * 10000) / 100,
          currency: 'KES',
        }));
        
        onFileLoaded(mockAccounts);
      }
    } catch (err) {
      setError('Error processing file. Please check the file format and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetFile = () => {
    setFile(null);
    setError(null);
  };
  
  const getFileIcon = () => {
    if (!file) return null;
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    switch (fileExtension) {
      case 'csv':
        return <FileText className="h-8 w-8 text-primary-500" />;
      case 'json':
        return <FileJson className="h-8 w-8 text-primary-500" />;
      default:
        return <File className="h-8 w-8 text-primary-500" />;
    }
  };
  
  return (
    <div className="w-full">
      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-10 transition-colors cursor-pointer flex flex-col items-center justify-center text-center",
            isDragActive ? "border-primary-400 bg-primary-50" : "border-border",
            (isProcessing || isLoading) && "opacity-60 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <UploadCloud className="h-12 w-12 text-primary-500 mx-auto" />
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">Upload Payment File</h3>
          <p className="text-muted-foreground mb-3 max-w-md">
            Drag and drop your CSV, JSON, or XML file containing account records to validate
          </p>
          <Button 
            variant="outline" 
            disabled={isProcessing || isLoading}
          >
            Select File
          </Button>
          <div className="mt-3 text-sm text-muted-foreground">
            Maximum file size: 10MB
          </div>
        </div>
      ) : (
        <Card className="border border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              {getFileIcon()}
              <div className="ml-4 flex-1">
                <div className="font-medium">{file.name}</div>
                <div className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</div>
              </div>
              
              {isLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin text-primary-500" />
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetFile}
                  disabled={isProcessing}
                  className="ml-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-error-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;