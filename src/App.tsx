import React, { useState, useEffect } from "react";
import "./App.css";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState("");

  const [nudges, setNudges] = useState<string[]>([]);

  const categories = [
    "Groceries",
    "Transport",
    "Dining Out",
    "Entertainment",
    "Utilities",
    "Salary",
    "Rent",
    "Other",
  ];

  const handleAddTransaction = (event: React.FormEvent) => {
    event.preventDefault();

    if (!description || amount === "" || !category) {
      console.error("Please fill in all transaction details.");
      return;
    }
    if (typeof amount !== "number" || isNaN(amount) || amount === 0) {
      console.error("Please enter a valid non-zero amount.");
      return;
    }

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      description,
      amount,
      category,
      date: new Date().toISOString().split("T")[0],
    };

    setTransactions((prevTransactions) => [
      ...prevTransactions,
      newTransaction,
    ]);

    setDescription("");
    setAmount("");
    setCategory("");
  };