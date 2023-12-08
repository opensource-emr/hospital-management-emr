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
  Final = "final",
  Complete = "complete",
  Cancel = "cancel"
}


export enum ENUM_PriceCategory {
  Normal = "Normal",
  EHS = "EHS",
  Foreigner = "Foreigner",
  SAARCCitizen = "SAARCCitizen",
  SSF = "ssf",
  Medicare = "medicare",
  General = "general"
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
  outpatient = "op-normal"
}

export enum ENUM_TermsApplication {
  Inventory = 1,
  Pharmacy = 2,
}

export enum ENUM_StockLocations {
  Dispensary = 1,
  Store = 2
}
export enum ENUM_GRItemCategory {
  Consumables = "Consumables",
  CapitalGoods = "Capital Goods"
}

export enum ENUM_OrderStatusNumber {
  active = 1,
  pending = 2,
  final = 3
}
export enum ENUM_DispensaryType {
  normal = "normal",
  insurance = "insurance"
}
export enum ENUM_ACC_ADDLedgerLedgerType {
  Default = "ledger",
  PharmacySupplier = 'pharmacysupplier',
  InventoryVendor = 'inventoryvendor',
  Consultant = 'consultant',
  CreditOrganization = 'creditorganization',
  InventorySubCategory = 'inventorysubcategory',
  InventoryConsumption = 'InventoryConsumption',
  BillingPriceItem = 'billingincomeledger',
  PaymentModes = 'paymentmodes',
  BankReconciliationCategory = 'bankreconciliationcategory',
  MedicareTypes = 'medicaretypes'
}
export enum ENUM_ACC_ReportStaticName {
  LedgerReport = "LedgerReport",
  DailyTransactionReport = 'DailyTransactionReport',
  TrailBalanceReport = 'TrailBalanceReport',
  ProfitLossReport = 'ProfitLossReport',
  BalanceSheetReport = 'BalanceSheetReport',
  CashFlowReport = 'CashFlowReport',
  GroupStatementReport = 'GroupStatementReport',
  BankReconciliation = 'BankReconciliation',
  CashBankBookReport = 'CashBankBookReport',
  DayBookReport = 'DayBookReport',
  SubLedgerReport = 'SubLedgerReport',
  AccountHeadDetailReport = 'AccountHeadDetailReport'
}
export enum ENUM_ACC_ReportName {
  LedgerReport = "/Accounting/Reports/LedgerReport",
  DailyTransactionReport = '/Accounting/Reports/DailyTransactionReport',
  TrailBalanceReport = '/Accounting/Reports/TrailBalanceReport',
  ProfitLossReport = '/Accounting/Reports/ProfitLossReport',
  BalanceSheetReport = '/Accounting/Reports/BalanceSheetReport',
  CashFlowReport = '/Accounting/Reports/CashFlowReport',
  GroupStatementReport = '/Accounting/Reports/GroupStatementReport',
  BankReconciliation = '/Accounting/Reports/BankReconciliation',
  CashBankBookReport = '/Accounting/Reports/Cash-BankBookReport',
  DayBookReport = '/Accounting/Reports/DayBookReport',
  SubLedgerReport = '/Accounting/Reports/SubLedgerReport',
  AccountHeadDetailReport = '/Accounting/Reports/AccountHeadDetailReport',
}
export enum ENUM_SSF_EligibilityType {
  Medical = "Medical",
  Accident = "Accident"
}

export enum ENUM_RegistrationSubCases {
  NonWorkRelated = "non work related",
  WorkRelated = "work related"
}

export enum ENUM_ValidFileFormats {
  jpegImage = "image/jpeg",
  // pngImage = "image/png",
  jpgImage = "image/jpg",
  pdf = "application/pdf"
}

export enum ENUM_FileSizeUnits {
  Bytes = "Bytes",
  KB = "KB",
  MB = "MB",
  GB = "GB",
  TB = "TB",
  PB = "PB",
  EB = "EB",
  ZB = "ZB",
  YB = "YB"
}
export enum ENUM_SSFSchemeTypeSubProduct {
  MedicalExpenses_IP = 1,
  MedicalExpenses_OP = 2,
  MaternityExpenses_IP = 3,
  MaternityExpenses_OP = 4,
  MedicalExpensesNewlyBornChild_IP = 5,
  MedicalExpensesNewlyBornChild_OP = 6,
  OccupationalDisease_MedicalExpense = 10,
  OccupationalDisease_TemporaryTotalDisability = 11,
  OccupationalDisease_PermanentDisability = 12,
  OccupationalDisease_TotalPermanentDisability = 13,
  EmploymentRelatedAccident_MedicalExpenses = 14,
  EmploymentRelatedAccident_TemporaryTotalDisability = 15,
  EmploymentRelatedAccident_PermanentDisability = 16,
  EmploymentRelatedAccident_TotalPermanentDisability = 17,
  OtherAccident_ExceptEmploymentRelated = 18,
}

