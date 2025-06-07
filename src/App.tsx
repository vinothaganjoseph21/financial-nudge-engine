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

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prevTransactions) =>
      prevTransactions.filter((transaction) => transaction.id !== id)
    );
  };

  useEffect(() => {
    generateNudges(transactions);
  }, [transactions]);

  const generateNudges = (currentTransactions: Transaction[]) => {
    const generated: string[] = [];

    if (currentTransactions.length < 3) {
      generated.push(
        "Add a few more transactions to start getting personalized financial nudges!"
      );
      setNudges(generated);
      return;
    }

    const monthlySpending: { [key: string]: number } = {};
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    currentTransactions.forEach((t) => {
      const transactionDate = new Date(t.date);

      if (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      ) {
        if (t.amount < 0) {
          const category = t.category;
          monthlySpending[category] =
            (monthlySpending[category] || 0) + Math.abs(t.amount);
        }
      }
    });

    if (monthlySpending["Dining Out"] && monthlySpending["Dining Out"] > 100) {
      generated.push(
        "Consider cooking at home more often! Your dining out expenses are adding up this month."
      );
    }

    const entertainmentCount = currentTransactions.filter(
      (t) =>
        t.category === "Entertainment" &&
        new Date(t.date).getMonth() === currentMonth &&
        t.amount < 0
    ).length;
    if (entertainmentCount >= 3) {
      generated.push(
        `You've had ${entertainmentCount} entertainment expenses this month. Planning your fun might help!`
      );
    }

    const totalExpenses = Object.values(monthlySpending).reduce(
      (sum, val) => sum + val,
      0
    );
    const totalIncome = currentTransactions
      .filter(
        (t) => t.amount > 0 && new Date(t.date).getMonth() === currentMonth
      )
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalIncome > 0 && totalExpenses < totalIncome / 2) {
      generated.push(
        "Great job! You're spending less than half of your income. Have you thought about setting up an automated transfer to savings?"
      );
    } else if (totalIncome === 0 && totalExpenses > 100) {
      generated.push(
        "Keep an eye on your expenses! Try to categorize everything to see where your money is going."
      );
    }

    const uniqueCategoriesSpent = new Set(
      currentTransactions
        .filter(
          (t) => t.amount < 0 && new Date(t.date).getMonth() === currentMonth
        )
        .map((t) => t.category)
    ).size;
    if (uniqueCategoriesSpent > 4 && totalExpenses > 200) {
      generated.push(
        "You're spending across many categories this month. A quick review of your recent transactions could highlight areas to optimize."
      );
    }

    if (generated.length === 0) {
      generated.push(
        "Keep tracking your transactions! We'll find some insights for you soon."
      );
    }

    setNudges(generated);
  };
}
