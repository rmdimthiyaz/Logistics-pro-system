
// ======================================
// LOGISTICSPRO - LOGISTICS MANAGEMENT
// ======================================

// Default sample data
const defaultShipments = [
  {id:"SHP1001",customer:"Arun Kumar",destination:"Chennai",date:"2026-11-05",status:"In Transit"},
  {id:"SHP1002",customer:"Ravi Traders",destination:"Trichy",date:"2026-11-05",status:"Delivered"},
  {id:"SHP1003",customer:"Priya Stores",destination:"Coimbatore",date:"2026-11-06",status:"Pending"},
  {id:"SHP1004",customer:"Kumar Agencies",destination:"Madurai",date:"2026-11-06",status:"Out for Delivery"}
];

const defaultFleet = [
  {id:"VEH101",name:"Tata Ace",driver:"Ramesh",registration:"TN45AB1234",status:"Available"},
  {id:"VEH102",name:"Ashok Leyland",driver:"Suresh",registration:"TN55CD5678",status:"On Route"}
];

const defaultWarehouse = [
  {id:"ITM101",product:"Electronics",location:"Chennai Warehouse",quantity:120},
  {id:"ITM102",product:"Clothing",location:"Trichy Warehouse",quantity:250},
  {id:"ITM103",product:"Food Products",location:"Madurai Warehouse",quantity:80}
];

const defaultOrders = [
  {id:"ORD101",customer:"Arun Kumar",product:"Electronics",amount:15000,status:"Processing"},
  {id:"ORD102",customer:"Priya Stores",product:"Clothing",amount:8500,status:"Completed"}
];

// Load data from browser storage
let shipments = JSON.parse(localStorage.getItem("lp_shipments")) || defaultShipments;
let fleet = JSON.parse(localStorage.getItem("lp_fleet")) || defaultFleet;
let warehouse = JSON.parse(localStorage.getItem("lp_warehouse")) || defaultWarehouse;
let orders = JSON.parse(localStorage.getItem("lp_orders")) || defaultOrders;

function saveData() {
  localStorage.setItem("lp_shipments", JSON.stringify(shipments));
  localStorage.setItem("lp_fleet", JSON.stringify(fleet));
  localStorage.setItem("lp_warehouse", JSON.stringify(warehouse));
  localStorage.setItem("lp_orders", JSON.stringify(orders));
}

function makeId(prefix) {
  return prefix + Date.now().toString().slice(-7);
}

// ======================================
// LOGIN AND REGISTER
// ======================================

const loginScreen = document.getElementById("loginScreen");
const app = document.getElementById("app");

function showRegister() {
  const name = prompt("Enter your name:");
  if (!name || !name.trim()) return;

  const email = prompt("Enter your email:");
  if (!email || !email.includes("@")) {
    alert("Please enter a valid email.");
    return;
  }

  const password = prompt("Create a password:");
  if (!password || password.length < 6) {
    alert("Password must contain at least 6 characters.");
    return;
  }

  localStorage.setItem("lp_user", JSON.stringify({
    name: name.trim(),
    email,
    password
  }));

  alert("Registration successful! Please login.");
}

document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const user = JSON.parse(localStorage.getItem("lp_user") || "null");

  const adminLogin =
    email === "admin@logisticspro.com" && password === "admin123";

  const registeredLogin =
    user && email === user.email && password === user.password;

  if (adminLogin || registeredLogin) {
    sessionStorage.setItem("lp_logged_in", "true");
    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");
    renderAll();
  } else {
    alert("Invalid email or password.");
  }
});

function logout() {
  sessionStorage.removeItem("lp_logged_in");
  app.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  document.getElementById("loginForm").reset();
}

document.getElementById("logoutBtn").addEventListener("click", logout);

if (sessionStorage.getItem("lp_logged_in") === "true") {
  loginScreen.classList.add("hidden");
  app.classList.remove("hidden");
}

// ======================================
// NAVIGATION
// ======================================

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(pageId).classList.add("active");

  document.querySelectorAll(".nav-item[data-page]").forEach(button => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });

  renderAll();

  document.getElementById("sidebar").classList.remove("open");
}

document.querySelectorAll(".nav-item[data-page]").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

