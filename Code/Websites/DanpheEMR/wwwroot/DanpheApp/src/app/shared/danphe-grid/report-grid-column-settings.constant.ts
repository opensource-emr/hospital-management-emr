import * as moment from "moment/moment";
import { ReportingService } from "../../reporting/shared/reporting-service";
import { CommonFunctions } from "../common.functions";
import GridColumnSettings from "./grid-column-settings.constant";
export class ReportGridColumnSettings {
  constructor(public taxLabel) { }

  //All Billing Grid Reports Constant Setting Start
  //grid-action-label
  public DoctorRevenue = [
    {
      headerName: "Date",
      children: [
        {
          headerName: "",
          field: "Date",
          width: 130,
          cellRenderer: this.DateConverterRenderer,
        },
      ],
    },
    {
      headerName: "Doctor",
      children: [
        {
          headerName: "",
          width: 220,
          cellRenderer: this.DocRevenue_DocNameRenderer,
        },
      ],
    },
    {
      headerName: "USG",
      children: [
        { headerName: "amount", field: "USG", width: 100 },
        { headerName: "count", field: "USGCOUNT", width: 90 },
      ],
    },
    {
      headerName: "Ortho-Procedures",
      children: [
        { headerName: "amount", field: "ORTHOPROCEDURES", width: 120 },
        { headerName: "count", field: "ORTHOPROCEDURESCOUNT", width: 90 },
      ],
    },
    {
      headerName: "CT-Scan",
      width: 100,
      children: [
        { headerName: "amount", field: "CT", width: 80 },
        { headerName: "count", field: "CTCOUNT", width: 80 },
      ],
    },
    {
      headerName: "<b>OPD</b>",
      children: [
        { headerName: "amount", field: "OPD", width: 80 },
        { headerName: "count", field: "OPDCOUNT", width: 80 },
      ],
    },
    {
      headerName: "General Surgery",
      children: [
        { headerName: "amount", field: "GSURG", width: 100 },
        { headerName: "count", field: "GSURGCOUNT", width: 90 },
      ],
    },
    {
      headerName: "Gyno-Surgery",
      children: [
        { headerName: "amount", field: "GYNSURG", width: 100 },
        { headerName: "count", field: "GYNSURGCOUNT", width: 90 },
      ],
    },
    {
      headerName: "ENT",
      children: [
        { headerName: "amount", field: "ENT", width: 100 },
        { headerName: "count", field: "ENTCOUNT", width: 90 },
      ],
    },
    {
      headerName: "Dental",
      children: [
        { headerName: "amount", field: "DENTAL", width: 100 },
        { headerName: "count", field: "DENTALCOUNT", width: 90 },
      ],
    },
    {
      headerName: "OT",
      children: [
        { headerName: "amount", field: "OT", width: 100 },
        { headerName: "count", field: "OTCOUNT", width: 90 },
      ],
    },
  ];
  public DoctorReport = [
    {
      headerName: "Date",
      field: "Date",
      width: 110,
      cellRenderer: this.DateConverterRenderer,
    },
    { headerName: "Doctor", field: "Doctor", width: 200 },
    { headerName: "Hospital No", field: "HospitalNo", width: 200 },
    { headerName: "Patient Name", field: "PatientName", width: 200 },
    { headerName: "Department", field: "Department", width: 150 },
    { headerName: "Item", field: "Item", width: 180 },
    { headerName: "Rate", field: "Rate", width: 100 },
    { headerName: "Qty", field: "Quantity", width: 100 },
    { headerName: "SubTotal", field: "SubTotal", width: 100 },
    { headerName: "Discount", field: "Discount", width: 120 },
    //{ headerName: "" + this.taxLabel + "", field: "Tax", width: 100 },
    { headerName: "Total", field: "Total", width: 100 },
    { headerName: "Ret Amt", field: "ReturnAmount", width: 140 },
    //{ headerName: "Ret " + this.taxLabel + "", field: "ReturnTax", width: 120 },
    //{ headerName: "Cancel Amt", field: "CancelTotal", width: 140 },
    { headerName: "Net Amt", field: "NetAmount", width: 140 },
    //{ headerName: "Cancel " + this.taxLabel + "", field: "CancelTax", width: 120 },
  ];
  public DoctorReferral = [
    {
      headerName: "Date",
      field: "VisitDate",
      width: 110,
      cellRenderer: this.DocRefDateConverter,
    },
    { headerName: "DoctorName", field: "ProviderName", width: 200 },
    { headerName: "Total Referrals", field: "TotalReferrals", width: 150 },
    {
      headerName: "ReferralCount",
      field: "ReferralCount",
      width: 150,
      cellRenderer: this.DocRefCountRenderer,
    },
    {
      headerName: "ReferralAmount",
      field: "ReferralAmount",
      width: 150,
      cellRenderer: this.DocRefAmountRenderer,
    },
    //{
    //    headerName: "",
    //    field: "",
    //    width: 150,
    //    template:
    //    `<a danphe-grid-action="details" class="grid-action">
    //       Details`
    //}
  ];

  public HandoverDenominationReport = [
    {
      headerName: "Date",
      field: "CreatedOn",
      width: 110,
      cellRenderer: this.BilDenominationDateConverter,
    },
    {
      headerName: "User Name",
      field: "FirstName",
      width: 200,
      cellRenderer: GridColumnSettings.FullNameRenderer,
    },
    {
      headerName: "Handover User Name",
      field: "FirstName",
      width: 200,
      cellRenderer: GridColumnSettings.HandoverFullNameRenderer,
    },
    { headerName: "Handover Type", field: "HandoverType", width: 200 },
    { headerName: "Amount", field: "HandoverAmount", width: 150 },
  ];

  public DailySalesReport = [
    {
      headerName: "Date",
      field: "BillingDate",
      width: 90,
      cellRenderer: this.DateConverter_UserCollection,
    },
    { headerName: "Type", field: "BillingType", width: 90 },
    { headerName: "ReceiptNo", field: "ReceiptNo", width: 110 },
    { headerName: "Hospital Number", field: "HospitalNo", width: 90 },
    { headerName: "PatientName", field: "PatientName", width: 220 },
    { headerName: "SubTotal", field: "SubTotal", width: 80 },
    { headerName: "Discount", field: "DiscountAmount", width: 80  },
    {
      headerName: "Net Total",
      field: "TotalAmount",
      width: 100,
      cellRenderer: this.StaticAmountRoundOff,
    },
    { headerName: "Cash Collection", field: "CashCollection", width: 100 },
    //{ headerName: "Credit Amt.", field: "Receivables", width: 80 },
    //{ headerName: "Credit Received Amt.", field: "CreditReceived", width: 80 },
    { headerName: "User", field: "CreatedBy", width: 100 },
    { headerName: "Remarks", field: "Remarks", width: 100 },
    { headerName: "Counter", field: "CounterName", width: 100 },
  ];

  //Admission Setting End
  public DateConverter_UserCollection(params) {
    let Date: string = params.data.BillingDate;
    return moment(Date).format("DD-MMM-YYYY");
  }

  public DiscountReport = [
    {
      headerName: "Date",
      field: "Date",
      width: 110,
      cellRenderer: this.DateConverterRenderer,
    },
    { headerName: "ReceiptNo", field: "ReceiptNo", width: 110 },
    { headerName: "Hospital Number", field: "HospitalNo", width: 90 },
    { headerName: "PatientName", field: "PatientName", width: 220 },
    { headerName: "Sub Total", field: "Price", width: 80 },
    //{ headerName: "Quantity", field: "Quantity", width: 160 },
    { headerName: "Discount", field: "DiscountAmount", width: 80 },
    { headerName: "" + this.taxLabel + "", field: "Tax", width: 80 },
    {
      headerName: "TotalAmount",
      field: "TotalAmount",
      width: 100,
      cellRenderer: this.StaticAmountRoundOff,
    },
    // { headerName: "Counter", field: "CounterId", width: 100 },
    { headerName: "User", field: "CreatedBy", width: 100 },
  ];

  public DepositBalanceReport = [

    { headerName: "Hospital Number", field: "PatientCode", width: 110 },
    { headerName: "Patient Name", field: "PatientName", width: 240 },
    {
      headerName: "Age/Sex", field: "", width: 100,
      cellRenderer: this.AgeSexRendererPatient,
    },
    { headerName: "Contact No", field: "PhoneNumber", width: 150 },
    { headerName: "TotalDeposit", field: "TotalDeposit", width: 110 },
    { headerName: "Total Deducted", field: "TotalDeducted", width: 110 },
    { headerName: "Total Refunded", field: "TotalRefunded", width: 110 },
    { headerName: "Balance", field: "Balance", width: 110 },
  ];

  public DepositTransactionsColumns = [
    {
      headerName: "Deposit Date",
      field: "DepositDate",
      width: 110,
      cellRenderer: this.DateConverterRendererForDepositeDate,
    },
    { headerName: "Receipt No", field: "ReceiptNo", width: 100 },
    { headerName: "Hospital No", field: "PatientCode", width: 110 },
    { headerName: "Patient Name", field: "PatientName", width: 150 },
    { headerName: "Contact No", field: "PhoneNumber", width: 110 },
    {
      headerName: "Age/Sex", field: "", width: 100,
      cellRenderer: this.AgeSexRendererPatient,
    },
    { headerName: "Deposit Received", field: "DepositReceived", width: 110 },
    { headerName: "Deposit Deduted", field: "DepositDeducted", width: 110 },
    { headerName: "Deposit Returned", field: "DepositReturned", width: 110 },
    { headerName: "User Name", field: "UserName", width: 110 },
    { headerName: "Counter", field: "CounterName", width: 110 }
  ];


  public DiscountSchemeGridColumns = [
    // {
    //   headerName: "Date",
    //   field: "Date",
    //   width: 110,
    //   cellRenderer: this.DateConverterRendererForSchemeWiseDiscountDate,
    // },
    { headerName: "Scheme Name", field: "MembershipTypeName", width: 100 },
    { headerName: "Community", field: "CommunityName", width: 100 },
    // { headerName: "Receipt No", field: "ReceiptNo", width: 100 },
    // { headerName: "Hospital No", field: "PatientCode", width: 110 },
    // { headerName: "Patient Name", field: "PatientName", width: 150 },
    { headerName: "Cash Amount", field: "CashAmount", width: 110 },
    { headerName: "Credit Amount", field: "CreditAmount", width: 110 },
    { headerName: "Total Amount", field: "Total", width: 110 },
    { headerName: "Free Cons Amount", field: "Free_Cons_Amount", width: 110 },
    { headerName: "Net Refund Amount", field: "NetRefundAmount", width: 110 },
    { headerName: "Discount Refund", field: "DiscountRefund", width: 110 },    
    { headerName: "NetAmount", field: "NetAmount", width: 110 }
  ];