export enum ENUM_DanpheHTTPResponses {
  OK = "OK",
  Failed = "Failed"
}

export enum ENUM_ClaimExtensionUrl {
  IsReclaim = 'IsReclaim',
  PreviousClaimCode = 'PreviousClaimCode',
  EmployerId = 'EmployerId',
  schemeType = 'schemeType',
  subProduct = 'subProduct',
  Admitted = 'Admitted',
  WoundCondition = 'WoundCondition',
  InjuredBodyPart = 'InjuredBodyPart',
  IsDisable = 'IsDisable',
  IsDead = 'IsDead',
  AccidentDescription = 'AccidentDescription',
  ReasonOfSickness = 'ReasonOfSickness',
  DischargeType = 'DischargeType',
  DischargeSummary = 'DischargeSummary',
  DischargeDate = 'DischargeDate',
  Cancer = 'Cancer',
  HIV = 'HIV',
  HeartAttack = 'HeartAttack',
  HighBp = 'HighBp',
  Diabetes = 'Diabetes'
}

export enum ENUM_ICDCoding {
  ICD10 = 'icd_0'
}

export enum ENUM_DefaultICDCode {
  A09 = "A09"
}

export enum ENUM_ClaimCategory {
  Service = 'service',
  Product = 'product',
  Item = 'item'
}

export enum ENUM_ClaimResourceType {
  ResourceType = 'Claim'
}

export enum ENUM_MessageBox_Status {
  Success = "success",
  Error = "error",
  Failed = "failed",
  Warning = "warning",
  Notice = "notice"
}

export enum ENUM_LabTypes {
  OpLab = "OP-Lab",
  ErLab = "ER-Lab"
}

export enum ENUM_ACC_VoucherCode {
  PaymentVoucher = "PMTV",
  ReceiptVoucher = "RV",
  JournalVoucher = "JV",
  PurchaseVoucher = "PV",
  SalesVoucher = "SV",
  ContraVoucher = "CV",
  CreditNote = "CN",
  DebitNote = "DN",
  ReverseVoucher = "RVS"
}

export enum ENUM_ACC_PaymentMode {
  NA = "NA",
  Cash = "Cash",
  Bank = "Bank"
}

export enum ENUM_ACC_UtilityTerms {
  VoucherReportCopy = "VoucherReportCopy"
}

export enum ENUM_ACC_DrCr {
  Dr = "Dr",
  Cr = "Cr"
}

export enum ENUM_Data_Type {
  Object = "object",
  String = "string"
}

export enum ENUM_DateFormats {
  Year_Month_Day = "YYYY-MM-DD"
}

export enum ENUM_CalanderType {
  NP = "np",
  EN = "en"
}

export enum ENUM_AD_BS {
  AD = "AD",
  BS = "BS"
}

export enum ENUM_ParameterGroupName {
  Inventory = 'Inventory'
}

export enum ENUM_ParameterName {
  InventoryFiledCustomization = 'InventoryFieldCustomization'
}


export enum ENUM_HandOver_Type {
  User = "User",
  Account = "Account"
}

export enum ENUM_HandOver_Status {
  Pending = "pending",
  Received = "received"
}

export enum ENUM_DanpheHTTPResponseText {
  OK = "OK",
  Failed = "Failed"
}
export enum ENUM_EmpCashTransactionType {
  CashSales = "CashSales",
  Deposit = "Deposit",
  SalesReturn = "SalesReturn",
  ReturnDeposit = "ReturnDeposit",
  DepositDeduct = "depositdeduct",
  CashDiscountGiven = "CashDiscountGiven",
  CollectionFromReceivable = "CollectionFromReceivable",
  HandoverGiven = "HandoverGiven",
  MaternityAllowance = "MaternityAllowance",
  MaternityAllowanceReturn = "MaternityAllowanceReturn",
  HandoverReceived = "HandoverReceived"
}

