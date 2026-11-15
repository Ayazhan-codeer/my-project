let transactions = [];
let totalIncome = 0;
let totalSpent = 0;
let expenseLimit = 5000;

let expenseChart = null;
let budgetChart = null;

function showNotification(message) {
    if (Notification.permission === "granted") {
        new Notification(message);
    } else {
        alert(message); 
    }
}

document.getElementById("income-form").addEventListener("submit", function (e) { //обработчик событий
    e.preventDefault();

    const incomeAmount = parseFloat(document.getElementById("income-amount").value);
    const incomeComment = document.getElementById("income-comment").value;

    if (isNaN(incomeAmount) || incomeAmount <= 0) {
        alert("Please enter a valid income amount!");
        return;
    }

    const transaction = {
        type: "Income",
        amount: incomeAmount,
        category: "N/A",
        comment: incomeComment || "No comment",
        date: new Date().toLocaleDateString(),
    };

    transactions.push(transaction);
    totalIncome += incomeAmount;

    updateUI();

    document.getElementById("income-form").reset();
});

document.getElementById("expense-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const category = document.getElementById("expense-category").value;
    const expenseAmount = parseFloat(document.getElementById("expense-amount").value);
    const expenseComment = document.getElementById("expense-comment").value;

    if (isNaN(expenseAmount) || expenseAmount <= 0) {
        alert("Please enter a valid expense amount!");
        return;
    }

    const transaction = {
        type: "Expense",
        amount: expenseAmount,
        category,
        comment: expenseComment || "No comment",
        date: new Date().toLocaleDateString(),
    };

    transactions.push(transaction);
    totalSpent += expenseAmount;

    if (totalSpent >= expenseLimit) {
        showNotification(`Warning: Your spending has reached or exceeded the limit of $${expenseLimit}!`);
    }

    updateUI();

    document.getElementById("expense-form").reset();
});

function deleteTransaction(index) {
    const transaction = transactions[index];
    if (transaction.type === "Income") {
        totalIncome -= transaction.amount;
    } else {
        totalSpent -= transaction.amount;
    }
    transactions.splice(index, 1); 
    updateUI();
}

function editTransaction(index) {
    const transaction = transactions[index];

    if (transaction.type === "Income") {
        document.getElementById("income-amount").value = transaction.amount;
        document.getElementById("income-comment").value = transaction.comment;
    } else {
        document.getElementById("expense-category").value = transaction.category;
        document.getElementById("expense-amount").value = transaction.amount;
        document.getElementById("expense-comment").value = transaction.comment;
    }

    deleteTransaction(index);
}

function updateUI() {
    const transactionsList = document.getElementById("transactions-list");
    const incomeTotalElement = document.getElementById("income-total");
    const spentTotalElement = document.getElementById("spent-total");
    const remainingTotalElement = document.getElementById("remaining-total");

    transactionsList.innerHTML = "";

    const remaining = totalIncome - totalSpent;

    incomeTotalElement.textContent = totalIncome.toFixed(2);
    spentTotalElement.textContent = totalSpent.toFixed(2);
    remainingTotalElement.textContent = remaining.toFixed(2);

    transactions.forEach((transaction, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${transaction.type}</td>
            <td>$${transaction.amount.toFixed(2)}</td>
            <td>${transaction.category}</td>
            <td>${transaction.date}</td>
            <td>${transaction.comment}</td>
            <td>
                <button class="edit-btn" onclick="editTransaction(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteTransaction(${index})">Delete</button>
            </td>
        `;
        transactionsList.appendChild(row);
    });

    updateCategoryTotals();
    updateExpenseChart();
    updateBudgetChart();
}

function getCategoryTotal(category) {
    return transactions
        .filter((t) => t.type === "Expense" && t.category === category)
        .reduce((sum, t) => sum + t.amount, 0);
}

function updateCategoryTotals() {
    document.getElementById("food-total").textContent = getCategoryTotal("Food").toFixed(2);
    document.getElementById("entertainment-total").textContent = getCategoryTotal("Entertainment").toFixed(2);
    document.getElementById("education-total").textContent = getCategoryTotal("Education").toFixed(2);
}

function updateExpenseChart() {
    const foodTotal = getCategoryTotal("Food");
    const entertainmentTotal = getCategoryTotal("Entertainment");
    const educationTotal = getCategoryTotal("Education");

    const data = [foodTotal, entertainmentTotal, educationTotal];
    const labels = ["Food", "Entertainment", "Education"];
    const colors = ["#ff7f50", "#7fffd4", "#6495ed"];

    if (expenseChart) {
        expenseChart.destroy();
    }

    const ctx = document.getElementById("expense-chart").getContext("2d");
    expenseChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: colors,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
            },
        },
    });
}

function updateBudgetChart() {
    const remaining = totalIncome - totalSpent;

    const data = [totalSpent, remaining];
    const labels = ["Spent", "Remaining"];
    const colors = ["#ff4d4d", "#28a745"];

    if (budgetChart) {
        budgetChart.destroy();
    }

    const ctx = document.getElementById("budget-chart").getContext("2d");
    budgetChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: colors,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
            },
        },
    });
}