  //public DepartmentWiseDiscountSchemeGridColumns = [
    // {
    //   headerName: "Date",
    //   field: "Date",
    //   width: 110,
    //   cellRenderer: this.DateConverterRendererForSchemeWiseDiscountDate,
    // },
  //   { headerName: "Service Department Name", field: "ServiceDepartmentName", width: 100 },
  //   { headerName: "Scheme Name", field: "MembershipTypeName", width: 100 },
  //   { headerName: "Community", field: "CommunityName", width: 100 },
  //   { headerName: "Cash Amount", field: "CashAmount", width: 110 },
  //   { headerName: "Credit Amount", field: "CreditAmount", width: 110 },
  //   { headerName: "Total Amount", field: "Total", width: 110 },
  //   { headerName: "Free Cons Amount", field: "Free_Cons_Amount", width: 110 },
  //   { headerName: "Net Refund Amount", field: "NetRefundAmount", width: 110 },
  //   { headerName: "Discount Refund", field: "DiscountRefund", width: 110 },    
  //   { headerName: "NetAmount", field: "NetAmount", width: 110 }
  // ];

  public DepartmentWiseDiscountSchemeGridColumns = [
    { headerName: "Service Department Name", field: "ServiceDepartmentName", width: 150 },
    { headerName: "Scheme Name", field: "MembershipTypeName", width: 150 },
    { headerName: "Total Quantity", field: "TotalQuantity", width: 90 },
    { headerName: "Total Invoice Amount", field: "TotalAmount", width: 90 },
    { headerName: "Total Discount", field: "TotalDiscount", width: 90 },
    { headerName: "Net Refund", field: "NetRefundAmount", width: 90 },
    { headerName: "Hospital Collection", field: "NetAmount", width: 100 },
    { headerName: "Payment mode", field: "PaymentMode", width: 100 },
    {
      headerName: "Actions",
      field: "",
      width: 80,
      template: `<a danphe-grid-action="viewDetails" class="grid-action">
                  View Details
                </a>`,
    }
  ];

  public DepartmentWiseDiscountSchemeItemsDetailsGridColumns = [
    { headerName: "Item Name", field: "ItemName", width: 250 },
    { headerName: "Scheme Name", field: "MembershipTypeName", width: 180 },
    { headerName: "Total Quantity", field: "TotalQuantity", width: 100 },
    { headerName: "Total Invoice Amount", field: "TotalAmount", width: 120 },
    { headerName: "Total Discount", field: "TotalDiscount", width: 100 },
    { headerName: "Net Refund", field: "NetRefundAmount", width: 100 },
    { headerName: "Hospital Collection", field: "NetAmount", width: 100 },
    { headerName: "Payment Mode", field: "PaymentMode", width: 100 },
  ];

  public PatientCreditSummaryColumns = [
    { headerName: "SR NO.", field: "SN", width: 50 },
    {
      headerName: "Date",
      field: "CreatedOn",
      width: 110,
      cellRenderer: this.DateConverterRendererForCreatedOn,
    },
    { headerName: "Patient Name", field: "PatientName", width: 200 },
    { headerName: "Hospital Number", field: "PatientCode", width: 90 },
    { headerName: "SubTotal", field: "SubTotal", width: 90 },
    { headerName: "Discount Amt", field: "DiscountAmount", width: 90 },
    {
      headerName: "Credit Amount",
      field: "TotalAmount",
      width: 110,
      cellRenderer: this.StaticAmountRoundOff,
    },
    { headerName: "Invoice No", field: "InvoiceNo", width: 90 },
    { headerName: "Credit Organization", field: "OrganizationName", width: 90 },
    { headerName: "Remarks", field: "Remarks", width: 90 },
    //{ headerName: "LastTxnDate", field: "LastTxnDate", width: 110, cellRenderer: this.LastTxnDateConverter },
    //TotalAmount = CommonFunctions.parseAmount(TotalAmount);
  ];

  public GetColumn_Billing_IncomeSegregation = [
    { headerName: "Department", field: "ServDeptName", width: 200 },
    { headerName: "Cash Sales", field: "CashSales" },
    { headerName: "Cash Discount", field: "CashDiscount" },
    { headerName: "Credit Sales", field: "CreditSales" },
    { headerName: "Credit Discount", field: "CreditDiscount" },
    { headerName: "Gross Sales", field: "GrossSales" },
    { headerName: "Total Discount", field: "TotalDiscount" },
    { headerName: "Return CashSales", field: "ReturnCashSales" },
    { headerName: "Return CashDiscount", field: "ReturnCashDiscount" },
    { headerName: "Return CreditSales", field: "ReturnCreditSales" },
    { headerName: "Return CreditDiscount", field: "ReturnCreditDiscount" },
    { headerName: "Total SalesReturn", field: "TotalSalesReturn" },
    { headerName: "Total ReturnDiscount", field: "TotalReturnDiscount" },
    { headerName: "Net Sales", field: "NetSales" },
    { headerName: "Total Sale Qty.", field: "TotalSaleQuantity" },
    { headerName: "Total Return Qty.", field: "TotalReturnQuantity" },
    { headerName: "Net Quantity", field: "NetQuantity" }
  ];

  public BillCancelSummaryColumns = [
    { headerName: "Patient Name", field: "PatientName", width: 150 },
    { headerName: "Hospital No.", field: "HospitalNo", width: 120 },
    {
      headerName: "Service Department",
      field: "ServiceDepartmentName",
      width: 180,
    },
    { headerName: "Item Name", field: "ItemName", width: 250 },
    { headerName: "Qty", field: "Quantity", width: 80 },
    {
      headerName: "Total Amt.",
      field: "TotalAmount",
      width: 90,
      cellRenderer: this.StaticAmountRoundOff,
    },
    { headerName: "Bill Entry Date", field: "CreatedOn", width: 110 },
    { headerName: "Entered By", field: "CreatedBy", width: 150 },
    { headerName: "Cancelled Date", field: "CancelledOn", width: 110 },
    { headerName: "Cancelled By", field: "CancelledBy", width: 150 },
    { headerName: "CancelRemarks", field: "CancelRemarks", width: 140 },
  ];

  public ReturnBillGridColumn = [
    {
      headerName: "Return Date",
      field: "Date",
      width: 100,
      cellRenderer: this.DateConverterRenderer,
    },
    { headerName: "Reference Invoice No.", width: 150, field: "RefInvoiceNo" },
    { headerName: "Credit Note No.", width: 100, field: "CreditNoteNumber" },
    { headerName: "Hospital Number", width: 120, field: "PatientCode" },
    { headerName: "Patient Name", width: 200, field: "PatientName" },
    //{ headerName: "ServiceDept Name", width: 140, field: "ServiceDepartmentName" },
    //{ headerName: "Item Name", width: 150, field: "ItemName" },
    // { headerName: "Sub Total", width: 90, field: "SubTotal" },
    // { headerName: "Discount Amount", width: 90, field: "DiscountAmount" },

    // { headerName: "Taxable Amount", width: 90, field: "TaxableAmount" },
    // { headerName: "Tax Total", width: 90, field: "TaxTotal" },
    { headerName: "Return Sub Total", width: 120, field: "SubTotal" },
    { headerName: "Return Discount", width: 120, field: "DiscountAmount" },
    { headerName: "Return Amount", width: 120, field: "TotalAmount" },
    { headerName: "Payment Mode", width: 120, field: "PaymentMode" },
    { headerName: "User", width: 90, field: "User" },
    { headerName: "Counter", width: 90, field: "CounterName" },
    { headerName: "Return Remarks", width: 110, field: "Remarks" },
    {
      headerName: "Action",
      field: "",
      width: 120,
      cellRenderer: ReportGridColumnSettings.ReturnBillReportAction,
    },
  ];

  static ReturnBillReportAction(){
    return `<a danphe-grid-action="view" class="grid-action">
    View Details</a>`;
  }
  public TotalItemsBillReport = [
    { headerName: "Date", field: "TransactionDate", width: 130 },
    { headerName: "Receipt No.", field: "ReceiptNo", width: 130 },
    { headerName: "BillingType", field: "BillingType", width: 130 },
    { headerName: "VisitType", field: "VisitType", width: 130 },
    { headerName: "Hospital No.", field: "HospitalNumber", width: 140 },
    { headerName: "Patient Name", field: "PatientName", width: 200 },
    { headerName: "Department", field: "ServiceDepartmentName", width: 130 },
    { headerName: "Item", field: "ItemName", width: 180 },
    { headerName: "Price", field: "Price", width: 110 },
    { headerName: "Qty", field: "Quantity", width: 80 },
    { headerName: "SubTotal", field: "SubTotal", width: 130 },
    { headerName: "Discount", field: "DiscountAmount", width: 130 },
    { headerName: "Total", field: "TotalAmount", width: 120 },
    { headerName: "User Name", field: "UserName", width: 110 },
    { headerName: "AssignedTo Dr.", field: "AssignedToDoctor", width: 180 },
    { headerName: "ReferredBy Dr.", field: "ReferredByDoctor", width: 180 },
    { headerName: "Remarks", field: "Remarks", width: 180 },
    { headerName: "ReferenceReceiptNo", field: "ReferenceReceiptNo", width: 180 },
    { headerName: "Disc. Scheme", field: "DiscountScheme", width: 180 },
    { headerName: "IsInsurance?", field: "IsInsurance", width: 180 }
  ];

  public EHSBillReport = [
    { headerName: "Date", field: "TransactionDate", width: 130 },
    { headerName: "Receipt No.", field: "ReceiptNo", width: 130 },
    { headerName: "BillingType", field: "BillingType", width: 130 },
    { headerName: "Hospital No.", field: "HospitalNumber", width: 140 },
    { headerName: "Patient Name", field: "PatientName", width: 200 },
    { headerName: "Department", field: "ServiceDepartmentName", width: 130 },
    { headerName: "Item", field: "ItemName", width: 180 },
    { headerName: "SubTotal", field: "SubTotal", width: 130 },
    { headerName: "Discount", field: "DiscountAmount", width: 130 },
    { headerName: "Total", field: "TotalAmount", width: 120 },
    { headerName: "User Name", field: "UserName", width: 110 },
    { headerName: "AssignedTo Dr.", field: "AssignedToDoctor", width: 180 },
    { headerName: "ReferredBy Dr.", field: "ReferredByDoctor", width: 180 },
    { headerName: "Remarks", field: "Remarks", width: 180 },
    { headerName: "ReferenceReceiptNo", field: "ReferenceReceiptNo", width: 180 },
  ];

  public SalesDaybookReport = [
    {
      headerName: "Date",
      field: "BillingDate",
      width: 100,
      cellRenderer: this.BillingDateConverterRenderer,
    },
    { headerName: "Cash Sales", field: "Paid_SubTotal", width: 110 },
    { headerName: "Cash Discount", field: "Paid_DiscountAmount", width: 110 },
    { headerName: "Return Cash Sales", field: "CashRet_SubTotal", width: 110 },
    { headerName: "Return Cash Discount", field: "CashRet_DiscountAmount", width: 110 },
    { headerName: "Credit Sales", field: "CrSales_SubTotal", width: 110 },
    { headerName: "Credit Discount",field: "CrSales_DiscountAmount",width: 110,},
    { headerName: "Return Credit Sales", field: "CrRet_SubTotal", width: 110 },
    { headerName: "Return Credit Discount", field: "CrRet_DiscountAmount", width: 110 },
    { headerName: "Gross Sales", field: "SubTotal", width: 120 },
    { headerName: "Total Discount ", field: "DiscountAmount", width: 110 },
    { headerName: "Total Sales Return", field: "TotalSalesReturn", width: 110 },
    { headerName: "Total Return Discount", field: "TotalReturnDiscount", width: 110 },
    { headerName: "Net Sales", field: "TotalAmount", width: 120 },
    { headerName: "Deposit Recieved", field: "DepositReceived", width: 110 },
    { headerName: "Deposit Deducted", field: "DepositDeducted", width: 110 },
    { headerName: "Deposit Refund", field: "DepositRefund", width: 110 },
    { headerName: "Net Cash Collection", field: "CashCollection", width: 120 },
  ];

