# Inventory ERP System — Blueprint

> **Purpose:** Demo & pitching content. Backend: Google Sheets + Google Apps Script. Frontend: SPA terpisah, mobile-responsive, PWA-ready.
> **Apps Script Deployment URL:** `https://script.google.com/macros/s/AKfycbyuOBOy7ie9qIfUq0FeEMJPvs2IkyIJdHAwV2_-7be5zdkN89YT8h6KVy69GrwWHW2U/exec`

---

## 1. Tech Stack Recommendation (FE — di luar blueprint ini, hanya referensi)

| Layer | Stack |
|---|---|
| Framework | Alpine.js + HTMX atau Vue 3 (Vite) |
| Styling | Tailwind CSS v4 |
| Icons | Tabler Icons |
| Font | Geist |
| PWA | Vite PWA Plugin / manual manifest |
| Layout Mobile | Bottom Navbar (5 item max) |
| Layout Desktop | Side Menu collapsible |
| HTTP Client | fetch() native / axios |
| State | Alpine.js store / Pinia (Vue) |
| Host | Netlify / CF Pages |

---

## 2. Google Sheets — Struktur Sheet (Tab)

Setiap tab merepresentasikan satu "tabel". Semua sheet dibuat otomatis oleh fungsi `initializeSheets()` di `Code.gs`.

### Sheet List

| No | Sheet Name | Keterangan |
|---|---|---|
| 1 | `users` | Data user & role |
| 2 | `categories` | Master kategori item |
| 3 | `brands` | Master brand item |
| 4 | `units` | Master satuan item |
| 5 | `items` | Master item/barang |
| 6 | `suppliers` | Master supplier |
| 7 | `warehouses` | Master gudang / project |
| 8 | `stock` | Stock aktual per item per lokasi |
| 9 | `request_items` | Request pembelian/kebutuhan item |
| 10 | `request_item_details` | Detail line item dari request |
| 11 | `receipt_items` | Penerimaan barang dari supplier |
| 12 | `receipt_item_details` | Detail line item dari receipt |
| 13 | `stock_transfers` | Header transfer stock antar lokasi |
| 14 | `stock_transfer_details` | Detail bulk item dalam transfer |
| 15 | `stock_opnames` | Header opname / adjust stock |
| 16 | `stock_opname_details` | Detail bulk item dalam opname |
| 17 | `stock_usages` | Penggunaan stock di project |
| 18 | `stock_usage_details` | Detail item yang digunakan |
| 19 | `activity_log` | Log semua aktivitas sistem |

---

## 3. Struktur Kolom Per Sheet

### `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| name | STRING | Nama lengkap |
| email | STRING | Email (unique) |
| password_hash | STRING | Hash password sederhana |
| role | ENUM | `manager` / `admin` |
| is_active | BOOLEAN | Status aktif |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `categories`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| name | STRING | Nama kategori |
| description | STRING | Deskripsi opsional |
| is_active | BOOLEAN | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `brands`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| name | STRING | Nama brand |
| description | STRING | |
| is_active | BOOLEAN | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `units`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| name | STRING | pcs, kg, liter, box, dll |
| abbreviation | STRING | Singkatan: pcs, kg, L |
| is_active | BOOLEAN | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `items`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| code | STRING | Kode item (unik) |
| name | STRING | Nama item |
| category_id | STRING | FK → categories.id |
| brand_id | STRING | FK → brands.id |
| unit_id | STRING | FK → units.id |
| description | STRING | |
| min_stock | NUMBER | Minimum stock alert |
| is_active | BOOLEAN | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `suppliers`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| code | STRING | Kode supplier |
| name | STRING | Nama supplier/perusahaan |
| contact_person | STRING | Nama PIC |
| phone | STRING | |
| email | STRING | |
| address | STRING | |
| is_active | BOOLEAN | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `warehouses`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| code | STRING | Kode lokasi |
| name | STRING | Nama gudang atau proyek |
| type | ENUM | `warehouse` / `project` |
| location | STRING | Alamat/lokasi fisik |
| person_in_charge | STRING | PIC lokasi |
| is_active | BOOLEAN | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `stock`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| item_id | STRING | FK → items.id |
| warehouse_id | STRING | FK → warehouses.id |
| quantity | NUMBER | Jumlah stock saat ini |
| updated_at | DATETIME | |

> **Constraint:** Kombinasi `item_id + warehouse_id` harus unik.

### `request_items`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| request_number | STRING | Auto-generate: REQ-YYYYMMDD-XXX |
| requested_by | STRING | FK → users.id |
| warehouse_id | STRING | FK → warehouses.id (tujuan) |
| notes | STRING | Catatan request |
| status | ENUM | `draft` / `submitted` / `approved` / `rejected` |
| submitted_at | DATETIME | |
| approved_by | STRING | FK → users.id (manager) |
| approved_at | DATETIME | |
| rejection_reason | STRING | Alasan jika ditolak |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `request_item_details`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| request_id | STRING | FK → request_items.id |
| item_id | STRING | FK → items.id |
| quantity_requested | NUMBER | |
| notes | STRING | |

### `receipt_items`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| receipt_number | STRING | Auto-generate: RCV-YYYYMMDD-XXX |
| request_id | STRING | FK → request_items.id (opsional) |
| supplier_id | STRING | FK → suppliers.id |
| warehouse_id | STRING | FK → warehouses.id (tujuan penerima) |
| received_by | STRING | FK → users.id |
| receipt_date | DATE | |
| notes | STRING | |
| status | ENUM | `draft` / `confirmed` |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `receipt_item_details`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| receipt_id | STRING | FK → receipt_items.id |
| item_id | STRING | FK → items.id |
| quantity_received | NUMBER | |
| notes | STRING | |

> **Saat receipt di-confirm:** quantity di sheet `stock` untuk `item_id + warehouse_id` bertambah.

### `stock_transfers`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| transfer_number | STRING | Auto-generate: TRF-YYYYMMDD-XXX |
| from_warehouse_id | STRING | FK → warehouses.id |
| to_warehouse_id | STRING | FK → warehouses.id |
| transferred_by | STRING | FK → users.id |
| transfer_date | DATE | |
| notes | STRING | |
| status | ENUM | `draft` / `confirmed` |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `stock_transfer_details`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| transfer_id | STRING | FK → stock_transfers.id |
| item_id | STRING | FK → items.id |
| quantity | NUMBER | Jumlah yang dipindah |
| notes | STRING | |

> **Saat transfer di-confirm:** stock `from_warehouse` berkurang, `to_warehouse` bertambah.

### `stock_opnames`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| opname_number | STRING | Auto-generate: OPN-YYYYMMDD-XXX |
| warehouse_id | STRING | FK → warehouses.id |
| conducted_by | STRING | FK → users.id |
| opname_date | DATE | |
| notes | STRING | |
| status | ENUM | `draft` / `confirmed` |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `stock_opname_details`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| opname_id | STRING | FK → stock_opnames.id |
| item_id | STRING | FK → items.id |
| quantity_system | NUMBER | Stock sistem sebelum adjust |
| quantity_actual | NUMBER | Stock hasil hitung fisik |
| difference | NUMBER | `quantity_actual - quantity_system` |
| notes | STRING | |

> **Saat opname di-confirm:** stock di sheet `stock` di-update ke `quantity_actual`.

