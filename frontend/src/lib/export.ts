import { format } from 'date-fns';
import { Expense } from './api';

export const exportToCSV = (expenses: Expense[], filename: string = 'expenses.csv') => {
  // Create CSV header
  const headers = ['Date', 'Category', 'Description', 'Amount'];
  
  // Create CSV rows
  const rows = expenses.map(expense => [
    format(new Date(expense.date), 'yyyy-MM-dd'),
    expense.category?.name || 'Unknown',
    expense.description || '',
    expense.amount.toFixed(2)
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (expenses: Expense[], filename: string = 'expenses.pdf') => {
  // For now, we'll create a simple HTML-based PDF export
  // In production, you'd use jsPDF or similar library
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Expense Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #4F46E5; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; }
      </style>
    </head>
    <body>
      <h1>Expense Report</h1>
      <p>Generated on: ${format(new Date(), 'MMMM dd, yyyy')}</p>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${expenses.map(expense => `
            <tr>
              <td>${format(new Date(expense.date), 'MMM dd, yyyy')}</td>
              <td>${expense.category?.icon} ${expense.category?.name || 'Unknown'}</td>
              <td>${expense.description || '-'}</td>
              <td>$${expense.amount.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="total">
        Total Expenses: $${expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
      </div>
    </body>
    </html>
  `;
  
  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};
