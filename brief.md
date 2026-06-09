# Inventory ERP System — Blueprint

> **Purpose:** Demo & pitching content. Backend: Google Sheets + Google Apps Script. Frontend: SPA terpisah, mobile-responsive, PWA-ready.
> **Apps Script Deployment URL:** `https://script.google.com/macros/s/AKfycbyuOBOy7ie9qIfUq0FeEMJPvs2IkyIJdHAwV2_-7be5zdkN89YT8h6KVy69GrwWHW2U/exec`

---

## 1. Tech Stack

| Layer | Stack |
|---|---|
| Framework | Vue 3 (Vite) + TypeScript |
| Styling | Tailwind CSS v4 |
| UI Library | shadcn-vue + Reka UI |
| Icons | Lucide Vue |
| State Management | Pinia |
| HTTP Client | Axios |
| Form Validation | VeeValidate + Zod |
| Routing | Vue Router 4 |
| Backend | Google Apps Script + Google Sheets |
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
| 20 | `sales` | Header transaksi POS / kasir |
| 21 | `sale_details` | Detail line item penjualan POS |

---

## 3. Struktur Kolom Per Sheet

### `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| name | STRING | Nama lengkap |
| email | STRING | Email (unique) |
| password_hash | STRING | Hash password (MD5) |
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
| price | NUMBER | Harga jual (untuk POS) |
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
| module | STRING | Nama modul (request_items, stock, sales, dll) |
| record_id | STRING | ID record yang diaksi |
| description | STRING | Deskripsi singkat aktivitas |
| payload | STRING | JSON string data sebelum/sesudah (opsional) |

### `sales`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| sale_number | STRING | Auto-generate: SAL-YYYYMMDD-XXX |
| warehouse_id | STRING | FK → warehouses.id (sumber stok) |
| cashier_id | STRING | FK → users.id |
| sale_date | DATETIME | |
| subtotal | NUMBER | Total sebelum diskon |
| discount_type | ENUM | `percent` / `fixed` / `""` |
| discount_value | NUMBER | Nilai input user |
| discount_amount | NUMBER | Hasil kalkulasi nominal potongan |
| total | NUMBER | Total setelah diskon |
| notes | STRING | |
| status | ENUM | `completed` / `voided` |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `sale_details`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | STRING | UUID |
| sale_id | STRING | FK → sales.id |
| item_id | STRING | FK → items.id |
| quantity | NUMBER | |
| price_at_sale | NUMBER | Harga saat transaksi (snapshot) |
| discount_type | ENUM | `percent` / `fixed` / `""` |
| discount_value | NUMBER | |
| discount_amount | NUMBER | Nominal potongan per item |
| subtotal | NUMBER | `(price_at_sale * quantity) - discount_amount` |
| created_at | DATETIME | |

> **Saat sale dibuat:** stock akan berkurang. Saat `voidSale`: stock dikembalikan.

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
| POS / Kasir | ✅ | ✅ |
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

### Auth
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `login` | POST | `email`, `password` | Return user data + role |

### Master: Categories
| Action | Method | Parameter |
|---|---|---|
| `getCategories` | GET | `is_active` (opsional) |
| `createCategory` | POST | `name`, `description` |
| `updateCategory` | POST | `id`, `name`, `description`, `is_active` |
| `deleteCategory` | POST | `id` |

### Master: Brands
| Action | Method | Parameter |
|---|---|---|
| `getBrands` | GET | — |
| `createBrand` | POST | `name`, `description` |
| `updateBrand` | POST | `id`, ...fields |
| `deleteBrand` | POST | `id` |

### Master: Units
| Action | Method | Parameter |
|---|---|---|
| `getUnits` | GET | — |
| `createUnit` | POST | `name`, `abbreviation` |
| `updateUnit` | POST | `id`, ...fields |
| `deleteUnit` | POST | `id` |

### Master: Items
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `getItems` | GET | `category_id`, `is_active` | |
| `getItemById` | GET | `id` | |
| `createItem` | POST | `code`, `name`, `category_id`, `brand_id`, `unit_id`, `min_stock`, `price` | `price` default `0` |
| `updateItem` | POST | `id`, ...fields | |
| `deleteItem` | POST | `id` | |

### Master: Suppliers
| Action | Method | Parameter |
|---|---|---|
| `getSuppliers` | GET | — |
| `getSupplierById` | GET | `id` |
| `createSupplier` | POST | `code`, `name`, `contact_person`, `phone`, `email`, `address` |
| `updateSupplier` | POST | `id`, ...fields |
| `deleteSupplier` | POST | `id` |

### Master: Warehouses
| Action | Method | Parameter |
|---|---|---|
| `getWarehouses` | GET | `type` (`warehouse`/`project`) |
| `getWarehouseById` | GET | `id` |
| `createWarehouse` | POST | `code`, `name`, `type`, `location`, `person_in_charge` |
| `updateWarehouse` | POST | `id`, ...fields |
| `deleteWarehouse` | POST | `id` |