### `stock_usages`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| usage_number | STRING | Auto-generate: USG-YYYYMMDD-XXX |
| project_id | STRING | FK → warehouses.id (type=project) |
| input_type | ENUM | `usage` / `remaining` |
| recorded_by | STRING | FK → users.id |
| usage_date | DATE | |
| notes | STRING | |
| status | ENUM | `draft` / `confirmed` |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `stock_usage_details`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| usage_id | STRING | FK → stock_usages.id |
| item_id | STRING | FK → items.id |
| quantity_before | NUMBER | Stock sebelum transaksi |
| quantity_input | NUMBER | Nilai yang diinput user |
| quantity_used | NUMBER | Kalkulasi pemakaian aktual |
| quantity_remaining | NUMBER | Sisa setelah transaksi |
| notes | STRING | |

> **Logika input_type:**
> - `usage`: user input `quantity_input` = jumlah pemakaian → `quantity_remaining = quantity_before - quantity_input`, `quantity_used = quantity_input`
> - `remaining`: user input `quantity_input` = sisa yang ada → `quantity_used = quantity_before - quantity_input`, `quantity_remaining = quantity_input`
> Stock di sheet `stock` untuk project tersebut di-update ke `quantity_remaining`.

### `activity_log`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| timestamp | DATETIME | |
| user_id | STRING | FK → users.id |
| action | STRING | CREATE / UPDATE / DELETE / APPROVE / REJECT / CONFIRM |
| module | STRING | Nama modul (request_items, stock, dll) |
| record_id | STRING | ID record yang diaksi |
| description | STRING | Deskripsi singkat aktivitas |
| payload | STRING | JSON string data sebelum/sesudah (opsional) |

---

## 4. Role & Permission Matrix

| Fitur | Manager | Admin |
|---|---|---|
| Dashboard | ✅ View | ✅ View |
| Master Item (Category/Brand/Unit/Item) | ✅ Full CRUD | ✅ Full CRUD |
| Master Supplier | ✅ Full CRUD | ✅ Full CRUD |
| Master Warehouse/Project | ✅ Full CRUD | ✅ Full CRUD |
| Request Item — Create/Edit Draft | ✅ | ✅ |
| Request Item — Submit | ✅ | ✅ |
| Request Item — Approve/Reject | ✅ | ❌ |
| Receipt Item | ✅ | ✅ |
| Stock Transfer | ✅ | ✅ |
| Stock Opname | ✅ | ✅ |
| Stock Usage | ✅ | ✅ |
| Activity Log | ✅ View All | ❌ |
| User Management | ✅ | ❌ |

---

## 5. API Endpoints (Google Apps Script)

Semua request ke deployment URL Apps Script. Method dibungkus dalam parameter `action`.

### Format Request
```
GET  : ?action=<action>&param1=value1
POST : body JSON { action: "<action>", ...payload }
```

### Response Format (semua endpoint)
```json
{
  "success": true,
  "data": {},
  "message": "OK"
}
```
atau jika error:
```json
{
  "success": false,
  "error": "Pesan error",
  "code": 400
}
```

---

### Auth
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `login` | POST | `email`, `password` | Return user data + role |

---

### Master: Categories
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `getCategories` | GET | `is_active` (opsional) | List semua kategori |
| `createCategory` | POST | `name`, `description` | |
| `updateCategory` | POST | `id`, `name`, `description`, `is_active` | |
| `deleteCategory` | POST | `id` | Soft delete (is_active=false) |

### Master: Brands
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `getBrands` | GET | — | |
| `createBrand` | POST | `name`, `description` | |
| `updateBrand` | POST | `id`, ...fields | |
| `deleteBrand` | POST | `id` | |

### Master: Units
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `getUnits` | GET | — | |
| `createUnit` | POST | `name`, `abbreviation` | |
| `updateUnit` | POST | `id`, ...fields | |
| `deleteUnit` | POST | `id` | |

### Master: Items
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `getItems` | GET | `category_id`, `is_active` (opsional) | |
| `getItemById` | GET | `id` | |
| `createItem` | POST | `code`, `name`, `category_id`, `brand_id`, `unit_id`, `min_stock` | |
| `updateItem` | POST | `id`, ...fields | |
| `deleteItem` | POST | `id` | |

### Master: Suppliers
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `getSuppliers` | GET | — | |
| `getSupplierById` | GET | `id` | |
| `createSupplier` | POST | `code`, `name`, `contact_person`, `phone`, `email`, `address` | |
| `updateSupplier` | POST | `id`, ...fields | |
| `deleteSupplier` | POST | `id` | |

### Master: Warehouses
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `getWarehouses` | GET | `type` (`warehouse`/`project`, opsional) | |
| `getWarehouseById` | GET | `id` | |
| `createWarehouse` | POST | `code`, `name`, `type`, `location`, `person_in_charge` | |
| `updateWarehouse` | POST | `id`, ...fields | |
| `deleteWarehouse` | POST | `id` | |

### Stock
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `getStock` | GET | `warehouse_id`, `item_id` (opsional) | Stock aktual |
| `getLowStock` | GET | — | Item di bawah min_stock |

### Request Items
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `getRequests` | GET | `status`, `requested_by` (opsional) | |
| `getRequestById` | GET | `id` | Include details |
| `createRequest` | POST | `warehouse_id`, `notes`, `details: [{item_id, quantity_requested, notes}]` | Status default: `draft` |
| `updateRequest` | POST | `id`, `notes`, `details` | Hanya saat status `draft` |
| `submitRequest` | POST | `id` | Status → `submitted` |
| `approveRequest` | POST | `id`, `approved_by` | Manager only. Status → `approved` |
| `rejectRequest` | POST | `id`, `approved_by`, `rejection_reason` | Manager only. Status → `rejected` |
| `deleteRequest` | POST | `id` | Hanya saat status `draft` |

### Receipt Items
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `getReceipts` | GET | `status`, `warehouse_id` (opsional) | |
| `getReceiptById` | GET | `id` | Include details |
| `createReceipt` | POST | `supplier_id`, `warehouse_id`, `receipt_date`, `request_id` (opsional), `notes`, `details: [{item_id, quantity_received, notes}]` | Status: `draft` |
| `updateReceipt` | POST | `id`, ...fields | Hanya saat `draft` |
| `confirmReceipt` | POST | `id` | Status → `confirmed`, update stock |
| `deleteReceipt` | POST | `id` | Hanya saat `draft` |

### Stock Transfer
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `getTransfers` | GET | `status`, `from_warehouse_id`, `to_warehouse_id` (opsional) | |
| `getTransferById` | GET | `id` | Include details |
| `createTransfer` | POST | `from_warehouse_id`, `to_warehouse_id`, `transfer_date`, `notes`, `details: [{item_id, quantity, notes}]` | |
| `updateTransfer` | POST | `id`, ...fields | Hanya saat `draft` |
| `confirmTransfer` | POST | `id` | Stock from berkurang, to bertambah |
| `deleteTransfer` | POST | `id` | Hanya saat `draft` |

### Stock Opname
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `getOpnames` | GET | `status`, `warehouse_id` (opsional) | |
| `getOpnameById` | GET | `id` | Include details |
| `createOpname` | POST | `warehouse_id`, `opname_date`, `notes`, `details: [{item_id, quantity_system, quantity_actual, notes}]` | |
| `updateOpname` | POST | `id`, ...fields | Hanya saat `draft` |
| `confirmOpname` | POST | `id` | Update stock ke quantity_actual |
| `deleteOpname` | POST | `id` | Hanya saat `draft` |

