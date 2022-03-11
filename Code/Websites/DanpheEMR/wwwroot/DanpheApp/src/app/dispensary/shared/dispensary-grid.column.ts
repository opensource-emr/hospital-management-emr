import * as moment from "moment";
import { SecurityService } from "../../security/shared/security.service";
import { CommonFunctions } from "../../shared/common.functions";
import { DispensaryService } from "./dispensary.service";

export default class DispensaryGridColumns {
  static securityService
  currentActiveDispensary: any;
  IsCurrentDispensaryInsurace: any;
  constructor(private _securityService: SecurityService, private _dispensaryService: DispensaryService) {
    DispensaryGridColumns.securityService = this._securityService;
    this.currentActiveDispensary = this._dispensaryService.activeDispensary;
    this.IsCurrentDispensaryInsurace = this._dispensaryService.isInsuranceDispensarySelected;
  }
  //Grid column setting for Pharmacy Patient search page
  static PHRMPatientList = [
    { headerName: "Hospital Number", field: "PatientCode", width: 100 },
    { headerName: "Patient Name", field: "ShortName", width: 200 },
    { headerName: "Age/Sex", field: "", width: 110, cellRenderer: DispensaryGridColumns.AgeSexRendererPatient },
    { headerName: "Address", field: "Address", width: 110 },
    { headerName: "Phone", field: "PhoneNumber", width: 110 },
    { headerName: "Patient Type", field: "IsOutdoorPat", width: 100, cellRenderer: DispensaryGridColumns.IsOutdoorPatientText },
    {
      headerName: "Actions",
      field: "",
      width: 320,
      template:
        `<a danphe-grid-action="sale" class="grid-action">
                Sale
            </a>
            &nbsp;
            <a *ngIf= "IsCurrentDispensaryInsurace == false" danphe-grid-action="deposit" class="grid-action" >
                Deposit
            </a>`
    }

  ]

  static PHRMINSPatientList = [
    { headerName: "Hospital Number", field: "PatientCode", width: 100 },
    { headerName: "Patient Name", field: "ShortName", width: 200 },
    { headerName: "NSHI Number", field: "Ins_NshiNumber", width: 100 },
    { headerName: "Age/Sex", field: "", width: 110, cellRenderer: DispensaryGridColumns.AgeSexRendererPatient },
    { headerName: "Address", field: "Address", width: 110 },
    { headerName: "Phone", field: "PhoneNumber", width: 110 },
    { headerName: "Patient Type", field: "IsOutdoorPat", width: 100, cellRenderer: DispensaryGridColumns.IsOutdoorPatientText },
    {
      headerName: "Actions",
      field: "",
      width: 320,
      template:
        `<a danphe-grid-action="sale" class="grid-action">
                Sale
            </a>
          `
    }

  ]
  static AgeSexRendererPatient(params) {
    let dob = params.data.DateOfBirth;
    let gender: string = params.data.Gender;
    return CommonFunctions.GetFormattedAgeSex(dob, gender);

  }
  //Render column value bool to test for outdoor patient
  static IsOutdoorPatientText(params) {
    let Isoutdootpat = params.data.IsOutdoorPat;
    return Isoutdootpat == true ? 'Outdoor Patient' : 'Indoor Patient';
  }

  static PHRMPrescriptionList = [
    // { headerName: "PrescriptionId", field: "PrescriptionId", width: 100 },
    { headerName: "Code", field: "PatientCode", width: 100 },
    { headerName: "Patient Name", field: "PatientName", width: 200 },
    { headerName: "Requested By", field: "ProviderFullName", width: 200 },
    { headerName: "Date", field: "CreatedOn", width: 110, cellRenderer: DispensaryGridColumns.PrescriptionListDateRender },
    {
      headerName: "Actions",
      field: "",
      width: 200,
      template:
        `<a danphe-grid-action="view" class="grid-action">
                View Availability
             </a>
            `
    }
  ]
  static ProvisionalTotal(params) {
    let data = params.data;
    let provBal: number =
      data.ProvisionalTotal == null ? 0 : data.ProvisionalTotal;
    provBal = CommonFunctions.parseAmount(provBal);
    return provBal;
  }

