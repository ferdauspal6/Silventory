export interface User {
  id: string
  name: string
  email: string
  role: 'manager' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  name: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Unit {
  id: string
  name: string
  abbreviation: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Item {
  id: string
  code: string
  name: string
  category_id: string
  brand_id: string
  unit_id: string
  description: string
  min_stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  code: string
  name: string
  contact_person: string
  phone: string
  email: string
  address: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Warehouse {
  id: string
  code: string
  name: string
  type: 'warehouse' | 'project'
  location: string
  person_in_charge: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Stock {
  id: string
  item_id: string
  warehouse_id: string
  quantity: number
  updated_at: string
}

export interface RequestItem {
  id: string
  request_number: string
  requested_by: string
  warehouse_id: string
  notes: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  submitted_at: string
  approved_by: string
  approved_at: string
  rejection_reason: string
  created_at: string
  updated_at: string
  details?: RequestItemDetail[]
}

export interface RequestItemDetail {
  id: string
  request_id: string
  item_id: string
  quantity_requested: number
  notes: string
}

export interface ReceiptItem {
  id: string
  receipt_number: string
  request_id: string
  supplier_id: string
  warehouse_id: string
  received_by: string
  receipt_date: string
  notes: string
  status: 'draft' | 'confirmed'
  created_at: string
  updated_at: string
  details?: ReceiptItemDetail[]
}

export interface ReceiptItemDetail {
  id: string
  receipt_id: string
  item_id: string
  quantity_received: number
  notes: string
}

export interface StockTransfer {
  id: string
  transfer_number: string
  from_warehouse_id: string
  to_warehouse_id: string
  transferred_by: string
  transfer_date: string
  notes: string
  status: 'draft' | 'confirmed'
  created_at: string
  updated_at: string
  details?: StockTransferDetail[]
}

export interface StockTransferDetail {
  id: string
  transfer_id: string
  item_id: string
  quantity: number
  notes: string
}

export interface StockOpname {
  id: string
  opname_number: string
  warehouse_id: string
  conducted_by: string
  opname_date: string
  notes: string
  status: 'draft' | 'confirmed'
  created_at: string
  updated_at: string
  details?: StockOpnameDetail[]
}

export interface StockOpnameDetail {
  id: string
  opname_id: string
  item_id: string
  quantity_system: number
  quantity_actual: number
  difference: number
  notes: string
}

export interface StockUsage {
  id: string
  usage_number: string
  project_id: string
  input_type: 'usage' | 'remaining'
  recorded_by: string
  usage_date: string
  notes: string
  status: 'draft' | 'confirmed'
  created_at: string
  updated_at: string
  details?: StockUsageDetail[]
}

export interface StockUsageDetail {
  id: string
  usage_id: string
  item_id: string
  quantity_before: number
  quantity_input: number
  quantity_used: number
  quantity_remaining: number
  notes: string
}

export interface ActivityLog {
  id: string
  timestamp: string
  user_id: string
  action: string
  module: string
  record_id: string
  description: string
  payload: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
  code?: number
}

export interface DashboardSummary {
  total_items: number
  total_warehouses: number
  low_stock_count: number
  pending_transactions: number
}