  public DeptSalesDaybookReport = [
    //{ headerName: "SN", field: "SN", width: 90 },
    {
      headerName: "From",
      field: "FromDate",
      width: 110,
      cellRenderer: this.FromDateConverterRenderer,
    },
    {
      headerName: "To",
      field: "ToDate",
      width: 110,
      cellRenderer: this.ToDateConverterRenderer,
    },
    { headerName: "Department", field: "ServDeptName", width: 220 },
    {
      headerName: "SubTotal",
      field: "Price",
      width: 130,
      cellRenderer: this.StaticPriceRoundOff,
    },
    //{ headerName: "" + this.taxLabel + "", field: "Tax", width: 130, cellRenderer: this.StaticTaxRoundOff },
    {
      headerName: "Discount",
      field: "DiscountAmount",
      width: 130,
      cellRenderer: this.StaticDiscountAmountRoundOff,
    },
    {
      headerName: "TotalAmount",
      field: "TotalAmount",
      width: 130,
      cellRenderer: this.StaticAmountRoundOff,
    },
    {
      headerName: "ReturnAmount",
      field: "ReturnAmount",
      width: 130,
      cellRenderer: this.StaticReturnAmountRoundOff,
    },
    //{ headerName: "ReturnTax", field: "ReturnTax", width: 130, cellRenderer: this.StaticReturnTaxRoundOff },
    { headerName: "Net Amount", field: "NetSales", width: 130 },
  ];

  public PatientNeighbourhoodCardDetailsReport = [
    {
      headerName: "IssuedDate",
      field: "IssuedDate",
      width: 110,
      cellRenderer: this.FromDateConverterRenderer,
    },
    { headerName: "HospitalNo", field: "HospitalNo", width: 110 },
    { headerName: "PatientName", field: "PatientName", width: 150 },
    { headerName: "Gender", field: "Gender", width: 150 },
    { headerName: "DOB", field: "DateOfBirth", width: 150 },
    { headerName: "RequestedBy", field: "RequestedBy", width: 150 },
  ];
  public PackageSalesReport = [
    { headerName: "InvoiceNo", field: "InvoiceNo", width: 100 },
    {
      headerName: "IssuedDate",
      field: "IssuedDate",
      width: 110,
      cellRenderer: this.FromDateConverterRenderer,
    },
    { headerName: "HospitalNo", field: "HospitalNo", width: 110 },
    { headerName: "PatientName", field: "PatientName", width: 150 },
    { headerName: "Age/Sex", field: "AgeSex", width: 60 },
    { headerName: "PackageName", field: "PackageName", width: 250 },
    { headerName: "Price", field: "Price", width: 60 },
    { headerName: "ReferedBy", field: "RequestedBy", width: 150 },
    {
      headerName: "Actions",
      field: "",
      width: 100,
      template: `<a danphe-grid-action="sticker" class="grid-action">
                  Sticker
                </a>`,
    },
  ];

  public DialysisPatientDetailsReport = [
    {
      headerName: "Date",
      field: "Date",
      width: 110,
      cellRenderer: this.DateConverterRenderer,
    },
    { headerName: "HospitalNo", field: "HospitalNo", width: 110 },
    { headerName: "HospitalDialysisNo", field: "DialysisCode", width: 110 },
    { headerName: "PatientName", field: "PatientName", width: 200 },
    { headerName: "Age/Sex", field: "Gender", width: 100 },
    // { headerName: "Age", field: "Age", width: 100 },
    { headerName: "RequestedBy", field: "RequestedBy", width: 150 },
  ];

  public PaidBillColumns = [
    { headerName: "SrNo", field: "SrNo", width: 90 },
    { headerName: "Department", field: "Department", width: 160 },
    { headerName: "Item", field: "Item", width: 180 },
    { headerName: "Rate", field: "Rate", width: 100 },
    { headerName: "Quantity", field: "Quantity", width: 100 },
    { headerName: "SubTotal", field: "SubTotal", width: 100 },
    { headerName: "Discount", field: "Discount", width: 100 },
    { headerName: "" + this.taxLabel + "", field: "Tax", width: 100 },
    { headerName: "PaidAmount", field: "Amount", width: 120 },
    { headerName: "Paid Date", field: "PaidDate", width: 100 },
    { headerName: "Invoice No.", field: "ReceiptNo", width: 100 },
  ];

  public UnpaidBillColumns = [
    { headerName: "SrNo", field: "SrNo", width: 90 },
    { headerName: "Department", field: "Department", width: 160 },
    { headerName: "Item", field: "Item", width: 180 },
    { headerName: "Rate", field: "Rate", width: 100 },
    { headerName: "Quantity", field: "Quantity", width: 100 },
    { headerName: "SubTotal", field: "SubTotal", width: 100 },
    { headerName: "Discount", field: "Discount", width: 100 },
    { headerName: "" + this.taxLabel + "", field: "Tax", width: 100 },
    { headerName: "CreditAmount", field: "Amount", width: 120 },
    { headerName: "CreditDate", field: "Date", width: 100 },
  ];

  public ReturnedBillColumns = [
    { headerName: "SrNo", field: "SrNo", width: 90 },
    { headerName: "Department", field: "Department", width: 160 },
    { headerName: "Item", field: "Item", width: 100 },
    { headerName: "Rate", field: "Rate", width: 100 },
    { headerName: "Quantity", field: "Quantity", width: 100 },
    { headerName: "Discount", field: "Discount", width: 100 },
    { headerName: "" + this.taxLabel + "", field: "Tax", width: 100 },
    { headerName: "Amount", field: "Amount", width: 120 },
    { headerName: "Returned Amount", field: "ReturnedAmount", width: 100 },

    { headerName: "Return Date", field: "ReturnDate", width: 100 },
    { headerName: "Receipt No", field: "ReceiptNo", width: 100 },
  ];

  public DepositBillColumns = [
    { headerName: "SrNo", field: "SrNo", width: 90 },
    { headerName: "DepositDate", field: "DepositDate", width: 100 },
    { headerName: "DepositType", field: "DepositType", width: 100 },
    { headerName: "DepositAmount", field: "DepositAmount", width: 120 },
    { headerName: "Remarks", field: "Remarks", width: 100 },
  ];

  public BillCreditSettlementReportColumns = [
    { headerName: "Hospital No.", field: "HospitalNo", width: 120 },
    { headerName: "Patient Name", field: "PatientName", width: 150 },
    {
      headerName: "Age/Sex",
      field: "",
      width: 180,
      cellRenderer:ReportGridColumnSettings.CreditSettlementAgeSexRenderer
    },
    { headerName: "Contact No", field: "ContactNo", width: 250 },
    { headerName: "Collection From Receivable", field: "CollnFromReceivable", width: 100 },
    {
      headerName: "Cash Discount",
      field: "CashDiscountGiven",
      width: 100,
    },
    { headerName: "Return Cash Discount", field: "CashDiscReturn", width: 100 },
    { headerName: "Actions", field: "", width: 110 ,
    template:
            `<a danphe-grid-action="credit-settlement-view" class="grid-action">
              View Details
            </a>`
    }
  ];

  static CreditSettlementAgeSexRenderer(params){
    let gender = params.data.Gender;
    let dob = params.data.DateOfBirth;
    return CommonFunctions.GetFormattedAgeSex(dob, gender);
  }
  //All Billing Report Grid Column constant setting End

  //All Appointment Grid Reports Constant Setting Start
  public DailyAppointmentReport = [
    { headerName: "Sr No.", valueGetter: "node.rowIndex+1", width: 70 },
    {
      headerName: "Date/Time",
      field: "Date",
      width: 140,
    },
    { headerName: "Hospital No.", field: "PatientCode", width: 120 },
    { headerName: "Patient Name", field: "Patient_Name", width: 160 },
    { headerName: "Phone", field: "PhoneNumber", width: 100 },
    { headerName: "Age", field: "Age", width: 70 },
    { headerName: "Gender", field: "Gender", width: 100 },
    { headerName: "District", field: "DistrictName", width: 100 },
    { headerName: "Doctor", field: "Doctor_Name", width: 120 },
    { headerName: "Address", field: "Address", width: 100 },
    { headerName: "Diagnosis", field: "Diagnosis", width: 100 },
    { headerName: "Department", field: "DepartmentName", width: 120 },
    // { headerName: "Visit Type", field: "VisitType", width: 140 },
    { headerName: "Appointment Type", field: "AppointmentType", width: 140 }
  ];

  //Phone Book Appointment Report
  public PhoneBookAppointmentReport = [
    {
      headerName: "Date",
      field: "Date",
      width: 160,
      cellRenderer: this.DateConverterRenderer,
    },
    {
      headerName: "Time",
      field: "Date",
      width: 160,
      cellRenderer: this.TimeConverterRenderer,
    },
    { headerName: "Hospital No.", field: "PatientCode", width: 160 },
    { headerName: "Patient Name", field: "PatientName", width: 160 },
    { headerName: "Phone", field: "ContactNumber", width: 160 },
    { headerName: "Age", field: "Age", width: 100 },
    { headerName: "Address", field: "Address", width: 100 },
    { headerName: "Gender", field: "Gender", width: 100 },
    { headerName: "Provider Name", field: "ProviderName", width: 160 },
    {
      headerName: "Appointment Status",
      field: "AppointmentStatus",
      width: 160,
    },
  ];

  //Diagnosis wise Patient List
  public DiagnosisWisePatientReport = [
    {
      headerName: "Date",
      field: "Date",
      width: 160,
      cellRenderer: this.DateConverterRenderer,
    },
    { headerName: "Hospital No.", field: "PatientCode", width: 160 },
    { headerName: "Patient Name", field: "PatientName", width: 160 },
    { headerName: "Phone", field: "PhoneNumber", width: 160 },
    { headerName: "Diagnosis", field: "Diagnosis", width: 160 },
  ];
  public DistrictWiseAppointmentReport = [
    {
      headerName: "Date",
      field: "Date",
      width: 160,
      cellRenderer: this.DateConverterRenderer,
    },
    { headerName: "District Name", field: "DistrictName", width: 160 },
    {
      headerName: "Total Appointment ",
      field: "Total_Appointment",
      width: 160,
    },
  ];
  //Patient Registration Report
  public PatientRegistrationReport = [
    {
      headerName: "RegisteredDate",
      field: "RegisteredDate",
      width: 140,
      cellRenderer: this.RegDateConverterRenderer,
    },
    { headerName: "Patient Name", field: "Patient_Name", width: 160 },
    {
      headerName: "Date of Birth",
      field: "DateOfBirth",
      width: 120,
      cellRenderer: this.RPT_PAT_DateConverterRenderer,
    },
    { headerName: "Age", field: "Age", width: 100 },
    { headerName: "Gender", field: "Gender", width: 100 },
    { headerName: "PhoneNumber", field: "PhoneNumber", width: 100 },
    { headerName: "Country", field: "CountryName", width: 100 },
    { headerName: "Address", field: "Address", width: 100 },
    { headerName: "MembershipType", field: "MembershipTypeName", width: 100 },
    { headerName: "Blood Group", field: "BloodGroup", width: 100 },
    { headerName: "Insurance No ", field: "InsuranceNumber", width: 133 },
  ];

