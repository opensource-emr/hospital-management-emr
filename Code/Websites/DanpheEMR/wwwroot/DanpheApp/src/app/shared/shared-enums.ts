export enum ENUM_BillingStatus {
  paid = "paid",
  unpaid = "unpaid",
  provisional = "provisional",
  cancel = "cancel",
  returned = "returned",
  free = "free" // needed for free-followups.
}

export enum ENUM_BillingType {
  inpatient = "inpatient",
  outpatient = "outpatient"
}

export enum ENUM_BillPaymentMode {
  cash = "cash",
  credit = "credit"
}

export enum ENUM_BillDepositType {
  Deposit = "Deposit",
  ReturnDeposit = "ReturnDeposit",
  DepositDeduct = "depositdeduct",
  DepositCancel = "depositcancel"
}


export enum ENUM_VisitType {
  inpatient = "inpatient",
  outpatient = "outpatient",
  emergency = "emergency"
}

export enum ENUM_AppointmentType {
  new = "New",
  followup = "followup",
  transfer = "Transfer",
  referral = "Referral"
}

export enum ENUM_VisitStatus {
  initiated = "initiated",
  cancel = "cancel"
}

export enum ENUM_OrderStatus {
  Active = "active",
  Pending = "pending",
  Final = "final"
}


export enum ENUM_PriceCategory {
  Normal = "Normal",
  EHS = "EHS",
  Foreigner = "Foreigner",
  SAARCCitizen = "SAARCCitizen"
}

export enum ENUM_LabOrderStatus {
  Active = "active",
  Pending = "pending",
  ResultAdded = "result-added",
  ReportGenerated = "report-generated"
}

export enum ENUM_LabUrgency {
  Urgent = "urgent",
  Normal = "normal",
  STAT = "STAT"
}

export enum ENUM_LabTemplateType {
  normal = "normal",
  html = "html",
  culture = "culture"
}

export enum ENUM_LabRunNumType {
  histo = "histo",
  cyto = "cyto",
  normal = "normal"
}


export enum ENUM_ValidatorTypes {
  required = "required",
  phoneNumber = "phoneNumber",
  positiveNumber = "positiveNum",

  //we can add other commonly used max length as well.
  maxLength10 = "maxLength10",
  maxLength20 = "maxLength20",
  maxLength30 = "maxLength30",
  maxLength100 = "maxLength100",

}

export enum ENUM_Requisition_VerificationStatus {
  //not initializing will auto-increment the enums. i.e. pending = 0 ,approved = 1..etc.
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
  all = "all"
}

export enum ENUM_InvoiceType {
  inpatientPartial = "ip-partial",
  inpatientDischarge = "ip-discharge",
  outpatient = "op-invoice"
}

export enum ENUM_TermsApplication {
  Inventory = 1,
  Pharmacy = 2,
}

export enum ENUM_StockLocations {
  Dispensary = 1,
  Store = 2
}
export enum ENUM_GRCategory {
  Consumables = "Consumables",
  CapitalGoods = "Capital Goods"
}

export enum ENUM_OrderStatusNumber {
  active = 1,
  pending = 2,
  final = 3
}
