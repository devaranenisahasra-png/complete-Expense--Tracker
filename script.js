
const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expensesEl = document.getElementById("expenses");

const listEl = document.getElementById("transaction-list");
const emptyState = document.getElementById("empty-state");
const filterEl = document.getElementById("filter");
const clearAllButton = document.getElementById("clear-all");
const messageEl = document.getElementById("message");

let transactions = loadTransactions();

function loadTransactions() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("expenseTrackerTransactions") || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(
    "expenseTrackerTransactions",
    JSON.stringify(transactions)
  );
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(amount);
}

function renderSummary() {
  const income = transactions
    .filter(item => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const expenses = transactions
    .filter(item => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  incomeEl.textContent = formatCurrency(income);
  expensesEl.textContent = formatCurrency(expenses);
  balanceEl.textContent = formatCurrency(income - expenses);
}

function renderTransactions() {
  const filter = filterEl.value;

  const visibleTransactions = transactions.filter(item =>
    filter === "all" || item.type === filter
  );

  listEl.replaceChildren();
  emptyState.hidden = visibleTransactions.length > 0;

  visibleTransactions.slice().reverse().forEach(item => {
    const li = document.createElement("li");
    li.className = "transaction-item";

    const icon = document.createElement("div");
    icon.className = "transaction-icon";
    icon.textContent = item.type === "income" ? "↙" : "↗";
    icon.setAttribute("aria-hidden", "true");

    const main = document.createElement("div");
    main.className = "transaction-main";

    const title = document.createElement("strong");
    title.textContent = item.description;

    const date = document.createElement("small");
    date.textContent = new Date(item.createdAt).toLocaleDateString(
      "en-IN",
      { day: "numeric", month: "short", year: "numeric" }
    );

    main.append(title, date);

    const amount = document.createElement("div");
    amount.className = `transaction-amount ${item.type}`;
    amount.textContent =
      `${item.type === "income" ? "+" : "−"}${formatCurrency(item.amount)}`;

    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Delete ${item.description}`);

    remove.addEventListener("click", () => {
      deleteTransaction(item.id);
    });

    li.append(icon, main, amount, remove);
    listEl.appendChild(li);
  });
}

function render() {
  renderSummary();
  renderTransactions();
}

function deleteTransaction(id) {
  transactions = transactions.filter(item => item.id !== id);
  saveTransactions();
  render();
  messageEl.textContent = "Transaction deleted.";
}

form.addEventListener("submit", function(event) {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const type = typeInput.value;

  if (!description || !Number.isFinite(amount) || amount <= 0) {
    messageEl.textContent =
      "Please enter a description and an amount greater than zero.";
    return;
  }

  transactions.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    description: description,
    amount: amount,
    type: type,
    createdAt: new Date().toISOString()
  });

  saveTransactions();
  render();

  form.reset();
  messageEl.textContent = "Transaction added successfully!";
  descriptionInput.focus();
});

filterEl.addEventListener("change", renderTransactions);

clearAllButton.addEventListener("click", function() {
  if (transactions.length === 0) {
    messageEl.textContent = "There are no transactions to clear.";
    return;
  }

  if (confirm("Are you sure you want to delete all transactions?")) {
    transactions = [];
    saveTransactions();
    render();
    messageEl.textContent = "All transactions cleared.";
  }
});

render();