### Stock Usage
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `getUsages` | GET | `project_id`, `status` (opsional) | |
| `getUsageById` | GET | `id` | Include details |
| `createUsage` | POST | `project_id`, `input_type` (`usage`/`remaining`), `usage_date`, `notes`, `details: [{item_id, quantity_input, notes}]` | |
| `updateUsage` | POST | `id`, ...fields | Hanya saat `draft` |
| `confirmUsage` | POST | `id` | Hitung qty_used/remaining, update stock |
| `deleteUsage` | POST | `id` | Hanya saat `draft` |

### Dashboard
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `getDashboardSummary` | GET | — | Total item, gudang, stock rendah, transaksi pending |
| `getStockByWarehouse` | GET | `warehouse_id` | Stock per lokasi |
| `getRecentActivity` | GET | `limit` (default 10) | Log aktivitas terbaru |

### Users (Manager only)
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `getUsers` | GET | — | |
| `createUser` | POST | `name`, `email`, `password`, `role` | |
| `updateUser` | POST | `id`, ...fields | |
| `deactivateUser` | POST | `id` | |

---

## 6. Code.gs — Struktur File

```
Code.gs
├── doGet(e)               — Router GET requests
├── doPost(e)              — Router POST requests
├── initializeSheets()     — Generate semua sheet + header
├── generateId()           — UUID v4 generator
├── generateNumber()       — Auto-number (REQ-, RCV-, TRF-, dll)
├── getTimestamp()         — Current datetime string
├── hashPassword(pwd)      — Simple hash (MD5 via Utilities)
├── verifyRole(userId, requiredRole) — Role check helper
├── updateStock(itemId, warehouseId, delta) — Tambah/kurangi stock
├── setStock(itemId, warehouseId, qty)     — Set stock ke nilai tertentu
├── logActivity(userId, action, module, recordId, desc) — Activity logger
│
├── [AUTH] handleLogin(payload)
│
├── [MASTER] Category CRUD
├── [MASTER] Brand CRUD
├── [MASTER] Unit CRUD
├── [MASTER] Item CRUD
├── [MASTER] Supplier CRUD
├── [MASTER] Warehouse CRUD
│
├── [STOCK] getStock / getLowStock
│
├── [REQUEST] CRUD + submit + approve/reject
├── [RECEIPT] CRUD + confirm (→ updateStock)
├── [TRANSFER] CRUD + confirm (→ updateStock x2)
├── [OPNAME] CRUD + confirm (→ setStock)
├── [USAGE] CRUD + confirm (→ setStock dengan logika input_type)
│
├── [DASHBOARD] getDashboardSummary / getStockByWarehouse / getRecentActivity
└── [USERS] CRUD
```

---

## 7. Code.gs — Implementasi Lengkap

