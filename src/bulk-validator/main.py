from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import requests
import asyncio
import tempfile
import os
import time
import csv
import io
import json
from enum import Enum

app = FastAPI(title="Account Validation API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API endpoint for validation
VALIDATION_API_URL = "https://account-validation-service.dev.pesalink.co.ke/api/validate"

# Temporary storage for results
RESULTS_DIR = "results"
os.makedirs(RESULTS_DIR, exist_ok=True)

class ValidationMode(str, Enum):
    REAL_TIME = "REAL_TIME"
    SIMULATED = "SIMULATED"

class AccountValidationRequest(BaseModel):
    csv_url: Optional[str] = None
    accounts: Optional[List[Dict[str, Any]]] = None
    mode: ValidationMode = ValidationMode.REAL_TIME

# Function to validate a single account
async def validate_account(account_number: str, bank_code: str, mode: ValidationMode):
    if mode == ValidationMode.SIMULATED:
        # Simulated validation logic
        # This is a simple example - you would implement more sophisticated rules
        is_valid = len(account_number) >= 5 and len(bank_code) == 4
        
        # Simulate API response
        return {
            "status": "Valid" if is_valid else "Invalid",
            "accountHolderName": f"Simulated User {account_number[-4:]}",
            "bankName": f"Bank {bank_code}",
            "currency": "KES"
        }
    else:
        # Real-time validation using the API
        try:
            payload = {
                "accountNumber": account_number,
                "bankCode": bank_code
            }
            response = requests.post(VALIDATION_API_URL, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error validating account {account_number}: {str(e)}")
            return {
                "status": "Invalid",
                "accountHolderName": "",
                "bankName": "",
                "currency": "",
                "reason": str(e)
            }

# Function to process accounts in batches
async def process_accounts_in_batches(accounts_data, mode: ValidationMode, batch_size=10):
    valid_accounts = []
    invalid_accounts = []
    start_time = time.time()
    
    # Process in batches to avoid overwhelming the API
    for i in range(0, len(accounts_data), batch_size):
        batch = accounts_data[i:i+batch_size]
        batch_tasks = []
        
        for account in batch:
            account_number = str(account.get('accountNumber', account.get('Account Number')))
            bank_code = str(account.get('bankCode', account.get('Bank Code')))
            task = asyncio.create_task(validate_account(account_number, bank_code, mode))
            batch_tasks.append((account, task))
        
        # Wait for all tasks in this batch to complete
        for account_data, task in batch_tasks:
            result = await task
            
            # Create enriched account data
            account_number = str(account_data.get('accountNumber', account_data.get('Account Number')))
            bank_code = str(account_data.get('bankCode', account_data.get('Bank Code')))
            
            enriched_account = {
                'accountNumber': account_number,
                'bankCode': bank_code,
                'accountHolderName': result.get('accountHolderName', ''),
                'bankName': result.get('bankName', ''),
                'status': result.get('status', 'Invalid'),
                'currency': result.get('currency', ''),
                'reason': result.get('reason', '')
            }
            
            # Sort into valid or invalid
            if result.get('status') == 'Valid':
                valid_accounts.append(enriched_account)
            else:
                invalid_accounts.append(enriched_account)
        
        # Add a small delay between batches
        if i + batch_size < len(accounts_data):
            await asyncio.sleep(0.5)
    
    duration = time.time() - start_time
    
    # Save results to CSV files
    save_to_csv(valid_accounts, os.path.join(RESULTS_DIR, "valid_accounts.csv"))
    save_to_csv(invalid_accounts, os.path.join(RESULTS_DIR, "invalid_accounts.csv"))
    
    # Save all accounts to a single CSV
    save_to_csv(valid_accounts + invalid_accounts, os.path.join(RESULTS_DIR, "all_accounts.csv"))
    
    # Generate a report
    generate_report(valid_accounts, invalid_accounts, duration, os.path.join(RESULTS_DIR, "validation_report.csv"))
    
    return valid_accounts, invalid_accounts, duration

def save_to_csv(accounts, filename):
    if not accounts:
        # Create an empty file
        with open(filename, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['accountNumber', 'bankCode', 'accountHolderName', 'bankName', 'status', 'currency', 'reason'])
        return
    
    df = pd.DataFrame(accounts)
    df.to_csv(filename, index=False)

def generate_report(valid_accounts, invalid_accounts, duration, filename):
    total = len(valid_accounts) + len(invalid_accounts)
    
    # Group by bank
    bank_stats = {}
    for account in valid_accounts + invalid_accounts:
        bank_name = account.get('bankName', 'Unknown')
        bank_code = account.get('bankCode', 'Unknown')
        key = f"{bank_name} ({bank_code})"
        
        if key not in bank_stats:
            bank_stats[key] = {'valid': 0, 'invalid': 0, 'total': 0}
        
        bank_stats[key]['total'] += 1
        if account.get('status') == 'Valid':
            bank_stats[key]['valid'] += 1
        else:
            bank_stats[key]['invalid'] += 1
    
    # Create report data
    report_data = [
        {'Metric': 'Total Accounts', 'Value': total},
        {'Metric': 'Valid Accounts', 'Value': len(valid_accounts)},
        {'Metric': 'Invalid Accounts', 'Value': len(invalid_accounts)},
        {'Metric': 'Validation Rate', 'Value': f"{(len(valid_accounts) / total * 100) if total > 0 else 0:.2f}%"},
        {'Metric': 'Processing Time', 'Value': f"{duration:.2f} seconds"},
        {'Metric': 'Average Time per Account', 'Value': f"{(duration / total) if total > 0 else 0:.4f} seconds"}
    ]
    
    # Add bank-specific stats
    for bank, stats in bank_stats.items():
        report_data.append({
            'Metric': f"Bank: {bank}",
            'Value': f"Total: {stats['total']}, Valid: {stats['valid']}, Invalid: {stats['invalid']}"
        })
    
    # Save report
    pd.DataFrame(report_data).to_csv(filename, index=False)

@app.post("/api/validate-accounts")
async def validate_accounts(
    file: UploadFile = File(...),
    mode: str = Form(ValidationMode.REAL_TIME)
):
    try:
        # Parse the validation mode
        validation_mode = ValidationMode(mode)
        
        # Read the uploaded CSV
        content = await file.read()
        
        # Parse CSV
        df = pd.read_csv(io.BytesIO(content))
        accounts_data = df.to_dict('records')
        
        # Process accounts
        valid_accounts, invalid_accounts, duration = await process_accounts_in_batches(
            accounts_data, validation_mode
        )
        
        # Return results
        return {
            "total_accounts": len(valid_accounts) + len(invalid_accounts),
            "valid_accounts": len(valid_accounts),
            "invalid_accounts": len(invalid_accounts),
            "valid_accounts_data": valid_accounts[:100],  # Limit to first 100 for response size
            "invalid_accounts_data": invalid_accounts[:100],  # Limit to first 100 for response size
            "duration": duration
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/validate-accounts-json")
async def validate_accounts_json(request: AccountValidationRequest):
    try:
        accounts_data = []
        
        # Get accounts from CSV URL if provided
        if request.csv_url:
            response = requests.get(request.csv_url)
            response.raise_for_status()
            df = pd.read_csv(io.StringIO(response.text))
            accounts_data = df.to_dict('records')
        # Otherwise use the provided accounts list
        elif request.accounts:
            accounts_data = request.accounts
        else:
            raise HTTPException(status_code=400, detail="Either csv_url or accounts must be provided")
        
        # Process accounts
        valid_accounts, invalid_accounts, duration = await process_accounts_in_batches(
            accounts_data, request.mode
        )
        
        # Return results
        return {
            "total_accounts": len(valid_accounts) + len(invalid_accounts),
            "valid_accounts": len(valid_accounts),
            "invalid_accounts": len(invalid_accounts),
            "valid_accounts_data": valid_accounts[:100],  # Limit to first 100 for response size
            "invalid_accounts_data": invalid_accounts[:100],  # Limit to first 100 for response size
            "duration": duration
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download-results/{result_type}")
async def download_results(result_type: str):
    valid_types = ["valid", "invalid", "all", "report"]
    if result_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Result type must be one of {valid_types}")
    
    filename_map = {
        "valid": "valid_accounts.csv",
        "invalid": "invalid_accounts.csv",
        "all": "all_accounts.csv",
        "report": "validation_report.csv"
    }
    
    file_path = os.path.join(RESULTS_DIR, filename_map[result_type])
    
    if not os.path.exists(file_path):
        # Create an empty file if it doesn't exist
        if result_type == "report":
            generate_report([], [], 0, file_path)
        else:
            save_to_csv([], file_path)
    
    return FileResponse(
        path=file_path,
        filename=filename_map[result_type],
        media_type="text/csv"
    )

@app.get("/")
async def root():
    return {"message": "Account Validation API. Use /api/validate-accounts endpoint."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