  //This for prescription List createdOn date format rendering
  static PrescriptionListDateRender(params) {
    let CreatedOn: string = params.data.CreatedOn;
    if (CreatedOn)
      return moment(CreatedOn).format('DD-MMM-YYYY hh:mm A');
    else
      return null;
  }
  static PHRMSettlementBillSearch = [
    { headerName: "Hospital No.", field: "PatientCode", width: 120 },
    { headerName: "Patient Name", field: "PatientName", width: 150 },
    {
      headerName: "Age/Sex",
      field: "Gender",
      width: 110,
      cellRenderer: DispensaryGridColumns.AgeSexRendererPatient,
    },
    { headerName: "Deposit Amt", field: "DepositBalance", width: 120 },
    { headerName: "Credit Amt", field: "CreditTotal", width: 120 },
    {
      headerName: "Provisional Amt",
      field: "",
      width: 140,
      cellRenderer: DispensaryGridColumns.ProvisionalTotal,
    },
    {
      headerName: "Balance Amt",
      field: "",
      width: 120,
      cellRenderer: DispensaryGridColumns.SettlementBalanceRenderer,
    },
    {
      headerName: "Last Credit",
      field: "CreditDate",
      width: 160,
      cellRenderer: DispensaryGridColumns.CreditDateTimeRenderer,
    },
    {
      headerName: "Last Deposit",
      field: "DepositDate",
      width: 160,
      cellRenderer: DispensaryGridColumns.DepositDateTimeRenderer,
    },
    // {
    //   headerName: "Status",
    //   field: "BilStatus",
    //   width: 100,
    //   cellRenderer: DispensaryGridColumns.BillStatus
    // },
    {
      headerName: "Action",
      field: "",
      width: 200,
      cellRenderer: DispensaryGridColumns.SettlementAction,
    },
  ];
  static PHRMAllSettlementsColSettings = [
    { headerName: "Hospital No.", field: "HospitalNo", width: 120 },
    { headerName: "Patient Name", field: "PatientName", width: 150 },
    {
      headerName: "Age/Sex",
      field: "Gender",
      width: 110,
      cellRenderer: DispensaryGridColumns.AgeSexRendererPatient,
    },
    { headerName: "Contact", field: "ContactNumber", width: 150 },
    { headerName: "Receipt No", field: "ReceiptNo", width: 150 },
    { headerName: "Settlement Date", field: "SettlementDate", width: 150, cellRenderer: DispensaryGridColumns.PHRMCreditDateTimeRenderer },
    {
      headerName: "Action",
      field: "",
      width: 200,
      cellRenderer: DispensaryGridColumns.PHRMDuplicatePrintSettlementAction,
    },
  ];
  static SettlementBalanceRenderer(params) {
    let data = params.data;
    let credit: number = data.CreditTotal == null ? 0 : data.CreditTotal;
    let depositBal: number = data.DepositBalance;
    let provBal: number =
      data.ProvisionalTotal == null ? 0 : data.ProvisionalTotal;

    let balAmt: number = depositBal - credit - provBal;

    balAmt = CommonFunctions.parseAmount(balAmt);

    if (balAmt > 0) {
      return "(+)" + balAmt.toString() + "";
    } else {
      return "(-)" + (-balAmt).toString() + "";
    }
  }

