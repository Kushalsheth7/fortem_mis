const XLSX = require('xlsx');
const path = require('path');

// Configuration for sample data
const SKUS = ["Millet Drink 200ml", "Barista Blend Oat Milk", "Dark Chocolate Oat Milk", "Caramel Coffee Cold Brew", "Kesar Badam Delight", "Assorted Gift Box (Pack of 6)", "Premium Oat Milk (Others)"];
const CITIES = ["Mumbai", "Bangalore", "New Delhi", "Chennai", "Hyderabad", "Pune", "Gurgaon"];
const CUSTOMERS = ["Zomato Hyperpure", "Nature's Basket", "Swiggy Instamart", "Amazon Fresh", "Reliance Retail", "Starbucks India", "Blue Tokai"];

const data = [];

// Generate 50 sample rows across different months
for (let i = 0; i < 50; i++) {
    const month = Math.floor(Math.random() * 3) + 1; // Jan, Feb, Mar (to match FY ending)
    const day = Math.floor(Math.random() * 28) + 1;
    const year = 2026;
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const sku = SKUS[Math.floor(Math.random() * SKUS.length)];
    const qty = Math.floor(Math.random() * 50) + 5;
    const price = Math.floor(Math.random() * 100) + 150;
    const gst = Math.round(qty * price * 0.18 * 100) / 100;
    
    data.push({
        "Order Date": date,
        "Product Description": sku,
        "Quantity Sold": qty,
        "Unit Price (Excl Tax)": price,
        "Customer Name": CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)],
        "Shipping City": CITIES[Math.floor(Math.random() * CITIES.length)],
        "Total GST": gst,
        "Order ID": "ORD-" + (10000 + i)
    });
}

// Create a new workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(data);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(wb, ws, "Sales Report");

// Write to file
const filePath = path.join(__dirname, 'Sample_Sales_Report.xlsx');
XLSX.writeFile(wb, filePath);

console.log(`\u2705 Success! Test data generated at: ${filePath}`);
console.log("\uD83D\uDCA1 This file contains:");
console.log("- 50 randomized sales records");
console.log("- Variations in SKU names to test auto-detection");
console.log("- Dates spread across Jan, Feb, and March");
