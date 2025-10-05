import { useEffect, useState } from 'react'

const STORAGE_KEY = 'transactions_v1'

export default function useTransactions() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      console.error('Failed to read transactions from storage', e)
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
    } catch (e) {
      console.error('Failed to write transactions to storage', e)
    }
  }, [transactions])

  const addTransaction = (tx) => {
    setTransactions(prev => [tx, ...prev])
  }

  const updateTransaction = (id, updates) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const clearAll = () => setTransactions([])

  return { transactions, addTransaction, updateTransaction, deleteTransaction, clearAll, setTransactions }
}