  static CreditDateTimeRenderer(params) {
    if (params.data.CreditDate == null) {
      return "--No sale--";
    }
    return moment(params.data.CreditDate).format("YYYY-MM-DD HH:mm");
  }
  static PHRMCreditDateTimeRenderer(params) {
    if (params.data.SettlementDate == null) {
      return "--No sale--";
    }
    return moment(params.data.SettlementDate).format("YYYY-MM-DD HH:mm");
  }
  static DepositDateTimeRenderer(params) {
    if (params.data.DepositDate == null) {
      return "--No deposit--";
    }
    return moment(params.data.DepositDate).format("YYYY-MM-DD HH:mm");
  }
  static BillStatus(params) {
    if (params.data.BilStatus == 'unpaid') {
      return `<span style="color: red;"><b><b>Unpaid</b></span>`;
    }
    else {
      return `<span style="color: green;"><b><b>Paid</b></span>`;
    }
  }
  static SettlementAction(params) {
    if (params.data.DepositBalance > 0 || params.data.BilStatus == 'unpaid') {
      let template = `<a danphe-grid-action="showDetails" class="grid-action">
                        Show Details
                        </a>
                        `
        ;
      return template;
    } else {
      let template = `<a danphe-grid-action="print" class="grid-action">
                                  Print
                                  </a>`;
      return template;
    }
  }
  static PHRMDuplicatePrintSettlementAction(params) {
    let template = `<a danphe-grid-action="print" class="grid-action">
                                  Print
                                  </a>`;
    return template;

  }
  static IncomingStockList = [
    { headerName: 'Transferred Date', field: 'DispatchedDate', width: 100, cellRenderer: DispensaryGridColumns.DispatchedDateRenderer },
    { headerName: 'Transferred By', field: 'DispatchedBy', width: 200 },
    { headerName: 'Transferred From', field: 'TransferredFrom', width: 200 },
    { headerName: 'Status', field: 'Status', width: 100 },
    { headerName: 'Received By', field: 'ReceivedBy', width: 200 },
    { headerName: 'Received Date', field: 'ReceivedOn', width: 100, cellRenderer: DispensaryGridColumns.ReceivedDateRenderer },
    { headerName: 'Action', field: '', width: 100, cellRenderer: DispensaryGridColumns.IncomingStockListAction }
  ];
  static DispatchedDateRenderer(params) { return moment(params.data.DispatchedDate).format("YYYY-MM-DD"); }
  static ReceivedDateRenderer(params) { return (params.data.ReceivedOn) ? moment(params.data.ReceivedOn).format("YYYY-MM-DD") : ""; }

