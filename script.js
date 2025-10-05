// DOM Elements
const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const type = document.getElementById('type');
const category = document.getElementById('category');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Add Transaction
form.addEventListener('submit', addTransaction);

function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please enter description and amount');
    return;
  }

  const transaction = {
    id: generateID(),
    text: text.value,
    amount: +amount.value,
    type: type.value,
    category: category.value
  };

  transactions.push(transaction);
  updateLocalStorage();
  init();
  form.reset();
}

// Generate Random ID
function generateID() {
  return Math.floor(Math.random() * 1000000);
}

// Remove Transaction
function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  init();
}

// Update Local Storage
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Add Transaction to DOM
function addTransactionDOM(transaction) {
  const sign = transaction.type === 'expense' ? '-' : '+';
  const item = document.createElement('li');
  item.classList.add(transaction.type);
  item.innerHTML = `
    ${transaction.text} [${transaction.category}] <span>${sign}$${Math.abs(transaction.amount)}</span>
    <button onclick="removeTransaction(${transaction.id})">x</button>
  `;
  list.appendChild(item);
}

// Update Balance, Income, Expense
function updateValues() {
  const amounts = transactions.map(t => t.type === 'income' ? t.amount : -t.amount);
  const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
  const income = amounts.filter(i => i > 0).reduce((acc, i) => acc + i, 0).toFixed(2);
  const expense = amounts.filter(i => i < 0).reduce((acc, i) => acc + Math.abs(i), 0).toFixed(2);

  balance.innerText = `$${total}`;
  money_plus.innerText = `+$${income}`;
  money_minus.innerText = `-$${expense}`;

  renderCharts();
}

// Initialize App
function init() {
  list.innerHTML = '';
  transactions.forEach(addTransactionDOM);
  updateValues();
}

init();

// Dark Mode Toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark');
}

// Charts
let pieChart, barChart;

function renderCharts() {
  const categories = [...new Set(transactions.map(t => t.category))];
  const catTotals = categories.map(cat => {
    return transactions
      .filter(t => t.category === cat && t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  });

  // Destroy previous chart if exists
  if (pieChart) pieChart.destroy();

  // Pie Chart - Expense by Category
  const pieCtx = document.getElementById('pieChart').getContext('2d');
  pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        data: catTotals,
        backgroundColor: categories.map(() => `hsl(${Math.random() * 360}, 70%, 60%)`)
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });

  // Bar Chart - Income vs Expense
  const incomeTotal = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  if (barChart) barChart.destroy();
  const barCtx = document.getElementById('barChart').getContext('2d');
  barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        label: 'Total Amount',
        data: [incomeTotal, expenseTotal],
        backgroundColor: ['green', 'red']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}
