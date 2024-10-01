// Load saved expenses from local storage when the app starts
let expenses = JSON.parse(localStorage.getItem('expenses')) || {};
let undoStack = [];  // Stack for undo functionality

// Add an expense when the button is clicked
document.getElementById('addExpenseBtn').addEventListener('click', function() {
    let product = document.getElementById('productName').value;
    let date = document.getElementById('expenseDate').value;
    let amount = parseFloat(document.getElementById('expenseAmount').value);

    if (product && date && amount) {
        let month = date.slice(0, 7);  // Get YYYY-MM from date (for monthly grouping)

        if (!expenses[month]) {
            expenses[month] = [];
        }

        // Add the expense to the corresponding month
        let expenseEntry = { date, product, amount };
        expenses[month].push(expenseEntry);

        // Push the expense entry to the undo stack
        undoStack.push({ month, expense: expenseEntry });

        // Save updated expenses to local storage
        localStorage.setItem('expenses', JSON.stringify(expenses));

        // Clear the inputs
        document.getElementById('productName').value = '';
        document.getElementById('expenseAmount').value = '';

        // Update UI
        updateExpenses();
    } else {
        alert("Please enter valid product, date, and amount.");
    }
});

// Clear all expenses for the current month
document.getElementById('clearMonthBtn').addEventListener('click', function() {
    let date = document.getElementById('expenseDate').value;

    if (!date) {
        alert("Please select a date to clear that month's expenses.");
        return;
    }

    let month = date.slice(0, 7);  // Get YYYY-MM

    if (expenses[month]) {
        if (confirm(`Are you sure you want to clear all expenses for ${month}?`)) {
            delete expenses[month];  // Remove all expenses for that month
            localStorage.setItem('expenses', JSON.stringify(expenses));
            updateExpenses();
        }
    } else {
        alert("No expenses found for the selected month.");
    }
});

// Undo the last added expense
document.getElementById('undoBtn').addEventListener('click', function() {
    if (undoStack.length === 0) {
        alert("No actions to undo.");
        return;
    }

    let lastAction = undoStack.pop();  // Get the last action
    let { month, expense } = lastAction;

    // Remove the last added expense from that month
    expenses[month] = expenses[month].filter(e => e !== expense);

    // Save updated expenses to local storage
    localStorage.setItem('expenses', JSON.stringify(expenses));

    updateExpenses();
});

// Function to update the expense tables month-wise
function updateExpenses() {
    let monthlySummary = document.getElementById('monthlySummary');
    monthlySummary.innerHTML = '';  // Clear previous content

    for (let month in expenses) {
        // Create a new section for each month
        let monthDiv = document.createElement('div');
        monthDiv.classList.add('month-table');

        let monthTitle = document.createElement('h2');
        monthTitle.textContent = `Expenses for ${month}`;
        monthDiv.appendChild(monthTitle);

        let table = document.createElement('table');
        let tableHeader = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Amount (₹)</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        table.innerHTML = tableHeader;
        let tableBody = table.querySelector('tbody');

        // Populate the table with the month's expenses
        let total = 0;
        expenses[month].forEach(expense => {
            let row = tableBody.insertRow();
            row.insertCell(0).textContent = expense.date;
            row.insertCell(1).textContent = expense.product;
            row.insertCell(2).textContent = `₹${expense.amount.toFixed(2)}`;
            total += expense.amount;
        });

        // Add the total row at the bottom of the table
        let totalRow = tableBody.insertRow();
        totalRow.classList.add('total-row');
        totalRow.insertCell(0).textContent = '';
        totalRow.insertCell(1).textContent = 'Total';
        totalRow.insertCell(2).textContent = `₹${total.toFixed(2)}`;

        // Append the table to the monthly summary section
        monthDiv.appendChild(table);
        monthlySummary.appendChild(monthDiv);
    }
}

// Load and display expenses when the page is loaded
window.onload = function() {
    updateExpenses();
};