### Stock
| Action | Method | Parameter |
|---|---|---|
| `getStock` | GET | `warehouse_id`, `item_id` |
| `getLowStock` | GET | — |

### Request Items
| Action | Method | Parameter |
|---|---|---|
| `getRequests` | GET | `status`, `requested_by` |
| `getRequestById` | GET | `id` |
| `createRequest` | POST | `warehouse_id`, `notes`, `details` |
| `updateRequest` | POST | `id`, `notes`, `details` |
| `submitRequest` | POST | `id` |
| `approveRequest` | POST | `id`, `approved_by` |
| `rejectRequest` | POST | `id`, `approved_by`, `rejection_reason` |
| `deleteRequest` | POST | `id` |

### Receipt Items
| Action | Method | Parameter |
|---|---|---|
| `getReceipts` | GET | `status`, `warehouse_id` |
| `getReceiptById` | GET | `id` |
| `createReceipt` | POST | `supplier_id`, `warehouse_id`, `receipt_date`, `request_id`, `notes`, `details` |
| `updateReceipt` | POST | `id`, ...fields |
| `confirmReceipt` | POST | `id` |
| `deleteReceipt` | POST | `id` |

### Stock Transfer
| Action | Method | Parameter |
|---|---|---|
| `getTransfers` | GET | `status`, `from_warehouse_id`, `to_warehouse_id` |
| `getTransferById` | GET | `id` |
| `createTransfer` | POST | `from_warehouse_id`, `to_warehouse_id`, `transfer_date`, `notes`, `details` |
| `updateTransfer` | POST | `id`, ...fields |
| `confirmTransfer` | POST | `id` |
| `deleteTransfer` | POST | `id` |

### Stock Opname
| Action | Method | Parameter |
|---|---|---|
| `getOpnames` | GET | `status`, `warehouse_id` |
| `getOpnameById` | GET | `id` |
| `createOpname` | POST | `warehouse_id`, `opname_date`, `notes`, `details` |
| `updateOpname` | POST | `id`, ...fields |
| `confirmOpname` | POST | `id` |
| `deleteOpname` | POST | `id` |

### Stock Usage
| Action | Method | Parameter |
|---|---|---|
| `getUsages` | GET | `project_id`, `status` |
| `getUsageById` | GET | `id` |
| `createUsage` | POST | `project_id`, `input_type`, `usage_date`, `notes`, `details` |
| `updateUsage` | POST | `id`, ...fields |
| `confirmUsage` | POST | `id` |
| `deleteUsage` | POST | `id` |

### POS / Sales
| Action | Method | Parameter | Keterangan |
|---|---|---|---|
| `getSales` | GET | `warehouse_id`, `status`, `cashier_id` | |
| `getSaleById` | GET | `id` | Include details |
| `createSale` | POST | `warehouse_id`, `cashier_id`, `sale_date`, `notes`, `discount_type`, `discount_value`, `details: [{item_id, quantity, price_at_sale, discount_type, discount_value}]` | Validasi stok, kurangi stock, generate sale_number |
| `voidSale` | POST | `id`, `user_id` | Status → voided, stock dikembalikan |
| `getDailySummary` | GET | `date`, `warehouse_id` (opsional) | Total transaksi, revenue, item terjual, voided |

### Dashboard
| Action | Method | Parameter |
|---|---|---|
| `getDashboardSummary` | GET | — |
| `getStockByWarehouse` | GET | `warehouse_id` |
| `getRecentActivity` | GET | `limit` (default 10) |

### Users (Manager only)
| Action | Method | Parameter |
|---|---|---|
| `getUsers` | GET | — |
| `createUser` | POST | `name`, `email`, `password`, `role` |
| `updateUser` | POST | `id`, ...fields |
| `deactivateUser` | POST | `id` |

---

## 6. Code.gs — Struktur File

```
Code.gs
├── doGet(e)               — Router GET requests
├── doPost(e)              — Router POST requests
├── initializeSheets()     — Generate semua sheet + header
├── generateId()           — UUID v4 generator
├── generateNumber()       — Auto-number (REQ-, RCV-, TRF-, SAL-, dll)
├── getTimestamp()         — Current datetime string
├── hashPassword(pwd)      — Simple hash (MD5 via Utilities)
├── updateStock(itemId, warehouseId, delta) — Tambah/kurangi stock
├── setStock(itemId, warehouseId, qty)     — Set stock ke nilai tertentu
├── logActivity(userId, action, module, recordId, desc) — Activity logger
│
├── [AUTH] handleLogin(payload)
│
├── [MASTER] Category CRUD
├── [MASTER] Brand CRUD
├── [MASTER] Unit CRUD
├── [MASTER] Item CRUD (custom createItem/updateItem dengan price)
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
├── [POS/SALES] getSales / getSaleById / createSale / voidSale / getDailySummary
│
├── [DASHBOARD] getDashboardSummary / getStockByWarehouse / getRecentActivity
└── [USERS] CRUD
```