  //Admission Setting Start
  public TotalAdmittedPatient = [
     {
      headerName: "Admitted Date",
      field: "AdmissionDate",
      width: 150,
      cellRenderer: this.AdmissionDateRenderer,
    },
    { headerName: "Hospital Number", field: "PatientCode", width: 120 },
    { headerName: "IP Number", field: "VisitCode", width: 120 },
    { headerName: "Patient Name", field: "PatientName", width: 170 },
    { headerName: "Age/Sex", field: "Age/Sex", width: 110 },
    { headerName: "Admitting Doc.", field: "AdmittingDoctorName", width: 140 },
    { headerName: "Admitting Dept.", field: "DepartmentName", width: 160 },//sud:21Sep'21--Added Department field also in this report.
    { headerName: "Bed Feature", field: "BedFeature", width: 100 },
    { headerName: "BedCode", field: "BedCode", width: 120 },
  ];
  //Admission And Discharge List
  public AdmisssionAndDischargeList = [
    { headerName: "S.N.", field: "SN", width: 70 },
    { headerName: "Patient Name", field: "PatientName", width: 160 },
    { headerName: "Age/Gender", field: "Age_Gender", width: 80},
    { headerName: "Address", field: "Address", width: 80},
    { headerName: "Hospital Code", field: "PatientCode", width: 100 },
    { headerName: "IP Number", field: "VisitCode", width: 100 },
    {
      headerName: "Admitted Date",
      field: "AdmissionDate",
      width: 110
    },
    { headerName: "Requesting Department", field: "DepartmentName", width: 150 },
    { headerName: "AdmittingDoctor", field: "AdmittingDoctorName", width: 160 },
    { headerName: "Ward", field: "WardName", width: 110 },
    { headerName: "Bed Feature", field: "BedFeature", width: 100 },
    { headerName: "Bed", field: "BedCode", width: 90 },
    { headerName: "Diagnosis", field: "Diagnosis", width: 120 },
    { headerName: "Status", field: "AdmissionStatus", width: 90 },
    {
      headerName: "Discharged Date",
      field: "DischargeDate",
      width: 110
    },
    { headerName: "No. of Days", field: "Number_of_Days", width: 100 },
  ]; 
  //Category wise Lab Test
  public CategoryWiseLabTest = [
    { headerName: "S.N.", field: "SN", width: 60 },
    { headerName: "Category", field: "Category", width: 150 },
    { headerName: "Count", field: "Count", width: 120 },
  ];

  //Doctor wise lab test for IP/op/ER
  public DoctorWisePatientCountLabReport = [
    { headerName: "S.N.", field: "SN", width: 60 },
    { headerName: "Doctor", field: "Doctor", width: 150 },
    { headerName: "OP", field: "OP", width: 120 },
    { headerName: "IP", field: "IP", width: 150 },
    { headerName: "Emergency", field: "Emergency", width: 120 },
  ];

  public DischargedPatient = [
    { headerName: "IP Number ", field: "IpNumber", width: 170 },
    { headerName: "Patient Name ", field: "PatientName", width: 170 },
    { headerName: "Hospital No.", field: "HospitalNumber", width: 170 },
    { headerName: "Admitted On", field: "AdmissionDate", width: 170 },
    { headerName: "Discharged On", field: "DischargedDate", width: 170 },
    { headerName: "Admitting Doctor", field: "AdmittingDoctor", width: 200 },
    // {
    //     headerName: "Actions",
    //     field: "",
    //     width: 280,
    //     template:
    //         `<a danphe-grid-action="bill-summary" class="grid-action">
    //           Billing Summary
    //         </a>`
    // }
  ];
  public TransferredPatient = [
    {
      headerName: "Date",
      field: "Date",
      width: 120,
      cellRenderer: this.DateConverterRenderer,
    },
    {
      headerName: "Total Patient Transfer",
      field: "TotalPatientTransfer",
      width: 150,
    },
    {
      headerName: "Total Transferred Number",
      field: "TotalNumberTransferred",
      width: 150,
    },
    {
      headerName: "OrthoSurgery Ward Transfer",
      field: "OrthoSurgeryWardTransfer",
      width: 150,
    },
    {
      headerName: "MedicineGyno Ward Transfer",
      field: "MedicineGynoWardTransfer",
      width: 150,
    },
    {
      headerName: "Pre-Operation Ward Transfer",
      field: "Pre-OperationWardTransfer",
      width: 150,
    },
    {
      headerName: "ICU & POST-OP Ward Transfer",
      field: "ICU&POST-OPWardTransfer",
      width: 150,
    },
    {
      headerName: "Emergency Ward Transfer",
      field: "EmergencyWardTransfer",
      width: 150,
    },
  ];

  //All Appointment Report Grid Column constant setting End

  //Radiology Report Setting Start
  public RPT_RAD_RevenueGenerated = [
    {
      headerName: "Date",
      field: "Date",
      width: 250,
      cellRenderer: this.DateConverterRenderer,
    },
    { headerName: "Total Price", field: "TotalPrice", width: 250 },
    { headerName: "Total PaidAmount", field: "TotalPaidAmount", width: 250 },
    {
      headerName: "Total " + this.taxLabel + "",
      field: "TotalTax",
      width: 250,
    },
  ];

  //Radiology Report Setting End
  //Lab Report Setting Start
  public TotalRevenueFromLab = [
    {
      headerName: "Date",
      field: "Date",
      width: 250,
      cellRenderer: this.DateConverterRenderer,
    },
    { headerName: "Total Revenue", field: "TotalRevenue", width: 250 },
    {
      headerName: "Total " + this.taxLabel + "",
      field: "TotalTax",
      width: 250,
    },
    { headerName: "Total Discount", field: "TotalDiscount", width: 250 },
  ];
  public ItemWiseFromLab = [
    // { headerName: "Date", field: "Date", width: 250, cellRenderer: this.DateConverterRenderer },
    {
      headerName: "Service Department",
      field: "ServiceDepartmentName",
      width: 250,
    },
    { headerName: "Test Name", field: "ItemName", width: 250 },
    { headerName: "Unit", field: "Unit", width: 250 },
    { headerName: "Total Amount", field: "TotalAmount", width: 250 },
  ];

  public StatusWiseItemCount = [
    { headerName: "Hospital No", field: "HospitalNo", width: 150 },
    { headerName: "Patient Name", field: "PatientName", width: 200 },
    { headerName: "Age/Sex", field: "AgeSex", width: 100 },
    { headerName: "Requested On", field: "RequestedOn", width: 200 },
    { headerName: "Test Name", field: "LabTestName", width: 200 },
    { headerName: "Run No", field: "RunNo", width: 150 },
    { headerName: "Ward Name", field: "WardName", width: 150 },
    { headerName: "Bill Status", field: "BillStatus", width: 150 },
    {
      headerName: "Sample Collected By",
      field: "SampleCollectedBy",
      width: 150,
    },
    { headerName: "Refered By", field: "ReferredBy", width: 250 },
    { headerName: "Test Status", field: "TestStatus", width: 250 },
    { headerName: "Bill Cancelled By", field: "CancelledByUser", width: 250 },
    { headerName: "Bill Cancelled On", field: "BillCancelledOn", width: 200 },
  ];

  public TotalCovidCasesDetailReport = [
    { headerName: "Sample Id", field: "SampleId", width: 150 },
    { headerName: "Patient Type", field: "PatientType", width: 200 },
    { headerName: "Collection Date", field: "CollectionDate", width: 200 },
    { headerName: "Test Date", field: "TestDate", width: 200 },
    {
      headerName: "Collection Site",
      field: "",
      width: 200,
      cellRenderer: this.CollecionSite,
    },
    { headerName: "Name", field: "PatientName", width: 200 },
    { headerName: "Age", field: "Age", width: 100 },
    { headerName: "Gender", field: "Gender", width: 150 },
    { headerName: "Contact No.", field: "PhoneNumber", width: 150 },
    { headerName: "District", field: "CountrySubDivisionName", width: 150 },
    { headerName: "Address", field: "Address", width: 150 },
    // { headerName: "Municipality", field: "MunicipalityName", width: 150 },
    // { headerName: "Ward No.", field: "Address", width: 150 },
    { headerName: "E Gene", field: "EGene", width: 150 },
    { headerName: "N Gene", field: "NGene", width: 150 },
    { headerName: "ORF Gene", field: "ORFGene", width: 150 },
    { headerName: "Report", field: "Report", width: 150 },
  ];

  public CovidTestsSummary = [
    { headerName: "District", field: "District", width: 200 },
    { headerName: "New Negative Cases", field: "NewNegativeCases", width: 200 },
    { headerName: "New Positive Cases", field: "NewPositiveCases", width: 200 },
    { headerName: "FollowUp Negative Cases", field: "FollowupNegativeCases", width: 200 },
    { headerName: "FollowUp Positive Cases", field: "FollowupPositiveCases", width: 200 },
    {
      headerName: "Total Cases(New + Follow up)",
      field: "",
      width: 150,
      cellRenderer: this.TatalCovidCaseDistrictWise,
    },
  ];

  public HIVTestsReport = [
    { headerName: "Patient Name", field: "ShortName", width: 200 },
    { headerName: "Patient Code", field: "PatientCode", width: 200 },
    { headerName: "Age", field: "Age", width: 200 },
    { headerName: "Gender", field: "Gender", width: 150 },
    { headerName: "Address", field: "Address", width: 200 },
    { headerName: "Sample Code", field: "SampleCode", width: 200 },
    { headerName: "Method", field: "Method", width: 200 },
    { headerName: "Result Date", field: "ResultDate", width: 200 },
    { headerName: "Value", field: "Value", width: 200 },
  ];

  public CultureTestsReport = [
    { headerName: "Patient Name", field: "ShortName", width: 200 },
    { headerName: "Hospital No.", field: "PatientCode", width: 180 },
    { headerName: "Age", field: "Age", width: 100 },
    { headerName: "Gender", field: "Gender", width: 150 },
    { headerName: "Sample Code", field: "SampleCodeFormatted", width: 150 },
    { headerName: "Specimen", field: "LabTestSpecimen", width: 150 },
    { headerName: "Findings", field: "Finding", width: 200 },
    { headerName: "Sensitivity", field: "Sensitivity", width: 200 },
    { headerName: "Resistant", field: "Resistant", width: 250 },
    { headerName: "Intermediate", field: "Intermediate", width: 250 },
    { headerName: "Result Date", field: "ResultDate", width: 200 },
  ];