// ======================================
// MODALS
// ======================================

function openModal(id) {
  document.getElementById(id).classList.add("show");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("show");
}

// ======================================
// SHIPMENT MANAGEMENT
// ======================================

document.getElementById("shipmentForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const editId = document.getElementById("shipmentEditId").value;

  const data = {
    customer: document.getElementById("customer").value.trim(),
    destination: document.getElementById("destination").value.trim(),
    date: document.getElementById("shipmentDate").value,
    status: document.getElementById("shipmentStatus").value
  };

  if (editId) {
    const shipment = shipments.find(s => s.id === editId);
    if (shipment) Object.assign(shipment, data);
  } else {
    shipments.push({
      id: makeId("SHP"),
      ...data
    });
  }

  saveData();
  this.reset();
  document.getElementById("shipmentEditId").value = "";
  closeModal("shipmentModal");
  renderAll();
});

function editShipment(id) {
  const s = shipments.find(item => item.id === id);
  if (!s) return;

  document.getElementById("shipmentEditId").value = s.id;
  document.getElementById("customer").value = s.customer;
  document.getElementById("destination").value = s.destination;
  document.getElementById("shipmentDate").value = s.date;
  document.getElementById("shipmentStatus").value = s.status;

  openModal("shipmentModal");
}

function deleteShipment(id) {
  if (!confirm("Are you sure you want to delete this shipment?")) return;

  shipments = shipments.filter(s => s.id !== id);
  saveData();
  renderAll();
}

function renderShipments() {
  const tbody = document.getElementById("shipmentTable");

  tbody.innerHTML = shipments.map(s => `
    <tr>
      <td>${escapeHTML(s.id)}</td>
      <td>${escapeHTML(s.customer)}</td>
      <td>${escapeHTML(s.destination)}</td>
      <td>${escapeHTML(s.date)}</td>
      <td><span class="badge">${escapeHTML(s.status)}</span></td>
      <td>
        <button class="small-btn" onclick="editShipment('${s.id}')">Edit</button>
        <button class="action-btn" onclick="deleteShipment('${s.id}')">Delete</button>
      </td>
    </tr>
  `).join("");

  if (!shipments.length) {
    tbody.innerHTML = '<tr><td colspan="6">No shipments found.</td></tr>';
  }
}

document.getElementById("shipmentSearch").addEventListener("input", function() {
  const query = this.value.toLowerCase();

  const filtered = shipments.filter(s =>
    [s.id, s.customer, s.destination, s.status]
      .some(value => value.toLowerCase().includes(query))
  );

  document.getElementById("shipmentTable").innerHTML =
    filtered.map(s => `
      <tr>
        <td>${escapeHTML(s.id)}</td>
        <td>${escapeHTML(s.customer)}</td>
        <td>${escapeHTML(s.destination)}</td>
        <td>${escapeHTML(s.date)}</td>
        <td><span class="badge">${escapeHTML(s.status)}</span></td>
        <td>
          <button class="small-btn" onclick="editShipment('${s.id}')">Edit</button>
          <button class="action-btn" onclick="deleteShipment('${s.id}')">Delete</button>
        </td>
      </tr>
    `).join("") || '<tr><td colspan="6">No results found.</td></tr>';
});

// ======================================
// FLEET MANAGEMENT
// ======================================

document.getElementById("fleetForm").addEventListener("submit", function(e) {
  e.preventDefault();

  fleet.push({
    id: makeId("VEH"),
    name: document.getElementById("vehicleName").value.trim(),
    driver: document.getElementById("driverName").value.trim(),
    registration: document.getElementById("registration").value.trim(),
    status: document.getElementById("vehicleStatus").value
  });

  saveData();
  this.reset();
  closeModal("fleetModal");
  renderAll();
});

function deleteVehicle(id) {
  if (!confirm("Delete this vehicle?")) return;
  fleet = fleet.filter(v => v.id !== id);
  saveData();
  renderAll();
}

