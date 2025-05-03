import axios from "axios"
import type { Account, ValidationResult, ValidationMode } from "../lib/types"

// Base URL for the API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export const validateAccountsBatch = async (
  accounts: Omit<Account, "status" | "reason" | "timestamp">[],
  mode: ValidationMode,
  onProgress?: (progress: number) => void,
): Promise<ValidationResult> => {
  try {
    // Format the accounts data for the API
    const formattedAccounts = accounts.map((account) => ({
      accountNumber: account.accountNumber,
      bankCode: account.bankCode,
      // Include other fields if needed
      accountName: account.accountName || "",
      bankName: account.bankName || "",
    }))

    // Create form data for file upload
    const formData = new FormData()

    // Convert accounts to CSV format in memory
    const csvContent = accountsToCSV(formattedAccounts)
    const blob = new Blob([csvContent], { type: "text/csv" })
    const file = new File([blob], "accounts.csv", { type: "text/csv" })

    formData.append("file", file)
    formData.append("mode", mode)

    // Make the API call
    const response = await apiClient.post("/api/validate-accounts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percentCompleted)
        }
      },
    })

    // Process the response
    const result = response.data

    // Format the response to match the expected ValidationResult type
    return {
      totalRecords: result.total_accounts,
      validCount: result.valid_accounts,
      invalidCount: result.invalid_accounts,
      accounts: [
        ...formatAccounts(result.valid_accounts_data, "VALID"),
        ...formatAccounts(result.invalid_accounts_data, "INVALID"),
      ],
      timestamp: new Date().toISOString(),
      duration: result.duration || 0,
    }
  } catch (error) {
    console.error("Error validating accounts:", error)
    throw error
  }
}

export const downloadValidationResults = async (type: "valid" | "invalid" | "all" | "report") => {
  try {
    const response = await apiClient.get(`/api/download-results/${type}`, {
      responseType: "blob",
    })

    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `${type}_accounts.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error("Error downloading results:", error)
    throw error
  }
}

// Helper function to convert accounts to CSV
const accountsToCSV = (accounts: any[]): string => {
  if (accounts.length === 0) return ""

  // Get headers from the first account
  const headers = Object.keys(accounts[0])

  // Create CSV header row
  const csvRows = [headers.join(",")]

  // Add data rows
  for (const account of accounts) {
    const values = headers.map((header) => {
      const value = account[header] || ""
      // Escape commas and quotes
      return `"${String(value).replace(/"/g, '""')}"`
    })
    csvRows.push(values.join(","))
  }

  return csvRows.join("\n")
}

// Helper function to format accounts from API response
const formatAccounts = (accounts: any[], status: "VALID" | "INVALID"): Account[] => {
  if (!accounts || !Array.isArray(accounts)) return []

  return accounts.map((account) => ({
    accountNumber: account.accountNumber || account.account_number,
    bankCode: account.bankCode || account.bank_code,
    accountName: account.accountHolderName || account.account_holder_name,
    bankName: account.bankName || account.bank_name,
    status,
    reason: account.reason || (status === "INVALID" ? "Account validation failed" : ""),
    timestamp: new Date().toISOString(),
    currency: account.currency || "",
  }))
}
