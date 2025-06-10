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
  const [whatIfSavingAmount, setWhatIfSavingAmount] = useState<number | "">("");
  const [projectedSavings, setProjectedSavings] = useState<number | null>(null);

  const [predictiveTrends, setPredictiveTrends] = useState<{
    [category: string]: number;
  }>({});

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
    calculatePredictiveTrends(transactions);
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

  const calculatePredictiveTrends = (currentTransactions: Transaction[]) => {
    const spendingByMonthCategory: {
      [monthYear: string]: { [category: string]: number };
    } = {};

    currentTransactions.forEach((t) => {
      if (t.amount < 0) {
        const transactionDate = new Date(t.date);
        const monthYear = `${transactionDate.getFullYear()}-${transactionDate.getMonth()}`;
        const category = t.category;

        if (!spendingByMonthCategory[monthYear]) {
          spendingByMonthCategory[monthYear] = {};
        }
        spendingByMonthCategory[monthYear][category] =
          (spendingByMonthCategory[monthYear][category] || 0) +
          Math.abs(t.amount);
      }
    });

    const categoryMonthlyAverages: {
      [category: string]: { total: number; count: number };
    } = {};
    const monthsConsidered: Set<string> = new Set();

    for (const monthYear in spendingByMonthCategory) {
      monthsConsidered.add(monthYear);
      for (const category in spendingByMonthCategory[monthYear]) {
        if (!categoryMonthlyAverages[category]) {
          categoryMonthlyAverages[category] = { total: 0, count: 0 };
        }
        categoryMonthlyAverages[category].total +=
          spendingByMonthCategory[monthYear][category];
        categoryMonthlyAverages[category].count++;
      }
    }

    const projected: { [category: string]: number } = {};
    if (monthsConsidered.size > 0) {
      for (const category in categoryMonthlyAverages) {
        projected[category] =
          categoryMonthlyAverages[category].total / monthsConsidered.size;
      }
    }

    setPredictiveTrends(projected);
  };

  const handleCalculateWhatIf = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      typeof whatIfSavingAmount !== "number" ||
      isNaN(whatIfSavingAmount) ||
      whatIfSavingAmount <= 0
    ) {
      console.error(
        "Please enter a valid positive saving amount for the What If scenario."
      );
      setProjectedSavings(null);
      return;
    }

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const currentMonthIncome = transactions
      .filter(
        (t) =>
          t.amount > 0 &&
          new Date(t.date).getMonth() === currentMonth &&
          new Date(t.date).getFullYear() === currentYear
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const currentMonthExpenses = transactions
      .filter(
        (t) =>
          t.amount < 0 &&
          new Date(t.date).getMonth() === currentMonth &&
          new Date(t.date).getFullYear() === currentYear
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const currentMonthlyNet = currentMonthIncome - currentMonthExpenses;

    const projectedSixMonthSavings =
      (currentMonthlyNet + whatIfSavingAmount) * 6;
    setProjectedSavings(projectedSixMonthSavings);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Financial Nudge Engine</h1>
        <p>Your personal assistant for smarter spending.</p>
      </header>

      <main className="main-content">
        <section className="transaction-form-section card">
          <h2>Add New Transaction</h2>
          <form onSubmit={handleAddTransaction} className="transaction-form">
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Coffee, Bus fare, Paycheck"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount (£):</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || "")}
                placeholder="e.g., 4.50 or -20.00 (for expense) or 500.00 (for income)"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-add-transaction">
              Add Transaction
            </button>
          </form>
        </section>

        <section className="nudges-section card">
          <h2>Your Financial Nudges</h2>
          {nudges.length === 0 ? (
            <p className="no-nudges-message">
              No nudges yet, add more transactions to see insights!
            </p>
          ) : (
            <ul className="nudges-list">
              {nudges.map((nudge, index) => (
                <li key={index} className="nudge-item">
                  <span className="nudge-icon">&#128161;</span> {nudge}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="predictive-trends-section card">
          <h2>Predictive Spending Trends</h2>
          {Object.keys(predictiveTrends).length === 0 ? (
            <p className="no-trends-message">
              Add more transactions across different months to see predictive
              spending trends.
            </p>
          ) : (
            <ul className="trends-list">
              {Object.entries(predictiveTrends).map(([cat, avgAmount]) => (
                <li key={cat} className="trend-item">
                  Based on your past spending, you are projected to spend
                  approximately{" "}
                  <span className="trend-amount">£{avgAmount.toFixed(2)}</span>{" "}
                  on <span className="trend-category">{cat}</span> next month.
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="what-if-section card">
          <h2>What If Scenarios</h2>
          <form onSubmit={handleCalculateWhatIf} className="what-if-form">
            <div className="form-group">
              <label htmlFor="whatIfSaving">
                What if I save an extra amount each month? (£):
              </label>
              <input
                type="number"
                id="whatIfSaving"
                value={whatIfSavingAmount}
                onChange={(e) =>
                  setWhatIfSavingAmount(parseFloat(e.target.value) || "")
                }
                placeholder="e.g., 50"
                step="0.01"
                required
              />
            </div>
            <button type="submit" className="btn-what-if">
              Calculate Impact
            </button>
          </form>

          {projectedSavings !== null && (
            <div className="what-if-result">
              <p>
                In 6 months, with an extra £{whatIfSavingAmount} saved per
                month, you could have approximately:
              </p>
              <p className="projected-amount">£{projectedSavings.toFixed(2)}</p>
              <p className="result-note">
                {" "}
                (This projection is based on your current month's average net
                income.)
              </p>
            </div>
          )}
        </section>

        <section className="transaction-list-section card">
          <h2>Your Transactions</h2>
          {transactions.length === 0 ? (
            <p className="no-transactions-message">
              No transactions yet. Add some to get started!
            </p>
          ) : (
            <ul className="transaction-list">
              {transactions.map((transaction) => (
                <li key={transaction.id} className="transaction-item">
                  <div className="transaction-details">
                    <span className="transaction-date">{transaction.date}</span>
                    <span className="transaction-description">
                      {transaction.description}
                    </span>
                    <span className="transaction-category">
                      ({transaction.category})
                    </span>
                  </div>
                  <div className="transaction-amount">
                    <span
                      className={
                        transaction.amount > 0
                          ? "amount-income"
                          : "amount-expense"
                      }
                    >
                      £{transaction.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="btn-delete-transaction"
                      title="Delete transaction"
                    >
                      &times;
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