function renderFleet() {
  document.getElementById("fleetTable").innerHTML = fleet.map(v => `
    <tr>
      <td>${escapeHTML(v.id)}</td>
      <td>${escapeHTML(v.name)}</td>
      <td>${escapeHTML(v.driver)}</td>
      <td>${escapeHTML(v.registration)}</td>
      <td><span class="badge">${escapeHTML(v.status)}</span></td>
      <td><button class="action-btn" onclick="deleteVehicle('${v.id}')">Delete</button></td>
    </tr>
  `).join("") || '<tr><td colspan="6">No vehicles found.</td></tr>';
}

// ======================================
// WAREHOUSE MANAGEMENT
// ======================================

document.getElementById("warehouseForm").addEventListener("submit", function(e) {
  e.preventDefault();

  warehouse.push({
    id: makeId("ITM"),
    product: document.getElementById("productName").value.trim(),
    location: document.getElementById("warehouseLocation").value.trim(),
    quantity: Number(document.getElementById("quantity").value)
  });

  saveData();
  this.reset();
  closeModal("warehouseModal");
  renderAll();
});

function deleteStock(id) {
  if (!confirm("Delete this inventory item?")) return;
  warehouse = warehouse.filter(item => item.id !== id);
  saveData();
  renderAll();
}

function renderWarehouse() {
  document.getElementById("warehouseTable").innerHTML =
    warehouse.map(item => `
      <tr>
        <td>${escapeHTML(item.id)}</td>
        <td>${escapeHTML(item.product)}</td>
        <td>${escapeHTML(item.location)}</td>
        <td>${item.quantity}</td>
        <td><button class="action-btn" onclick="deleteStock('${item.id}')">Delete</button></td>
      </tr>
    `).join("") || '<tr><td colspan="5">No inventory found.</td></tr>';
}

// ======================================
// ORDER MANAGEMENT
// ======================================

document.getElementById("orderForm").addEventListener("submit", function(e) {
  e.preventDefault();

  orders.push({
    id: makeId("ORD"),
    customer: document.getElementById("orderCustomer").value.trim(),
    product: document.getElementById("orderProduct").value.trim(),
    amount: Number(document.getElementById("orderAmount").value),
    status: document.getElementById("orderStatus").value
  });

  saveData();
  this.reset();
  closeModal("orderModal");
  renderAll();
});

function deleteOrder(id) {
  if (!confirm("Delete this order?")) return;
  orders = orders.filter(o => o.id !== id);
  saveData();
  renderAll();
}

function renderOrders() {
  document.getElementById("orderTable").innerHTML =
    orders.map(o => `
      <tr>
        <td>${escapeHTML(o.id)}</td>
        <td>${escapeHTML(o.customer)}</td>
        <td>${escapeHTML(o.product)}</td>
        <td>₹${o.amount.toLocaleString("en-IN")}</td>
        <td><span class="badge">${escapeHTML(o.status)}</span></td>
        <td><button class="action-btn" onclick="deleteOrder('${o.id}')">Delete</button></td>
      </tr>
    `).join("") || '<tr><td colspan="6">No orders found.</td></tr>';
}

// ======================================
// ROUTE PLANNING - SIMULATED
// ======================================

function planRoute() {
  const from = document.getElementById("routeFrom").value.trim();
  const to = document.getElementById("routeTo").value.trim();

  if (!from || !to) {
    alert("Please enter both locations.");
    return;
  }

  if (from.toLowerCase() === to.toLowerCase()) {
    alert("Starting point and destination must be different.");
    return;
  }

  document.getElementById("routeResult").innerHTML = `
    <strong>Delivery Route Planned!</strong><br>
    📍 Starting Point: ${escapeHTML(from)}<br>
    🚚 Destination: ${escapeHTML(to)}<br>
    ✓ Route status: Planned<br>
    <small>This is a simulated route. Actual distance is not calculated.</small>
  `;
}

// ======================================
// SHIPMENT TRACKING
// ======================================

