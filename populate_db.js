const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'db.json');

const sampleData = {
  "oatey-mis:FY_2025-26": JSON.stringify({
    "9": {
      "horeca": 50000, "qcom": 120000, "ecom": 80000, "physical": 45000,
      "b2b_corp": 30000, "b2b_vending": 15000, "community": 5000, "website": 25000,
      "units_sold": 1500, "cost_per_unit": 22, "packaging": 12000, 
      "marketplace_fees": 18000, "courier": 9000, "marketing": 35000,
      "employment": 150000, "rent": 45000, "office": 12000
    }
  }),
  "oatey-sales:FY_2025-26": JSON.stringify([
    {
      "id": "INV-001001",
      "date": "2025-10-15",
      "channel": "qcom",
      "items": [{ "sku": "Millet", "qty": 100, "price": 85, "city": "Bengaluru", "region": "South" }],
      "subtotal": 8500,
      "units": 100,
      "gst": 425,
      "status": "raised",
      "createdAt": Date.now(),
      "source": "qcom"
    },
    {
      "id": "INV-001002",
      "date": "2025-10-16",
      "channel": "horeca",
      "items": [{ "sku": "Barista", "qty": 50, "price": 95, "city": "Mumbai", "region": "West" }],
      "subtotal": 4750,
      "units": 50,
      "gst": 237.5,
      "status": "raised",
      "createdAt": Date.now(),
      "source": "horeca"
    }
  ])
};

fs.writeFileSync(dbPath, JSON.stringify(sampleData, null, 2));
console.log('Sample data populated in db.json');
