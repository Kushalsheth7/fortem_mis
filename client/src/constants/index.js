export const FY_OPTIONS = ["FY_2025-26", "FY_2026-27"];
export const FY_LABELS = { "FY_2025-26": "FY 2025-26", "FY_2026-27": "FY 2026-27" };
export const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

export const CHANNELS = [
  { id: "horeca", name: "HORECA", icon: "\uD83C\uDFE8", color: "#B45309", bg: "#FEF3C7", desc: "Hotels, Restaurants, Cafes" },
  { id: "qcom", name: "Quick Commerce", icon: "\u26A1", color: "#7C3AED", bg: "#EDE9FE", desc: "Zepto, Blinkit, Swiggy" },
  { id: "ecom", name: "E-Commerce", icon: "\uD83D\uDCE6", color: "#2563EB", bg: "#DBEAFE", desc: "Amazon, Flipkart, JioMart" },
  { id: "physical", name: "Physical Stores", icon: "\uD83C\uDFEA", color: "#059669", bg: "#D1FAE5", desc: "Nature's Basket, Retail" },
  { id: "b2b_corp", name: "B2B Corporates", icon: "\uD83C\uDFE2", color: "#475569", bg: "#F1F5F9", desc: "Offices, Institutions" },
  { id: "b2b_vending", name: "B2B Vending", icon: "\uD83D\uDCB0", color: "#0F766E", bg: "#CCFBF1", desc: "Vending machines" },
  { id: "community", name: "Community Sales", icon: "\uD83E\uDD1D", color: "#BE185D", bg: "#FCE7F3", desc: "Events, Pop-ups" },
  { id: "website", name: "Website", icon: "\uD83C\uDF10", color: "#6D28D9", bg: "#F5F3FF", desc: "oatey.in D2C" },
];

export const CH_IDS = CHANNELS.map(c => c.id);
export const CH_MAP = Object.fromEntries(CHANNELS.map(c => [c.id, c]));

export const SKUS = ["Millet", "Barista", "Chocolate", "Caramel Coffee", "Kesar Badam", "Pre Orders", "Assorted Box", "Others"];

export const OPEX_KEYS = ["employment", "director_rem", "travel", "rent", "prof_fees", "consulting", "legal", "tax_paid", "software", "internet", "office", "other_admin"];
export const OPEX_LABELS = {
  "employment": "Employee Costs", "director_rem": "Director Remuneration", "travel": "Travel & Conveyance",
  "rent": "Rent & Taxes", "prof_fees": "Professional Fees", "consulting": "Consulting Fees",
  "legal": "Legal & Audit", "tax_paid": "Tax Paid", "software": "Software",
  "internet": "Internet & Telecom", "office": "Office Expenses", "other_admin": "Other Admin"
};

export const SFIELDS = [
  { key: "date", label: "Date", req: true },
  { key: "sku", label: "SKU / Product", req: true },
  { key: "quantity", label: "Quantity", req: true },
  { key: "unit_price", label: "Unit Price (excl. GST)", req: true },
  { key: "customer_name", label: "Customer Name", req: false },
  { key: "city", label: "City / Location", req: false },
  { key: "gst", label: "Total Tax", req: false },
  { key: "cgst", label: "CGST", req: false },
  { key: "sgst", label: "SGST", req: false },
  { key: "igst", label: "IGST", req: false },
  { key: "order_id", label: "Order / Invoice ID", req: false },
];

export const K = { mis: "oatey-mis", sales: "oatey-sales", maps: "oatey-maps" };

export const TH = {
  navy: "#0C1527", slate: "#1E293B", muted: "#64748B", border: "#E2E8F0", bg: "#F8FAFC",
  card: "#FFFFFF", green: "#059669", red: "#DC2626", amber: "#D97706", blue: "#2563EB"
};

export const SKU_KW = {
  "Millet": ["millet", "millets"],
  "Barista": ["barista"],
  "Chocolate": ["chocolate", "choco", "cocoa"],
  "Caramel Coffee": ["caramel", "coffee", "cafe", "latte"],
  "Kesar Badam": ["kesar", "badam", "almond", "saffron"],
  "Pre Orders": ["pre order", "preorder", "pre-order", "advance"],
  "Assorted Box": ["assorted", "combo", "variety", "mix", "sampler", "gift", "bundle", "hamper"]
};

export const CITY_NORM = {
  "bangalore": "Bengaluru", "bengaluru": "Bengaluru", "blr": "Bengaluru",
  "bombay": "Mumbai", "mumbai": "Mumbai", "delhi": "Delhi", "new delhi": "Delhi",
  "gurgaon": "Gurugram", "gurugram": "Gurugram", "chennai": "Chennai",
  "hyderabad": "Hyderabad", "kolkata": "Kolkata", "calcutta": "Kolkata",
  "pune": "Pune", "ahmedabad": "Ahmedabad", "jaipur": "Jaipur", "lucknow": "Lucknow",
  "kochi": "Kochi", "cochin": "Kochi", "noida": "Noida", "surat": "Surat", "indore": "Indore",
  "nagpur": "Nagpur", "coimbatore": "Coimbatore", "mysore": "Mysuru", "mysuru": "Mysuru",
  "mangalore": "Mangaluru", "chandigarh": "Chandigarh", "bhopal": "Bhopal"
};

export const CITY_REGIONS = {
  "Bengaluru": "South", "Chennai": "South", "Hyderabad": "South", "Kochi": "South",
  "Coimbatore": "South", "Mysuru": "South", "Mangaluru": "South", "Mumbai": "West",
  "Pune": "West", "Ahmedabad": "West", "Surat": "West", "Nagpur": "West", "Indore": "West",
  "Bhopal": "West", "Delhi": "North", "Noida": "North", "Gurugram": "North", "Jaipur": "North",
  "Lucknow": "North", "Chandigarh": "North", "Kolkata": "East", "Patna": "East",
  "Guwahati": "East", "Bhubaneswar": "East"
};