  public LabTypeWiseTestCountReport = [
    { headerName: "Category Name", field: "TestCategoryName", width: 150 },
    { headerName: "LabTest Name", field: "LabTestName", width: 200 },
    { headerName: "OP-LabTest Count", field: "op-lab", width: 200 },
    { headerName: "ER-LabTest Count", field: "er-lab", width: 200 },
    { headerName: "Total", field: "Total", width: 200 }
    // { headerName: "Total", field: "Total", width: 200 },
    // { headerName: "Created On", field: "CreatedOn", width: 150 },
    // { headerName: "Lab Type Name", field: "LabTypeName", width: 200 }
  ];
  //cellRenderer: this.RequestedDateConverterFunction
  //cellRenderer: ShowBillCancelledOn
  //cellRenderer: this.AddCancelledByDetail
  //Lab Report Setting End

  //inventory report Start

  public CurrentStockLevelReport = [
    { headerName: "Store Name", field: "StoreName" },
    { headerName: "Sub Category Name", field: "SubCategoryName" },
    { headerName: "Item Name", field: "ItemName" },
    { headerName: "Item Code", field: "Code" },
    { headerName: "Item Type", field: "ItemType" },
    { headerName: "Available Quantity", field: "AvailableQuantity" },
    {
      headerName: "Stock Value",
      field: "StockValue",
      valueFormatter: this.decimalValueFormatter,
    }
    // {
    //   headerName: "Actions",
    //   field: "",
    //   template: `<a danphe-grid-action="view" class="grid-action">
    //               View
    //             </a>`,
    // },
  ];

  public WriteOffReport = [
    { headerName: "WriteOffDate", field: "WriteOffDate", width: 150 },
    { headerName: "ItemName", field: "ItemName", width: 150 },
    { headerName: "Units/MeasurementName", field: "UOMName", width: 150 },
    { headerName: "Code", field: "Code", width: 150 },
    { headerName: "Batch No", field: "BatchNO", width: 100 },
    { headerName: "WriteOffQuantity", field: "WriteOffQuantity", width: 100 },
    { headerName: "ItemRate", field: "ItemRate", width: 100 },
    { headerName: "TotalAmount", field: "TotalAmount", width: 100 },
    { headerName: "RequestedBy", field: "RequestedBy", width: 150 },
    { headerName: "RequestedBy", field: "Remark", width: 150 },
  ];

  public ReturnToVendorReport = [
    { headerName: "ReturnedDate", field: "CreatedOn", width: 150 },
    { headerName: "VendorName", field: "VendorName", width: 150 },
    { headerName: "CreditNoteNo", field: "CreditNoteNo", width: 100 },
    { headerName: "ItemName", field: "ItemName", width: 150 },
    { headerName: "Units/MeasurementName", field: "UOMName", width: 150 },
    { headerName: "Code", field: "Code", width: 150 },
    { headerName: "Quantity", field: "Quantity", width: 100 },
    { headerName: "ItemRate", field: "ItemRate", width: 100 },
    { headerName: "TotalAmount", field: "TotalAmount", width: 150 },
    { headerName: "Remark", field: "Remark", width: 150 },
    { headerName: "ReturnedBy", field: "ReturnedBy", width: 100 },
  ];