```javascript
// ============================================================
// INVENTORY ERP — Google Apps Script Backend
// Version: 1.0.0
// ============================================================

const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
const DEPLOYMENT_URL = "https://script.google.com/macros/s/AKfycbyuOBOy7ie9qIfUq0FeEMJPvs2IkyIJdHAwV2_-7be5zdkN89YT8h6KVy69GrwWHW2U/exec";

const SHEETS = {
  USERS: "users",
  CATEGORIES: "categories",
  BRANDS: "brands",
  UNITS: "units",
  ITEMS: "items",
  SUPPLIERS: "suppliers",
  WAREHOUSES: "warehouses",
  STOCK: "stock",
  REQUEST_ITEMS: "request_items",
  REQUEST_ITEM_DETAILS: "request_item_details",
  RECEIPT_ITEMS: "receipt_items",
  RECEIPT_ITEM_DETAILS: "receipt_item_details",
  STOCK_TRANSFERS: "stock_transfers",
  STOCK_TRANSFER_DETAILS: "stock_transfer_details",
  STOCK_OPNAMES: "stock_opnames",
  STOCK_OPNAME_DETAILS: "stock_opname_details",
  STOCK_USAGES: "stock_usages",
  STOCK_USAGE_DETAILS: "stock_usage_details",
  ACTIVITY_LOG: "activity_log"
};

const HEADERS = {
  users: ["id","name","email","password_hash","role","is_active","created_at","updated_at"],
  categories: ["id","name","description","is_active","created_at","updated_at"],
  brands: ["id","name","description","is_active","created_at","updated_at"],
  units: ["id","name","abbreviation","is_active","created_at","updated_at"],
  items: ["id","code","name","category_id","brand_id","unit_id","description","min_stock","is_active","created_at","updated_at"],
  suppliers: ["id","code","name","contact_person","phone","email","address","is_active","created_at","updated_at"],
  warehouses: ["id","code","name","type","location","person_in_charge","is_active","created_at","updated_at"],
  stock: ["id","item_id","warehouse_id","quantity","updated_at"],
  request_items: ["id","request_number","requested_by","warehouse_id","notes","status","submitted_at","approved_by","approved_at","rejection_reason","created_at","updated_at"],
  request_item_details: ["id","request_id","item_id","quantity_requested","notes"],
  receipt_items: ["id","receipt_number","request_id","supplier_id","warehouse_id","received_by","receipt_date","notes","status","created_at","updated_at"],
  receipt_item_details: ["id","receipt_id","item_id","quantity_received","notes"],
  stock_transfers: ["id","transfer_number","from_warehouse_id","to_warehouse_id","transferred_by","transfer_date","notes","status","created_at","updated_at"],
  stock_transfer_details: ["id","transfer_id","item_id","quantity","notes"],
  stock_opnames: ["id","opname_number","warehouse_id","conducted_by","opname_date","notes","status","created_at","updated_at"],
  stock_opname_details: ["id","opname_id","item_id","quantity_system","quantity_actual","difference","notes"],
  stock_usages: ["id","usage_number","project_id","input_type","recorded_by","usage_date","notes","status","created_at","updated_at"],
  stock_usage_details: ["id","usage_id","item_id","quantity_before","quantity_input","quantity_used","quantity_remaining","notes"],
  activity_log: ["id","timestamp","user_id","action","module","record_id","description","payload"]
};

// ============================================================
// ROUTER
// ============================================================

function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function handleRequest(e, method) {
  try {
    let params = {};
    if (method === "GET") {
      params = e.parameter || {};
    } else {
      const body = JSON.parse(e.postData.contents || "{}");
      params = body;
    }

    const action = params.action;
    if (!action) return respond(false, null, "Missing action", 400);

    const result = dispatch(action, params, method);
    return result;
  } catch (err) {
    return respond(false, null, err.message, 500);
  }
}

function dispatch(action, p, method) {
  const routes = {
    // Auth
    "login": () => handleLogin(p),
    // Categories
    "getCategories": () => getAll(SHEETS.CATEGORIES, p),
    "createCategory": () => createRecord(SHEETS.CATEGORIES, p),
    "updateCategory": () => updateRecord(SHEETS.CATEGORIES, p),
    "deleteCategory": () => softDelete(SHEETS.CATEGORIES, p.id),
    // Brands
    "getBrands": () => getAll(SHEETS.BRANDS, p),
    "createBrand": () => createRecord(SHEETS.BRANDS, p),
    "updateBrand": () => updateRecord(SHEETS.BRANDS, p),
    "deleteBrand": () => softDelete(SHEETS.BRANDS, p.id),
    // Units
    "getUnits": () => getAll(SHEETS.UNITS, p),
    "createUnit": () => createRecord(SHEETS.UNITS, p),
    "updateUnit": () => updateRecord(SHEETS.UNITS, p),
    "deleteUnit": () => softDelete(SHEETS.UNITS, p.id),
    // Items
    "getItems": () => getItems(p),
    "getItemById": () => getById(SHEETS.ITEMS, p.id),
    "createItem": () => createRecord(SHEETS.ITEMS, p),
    "updateItem": () => updateRecord(SHEETS.ITEMS, p),
    "deleteItem": () => softDelete(SHEETS.ITEMS, p.id),
    // Suppliers
    "getSuppliers": () => getAll(SHEETS.SUPPLIERS, p),
    "getSupplierById": () => getById(SHEETS.SUPPLIERS, p.id),
    "createSupplier": () => createRecord(SHEETS.SUPPLIERS, p),
    "updateSupplier": () => updateRecord(SHEETS.SUPPLIERS, p),
    "deleteSupplier": () => softDelete(SHEETS.SUPPLIERS, p.id),
    // Warehouses
    "getWarehouses": () => getWarehouses(p),
    "getWarehouseById": () => getById(SHEETS.WAREHOUSES, p.id),
    "createWarehouse": () => createRecord(SHEETS.WAREHOUSES, p),
    "updateWarehouse": () => updateRecord(SHEETS.WAREHOUSES, p),
    "deleteWarehouse": () => softDelete(SHEETS.WAREHOUSES, p.id),
    // Stock
    "getStock": () => getStock(p),
    "getLowStock": () => getLowStock(),
    // Requests
    "getRequests": () => getRequests(p),
    "getRequestById": () => getRequestById(p.id),
    "createRequest": () => createRequest(p),
    "updateRequest": () => updateRequest(p),
    "submitRequest": () => submitRequest(p),
    "approveRequest": () => approveRequest(p),
    "rejectRequest": () => rejectRequest(p),
    "deleteRequest": () => deleteRequest(p),
    // Receipts
    "getReceipts": () => getReceipts(p),
    "getReceiptById": () => getReceiptById(p.id),
    "createReceipt": () => createReceipt(p),
    "updateReceipt": () => updateReceipt(p),
    "confirmReceipt": () => confirmReceipt(p),
    "deleteReceipt": () => deleteReceipt(p),
    // Transfers
    "getTransfers": () => getTransfers(p),
    "getTransferById": () => getTransferById(p.id),
    "createTransfer": () => createTransfer(p),
    "updateTransfer": () => updateTransfer(p),
    "confirmTransfer": () => confirmTransfer(p),
    "deleteTransfer": () => deleteTransfer(p),
    // Opnames
    "getOpnames": () => getOpnames(p),
    "getOpnameById": () => getOpnameById(p.id),
    "createOpname": () => createOpname(p),
    "updateOpname": () => updateOpname(p),
    "confirmOpname": () => confirmOpname(p),
    "deleteOpname": () => deleteOpname(p),
    // Usages
    "getUsages": () => getUsages(p),
    "getUsageById": () => getUsageById(p.id),
    "createUsage": () => createUsage(p),
    "updateUsage": () => updateUsage(p),
    "confirmUsage": () => confirmUsage(p),
    "deleteUsage": () => deleteUsage(p),
    // Dashboard
    "getDashboardSummary": () => getDashboardSummary(),
    "getStockByWarehouse": () => getStockByWarehouse(p),
    "getRecentActivity": () => getRecentActivity(p),
    // Users
    "getUsers": () => getAll(SHEETS.USERS, p),
    "createUser": () => createUser(p),
    "updateUser": () => updateRecord(SHEETS.USERS, p),
    "deactivateUser": () => softDelete(SHEETS.USERS, p.id),
  };

  if (!routes[action]) return respond(false, null, "Unknown action: " + action, 404);
  return routes[action]();
}

// ============================================================
// INIT — Generate All Sheets
// ============================================================

function initializeSheets() {
  Object.keys(HEADERS).forEach(sheetName => {
    let sheet = SPREADSHEET.getSheetByName(sheetName);
    if (!sheet) {
      sheet = SPREADSHEET.insertSheet(sheetName);
    }
    const headers = HEADERS[sheetName];
    const firstRow = sheet.getRange(1, 1, 1, headers.length);
    firstRow.setValues([headers]);
    firstRow.setFontWeight("bold");
    firstRow.setBackground("#4A86E8");
    firstRow.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  });

  // Seed default admin user jika users kosong
  const userSheet = SPREADSHEET.getSheetByName(SHEETS.USERS);
  if (userSheet.getLastRow() <= 1) {
    seedDefaultUsers();
  }

  return respond(true, { sheets_created: Object.keys(HEADERS).length }, "Sheets initialized successfully");
}

function seedDefaultUsers() {
  const now = getTimestamp();
  const users = [
    { id: generateId(), name: "Manager", email: "manager@demo.com", password_hash: hashPassword("manager123"), role: "manager", is_active: true, created_at: now, updated_at: now },
    { id: generateId(), name: "Admin", email: "admin@demo.com", password_hash: hashPassword("admin123"), role: "admin", is_active: true, created_at: now, updated_at: now }
  ];
  const sheet = SPREADSHEET.getSheetByName(SHEETS.USERS);
  const headers = HEADERS.users;
  users.forEach(u => {
    sheet.appendRow(headers.map(h => u[h] !== undefined ? u[h] : ""));
  });
}

// ============================================================
// HELPERS
// ============================================================

function generateId() {
  return Utilities.getUuid();
}

function getTimestamp() {
  return new Date().toISOString();
}

function hashPassword(pwd) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, pwd);
  return raw.map(b => ('0' + (b < 0 ? b + 256 : b).toString(16)).slice(-2)).join('');
}

function generateNumber(prefix, sheetName) {
  const sheet = SPREADSHEET.getSheetByName(sheetName);
  const date = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd");
  const allData = getSheetData(sheetName);
  const todayPrefix = `${prefix}-${date}-`;
  const todayRecords = allData.filter(r => {
    const numField = Object.values(r).find(v => typeof v === "string" && v.startsWith(todayPrefix));
    return !!numField;
  });
  const seq = String(todayRecords.length + 1).padStart(3, "0");
  return `${prefix}-${date}-${seq}`;
}

function respond(success, data, message, code) {
  const output = JSON.stringify({ success, data, message, code: code || (success ? 200 : 400) });
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(sheetName) {
  const sheet = SPREADSHEET.getSheetByName(sheetName);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function appendToSheet(sheetName, record) {
  const sheet = SPREADSHEET.getSheetByName(sheetName);
  const headers = HEADERS[sheetName];
  const row = headers.map(h => record[h] !== undefined ? record[h] : "");
  sheet.appendRow(row);
}

function updateRowById(sheetName, id, updates) {
  const sheet = SPREADSHEET.getSheetByName(sheetName);
  const headers = HEADERS[sheetName];
  const data = sheet.getDataRange().getValues();
  const idCol = headers.indexOf("id");
  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === id) {
      headers.forEach((h, colIdx) => {
        if (updates[h] !== undefined) {
          sheet.getRange(i + 1, colIdx + 1).setValue(updates[h]);
        }
      });
      return true;
    }
  }
  return false;
}

function findById(sheetName, id) {
  const data = getSheetData(sheetName);
  return data.find(r => r.id === id) || null;
}

function getById(sheetName, id) {
  const record = findById(sheetName, id);
  if (!record) return respond(false, null, "Record not found", 404);
  return respond(true, record);
}

function getAll(sheetName, filters) {
  let data = getSheetData(sheetName);
  if (filters) {
    if (filters.is_active !== undefined && filters.is_active !== "") {
      const val = filters.is_active === "true" || filters.is_active === true;
      data = data.filter(r => r.is_active == val);
    }
    if (filters.type) data = data.filter(r => r.type === filters.type);
  }
  return respond(true, data);
}

function createRecord(sheetName, payload) {
  const now = getTimestamp();
  const record = { id: generateId(), ...payload, created_at: now, updated_at: now };
  if (record.is_active === undefined) record.is_active = true;
  delete record.action;
  appendToSheet(sheetName, record);
  return respond(true, record, "Created successfully");
}

function updateRecord(sheetName, payload) {
  const { id, ...updates } = payload;
  if (!id) return respond(false, null, "ID required", 400);
  updates.updated_at = getTimestamp();
  delete updates.action;
  const found = updateRowById(sheetName, id, updates);
  if (!found) return respond(false, null, "Record not found", 404);
  return respond(true, { id, ...updates }, "Updated successfully");
}

function softDelete(sheetName, id) {
  if (!id) return respond(false, null, "ID required", 400);
  const found = updateRowById(sheetName, id, { is_active: false, updated_at: getTimestamp() });
  if (!found) return respond(false, null, "Record not found", 404);
  return respond(true, { id }, "Deleted successfully");
}

// ============================================================
// STOCK HELPERS
// ============================================================

function updateStock(itemId, warehouseId, delta) {
  const data = getSheetData(SHEETS.STOCK);
  const existing = data.find(r => r.item_id === itemId && r.warehouse_id === warehouseId);
  if (existing) {
    const newQty = Number(existing.quantity) + Number(delta);
    updateRowById(SHEETS.STOCK, existing.id, { quantity: newQty, updated_at: getTimestamp() });
    return newQty;
  } else {
    const record = { id: generateId(), item_id: itemId, warehouse_id: warehouseId, quantity: Number(delta), updated_at: getTimestamp() };
    appendToSheet(SHEETS.STOCK, record);
    return Number(delta);
  }
}

function setStock(itemId, warehouseId, qty) {
  const data = getSheetData(SHEETS.STOCK);
  const existing = data.find(r => r.item_id === itemId && r.warehouse_id === warehouseId);
  if (existing) {
    updateRowById(SHEETS.STOCK, existing.id, { quantity: Number(qty), updated_at: getTimestamp() });
  } else {
    const record = { id: generateId(), item_id: itemId, warehouse_id: warehouseId, quantity: Number(qty), updated_at: getTimestamp() };
    appendToSheet(SHEETS.STOCK, record);
  }
}

function getStockQty(itemId, warehouseId) {
  const data = getSheetData(SHEETS.STOCK);
  const r = data.find(d => d.item_id === itemId && d.warehouse_id === warehouseId);
  return r ? Number(r.quantity) : 0;
}

// ============================================================
// ACTIVITY LOG
// ============================================================

function logActivity(userId, action, module, recordId, description, payload) {
  const record = {
    id: generateId(),
    timestamp: getTimestamp(),
    user_id: userId || "",
    action,
    module,
    record_id: recordId || "",
    description: description || "",
    payload: payload ? JSON.stringify(payload) : ""
  };
  appendToSheet(SHEETS.ACTIVITY_LOG, record);
}

// ============================================================
// AUTH
// ============================================================

function handleLogin(p) {
  if (!p.email || !p.password) return respond(false, null, "Email and password required", 400);
  const hashed = hashPassword(p.password);
  const users = getSheetData(SHEETS.USERS);
  const user = users.find(u => u.email === p.email && u.password_hash === hashed && u.is_active);
  if (!user) return respond(false, null, "Invalid credentials", 401);
  const { password_hash, ...safeUser } = user;
  logActivity(user.id, "LOGIN", "auth", user.id, `User ${user.name} logged in`);
  return respond(true, safeUser, "Login successful");
}

// ============================================================
// MASTER: ITEMS (extended filter)
// ============================================================

function getItems(p) {
  let data = getSheetData(SHEETS.ITEMS);
  if (p.category_id) data = data.filter(r => r.category_id === p.category_id);
  if (p.is_active !== undefined && p.is_active !== "") {
    const val = p.is_active === "true" || p.is_active === true;
    data = data.filter(r => r.is_active == val);
  }
  return respond(true, data);
}

// ============================================================
// MASTER: WAREHOUSES (filter by type)
// ============================================================

function getWarehouses(p) {
  let data = getSheetData(SHEETS.WAREHOUSES);
  if (p.type) data = data.filter(r => r.type === p.type);
  if (p.is_active !== undefined && p.is_active !== "") {
    const val = p.is_active === "true" || p.is_active === true;
    data = data.filter(r => r.is_active == val);
  }
  return respond(true, data);
}

// ============================================================
// STOCK
// ============================================================

function getStock(p) {
  let data = getSheetData(SHEETS.STOCK);
  if (p.warehouse_id) data = data.filter(r => r.warehouse_id === p.warehouse_id);
  if (p.item_id) data = data.filter(r => r.item_id === p.item_id);
  return respond(true, data);
}

function getLowStock() {
  const items = getSheetData(SHEETS.ITEMS).filter(i => i.is_active);
  const stocks = getSheetData(SHEETS.STOCK);
  const low = [];
  items.forEach(item => {
    const totalQty = stocks.filter(s => s.item_id === item.id).reduce((sum, s) => sum + Number(s.quantity), 0);
    if (totalQty <= Number(item.min_stock || 0)) {
      low.push({ ...item, total_stock: totalQty });
    }
  });
  return respond(true, low);
}

// ============================================================
// REQUEST ITEMS
// ============================================================

function getRequests(p) {
  let data = getSheetData(SHEETS.REQUEST_ITEMS);
  if (p.status) data = data.filter(r => r.status === p.status);
  if (p.requested_by) data = data.filter(r => r.requested_by === p.requested_by);
  return respond(true, data);
}

function getRequestById(id) {
  const record = findById(SHEETS.REQUEST_ITEMS, id);
  if (!record) return respond(false, null, "Not found", 404);
  const details = getSheetData(SHEETS.REQUEST_ITEM_DETAILS).filter(d => d.request_id === id);
  return respond(true, { ...record, details });
}

function createRequest(p) {
  const now = getTimestamp();
  const id = generateId();
  const reqNum = generateNumber("REQ", SHEETS.REQUEST_ITEMS);
  const record = {
    id, request_number: reqNum, requested_by: p.requested_by || "",
    warehouse_id: p.warehouse_id, notes: p.notes || "",
    status: "draft", submitted_at: "", approved_by: "",
    approved_at: "", rejection_reason: "",
    created_at: now, updated_at: now
  };
  appendToSheet(SHEETS.REQUEST_ITEMS, record);
  (p.details || []).forEach(d => {
    appendToSheet(SHEETS.REQUEST_ITEM_DETAILS, {
      id: generateId(), request_id: id,
      item_id: d.item_id, quantity_requested: d.quantity_requested, notes: d.notes || ""
    });
  });
  logActivity(p.requested_by, "CREATE", "request_items", id, `Request ${reqNum} created`);
  return respond(true, { ...record, details: p.details }, "Request created");
}

function updateRequest(p) {
  const record = findById(SHEETS.REQUEST_ITEMS, p.id);
  if (!record) return respond(false, null, "Not found", 404);
  if (record.status !== "draft") return respond(false, null, "Can only edit draft requests", 400);
  updateRowById(SHEETS.REQUEST_ITEMS, p.id, { notes: p.notes || record.notes, updated_at: getTimestamp() });
  if (p.details) {
    // Remove old details and re-append
    const sheet = SPREADSHEET.getSheetByName(SHEETS.REQUEST_ITEM_DETAILS);
    const data = sheet.getDataRange().getValues();
    const headers = HEADERS.request_item_details;
    const ridCol = headers.indexOf("request_id");
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][ridCol] === p.id) sheet.deleteRow(i + 1);
    }
    p.details.forEach(d => {
      appendToSheet(SHEETS.REQUEST_ITEM_DETAILS, {
        id: generateId(), request_id: p.id,
        item_id: d.item_id, quantity_requested: d.quantity_requested, notes: d.notes || ""
      });
    });
  }
  return respond(true, { id: p.id }, "Updated");
}

function submitRequest(p) {
  const record = findById(SHEETS.REQUEST_ITEMS, p.id);
  if (!record) return respond(false, null, "Not found", 404);
  if (record.status !== "draft") return respond(false, null, "Can only submit draft requests", 400);
  updateRowById(SHEETS.REQUEST_ITEMS, p.id, { status: "submitted", submitted_at: getTimestamp(), updated_at: getTimestamp() });
  logActivity(p.user_id, "SUBMIT", "request_items", p.id, `Request ${record.request_number} submitted`);
  return respond(true, { id: p.id, status: "submitted" }, "Submitted");
}

function approveRequest(p) {
  const record = findById(SHEETS.REQUEST_ITEMS, p.id);
  if (!record) return respond(false, null, "Not found", 404);
  if (record.status !== "submitted") return respond(false, null, "Can only approve submitted requests", 400);
  const now = getTimestamp();
  updateRowById(SHEETS.REQUEST_ITEMS, p.id, { status: "approved", approved_by: p.approved_by, approved_at: now, updated_at: now });
  logActivity(p.approved_by, "APPROVE", "request_items", p.id, `Request ${record.request_number} approved`);
  return respond(true, { id: p.id, status: "approved" }, "Approved");
}

function rejectRequest(p) {
  const record = findById(SHEETS.REQUEST_ITEMS, p.id);
  if (!record) return respond(false, null, "Not found", 404);
  if (record.status !== "submitted") return respond(false, null, "Can only reject submitted requests", 400);
  const now = getTimestamp();
  updateRowById(SHEETS.REQUEST_ITEMS, p.id, { status: "rejected", approved_by: p.approved_by, approved_at: now, rejection_reason: p.rejection_reason || "", updated_at: now });
  logActivity(p.approved_by, "REJECT", "request_items", p.id, `Request ${record.request_number} rejected`);
  return respond(true, { id: p.id, status: "rejected" }, "Rejected");
}

function deleteRequest(p) {
  const record = findById(SHEETS.REQUEST_ITEMS, p.id);
  if (!record) return respond(false, null, "Not found", 404);
  if (record.status !== "draft") return respond(false, null, "Can only delete draft requests", 400);
  softDelete(SHEETS.REQUEST_ITEMS, p.id);
  return respond(true, { id: p.id }, "Deleted");
}

// ============================================================
// RECEIPT ITEMS
// ============================================================

function getReceipts(p) {
  let data = getSheetData(SHEETS.RECEIPT_ITEMS);
  if (p.status) data = data.filter(r => r.status === p.status);
  if (p.warehouse_id) data = data.filter(r => r.warehouse_id === p.warehouse_id);
  return respond(true, data);
}

function getReceiptById(id) {
  const record = findById(SHEETS.RECEIPT_ITEMS, id);
  if (!record) return respond(false, null, "Not found", 404);
  const details = getSheetData(SHEETS.RECEIPT_ITEM_DETAILS).filter(d => d.receipt_id === id);
  return respond(true, { ...record, details });
}

function createReceipt(p) {
  const now = getTimestamp();
  const id = generateId();
  const num = generateNumber("RCV", SHEETS.RECEIPT_ITEMS);
  const record = {
    id, receipt_number: num, request_id: p.request_id || "",
    supplier_id: p.supplier_id, warehouse_id: p.warehouse_id,
    received_by: p.received_by || "", receipt_date: p.receipt_date || now,
    notes: p.notes || "", status: "draft", created_at: now, updated_at: now
  };
  appendToSheet(SHEETS.RECEIPT_ITEMS, record);
  (p.details || []).forEach(d => {
    appendToSheet(SHEETS.RECEIPT_ITEM_DETAILS, {
      id: generateId(), receipt_id: id,
      item_id: d.item_id, quantity_received: d.quantity_received, notes: d.notes || ""
    });
  });
  logActivity(p.received_by, "CREATE", "receipt_items", id, `Receipt ${num} created`);
  return respond(true, { ...record, details: p.details }, "Receipt created");
}

function updateReceipt(p) {
  const record = findById(SHEETS.RECEIPT_ITEMS, p.id);
  if (!record) return respond(false, null, "Not found", 404);
  if (record.status !== "draft") return respond(false, null, "Can only edit draft receipts", 400);
  const updates = {};
  ["supplier_id","warehouse_id","receipt_date","notes"].forEach(f => { if (p[f] !== undefined) updates[f] = p[f]; });
  updates.updated_at = getTimestamp();
  updateRowById(SHEETS.RECEIPT_ITEMS, p.id, updates);
  return respond(true, { id: p.id }, "Updated");
}

function confirmReceipt(p) {
  const record = findById(SHEETS.RECEIPT_ITEMS, p.id);
  if (!record) return respond(false, null, "Not found", 404);
  if (record.status !== "draft") return respond(false, null, "Already confirmed", 400);
  const details = getSheetData(SHEETS.RECEIPT_ITEM_DETAILS).filter(d => d.receipt_id === p.id);
  details.forEach(d => {
    updateStock(d.item_id, record.warehouse_id, d.quantity_received);
  });
  updateRowById(SHEETS.RECEIPT_ITEMS, p.id, { status: "confirmed", updated_at: getTimestamp() });
  logActivity(p.user_id, "CONFIRM", "receipt_items", p.id, `Receipt ${record.receipt_number} confirmed, stock updated`);
  return respond(true, { id: p.id, status: "confirmed" }, "Receipt confirmed, stock updated");
}

function deleteReceipt(p) {
  const record = findById(SHEETS.RECEIPT_ITEMS, p.id);
  if (!record) return respond(false, null, "Not found", 404);
  if (record.status !== "draft") return respond(false, null, "Can only delete draft receipts", 400);
  softDelete(SHEETS.RECEIPT_ITEMS, p.id);
  return respond(true, { id: p.id }, "Deleted");
}

// ============================================================
// STOCK TRANSFER
// ============================================================

function getTransfers(p) {
  let data = getSheetData(SHEETS.STOCK_TRANSFERS);
  if (p.status) data = data.filter(r => r.status === p.status);
  if (p.from_warehouse_id) data = data.filter(r => r.from_warehouse_id === p.from_warehouse_id);
  if (p.to_warehouse_id) data = data.filter(r => r.to_warehouse_id === p.to_warehouse_id);
  return respond(true, data);
}

function getTransferById(id) {
  const record = findById(SHEETS.STOCK_TRANSFERS, id);
  if (!record) return respond(false, null, "Not found", 404);
  const details = getSheetData(SHEETS.STOCK_TRANSFER_DETAILS).filter(d => d.transfer_id === id);
  return respond(true, { ...record, details });
}

function createTransfer(p) {
  const now = getTimestamp();
  const id = generateId();
  const num = generateNumber("TRF", SHEETS.STOCK_TRANSFERS);
  const record = {
    id, transfer_number: num,
    from_warehouse_id: p.from_warehouse_id, to_warehouse_id: p.to_warehouse_id,
    transferred_by: p.transferred_by || "", transfer_date: p.transfer_date || now,
    notes: p.notes || "", status: "draft", created_at: now, updated_at: now
  };
  appendToSheet(SHEETS.STOCK_TRANSFERS, record);
  (p.details || []).forEach(d => {
    appendToSheet(SHEETS.STOCK_TRANSFER_DETAILS, {
      id: generateId(), transfer_id: id,
      item_id: d.item_id, quantity: d.quantity, notes: d.notes || ""
    });
  });
  logActivity(p.transferred_by, "CREATE", "stock_transfers", id, `Transfer ${num} created`);
  return respond(true, { ...record, details: p.details }, "Transfer created");
}

function updateTransfer(p) {
  const record = findById(SHEETS.STOCK_TRANSFERS, p.id);
  if (!record) return respond(false, null, "Not found", 404);
  if (record.status !== "draft") return respond(false, null, "Can only edit draft transfers", 400);
  const updates = {};
  ["from_warehouse_id","to_warehouse_id","transfer_date","notes"].forEach(f => { if (p[f] !== undefined) updates[f] = p[f]; });
  updates.updated_at = getTimestamp();
  updateRowById(SHEETS.STOCK_TRANSFERS, p.id, updates);
  return respond(true, { id: p.id }, "Updated");
}

function confirmTransfer(p) {
  const record = findById(SHEETS.STOCK_TRANSFERS, p.id);
  if (!record) return respond(false, null, "Not found", 404);
  if (record.status !== "draft") return respond(false, null, "Already confirmed", 400);
  const details = getSheetData(SHEETS.STOCK_TRANSFER_DETAILS).filter(d => d.transfer_id === p.id);
  // Validate stock availability
  for (const d of details) {
    const available = getStockQty(d.item_id, record.from_warehouse_id);
    if (available < Number(d.quantity)) {
      return respond(false, null, `Insufficient stock for item ${d.item_id}. Available: ${available}, Requested: ${d.quantity}`, 400);
    }
  }
  details.forEach(d => {
    updateStock(d.item_id, record.from_warehouse_id, -Number(d.quantity));
    updateStock(d.item_id, record.to_warehouse_id, Number(d.quantity));
  });
  updateRowById(SHEETS.STOCK_TRANSFERS, p.id, { status: "confirmed", updated_at: getTimestamp() });
  logActivity(p.user_id, "CONFIRM", "stock_transfers", p.id, `Transfer ${record.transfer_number} confirmed`);
  return respond(true, { id: p.id, status: "confirmed" }, "Transfer confirmed, stock updated");
}

function deleteTransfer(p) {
  const record = findById(SHEETS.STOCK_TRANSFERS, p.id);
  if (!record) return respond(false, null, "Not found", 404);
  if (record.status !== "draft") return respond(false, null, "Can only delete draft transfers", 400);
  softDelete(SHEETS.STOCK_TRANSFERS, p.id);
  return respond(true, { id: p.id }, "Deleted");
}

// ============================================================
// STOCK OPNAME
// ============================================================

function getOpnames(p) {
  let data = getSheetData(SHEETS.STOCK_OPNAMES);
  if (p.status) data = data.filter(r => r.status === p.status);
  if (p.warehouse_id) data = data.filter(r => r.warehouse_id === p.warehouse_id);
  return respond(true, data);
}

function getOpnameById(id) {
  const record = findById(SHEETS.STOCK_OPNAMES, id);
  if (!record) return respond(false, null, "Not found", 404);
  const details = getSheetData(SHEETS.STOCK_OPNAME_DETAILS).filter(d => d.opname_id === id);
  return respond(true, { ...record, details });
}

function createOpname(p) {
  const now = getTimestamp();
  const id = generateId();
  const num = generateNumber("OPN", SHEETS.STOCK_OPNAMES);
  const record = {
    id, opname_number: num,
    warehouse_id: p.warehouse_id, conducted_by: p.conducted_by || "",
    opname_date: p.opname_date || now, notes: p.notes || "",
    status: "draft", created_at: now, updated_at: now
  };
  appendToSheet(SHEETS.STOCK_OPNAMES, record);
  (p.details || []).forEach(d => {
    const diff = Number(d.quantity_actual) - Number(d.quantity_system);
    appendToSheet(SHEETS.STOCK_OPNAME_DETAILS, {
      id: generateId(), opname_id: id,
      item_id: d.item_id,
      quantity_system: d.quantity_system,
      quantity_actual: d.quantity_actual,
      difference: diff,
      notes: d.notes || ""
    });
  });
  logActivity(p.conducted_by, "CREATE", "stock_opnames", id, `Opname ${num} created`);
  return respond(true, { ...record, details: p.details }, "Opname created");
}

function updateOpname(p) {
  const record = findById(SHEETS.STOCK_OPNAMES, p.id);
  if (!record) return respond(false, null, "Not found", 404);
  if (record.status !== "draft") return respond(false, null, "Can only edit draft opnames", 400);
  const updates = {};
  ["warehouse_id","opname_date","notes"].forEach(f => { if (p[f] !== undefined) updates[f] = p[f]; });
  updates.updated_at = getTimestamp();
  updateRowById(SHEETS.STOCK_OPNAMES, p.id, updates);
  return respond(true, { id: p.id }, "Updated");
}

function confirmOpname(p) {
  const record = findById(SHEETS.STOCK_OPNAMES, p.id);
  if (!record) return respond(false, null, "Not found", 404);
  if (record.status !== "draft") return respond(false, null, "Already confirmed", 400);
  const details = getSheetData(SHEETS.STOCK_OPNAME_DETAILS).filter(d => d.opname_id === p.id);
  details.forEach(d => {
    setStock(d.item_id, record.warehouse_id, d.quantity_actual);
  });
  updateRowById(SHEETS.STOCK_OPNAMES, p.id, { status: "confirmed", updated_at: getTimestamp() });
  logActivity(p.user_id, "CONFIRM", "stock_opnames", p.id, `Opname ${record.opname_number} confirmed, stock adjusted`);
  return respond(true, { id: p.id, status: "confirmed" }, "Opname confirmed, stock adjusted");
}

function deleteOpname(p) {
  const record = findById(SHEETS.STOCK_OPNAMES, p.id);
  if (!record) return respond(false, null, "Not found", 404);
  if (record.status !== "draft") return respond(false, null, "Can only delete draft opnames", 400);
  softDelete(SHEETS.STOCK_OPNAMES, p.id);
  return respond(true, { id: p.id }, "Deleted");
}

// ============================================================
// STOCK USAGE
// ============================================================

function getUsages(p) {
  let data = getSheetData(SHEETS.STOCK_USAGES);
  if (p.project_id) data = data.filter(r => r.project_id === p.project_id);
  if (p.status) data = data.filter(r => r.status === p.status);
  return respond(true, data);
}

function getUsageById(id) {
  const record = findById(SHEETS.STOCK_USAGES, id);
  if (!record) return respond(false, null, "Not found", 404);
  const details = getSheetData(SHEETS.STOCK_USAGE_DETAILS).filter(d => d.usage_id === id);
  return respond(true, { ...record, details });
}

function createUsage(p) {
  const now = getTimestamp();
  const id = generateId();
  const num = generateNumber("USG", SHEETS.STOCK_USAGES);
  const record = {
    id, usage_number: num,
    project_id: p.project_id, input_type: p.input_type,
    recorded_by: p.recorded_by || "", usage_date: p.usage_date || now,
    notes: p.notes || "", status: "draft", created_at: now, updated_at: now
  };
  appendToSheet(SHEETS.STOCK_USAGES, record);
  (p.details || []).forEach(d => {
    const qtyBefore = getStockQty(d.item_id, p.project_id);
    let qtyUsed, qtyRemaining;
    if (p.input_type === "usage") {
      qtyUsed = Number(d.quantity_input);
      qtyRemaining = qtyBefore - qtyUsed;
    } else {
      qtyRemaining = Number(d.quantity_input);
      qtyUsed = qtyBefore - qtyRemaining;
    }
    appendToSheet(SHEETS.STOCK_USAGE_DETAILS, {
      id: generateId(), usage_id: id,
      item_id: d.item_id,
      quantity_before: qtyBefore,
      quantity_input: d.quantity_input,
      quantity_used: qtyUsed,
      quantity_remaining: qtyRemaining,
      notes: d.notes || ""
    });
  });
  logActivity(p.recorded_by, "CREATE", "stock_usages", id, `Usage ${num} created (${p.input_type})`);
  return respond(true, { ...record, details: p.details }, "Usage created");
}

function updateUsage(p) {
  const record = findById(SHEETS.STOCK_USAGES, p.id);
  if (!record) return respond(false, null, "Not found", 404);
  if (record.status !== "draft") return respond(false, null, "Can only edit draft usages", 400);
  const updates = {};
  ["project_id","input_type","usage_date","notes"].forEach(f => { if (p[f] !== undefined) updates[f] = p[f]; });
  updates.updated_at = getTimestamp();
  updateRowById(SHEETS.STOCK_USAGES, p.id, updates);
  return respond(true, { id: p.id }, "Updated");
}

function confirmUsage(p) {
  const record = findById(SHEETS.STOCK_USAGES, p.id);
  if (!record) return respond(false, null, "Not found", 404);
  if (record.status !== "draft") return respond(false, null, "Already confirmed", 400);
  const details = getSheetData(SHEETS.STOCK_USAGE_DETAILS).filter(d => d.usage_id === p.id);
  details.forEach(d => {
    setStock(d.item_id, record.project_id, d.quantity_remaining);
  });
  updateRowById(SHEETS.STOCK_USAGES, p.id, { status: "confirmed", updated_at: getTimestamp() });
  logActivity(p.user_id, "CONFIRM", "stock_usages", p.id, `Usage ${record.usage_number} confirmed, stock updated`);
  return respond(true, { id: p.id, status: "confirmed" }, "Usage confirmed, stock updated");
}

function deleteUsage(p) {
  const record = findById(SHEETS.STOCK_USAGES, p.id);
  if (!record) return respond(false, null, "Not found", 404);
  if (record.status !== "draft") return respond(false, null, "Can only delete draft usages", 400);
  softDelete(SHEETS.STOCK_USAGES, p.id);
  return respond(true, { id: p.id }, "Deleted");
}

// ============================================================
// DASHBOARD
// ============================================================

function getDashboardSummary() {
  const items = getSheetData(SHEETS.ITEMS).filter(i => i.is_active);
  const warehouses = getSheetData(SHEETS.WAREHOUSES).filter(w => w.is_active);
  const stocks = getSheetData(SHEETS.STOCK);
  const requests = getSheetData(SHEETS.REQUEST_ITEMS);
  const receipts = getSheetData(SHEETS.RECEIPT_ITEMS);
  const transfers = getSheetData(SHEETS.STOCK_TRANSFERS);

  const lowStockItems = items.filter(item => {
    const total = stocks.filter(s => s.item_id === item.id).reduce((sum, s) => sum + Number(s.quantity), 0);
    return total <= Number(item.min_stock || 0);
  });

  return respond(true, {
    total_items: items.length,
    total_warehouses: warehouses.filter(w => w.type === "warehouse").length,
    total_projects: warehouses.filter(w => w.type === "project").length,
    low_stock_count: lowStockItems.length,
    pending_requests: requests.filter(r => r.status === "submitted").length,
    draft_receipts: receipts.filter(r => r.status === "draft").length,
    draft_transfers: transfers.filter(t => t.status === "draft").length,
  });
}

function getStockByWarehouse(p) {
  if (!p.warehouse_id) return respond(false, null, "warehouse_id required", 400);
  const stocks = getSheetData(SHEETS.STOCK).filter(s => s.warehouse_id === p.warehouse_id);
  return respond(true, stocks);
}

function getRecentActivity(p) {
  const limit = Number(p.limit || 10);
  const logs = getSheetData(SHEETS.ACTIVITY_LOG);
  const recent = logs.slice(-limit).reverse();
  return respond(true, recent);
}

// ============================================================
// USERS
// ============================================================

function createUser(p) {
  if (!p.email || !p.password) return respond(false, null, "Email and password required", 400);
  const existing = getSheetData(SHEETS.USERS).find(u => u.email === p.email);
  if (existing) return respond(false, null, "Email already exists", 400);
  const now = getTimestamp();
  const record = {
    id: generateId(), name: p.name, email: p.email,
    password_hash: hashPassword(p.password), role: p.role || "admin",
    is_active: true, created_at: now, updated_at: now
  };
  appendToSheet(SHEETS.USERS, record);
  const { password_hash, ...safeRecord } = record;
  return respond(true, safeRecord, "User created");
}
```