function trackShipment() {
  const id = document.getElementById("trackingId").value.trim().toLowerCase();

  if (!id) {
    alert("Please enter a shipment ID.");
    return;
  }

  const s = shipments.find(item => item.id.toLowerCase() === id);
  const result = document.getElementById("trackingResult");

  if (!s) {
    result.textContent = "Shipment not found. Please check the ID.";
    return;
  }

  result.innerHTML = `
    <h3>Shipment Details</h3>
    <strong>Shipment ID:</strong> ${escapeHTML(s.id)}<br>
    <strong>Customer:</strong> ${escapeHTML(s.customer)}<br>
    <strong>Destination:</strong> ${escapeHTML(s.destination)}<br>
    <strong>Date:</strong> ${escapeHTML(s.date)}<br>
    <strong>Status:</strong> <span class="badge">${escapeHTML(s.status)}</span>
    <br><br>
    <strong>Tracking Timeline</strong><br>
    📦 Shipment Created<br>
    🚚 ${escapeHTML(s.status)}
  `;
}

// ======================================
// DASHBOARD AND REPORTS
// ======================================

function renderDashboard() {
  const count = status =>
    shipments.filter(s => s.status === status).length;

  document.getElementById("totalShipments").textContent = shipments.length;
  document.getElementById("transitCount").textContent = count("In Transit");
  document.getElementById("deliveredCount").textContent = count("Delivered");
  document.getElementById("totalOrders").textContent = orders.length;

  const statuses = [
    "Pending", "In Transit", "Out for Delivery",
    "Delivered", "Cancelled"
  ];

  document.getElementById("dashboardStatuses").innerHTML =
    statuses.map(status => `
      <div class="status-box">
        <strong>${count(status)}</strong>
        <small>${status}</small>
      </div>
    `).join("");

  document.getElementById("recentShipments").innerHTML =
    shipments.slice(-5).reverse().map(s => `
      <tr>
        <td>${escapeHTML(s.id)}</td>
        <td>${escapeHTML(s.customer)}</td>
        <td>${escapeHTML(s.destination)}</td>
        <td><span class="badge">${escapeHTML(s.status)}</span></td>
      </tr>
    `).join("") || '<tr><td colspan="4">No shipments available.</td></tr>';
}

function renderReports() {
  const count = status =>
    shipments.filter(s => s.status === status).length;

  document.getElementById("reportTotal").textContent = shipments.length;
  document.getElementById("reportDelivered").textContent = count("Delivered");
  document.getElementById("reportPending").textContent = count("Pending");
  document.getElementById("reportVehicles").textContent = fleet.length;

  const statuses = [
    "Pending", "In Transit", "Out for Delivery",
    "Delivered", "Cancelled"
  ];

  document.getElementById("reportBars").innerHTML =
    statuses.map(status => {
      const value = count(status);
      const percentage = shipments.length
        ? (value / shipments.length) * 100
        : 0;

      return `
        <div class="report-row">
          <div><span>${status}</span><strong>${value}</strong></div>
          <div class="bar-bg">
            <div class="bar-fill" style="width:${percentage}%"></div>
          </div>
        </div>
      `;
    }).join("");
}

// ======================================
// CSV EXPORT
// ======================================

function exportCSV() {
  if (!shipments.length) {
    alert("No shipment data to export.");
    return;
  }

  const rows = [
    ["Shipment ID", "Customer", "Destination", "Date", "Status"],
    ...shipments.map(s => [
      s.id, s.customer, s.destination, s.date, s.status
    ])
  ];

  const csv = rows.map(row =>
    row.map(value =>
      '"' + String(value).replace(/"/g, '""') + '"'
    ).join(",")
  ).join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "LogisticsPro_Shipment_Report.csv";
  link.click();

  URL.revokeObjectURL(url);
}

// ======================================
// DARK MODE
// ======================================

document.getElementById("themeBtn").addEventListener("click", function() {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");

  localStorage.setItem("lp_dark_mode", isDark);
  this.textContent = isDark ? "☀ Light Mode" : "◐ Dark Mode";
});

if (localStorage.getItem("lp_dark_mode") === "true") {
  document.body.classList.add("dark");
  document.getElementById("themeBtn").textContent = "☀ Light Mode";
}

// ======================================
// SECURITY HELPER FOR DISPLAY TEXT
// ======================================

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// ======================================
// RENDER ALL MODULES
// ======================================

function renderAll() {
  saveData();
  renderDashboard();
  renderShipments();
  renderFleet();
  renderWarehouse();
  renderOrders();
  renderReports();
}

// Show today's date
document.getElementById("today").textContent =
  new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

// Initial rendering
renderAll();
