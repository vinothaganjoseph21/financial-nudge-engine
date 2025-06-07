import React, { useState, useEffect } from "react";
import "./App.css";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}