---

## 8. Catatan Penting untuk AI Agent

### Setup Awal
1. Buka Google Sheets baru
2. Buka Apps Script (Extensions → Apps Script)
3. Copy semua kode dari section 7 ke `Code.gs`
4. Deploy sebagai Web App: Execute as "Me", Access "Anyone"
5. Jalankan fungsi `initializeSheets()` satu kali untuk generate semua sheet dan seed default users
6. Default credentials: `manager@demo.com` / `manager123` dan `admin@demo.com` / `admin123`

### Constraint Apps Script Penting
- Semua response harus melalui `ContentService.createTextOutput(...).setMimeType(ContentService.MimeType.JSON)`
- `doGet` dan `doPost` adalah entry point utama — tidak perlu fungsi lain di root
- Setiap kali deploy ulang, URL bisa berubah jika tidak menggunakan "Manage Deployments" → update yang ada
- CORS sudah ditangani otomatis oleh Apps Script Web App
- Tidak ada session/cookie — setiap request harus bawa `user_id` atau auth info di payload

### Konvensi FE
- Semua POST request: `Content-Type: application/json`
- Simpan `user` object di localStorage setelah login (termasuk `id` dan `role`)
- Setiap request yang butuh auth context: sertakan `user_id` di payload
- Gunakan `role` dari stored user untuk kondisional UI (approve button, user management menu, dll)

---

*Blueprint Version: 1.0.0 — Generated for Inventory ERP Demo*