  static IncomingStockListAction(params) {
    return `<a danphe-grid-action="receiveStock" title="Receive Items" 
    class="grid-action ${(params.data.CanUserReceiveStock) ? "animated-btn blinking-btn-warning grid-action" : ""}">
      Receive Items
    </a>`;
  }
  StockDetailsList = [
    { headerName: "Generic Name", field: "GenericName", width: 250 },
    { headerName: "Medicine Name", field: "ItemName", width: 250 },
    { headerName: "Batch No", field: "BatchNo", width: 100 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 150, cellRenderer: DispensaryGridColumns.DateOfExpiry },
    { headerName: "Available Quantity", field: "AvailableQuantity", width: 200 },
    { headerName: "S.Price", field: "MRP", width: 100 },
  ]
  InsuranceStockDetailsList = [
    { headerName: "Generic Name", field: "GenericName", width: 200 },
    { headerName: "Medicine Name", field: "ItemName", width: 200 },
    { headerName: "Batch No", field: "BatchNo", width: 100 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 150, cellRenderer: DispensaryGridColumns.DateOfExpiry },
    { headerName: "Available Quantity", field: "AvailableQuantity", width: 200 },
    { headerName: "S.Price", field: "GovtInsurancePrice", width: 100 },
  ]
  static DateOfExpiry(params) {
    let expiryDate: Date = params.data.ExpiryDate;
    let expiryDate1 = new Date(params.data.ExpiryDate)
    let date = new Date();
    let datenow = date.setMonth(date.getMonth() + 0);
    let datethreemonth = date.setMonth(date.getMonth() + 3);
    let expDate = expiryDate1.setMonth(expiryDate1.getMonth() + 0);

    if (expDate <= datenow) {
      return "<span style='background-color:red;color:white'>" + moment(expiryDate).format('YYYY-MM-DD') + "(" + "Exp" + ")"; //Without moment it seperate Date and Time with Letter T
    }
    if (expDate < datethreemonth && expDate > datenow) {

      return "<span style='background-color:yellow;color:black'>" + moment(expiryDate).format('YYYY-MM-DD') + "(" + "N. Exp" + ")";
    }
    if (expDate > datethreemonth) {

      return "<span style='background-color:white;color:black'>" + moment(expiryDate).format('YYYY-MM-DD') + "</span>";
    }


  }
  static WriteOffList = [
    { headerName: "Breakage Date", field: "WriteOffDate", width: 100, cellRenderer: DispensaryGridColumns.ReturnDateRenderer },
    { headerName: "Breakage Id", field: "WriteOffId", width: 100 },
    // { headerName: "BatchNo", field: "BatchNo", width: 120 },
    // { headerName: "ItemPrice", field: "ItemPrice", width: 100 },         now no need to show.
    { headerName: "TotalQty", field: "Quantity", width: 100 },
    { headerName: "Sub Total", field: "SubTotal", width: 100 },
    { headerName: "Discount Amount", field: "DiscountAmount", width: 100 },
    { headerName: "VAT Amount", field: "VATAmount", width: 100 },
    { headerName: "Total Amount", field: "TotalAmount", width: 100 },
    { headerName: "Remarks", field: "Remarks", width: 100 },
    { headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="view" class="grid-action">View</a>' },
  ]
  static ReturnDateRenderer(params) {
    let date: string = params.data.WriteOffDate;
    return moment(date).format('YYYY-MM-DD');
  }
  static PHRMStoreRequisitionList = [
    { headerName: "Req.No", field: "RequistionNo", width: 50 },
    { headerName: "RequestedBy", field: "CreatedByName", width: 120 },
    { headerName: "RequestedFrom", field: "RequestedStoreName", width: 120 },
    {
      headerName: "Date",
      field: "RequisitionDate",
      width: 150,
      cellRenderer: DispensaryGridColumns.RequisitionDateOnlyRenderer,
    },
    { headerName: "Status", field: "RequisitionStatus", width: 150 },
    {
      headerName: "Actions",
      field: "",
      width: 230,
      cellRenderer: DispensaryGridColumns.ShowActionForRequisitionList,
    },
  ];
  static RequisitionDateOnlyRenderer(params) {
    let date: string = params.data.RequisitionDate;
    return moment(date).format('yyyy-mm-hh');
  }
  static ShowActionForRequisitionList(params) {
    let template =
      `<a danphe-grid-action="view" class="grid-action">
        View
      </a>`;
    if (['partial', 'complete'].includes(params.data.RequisitionStatus) && params.data.IsReceiveFeatureEnabed == true) {
      template += `
        <a danphe-grid-action="receiveDispatchedItems" title="Receive Dispatched Items" 
        class="grid-action ${(params.data.IsNewDispatchAvailable) ? "animated-btn blinking-btn-warning grid-action" : ""}">
          Receive Items
        </a>
        <a danphe-grid-action="dispatchList" class="grid-action">
          Dispatch List
        </a>`;
    }
    return template;
  }
  static PHRMDispatchList = [
    { headerName: "Dispatch Id", field: "DispatchId", width: 50 },
    {
      headerName: "Dispatch Date",
      field: "CreatedOn",
      width: 150,
      cellRenderer: DispensaryGridColumns.DispatchDateRender,
    },
    { headerName: "Received By", field: "ReceivedBy", width: 100 },
    { headerName: "Dispatched By", field: "DispatchedByName", width: 150 },
    {
      headerName: "Action",
      field: "",
      width: 120,
      template: `<a danphe-grid-action="view" class="grid-action">
               View
             </a>`,
    },
  ];
  static DispatchDateRender(params) {
    let date: string = params.data.CreatedOn;
    return moment(date).format('yyyy-mm-hh');
  }
  //pharmacy - sale invoice list details grid column setting
  static PHRMSaleList = [
    { headerName: "Hospital Number", field: "PatientCode", width: 100 },
    { headerName: "Invoice No", field: "InvoicePrintId", width: 100, cellRenderer: DispensaryGridColumns.InvoicePrintIdRenderer },
    { headerName: "Patient Name", field: "PatientName", width: 200 },
    { headerName: "Sub Total", field: "SubTotal", width: 100 },
    { headerName: "Dis Amt", field: "DiscountAmount", width: 100 },
    { headerName: "Total Amt", field: "PaidAmount", width: 100 },
    { headerName: "Date", field: "CreateOn", width: 110, cellRenderer: DispensaryGridColumns.SaleListDateRender },
    { headerName: "Patient Type", field: "PatientType", width: 120 },
    {
      headerName: "Actions", field: "", width: 200,
      template: `<a danphe-grid-action="view" class="grid-action"> Print </a>`,
    }
  ]
  //pharmacy - sale invoice list details grid column setting
  static PHRMInsuranceSaleList = [
    { headerName: "Hospital Number", field: "PatientCode", width: 100 },
    { headerName: "Invoice No", field: "InvoicePrintId", width: 100, cellRenderer: DispensaryGridColumns.InvoicePrintIdRenderer },
    { headerName: "NSHI No.", field: "NSHINumber", width: 200 },
    { headerName: "Patient Name", field: "PatientName", width: 200 },
    { headerName: "Claim Code", field: "ClaimCode", width: 200 },
    { headerName: "Sub Total", field: "SubTotal", width: 100 },
    { headerName: "Dis Amt", field: "DiscountAmount", width: 100 },
    { headerName: "Total Amt", field: "PaidAmount", width: 100 },
    { headerName: "Date", field: "CreateOn", width: 110, cellRenderer: DispensaryGridColumns.SaleListDateRender },
    { headerName: "Patient Type", field: "PatientType", width: 120 },
    {
      headerName: "Actions", field: "", width: 200,
      template: `<a danphe-grid-action="view" class="grid-action"> Print </a>`,
    }
  ]
  //this rederer add PH before number 
  static InvoicePrintIdRenderer(params) {
    return 'PH' + params.data.InvoicePrintId;
  }
  //This for sale List createOn date format rendering
  static SaleListDateRender(params) {
    let CreateOn: string = params.data.CreateOn;
    if (CreateOn)
      return moment(CreateOn).format('DD-MMM-YYYY hh:mm A');
    else
      return null;
  }
  static ShowActionForPHRMSaleList(params) {
    let template =
      `<a danphe-grid-action="view" class="grid-action">
            Print
         </a>`
    return template;
  }

  static ProvisionalReturnList = [
    { headerName: "Hospital Number", field: "PatientCode", width: 170, pinned: true },
    { headerName: "Patient Name", field: "ShortName", width: 160, pinned: true },
    { headerName: "Contact No.", field: "ContactNo", width: 100, pinned: true },
    { headerName: "Age/Sex", field: "", width: 110, cellRenderer: DispensaryGridColumns.AgeSexRendererPatient, pinned: true },
    { headerName: "Date", field: "LastCreditBillDate", width: 180, pinned: true, cellRenderer: DispensaryGridColumns.PHRMRetunProvisionalRenderer },
    { headerName: "Total", field: "TotalCredit", width: 110, pinned: true },
    {
      headerName: "Action",
      field: "",
      pinned: true,
      width: 200,
      template:
        ` <a danphe-grid-action="view" class="grid-action">
                    Print
                 </a>`
    }
  ]
  static PHRMRetunProvisionalRenderer(params) {
    let date: string = params.data.LastCreditBillDate;
    return moment(date).format('YYYY-MM-DD');
  }
  static DispensaryTransferRecords = [
    { headerName: "Transfer Date", field: "TransferredDate", width: 150, cellRenderer: DispensaryGridColumns.TransferDateRenderer },
    { headerName: "Generic Name", field: "GenericName", width: 200 },
    { headerName: "Medicine Name", field: "ItemName", width: 200 },
    { headerName: "Batch", field: "BatchNo", width: 100 },
    { headerName: "ExpiryDate", field: "ExpiryDate", width: 80, cellRenderer: DispensaryGridColumns.DateOfExpiry },
    { headerName: "Trans Qty", field: "TransferredQuantity", width: 100 },
    { headerName: "Transferred By", field: "TransferredBy", width: 180 },
    { headerName: "Target Store", field: "TransferredTo", width: 180 },
    { headerName: "Received By", field: "ReceivedBy", width: 180 },
    { headerName: "Remarks", field: "ItemRemarks", width: 100 }
  ]
  static TransferDateRenderer(params) {
    let date: string = params.data.TransferredDate;
    return moment(date).format('YYYY-MM-DD');
  }
}
