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