export enum ENUM_DateTimeFormat {
  Year_Month_Day = "YYYY-MM-DD",
  Year_Month_Day_Hour_Minute = "YYYY-MM-DD HH:mm",
  Year_Month_Day_Hour_Minute_12HoursFormat = "YYYY-MM-DD HH:mm A"
}

export enum ENUM_DateFormat {
  AD = "AD",
  BS = "BS"
}

export enum ENUM_StoreCategory {
  SubStore = 'substore',
  Store = 'store',
  Dispensary = 'dispensary',
}

export enum ENUM_StoreSubCategory {
  Inventory = 'inventory',
  Pharmacy = 'pharmacy'
}

export enum ENUM_CurrentBillingFlow {
  Orders = "Orders",
  BillReturn = "BillReturn",
  PackageBilling = "packageBilling"
}

export enum ENUM_ACC_RouteFrom {
  VoucherReportCopy = "VoucherReportCopy",
  TransactionView = "TransactionView",
  EditVoucher = "EditVoucher",
  VoucherVerify = "VoucherVerify"
}

export enum ENUM_MembershipTypeName {
  SSF = "SSF",
  Medicare = "Medicare",
  ECHS = "ECHS"
}


export enum ENUM_LocalStorageKeys {
  LoginTokenName = "loginJwtToken"
}


export enum ENUM_TypesOfBillingForReport {
  CashSales = "CashSales",
  CreditSales = "CreditSales",
  ReturnCashSales = "ReturnCashSales",
  ReturnCreditSales = "ReturnCreditSales"
}

export enum ENUM_Relation {
  Self = "Self",
  Father = "Father",
  Mother = "Mother",
  Spouse = "Spouse",
  Children = "Children"
}

export enum ENUM_Country {
  Nepal = "Nepal"
}

export enum ENUM_DateRangeName {
  Today = "today",
  OneWeek = "last1week",
  OneMonth = "last1month",
  ThreeMonth = "last3month",
  SixMonth = "last6month"
}
export enum ENUM_CreditModule {
  Billing = "billing",
  Pharmacy = "pharmacy"
}
export enum ENUM_ServiceBillingContext {
  Registration = "registration",
  Admission = "admission",
  OpBilling = "op-billing",
  IpBilling = "ip-billing",
  IpPharmacy = "ip-pharmacy",
  OpPharmacy = "op-pharmacy"
}

export enum ENUM_Scheme_ApiIntegrationNames {
  SSF = "SSF",
  Medicare = "Medicare",
  ECHS = "ECHS",
  NGHIS = "NGHIS"
}

//Sud:14Mar'23--This Enum is for temporary purpose, we may achieve without this.. for Later Revision (less priority)
export enum ENUM_Scheme_FieldSettingParamNames {
  General = "General",
  SSF = "SSF",
  GeneralWithMembership = "GeneralWithMembership",
  Medicare = "Medicare",
  ECHS = "ECHS"
}

export enum ENUM_DanpheSSFSchemes {
  Medical = "SSF-Medical",
  Accidental_Work = "SSF-Accidental-Work Related",
  Accidental_Non_Work = "SSF-Accidental-Non Work Related"
}

export enum ENUM_AdditionalServiceItemGroups {
  Anaesthesia = "Anaesthesia",
  VisitAdditionalItems = "VisitAdditionalItems"
}

export enum ENUM_IntegrationNames {
  OPD = "OPD",
  LAB = "LAB",
  Radiology = "RADIOLOGY",
  BedCharges = "Bed Charges"
}

export enum ENUM_ModuleName {
  Pharmacy = 'Pharmacy',
  Dispensary = 'Dispensary'
}

export enum ENUM_Deposit_OrganizationOrPatient {
  Patient = 'patient',
  Organization = 'organization'
}
export enum ENUM_Dispensary_ReturnInvoiceBy {
  HospitalNumber = "hospitalno",
  BillNumber = "billno"
}

export enum ENUM_PHRMPurchaseOrderStatus {
  Pending = "pending",
  Complete = "complete",
  Active = "active",
  Cancel = "cancel"
}

export enum ENUM_InvoiceReceiptMode {
  Invoice = 'invoice',
  CreditNote = 'credit-note'
}

//* Krishna, 10thMay'23, Below enum is used to handle the names of Process that needs to be confirmed with user credentials,
//* Note: This enum needs to be updated if any new process is to be confirmed with user credentials
export enum ENUM_ProcessesToConfirmDisplayNames {
  SchemeRefund = "Scheme Refund Process",
  BillInvoiceReturn = "Billing Invoice Return Process"
}