  public DailyItemDispatchReport = [
    {
      headerName: "Bill Date",
      field: "Date",
      width: 150,
      cellRenderer: this.DateConverterRenderer,
    },
    { headerName: "Requisition ID", field: "RequisitionItemId", width: 150 },
    { headerName: "Store Name", field: "StoreName", width: 150 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Units/MeasurementName", field: "UOMName", width: 150 },
    { headerName: "Code", field: "Code", width: 150 },
    { headerName: "Quantity", field: "DispatchedQuantity", width: 150 },
    { headerName: "Amount", field: "Amount", width: 150 },
  ];

  public InventorySummaryReport = [
    { headerName: "Sub-Category", field: "SubCategory", width: 150 },
    { headerName: "ItemName", field: "ItemName", width: 150 },
    { headerName: "ItemCode", field: "ItemCode", width: 100 },
    { headerName: "Unit", field: "Unit", width: 100 },
    {
      headerName: "Opening Value",
      field: "OpeningValue",
      width: 70,
      valueFormatter: this.decimalValueFormatter,
    },
    {
      headerName: "Purchase Value",
      field: "PurchaseValue",
      width: 70,
      valueFormatter: this.decimalValueFormatter,
    },
    {
      headerName: "StockManage-Out Value",
      field: "StockManageOutValue",
      width: 70,
      valueFormatter: this.decimalValueFormatter,
    },
    {
      headerName: "StockManage-In Value",
      field: "StockManageInValue",
      width: 70,
      valueFormatter: this.decimalValueFormatter,
    },
  ];

  public InventoryPurchaseItemsReport = [
    { headerName: "Gr Date", field: "Dates", width: 100 },
    { headerName: "Gr No", field: "GoodsReceiptNo", width: 100 },
    { headerName: "Vendor Name", field: "VendorName", width: 150 },
    { headerName: "Vendor Contact", field: "VendorContact", width: 100 },
    { headerName: "SubCategory Name", field: "SubCategoryName", width: 150 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Item Type", field: "ItemType", width: 150 },
    {
      headerName: "Total Qty",
      field: "TotalQty",
      width: 100,
      valueFormatter: this.decimalValueFormatter,
    },
    {
      headerName: "Item Rate",
      field: "ItemRate",
      width: 100,
      valueFormatter: this.decimalValueFormatter,
    },
    {
      headerName: "SubTotal",
      field: "SubTotal",
      width: 100,
      valueFormatter: this.decimalValueFormatter,
    },
    {
      headerName: "DiscountAmt",
      field: "DiscountAmount",
      width: 100,
      valueFormatter: this.decimalValueFormatter,
    },
    {
      headerName: "VAT Amt",
      field: "VATAmount",
      width: 100,
      valueFormatter: this.decimalValueFormatter,
    },
    {
      headerName: "Total Amt",
      field: "TotalAmount",
      width: 100,
      valueFormatter: this.decimalValueFormatter,
    },
    { headerName: "Batch NO", field: "BatchNO", width: 100 },
    {
      headerName: "MRP",
      field: "MRP",
      width: 100,
      valueFormatter: this.decimalValueFormatter,
    },
  ];

  public SupplierWiseStockReportColumns = [
    { headerName: "Opening Stock", field: "OpeningStock", width: 100 },
    { headerName: "Vendor", field: "VendorName", width: 100 },
    { headerName: "Category", field: "Category", width: 100 },
    { headerName: "Sub-Cat", field: "SubCategory", width: 100 },
    { headerName: "Item Code", field: "ItemCode", width: 90 },
    { headerName: "Item Name", field: "ItemName", width: 100 },
    { headerName: "Store Name", field: "StoreName", width: 150 },
    { headerName: "Purchase Qty", field: "PurchaseQty", width: 100 },
    { headerName: "Batch Number", field: "BatchNo", width: 100 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 100 },
    { headerName: "Consumed Quantity", field: "ConsumedQty", width: 100 },
    { headerName: "Other Txns", field: "OtherQtyTxn", width: 100 },
    { headerName: "Closing Stock", field: "ClosingStock", width: 100 },
  ];

  public InventoryValuationReport = [
    { headerName: "ItemName", field: "ItemName", width: 150 },
    { headerName: "Units/MeasurementName", field: "UOMName", width: 150 },
    { headerName: "Code", field: "Code", width: 150 },
    { headerName: "Quantity", field: "Quantity", width: 150 },
    { headerName: "Rate", field: "Rate", width: 150 },
    { headerName: "Amount", field: "Amount", width: 150 },
  ];

  public ItemMgmtDetailReport = [
    { headerName: "ItemName", field: "ItemName", width: 150 },
    { headerName: "User", field: "CreatedBy", width: 150 },
    {
      headerName: "Created Date",
      field: "CreatedOn",
      cellRenderer: this.DateConverterRendererForCreatedOn,
      width: 150,
    },
    { headerName: "Modified By", field: "ModifiedBy", width: 150 },
    {
      headerName: "Modified Date",
      field: "ModifiedOn",
      width: 150,
      cellRenderer: this.DateConverterRendererForModifiedOn,
    },
  ];

  public ComparisonPoGrReport = [
    { headerName: "ID", field: "SNo", width: 30 },
    { headerName: "Item Name", field: "ItemName", width: 130 },
    { headerName: "Units/MeasurementName", field: "UOMName", width: 150 },
    { headerName: "Code", field: "Code", width: 150 },
    { headerName: "Purchase Order Id", field: "PurchaseOrderId", width: 120 },
    { headerName: "Goods Receipt ID", field: "GoodsReceiptID", width: 120 },
    { headerName: "Vendor Name", field: "VendorName", width: 120 },
    { headerName: "Purchased On", field: "CreatedOn", width: 150 },
    { headerName: "Ordered Qty", field: "Quantity", width: 100 },
    {
      headerName: "Received Qty.(Including free)",
      field: "RecevivedQuantity",
      width: 130,
    },
    { headerName: "Received On", field: "Receivedon", width: 150 },
  ];

  public PurchaseReport = [
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Units/MeasurementName", field: "UOMName", width: 150 },
    { headerName: "Code", field: "Code", width: 150 },
    { headerName: "Vendor Name", field: "VendorName", width: 150 },
    { headerName: "Contact No.", field: "ContactNo", width: 150 },
    { headerName: "Created On", field: "CreatedOn", width: 100 },
    {
      headerName: "Total Qty.(Including free)",
      field: "TotalQuantity",
      width: 150,
    },
    { headerName: "Standard Rate", field: "StandardRate", width: 150 },
    { headerName: "Total Amount", field: "TotalAmount", width: 150 },
    { headerName: "Discount", field: "Discount", width: 150 },
  ];

  public CancelledPOReport = [
    { headerName: "PO Id", field: "PurchaseOrderId", width: 100 },
    { headerName: "PO Date", field: "PoDate", width: 100 },
    { headerName: "Vendor Name", field: "VendorName", width: 250 },
    {
      headerName: "Total Amt",
      field: "TotalAmount",
      width: 100,
      valueFormatter: this.decimalValueFormatter,
    },
    { headerName: "Cancelled Date", field: "CancelledOn", width: 150 },
    { headerName: "Cancelled By", field: "CancelledBy", width: 150 },
    { headerName: "Cancel Remark", field: "CancelRemarks", width: 150 },
    {
      headerName: "Actions",
      field: "",
      width: 100,
      template: `<a danphe-grid-action="viewPO" class="grid-action">
                  View
                </a>`,
    },
  ];

  public CancelledGRReport = [
    { headerName: "GR No", field: "GoodsReceiptNo", width: 100 },
    { headerName: "Vendor Bill Date", field: "GoodsReceiptDate", width: 150 },
    { headerName: "Vendor Name", field: "VendorName", width: 250 },
    { headerName: "Bill No", field: "BillNo", width: 100 },
    {
      headerName: "Total Amt",
      field: "TotalAmount",
      width: 150,
      valueFormatter: this.decimalValueFormatter,
    },
    { headerName: "Cancelled Date", field: "CancelledOn", width: 150 },
    { headerName: "Cancelled By", field: "CancelledBy", width: 150 },
    { headerName: "Cancel Remark", field: "CancelRemarks", width: 150 },
    {
      headerName: "Actions",
      field: "",
      width: 100,
      template: `<a danphe-grid-action="viewGR" class="grid-action">
                  View
                </a>`,
    },
  ];

  public PurchaseOrderReport = [    
    { headerName: "PO Number", field: "PONumber", width: 120 },
    {
      headerName: "PO Date",
      field: "Date",
      width: 120,
      cellRenderer: this.DateConverterRenderer,
    },
    { headerName: "Vendor Name", field: "VendorName", width: 150 },
    { headerName: "Item Code", field: "ItemCode", width: 120 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Category", field: "ItemType", width: 150 },
    { headerName: "Sub-Category", field: "SubCategory", width: 150 },
    { headerName: "Quantity", field: "Quantity", width: 120 },
    { headerName: "Standard Rate", field: "StandardRate", width: 150 },
    { headerName: "VAT",field: "VAT",width: 100,},
    { headerName: "Total Amount", field: "TotalAmount", width: 150 },
    { headerName: "Remarks", field: "Remarks", width: 150 },
  ];

  public FixedAssetsReport = [
    {
      headerName: "Date",
      field: "Date",
      width: 100,
      cellRenderer: this.DateConverterRenderer,
    },
    { headerName: "Name", field: "Name", width: 150 },
    { headerName: "ItemName", field: "ItemName", width: 150 },
    { headerName: "Units/MeasurementName", field: "UOMName", width: 150 },
    { headerName: "Code", field: "Code", width: 150 },
    { headerName: "Quantity", field: "Qty", width: 100 },
    { headerName: "MRP", field: "MRP", width: 100 },
    { headerName: "Total Amount", field: "TotalAmt", width: 100 },
  ];
  public GREvaluationReport = [
    { headerName: "GR No", field: "GoodsReceiptNo", width: 100 },
    { headerName: "Name", field: "ItemName", width: 150 },
    { headerName: "Code", field: "Code", width: 150 },
    { headerName: "Units/MeasurementName", field: "UOMName", width: 150 },
    { headerName: "Type", field: "ItemType", width: 100 },
    { headerName: "BatchNO", field: "BatchNO", width: 100 },
    { headerName: "Rate", field: "ItemRate", width: 100 },
    { headerName: "TransactionType", field: "TransactionType", width: 100 },
    { headerName: "Qty", field: "Quantity", width: 100 },
    { headerName: "In/Out", field: "InOut", width: 100 },
    {
      headerName: "TransactionDate",
      field: "TransactionDate",
      width: 100,
      cellRenderer: this.GRDateConverterRenderer,
    },
    { headerName: "ReferenceNo", field: "ReferenceNo", width: 100 },
    { headerName: "TransactionBy", field: "TransactionBy", width: 100 },
  ];
  public VedorTransactionReport = [
    { headerName: "Fiscal Year", field: "FiscalYearName", width: 100 }, // width: 150, cellRenderer: this.DateConverterRenderer
    { headerName: "Supplier Name", field: "VendorName", width: 150 },
    { headerName: "Sub Total", field: "SubTotal", width: 150 },
    { headerName: "VAT Amount", field: "VATTotal", width: 150 },
    { headerName: "Discount Amount", field: "DiscountAmount", width: 150 },
    { headerName: "Total Amount", field: "TotalAmount", width: 150 },
    {
      headerName: "Actions",
      field: "",
      width: 100,
      template: `<a danphe-grid-action="view" class="grid-action">
                  View
                </a>`,
    },
  ];

  //GR No,GR Date, Vendor Bill Date, Vendor Name,Vendor Contact,
  //Bill No, Total Amt,Pay Mode,Remarks
  public InvPurchaseSummaryReportCol = [
    { headerName: "GR No", field: "GoodsReceiptNo", width: 50 },
    {
      headerName: "GR Date",
      field: "GoodsReceiptDate",
      width: 60,
      cellRenderer: this.InvPurchaseSummaryReportColGRDateConverter,
    },
    {
      headerName: "Vendor Bill Date",
      field: "VendorBillDate",
      width: 60,
      cellRenderer: this.InvPurchaseSummaryReportColVendorBillDateConverter,
    },
    
    { headerName: "Vendor Name", field: "VendorName", width: 100 },
    { headerName: "Vendor Contact", field: "ContactNo", width: 80 },
    
    { headerName: "Bill No", field: "BillNo", width: 80 },
    {
      headerName: "SubTotal",
      field: "SubTotal",
      width: 75,
      valueFormatter: this.decimalValueFormatter4digit,
    },
    {
      headerName: "Discount",
      field: "DiscountAmount",
      width: 75,
      valueFormatter: this.decimalValueFormatter4digit,
    },
    {
      headerName: "VAT",
      field: "VATTotal",
      width: 75,
      valueFormatter: this.decimalValueFormatter4digit,
    },
    {
      headerName: "Other charges",
      field: "OtherCharges",
      width: 75,
      valueFormatter: this.decimalValueFormatter4digit,
    },
    {
      headerName: "Total Amt",
      field: "TotalAmount",
      width: 75,
      valueFormatter: this.decimalValueFormatter4digit,
    },
    
    { headerName: "Pay Mode", field: "PaymentMode", width: 60 },

    { headerName: "Remarks", field: "Remarks", width: 100 },
    {
      headerName: "Action",
      field: "",
      width: 50,
      template: '<a danphe-grid-action="view" class="grid-action">View</a>',
    },
  ];
  public returnToSupplierReportCol = [
    { headerName: "S.N.", valueGetter: "node.rowIndex+1", width: 50 },
    {headerName: "Vendor Name",field: "VendorName",width: 100, },
    { headerName: "Return Date", 
      field: "ReturnDate", 
      width: 80,
      cellRenderer: this.DateConverterRendererForReturnDate,
    },
    { headerName: "Item Name", field: "ItemName", width: 100 },
    { headerName: "Batch Number", field: "BatchNo", width: 80 },
    { headerName: "Goods Receipt Number ",field: "GoodsReceiptNo",width: 80,},
    { headerName: "Return Quantity",field: "Quantity",width: 80,},
    { 
      headerName: "Rate",
      field: "ItemRate",
      width: 80,
      valueFormatter: this.decimalValueFormatter4digit,
    },
    {
      headerName: "Discount",
      field: "DiscountAmount",
      width: 80,
      valueFormatter: this.decimalValueFormatter4digit,
    },
    { 
      headerName: "VAT",
      field: "VAT",
      width: 60, 
      valueFormatter: this.decimalValueFormatter4digit,
    },
    {
       headerName: "Total Amount",
      field: "TotalAmount", 
      width: 80, 
      valueFormatter: this.decimalValueFormatter4digit, 
    },
    { headerName: "Credit Note Number", field: "CreditNoteNo", width: 80 },
    { headerName: "Remarks", field: "Remark", width: 80 },
  ];


  //Substore Dispatch and Consumption Report
  public SubstoreDispachNConsumptionReportCol = [
    { headerName: "Sub Category Name", field: "SubCategoryName" },
    { headerName: "Item Name", field: "ItemName" },
    { headerName: "Unit", field: "Unit" },
    { headerName: "Dispatch Qty.", field: "DispatchQuantity" },
    { headerName: "Consumption Qty.", field: "ConsumptionQuantity" },
    {
      headerName: "Dispatch Value",
      field: "DispatchValue",
      valueFormatter: this.DispValueFormatter,
    },
    {
      headerName: "Consumption Value",
      field: "ConsumptionValue",
      valueFormatter: this.ConValueFormatter,
    },
    {
      headerName: "Actions",
      field: "",
      template: `<a danphe-grid-action="view" class="grid-action">
                  View
                </a>`,
    },
  ];

  public DispValueFormatter(params) {
    let num = params.data.DispatchValue;
    let formdata = Math.round((num + Number.EPSILON) * 100) / 100;
    return formdata;
  }
  public ConValueFormatter(params) {
    let num = params.data.ConsumptionValue;
    let formattedData = Math.round((num + Number.EPSILON) * 100) / 100;
    return formattedData;
  }

  public SubstoreDispConItemLevelDetails = [
    { headerName: "Store Name", field: "Name", width: 100 },
    { headerName: "GR NO", field: "GoodsReceiptNo", width: 50 },
    {
      headerName: "Transaction Date",
      field: "TransactionDate",
      cellRenderer: this.TransactionDateConverterRenderer,
      width: 90,
    },
    { headerName: "Dispatch Qty.", field: "DispatchQuantity", width: 90 },
    {
      headerName: "Consumption Qty.",
      field: "ConsumptionQuantity",
      width: 110,
    },
    { headerName: "Unit Price", field: "Price", width: 80 },
    {
      headerName: "Dispatch Value",
      field: "DispatchValue",
      width: 80,
      valueFormatter: this.DispValueFormatter,
    },
    {
      headerName: "Consumption Value",
      field: "ConsumptionValue",
      width: 110,
      valueFormatter: this.ConValueFormatter,
    },
  ];
  //Inventory Report End

  //Police Case Report Start
  public PoliceCaseReportCol = [
    { headerName: "IP Number", field: "IpNumber", width: 150 },
    { headerName: "Patient Name", field: "ShortName", width: 150 },
    { headerName: "Hospital No.", field: "HospitalNumber", width: 150 },
    { headerName: "Admitted On", field: "AdmissionDate", width: 150 },
    {
      headerName: "Discharged On",
      field: "DischargedDate",
      cellRenderer: this.DischargedDateRenderer,
      width: 150,
    },
  ];

  public DischargedDateRenderer(params) {
    let disDate = params.data.DischargedDate;
    if (disDate != null) {
      return disDate;
    } else {
      let template = `<span style="font-weight:bold;">&nbsp;&nbsp;&nbsp; N/A &nbsp;&nbsp;&nbsp;</span>`;
      return template;
    }
  }
  //Polic Case Report End

  //Admission Setting End
  public DateConverterRenderer(params) {
    let Date: string = params.data.Date;
    return moment(Date).format("DD-MMM-YYYY");
  }
  public GRDateConverterRenderer(params) {
    let Date: string = params.data.TransactionDate;
    return moment(Date).format("DD-MMM-YYYY");
  }
  //Reports-Patient -start
  public RegDateConverterRenderer(params) {
    let RegisteredDate: string = params.data.RegisteredDate;
    return moment(RegisteredDate).format("DD-MMM-YYYY");
  }
  public RPT_PAT_DateConverterRenderer(params) {
    let DateOfBirth: string = params.data.DateOfBirth;
    return moment(DateOfBirth).format("DD-MMM-YYYY");
  }
  //Reports-Patient -end
  //sales day book report: BillingDate converted to 'DD-MM-YYYY' format
  public BillingDateConverterRenderer(params) {
    let date: string = params.data.BillingDate;
    return moment(date).format("DD-MM-YYYY");
  }
  public DateTimeConverterRenderer(params) {
    let Date: string = params.data.Date;
    return moment(Date).format("DD-MM-YYYY hh:mm:ss A");
  }

  public TimeConverterRenderer(params) {
    let Date: string = params.data.Date;
    return moment(Date).format("hh:mm:ss A");
  }
  public DocRefDateConverter(params) {
    let Date: string = params.data.VisitDate;
    return moment(Date).format("DD-MMM-YYYY");
  }

  public BilDenominationDateConverter(params) {
    let Date: string = params.data.CreatedOn;
    return moment(Date).format("DD-MMM-YYYY");
  }

  public DocRefCountRenderer(params) {
    let refCount = parseFloat(params.data.ReferralCount);
    return CommonFunctions.parseAmount(refCount);
  }
  public DocRefAmountRenderer(params) {
    let refAmount = parseFloat(params.data.ReferralAmount);
    return CommonFunctions.parseAmount(refAmount);
  }

  public DateConverterRendererForBillDate(params) {
    let date: string = params.data.BillingDate;
    return moment(date).format("DD-MMM-YYYY");
  }
  public DateConverterRendererForCreatedOn(params) {
    let date: string = params.data.CreatedOn;
    return moment(date).format("DD-MMM-YYYY");
  }
  public DateConverterRendererForModifiedOn(params) {
    let date: string = params.data.ModifiedOn;
    if (date != null) {
      return moment(date).format("DD-MMM-YYYY");
    }
  }
  public DateConverterRendererFunction(params) {
    let dates: string = params.data.Dates;
    return moment(dates).format("DD-MMM-YYYY");
  }

  public RequestedDateConverterFunction(params) {
    let date: string = params.data.RequestedOn;
    return moment(date).format("YYYY-MM-DD HH:mm");
  }

  public LastTxnDateConverter(params) {
    let dates: string = params.data.LastTxnDate;
    return moment(dates).format("DD-MMM-YYYY");
  }
  public FromDateConverterRenderer(params) {
    let Date: string = params.data.IssuedDate;
    return moment(Date).format("DD-MMM-YYYY");
  }
  public ToDateConverterRenderer(params) {
    let Date: string = params.data.ToDate;
    return moment(Date).format("DD-MMM-YYYY");
  }

  public TransactionDateConverterRenderer(params) {
    let Date: string = params.data.TransactionDate;
    return moment(Date).format("DD-MMM-YYYY");
  }
  public DateConverterRendererForDepositeDate(params) {
    let date: string = params.data.DepositDate;
    return moment(date).format("DD-MMM-YYYY");
  }
  public DateConverterRendererForReturnDate(params) {
    let date: string = params.data.ReturnDate;
    return moment(date).format("DD-MMM-YYYY");
  }
  public DateConverterRendererForSchemeWiseDiscountDate(params) {
    let date: string = params.data.DepositDate;
    return moment(date).format("DD-MMM-YYYY");
  }
  public FormatTotalColumns(params) {
    let patientName: string = params.data.PatientName;
    if (patientName == "Total") {
      return "" + patientName + "";
    }
  }

  public StaticAmountRoundOff(params) {
    let totalAmount: string = params.data.TotalAmount;
    let TotalAmount = CommonFunctions.parseAmount(totalAmount);
    return TotalAmount;
  }

  public DiscountAmountRoundOff(params) {
    let totalAmount: string = params.data.TotalAmount;
    let TotalAmount = CommonFunctions.parseAmount(totalAmount);
    return TotalAmount;
  }

  public StaticReturnAmountRoundOff(params) {
    let returnAmount: string = params.data.ReturnAmount;
    let ReturnAmount = CommonFunctions.parseAmount(returnAmount);
    return ReturnAmount;
  }
  public StaticReturnTaxRoundOff(params) {
    let returnTax: string = params.data.ReturnTax;
    let ReturnTax = CommonFunctions.parseAmount(returnTax);
    return ReturnTax;
  }
  //public StaticCancelAmountRoundOff(params) {
  //    let cancelAmount: string = params.data.CancelAmount;
  //    let CancelAmount = CommonFunctions.parseAmount(cancelAmount);
  //    return CancelAmount;
  //}
  public StaticCancelTaxRoundOff(params) {
    let cancelTax: string = params.data.CancelTax;
    let CancelTax = CommonFunctions.parseAmount(cancelTax);
    return CancelTax;
  }

  public StaticPriceRoundOff(params) {
    let price: string = params.data.Price;
    let Price = CommonFunctions.parseAmount(price);
    return Price;
  }
  public StaticTaxRoundOff(params) {
    let tax: string = params.data.Tax;
    let Tax = CommonFunctions.parseAmount(tax);
    return Tax;
  }
  public StaticDiscountAmountRoundOff(params) {
    let distamt: string = params.data.DiscountAmount;
    let DiscountAmount = CommonFunctions.parseAmount(distamt);
    return DiscountAmount;
  }

  public StaticSalesRoundOff(params) {
    let salesamt: string = params.data.Sales;
    let Sales = CommonFunctions.parseAmount(salesamt);
    return Sales;
  }

  public StaticLabRoundOff(params) {
    let salesamt: string = params.data.Lab;
    let Lab = CommonFunctions.parseAmount(salesamt);
    return Lab;
  }

  public StaticNetSalesRoundOff(params) {
    let netsales: string = params.data.NetSales;
    let NetSales = CommonFunctions.parseAmount(netsales);
    return NetSales;
  }

  public StaticDiscountRoundOff(params) {
    let discount: string = params.data.Discount;
    let Discount = CommonFunctions.parseAmount(discount);
    return Discount;
  }

  public StaticGrossSalesRoundOff(params) {
    let grossSales: string = params.data.GrossSales;
    let GrossSales = CommonFunctions.parseAmount(grossSales);
    return GrossSales;
  }

  public StaticCashCollectionRoundOff(params) {
    let cashcollection: string = params.data.CashCollection;
    let CashCollection = CommonFunctions.parseAmount(cashcollection);
    return CashCollection;
  }

  styles: {
    header: {
      fontSize: 22;
      bold: true;
    };
  };

  public GetColumnSettings(colNames: Array<string>) {
    //let allCols = ;
    let retColArray: Array<any> = [];
    colNames.forEach((a) => {
      /// this replace concept is used beacuse to remove the start and end bracket from column names in return table.
      //CalculateDynamicWidth method is used for displaying header properly with its size in grid
      let col = {
        headerName: "" + a.replace("[", "").replace("]", "") + "",
        field: a,
      };
      retColArray.push(col);
    });

    return retColArray;
  }

  //this function is for displaying header properly with its size in grid report setting
  public CalculateDynamicWidth(ipWord: string): number {
    return ipWord.length * 16;
  }

  public DocRevenue_DocNameRenderer(params) {
    let docName = params.data.Doctor;
    let returnTemplate = `<div class='grid-action-label'>` + docName + `</div>`;
    return returnTemplate;
  }

  public StaticAccSalesRoundOff(params) {
    let accSales: string = params.data.AccPrice;
    let AccSales = CommonFunctions.parseAmount(accSales);
    return AccSales;
  }
  public StaticAccDiscountRoundOff(params) {
    let accDis: string = params.data.AccDiscount;
    let AccDis = CommonFunctions.parseAmount(accDis);
    return AccDis;
  }
  public StaticAccHSTRoundOff(params) {
    let accHST: string = params.data.AccHST;
    let AccHST = CommonFunctions.parseAmount(accHST);
    return AccHST;
  }
  public StaticPaidSubTotalRoundOff(params) {
    let amt: string = params.data.CashSales;
    let Amt = CommonFunctions.parseAmount(amt);
    return Amt;
  }

  public StaticPaidHSTRoundOff(params) {
    let amt: string = params.data.PaidHST;
    let Amt = CommonFunctions.parseAmount(amt);
    return Amt;
  }

  public StaticPaidDiscountRoundOff(params) {
    let amt: string = params.data.CashDiscount;
    let Amt = CommonFunctions.parseAmount(amt);
    return Amt;
  }

  public StaticUnpaidSubTotalRoundOff(params) {
    let amt: string = params.data.CreditSales;
    let Amt = CommonFunctions.parseAmount(amt);
    return Amt;
  }

  public StaticUnpaidHSTRoundOff(params) {
    let amt: string = params.data.UnpaidHST;
    let Amt = CommonFunctions.parseAmount(amt);
    return Amt;
  }

  public StaticUnpaidDiscountRoundOff(params) {
    let amt: string = params.data.CreditDiscount;
    let Amt = CommonFunctions.parseAmount(amt);
    return Amt;
  }

  public StaticReturnHSTRoundOff(params) {
    let returnHST: string = params.data.ReturnHST;
    let ReturnHST = CommonFunctions.parseAmount(returnHST);
    return ReturnHST;
  }
  public StaticReturnDiscountRoundOff(params) {
    let returnDIS: string = params.data.ReturnDiscount;
    let ReturnDis = CommonFunctions.parseAmount(returnDIS);
    return ReturnDis;
  }
  public StaticCancelAmountRoundOff(params) {
    let cancelAmount: string = params.data.CancelAmount;
    let CancelAmount = CommonFunctions.parseAmount(cancelAmount);
    return CancelAmount;
  }
  public StaticCancelHSTRoundOff(params) {
    let cancelHST: string = params.data.CancelHST;
    let CancelHST = CommonFunctions.parseAmount(cancelHST);
    return CancelHST;
  }

  public StaticCancelDiscountRoundOff(params) {
    let cancelDST: string = params.data.CancelDiscount;
    let CancelDST = CommonFunctions.parseAmount(cancelDST);
    return cancelDST;
  }
  AdmissionDateRenderer(params) {
    let date: string = params.data.AdmissionDate;
    return moment(date).format("YYYY-MM-DD HH:mm");
  }
  ThresholdMargin(params) {
    let thresholdmargin = params.data.MinimumQuantity;
    let availablequantity = params.data.AvailableQuantity;
    if (availablequantity == 0) {
      return (
        "<div style='width:50%;background-color:red;'>" +
        availablequantity +
        "</div>"
      );
    } else if (availablequantity <= thresholdmargin) {
      return (
        "<div style='width:50%;background-color:yellow;'>" +
        availablequantity +
        "</div>"
      );
    } else {
      return "<div style='width:50%'>" + availablequantity + "</div>";
    }
  }

  AddCancelledByDetail(params) {
    let cancelledBy = params.data.CancelledByUser;
    if (cancelledBy != null) {
      return cancelledBy;
    }
  }

  ShowBillCancelledOn(params) {
    let cancelledOn = params.data.BillCancelledOn;
    if (cancelledOn != null && params.data.BillCancelledOn != "Invalid date") {
      if (moment(cancelledOn).isValid()) {
        return moment(cancelledOn).format("YYYY-MM-DD HH:mm");
      }
    }
  }
  public InvPurchaseSummaryReportColCreatedOnConverter(params) {
    let Date: string = params.data.CreatedOn;
    return moment(Date).format("DD-MMM-YYYY");
  }
  public InvPurchaseSummaryReportColGRDateConverter(params) {
    let Date: string = params.data.GoodsReceiptDate;
    return moment(Date).format("DD-MMM-YYYY");
  }
  public InvPurchaseSummaryReportColVendorBillDateConverter(params) {
    let Date: string = params.data.VendorBillDate;
    return moment(Date).format("DD-MMM-YYYY");
  }
  //this formatter will useful for all report data
  //it's check is it number or not if number then it format with 2 decimal point value and send back
  //if values like 453.659865 , here after decimal we have 6 digit . it's not good for end user so this formatter will send
  // back 453.65 value
  public decimalValueFormatter(params) {
    let checkIsNum = isNaN(params.value);
    if (checkIsNum) {
      return params.value;
    } else {
      return CommonFunctions.parseAmount(params.value);
    }
  }
  public decimalValueFormatter4digit(params){
    let checkIsNum=isNaN(params.value);
    if(checkIsNum){
      return params.value;
    }else{
      return CommonFunctions.parseDecimal(params.value);
    }
  }

  public ApprovedMaterialStockRegisterReport = [
    {
      headerName: "Date",
      children: [{ headerName: "", width: 80 }],
    },
    {
      headerName: "Incoming to Stores-RM/PM",
      children: [
        {
          headerName: "Approved Material Received from Supplier",
          children: [
            {
              headerName: "GRN NO.& Date",
              field: "",
              width: 130,
            },

            {
              headerName: "Lot No. & Expiry Date",
              field: "",
              width: 130,
            },
            {
              headerName: "Quantity",
              field: "",
              width: 130,
            },
          ],
        },
        {
          headerName: "Excess Material Return From User Department",
          children: [
            {
              headerName: "EMRN No. & Date",
              field: "",
              width: 120,
            },
            {
              headerName: "Lot No. & Expiry Date",
              field: "",
              width: 130,
            },

            {
              headerName: "Quantity",
              field: "",
              width: 120,
            },
          ],
        },
      ],
    },
    {
      headerName: "Outgoing form Storees-RM/PM",
      children: [
        {
          headerName: "Material issued to the User Department",
          children: [
            { headerName: "MIN No & Date", field: "", width: 120 },
            {
              headerName: "Lot No. & Expiry Date",
              field: "",
              width: 120,
            },
            {
              headerName: "Quantity",
              field: "",
              width: 120,
              cellRenderer: this.StaticReturnDiscountRoundOff,
            },
          ],
        },
      ],
    },

    {
      headerName:
        "Closing Stock(Verified Actual vs Record on Every month last day)",
      children: [
        {
          headerName: "Lot No.& Expiry Date",
          children: [
            {
              headerName: "",
              field: "",
              width: 130,
            },
          ],
        },
        {
          headerName: "Quantity",
          children: [
            {
              headerName: "",
              field: "",
              width: 130,
            },
          ],
        },
      ],
    },
  ];
  public DetailStockLedgerReport = [
    { headerName: "S No", valueGetter: "node.rowIndex+1", width: 40 },
    {
      headerName: "Date",
      field: "TransactionDate",
      width: 100,
      cellRenderer: this.TransactionDateConverter,
    },
    { headerName: "Receipt Qty", field: "ReceiptQty", width: 100 },
    { headerName: "Receipt Rate", field: "ReceiptRate", width: 100 },
    { headerName: "Receipt Amt", field: "ReceiptAmount", width: 100 },
    { headerName: "Issue Qty", field: "IssueQty", width: 100 },
    { headerName: "Issue Rate", field: "IssueRate", width: 100 },
    { headerName: "Issue Amt", field: "IssueAmount", width: 100 },
    { headerName: "Balance Qty", field: "BalanceQty", width: 100 },
    { headerName: "Balance Rate", field: "BalanceRate", width: 100 },
    { headerName: "Balance Amt", field: "BalanceAmount", width: 100 },
    { headerName: "Reference No", field: "ReferenceNo", width: 100 },
    { headerName: "Store", field: "Store", width: 100 },
    { headerName: "Employee", field: "Username", width: 100 },
    { headerName: "Remarks", field: "Remarks", width: 100 },
  ];

  public TransactionDateConverter(params) {
    let Date: string = params.data.TransactionDate;
    return moment(Date).format("DD-MMM-YYYY");
  }

  // public FixedAssetsMovementReport = [
  //   {
  //     headerName: "Date",
  //     field: "MovementDate",
  //     width: 100,
  //     cellRenderer: this.MovementDateConverter,
  //   },
  //   { headerName: "Department", field: "StoreName", width: 150 },
  //   { headerName: "Employee", field: "AssetHolder", width: 150 },
  //   { headerName: "ItemName", field: "ItemName", width: 150 },
  //   { headerName: "Units/MeasurementName", field: "UOMName", width: 150 },
  //   { headerName: "Code", field: "Code", width: 150 },
  //   { headerName: "Quantity", field: "Quantity", width: 100 },
  //   { headerName: "MRP", field: "Amount", width: 100 },
  //   { headerName: "Total Amount", field: "", width: 100 },
  // ];

  public FixedAssetsMovementReport = [
    { headerName: "Reference No.", field: "BarCodeNumber", width: 100 },
    {
      headerName: "Issue/Receipt Date",
      field: "MovementDate",
      width: 150,
      cellRenderer: this.MovementDateConverter,
    },
    { headerName: "ItemName", field: "ItemName", width: 150 },
    { headerName: "Units/MeasurementName", field: "UOMName", width: 100 },
    { headerName: "Quantity", field: "Quantity", width: 100 },
    { headerName: "Total Amount", field: "Amount", width: 100 },
    { headerName: "Department", field: "StoreName", width: 150 },
    { headerName: "Employee", field: "AssetHolder", width: 150 },
  ];

  public MovementDateConverter(params) {
    let Date: string = params.data.MovementDate;
    return moment(Date).format("DD-MMM-YYYY");
  }

  public CollecionSite() {
    let site: string = "LPH Hospital";
    return site;
  }

  public TatalCovidCaseDistrictWise(params) {
    let totalCase: number = params.data.NewNegativeCases + params.data.NewPositiveCases + params.data.FollowupNegativeCases + params.data.FollowupPositiveCases;
    return totalCase;
  }

  public AgeSexRendererPatient(params) {
    let dob = params.data.DateOfBirth;
    let gender: string = params.data.Gender;
    if (dob && gender) {
      return CommonFunctions.GetFormattedAgeSex(dob, gender);
    } else {
      return "";
    }
  }


  public RPT_APPT_DepartmentWiseAppointmentCounts = [
        {headerName: "DepartmentName", field: "DepartmentName", width: 200 },
        {headerName: "New", field: "NewAppointment", width: 150 },
        {headerName: "Followup", field: "Followup", width: 150 },
        {headerName: "Referral", field: "Referral", width: 150 },
        {headerName: "Total", field: "TotalAppointments", width: 150 },
        {
          headerName: "Actions",
          field: "",
          width: 120,
          template: `<a danphe-grid-action="view-details" class="grid-action">
                            <i class="fa fa-eye"></i>View Details
                     </a>`,
        },
  ];

  public RPT_APPT_DistrictWiseAppointmentCounts = [
    {headerName: "District Name", field: "DistrictName", width: 200 },
    {headerName: "New", field: "NewAppointment", width: 150 },
    {headerName: "Followup", field: "Followup", width: 150 },
    {headerName: "Referral", field: "Referral", width: 150 },
    {headerName: "Total", field: "TotalAppointments", width: 150 }
];
  public ExpiryItemReport = [
    { headerName: "Sr.No.", field: "SN", width: 110 },
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "Vendor Name", field: "VendorName", width: 200 },
    { headerName: "Batch No", field: "BatchNo", width: 150 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 200, cellRenderer: ReportGridColumnSettings.DateOfExpiry},
    { headerName: "Rate", field: "CostPrice", width: 150 },
    { headerName: "Quantity", field: "AvailableQuantity", width: 150 },
    { headerName: "Sub Store Name", field: "Name", width: 200 },

  ]
  static DateOfExpiry(params) {
    let expiryDate: Date = (params.data.ExpiryDate);
    let expiryDateFormatted = moment(expiryDate).format('YYYY-MM-DD');
    let expiryDate1 = new Date(params.data.ExpiryDate)
    let date = new Date();
    let datenow = date.setMonth(date.getMonth() + 0);
    let datethreemonth = date.setMonth(date.getMonth() + 3);
    let expDate = expiryDate1.setMonth(expiryDate1.getMonth() + 0);

    if (expDate <= datenow) {
      return "<span style='background-color:red;color:white'>" + expiryDateFormatted + "(" + "Expired" + ")" + "</span>";
    }
    if (expDate < datethreemonth && expDate > datenow) {

      return "<span style='background-color:yellow;color:black'>" + expiryDateFormatted + "(" + "Nearly Expired" + ")" + "</span>";
    }
    if (expDate > datethreemonth) {

      return "<span style='background-color:green;color:white'>" + expiryDateFormatted + "(" + "Not Expired" + ")" + "</span>";
    } 
  }

  public INVSupplierInfoReport = [
    { headerName: "VendorName", field: "VendorName", width: 110 },
    { headerName: "Contact No", field: "ContactNo", width: 200 },
    //{ headerName: "City", field: "City", width: 150 },
    { headerName: "Pan No.", field: "PanNo", width: 150 },
  { headerName: "ContactAddress", field: "ContactAddress", width: 150 },
    { headerName: "Email", field: "Email", width: 150 },
  ]

  public EditedPatientDetailReportColumns = [
    { headerName: "Hospital Number", field: "Hospital Number", width: 100 },
    { headerName: "Patient Old Name", field: "Patient Old Name", width: 150 },
    { headerName: "Patient New Name", field: "Patient New Name", width: 150 },
    { headerName: "Registered By", field: "Registered By", width: 150 },
    { headerName: "Edited By", field: "Edited By", width: 150 },
    { headerName: "Registered Date", field: "Registered Date", width: 100 },
    { headerName: "Edited Date", field: "Edited Date", width: 100 }
  ];

  // public DetailDeptwiseAppointmentReport = [
  //   { headerName: "Sr No.", valueGetter: "node.rowIndex+1", width: 70 },
  //   {
  //     headerName: "Date/Time",
  //     field: "Date",
  //     width: 140,
  //   },
  //   { headerName: "Hospital No.", field: "PatientCode", width: 120 },
  //   { headerName: "Patient Name", field: "Patient_Name", width: 160 },
  //   { headerName: "Phone", field: "PhoneNumber", width: 100 },
  //   { headerName: "Age", field: "Age", width: 70 },
  //   { headerName: "Gender", field: "Gender", width: 100 },
  //   // { headerName: "District", field: "DistrictName", width: 100 },
  //   { headerName: "Doctor", field: "Doctor_Name", width: 120 },
  //   { headerName: "Address", field: "Address", width: 100 },
  //   { headerName: "Diagnosis", field: "Diagnosis", width: 100 },
  //   { headerName: "Department", field: "DepartmentName", width: 120 },
  //   // { headerName: "Visit Type", field: "VisitType", width: 140 },
  //   { headerName: "Appointment Type", field: "AppointmentType", width: 140 }
  // ];
}