export enum ENUM_ProcessConfirmationActions {
  confirmSuccess = "confirm-success",
  close = "close"
}

export enum ENUM_PharmacyPurchaseOrderVerificationStatus {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
  all = "all"
}


export enum ENUM_PharmacyRequisitionVerificationStatus {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
  all = "all"
}
export enum ENUM_GeographicalReportType {
  District = "District",
  Municipality = "Municipality"
}

export enum ENUM_ServiceCategoryCodes {
  ServiceCharges = "SERVCH",
  InvestigationCharges = "INVSTCH",
  ProcedureCharges = "PROCEDCH",
  BedCharges = "BEDCH",
  OperationCharges = "OPERNCH",
  ConsumableCharges = "CONSUMCH",
  AmbulanceCharges = "AMBLNCH",
  PackageCharges = "PACKGCH",
  BloodBankCharges = "BLBNKCH",
  PharmacyCharges = "PHRMCH",
  ConsultationCharges = "CONSLTCH"
}
export enum ENUM_CancellationService {
  PR = "PR",
  PRC = "PRC"
}

export enum ENUM_ProvisionalBillingContext {
  Outpatient = "Outpatient",
  ProvisionalDischarge = "ProvisionalDischarge"
}
export enum ENUM_DischargeType {
  Lama = "LAMA",
  Death = "Death",
  Recovered = "Recovered",
}

export enum ENUM_Genders {
  Male = "male",
  Female = "female",
  Others = "others"
}
export enum ENUM_RecoveredDischargeConditions {
  Delivery = "delivery",
  Normal = "normal"
}
export enum ENUM_DischargeSummaryDisplayLabels {
  DischargeCondition = " <strong> Discharge Condition :</strong> ",
  DeathPeriod = " <strong> Death Period : </strong>",
  SelectedDiagnosis = " <strong> Selected Diagnosis : </strong> ",
  ProvisionalDiagnosis = " <strong> Provisional Diagnosis : </strong> ",
  Anesthetists = " <strong> Anesthetists : </strong> ",
  ResidenceDrName = "<strong> Residence Dr : </strong>",
  BabyWeight = "<strong> Baby Weight(gm) : </strong>",
  OtherDiagnosis = "<strong> Other Diagnosis :</strong>",
  ClinicalFindings = "<strong>Clinical Findings :</strong> ",
  ChiefComplaint = "<strong> Chief Complaint : </strong>",
  PatientIllnessHistory = "<strong> Patient Illness History :</strong> ",
  PastHistory = "<strong> Past History :</strong> ",
  CaseSummary = "<strong>Case Summary : </strong>",
  Procedure = "<strong> Procedure : </strong>",
  OperativeFindings = "<strong> Operative Findings : </strong>",
  HistologyReport = "<strong> Histology Report : </strong>",
  HospitalCourse = "<strong> Hospital Course : </strong>",
  Treatment = "<strong> Treatment During Hospital Stay : </strong>",
  Condition = "<strong> Condition On Discharge : </strong>",
  PendingReports = "<strong> Pending Reports : </strong>",
  SpecialNotes = "<strong> Special Notes : </strong>",
  Allergies = "<strong> Allergies : </strong>",
  Activities = "<strong> Activities : </strong>",
  Diet = "<strong> Diet : </strong>",
  RestDays = "<strong> Rest Days : </strong>",
  FollowUp = "<strong> Follow Up : </strong>",
  Others = "<strong> Others : </strong>",
  CheckedBy = "<strong> Checked By : </strong>",
  Medications = "<strong> Medications : </strong>",
  LabTests = "<strong> Lab Tests : </strong>",
  Consultants = "<strong> Consultants : </strong>"
}
export enum ENUM_CalendarTypes {
    English = "en",
    Nepali = "np"
}

export enum ENUM_SSF_BookingStatus {
  Booked = "Booked",
  NotBooked = "Not Booked"
}
export enum ENUM_ConsultationRequestStatus {
  Requested = "Requested",
  Consulted = "Consulted"
}
export enum ENUM_IntakeOutputType {
  Intake = "Intake",
  Output = "Output"
}
export enum ENUM_ExternalLab_SampleStatus {
  SampleCollected = "Sample Collected",
  SampleDispatched = "Sample Dispatched",
  ReportReceived = "Report Received"
}
