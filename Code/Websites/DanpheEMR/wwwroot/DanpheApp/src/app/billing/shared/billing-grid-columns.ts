import * as moment from 'moment/moment';
import { CoreService } from '../../core/shared/core.service';
import { CommonFunctions } from '../../shared/common.functions';


/*
 * Separate grid-column settings for Billing Module with option to use parameter value from Core-Services.
 Created:18Jul'19-Sud
 Remarks: Used only for Insurance now, later use for other pages as well.
 */

export class BillingGridColumnSettings {
  constructor(public coreService: CoreService) {

  }

  //Start: For Search Patient
  public InsurancePatientList = [
    { headerName: "Hospital No.", field: "PatientCode", width: 100 },
    { headerName: "Patient Name", field: "ShortName", width: 200 },
    { headerName: "IMIS Code", field: "IMISCode", width: 120 },
    { headerName: "Age/Sex", field: "", width: 70, cellRenderer: this.AgeSexRendererPatient },
    { headerName: "Phone", field: "PhoneNumber", width: 110 },
    { headerName: "Address", field: "Address", width: 120 },

    { headerName: "Balance Amt.", field: "CurrentBalance", width: 100 },
    {
      headerName: "Actions",
      field: "",
      width: 280,
      cellRenderer: this.BillingSearchActionsRenderer
    }

  ]

  public static HandOverTransactionList = [
    { headerName: "Voucher Date", field: "VoucherDate", width: 100 },
    { headerName: "Department", field: "DepartmentName", width: 100 },
    { headerName: "Counter", field: "CounterName", width: 100 },
    { headerName: "User", field: "UserName", width: 100 },
    { headerName: "Bank Name", field: "BankName", width: 100 },
    { headerName: "Voucher No.", field: "VoucherNumber", width: 100 },
    { headerName: "Handover Amt.", field: "HandoverAmount", width: 120 },
    { headerName: "Due Amount", field: "DueAmount", width: 120 },
    { headerName: "Entry Date", field: "CreatedOn", width: 100 },
    {
      headerName: "Action",
      field: "",
      width: 120,
      template: ` <a danphe-grid-action="handover-receive" class="grid-action">
                  Receive </a> `,
    }
  ]

  public static HandOverReportList = [
    { headerName: "Received Date", field: "ReceivedOn", width: 110 },
    { headerName: "Received Amt.", field: "HandoverAmount", width: 120 },
    { headerName: "Due Amount", field: "DueAmount", width: 120, cellRenderer: BillingGridColumnSettings.Handover_DueAmountRenderer },
    { headerName: "Received By", field: "ReceivedBy", width: 100 },
    { headerName: "Voucher No.", field: "VoucherNumber", width: 110 },
    { headerName: "Voucher Date", field: "VoucherDate", width: 100 },
    { headerName: "Bank Name", field: "BankName", width: 110 },
    { headerName: "Department", field: "DepartmentName", width: 120 },
    { headerName: "User", field: "UserName", width: 100 },
    { headerName: "Remarks", field: "ReceiveRemarks", width: 100 },
  ]

  static Handover_DueAmountRenderer(params) {
    let dueAmt = params.data.DueAmount;
    return CommonFunctions.parseAmount(dueAmt);
  }

  public static HandOverSummaryReportList = [
    { headerName: "Full Name", field: "FullName", width: 100 },
    { headerName: "Previous Due Amt", field: "PreviousDueAmount", width: 200 },
    { headerName: "Collection Till Date", field: "CollectionTillDate", width: 200 },
    { headerName: "Handover Till Date ", field: "HandoverTillDate", width: 100 },
    { headerName: "Due Amount", field: "DueAmount", width: 110 },
    { headerName: "Receive Pending Amount", field: "ReceivePendingAmount", width: 110 },
    { headerName: "Total Due Amount", field: "TotalDueAmount", width: 110, cellRenderer : BillingGridColumnSettings.ParseAmount},
  ]

  public static DailyCollectionVsHandoverReportList = [
    {
      headerName: "Date", field: "Date", width: 100,
      cellRenderer: BillingGridColumnSettings.HandoverTransactionDateTimeRenderer,
    },
    { headerName: "User Name", field: "FullName", width: 100 },
    { headerName: "Net Cash Collection", field: "CollectionTillDate", width: 200 },
    { headerName: "Handover", field: "HandoverTillDate", width: 100 },
    // { headerName: "Due Amount", field: "DueAmount", width: 100 },
    {
      headerName: "Action",
      field: "",
      width: 120,
      template: ` <a danphe-grid-action="view-detail" class="grid-action">
      View Handover Detail </a> `,
    }
  ] 
  public static HandoverDetailReportList = [
    {
      headerName: "Date", field: "HandoverDate", width: 100,
      cellRenderer: BillingGridColumnSettings.HandoverTransactionDateTimeRenderer,
    },
    { headerName: "HandOver Amount", field: "HandoverAmount", width: 120 },
    { headerName: "Due Amount", field: "DueAmount", width: 120 },
    { headerName: "Bank Name", field: "BankName", width: 110 },
    { headerName: "Voucher Number", field: "VoucherNumber", width: 100 },
    { headerName: "Counter", field: "CounterName", width: 100 },
    { headerName: "Recevied By", field: "ReceivedBy", width: 100 },
    {
      headerName: "Recevied On", field: "ReceivedOn", width: 100,
      cellRenderer: BillingGridColumnSettings.HandoverTransactionDateTimeRenderer,
    },
    { headerName: "Recevie Remarks", field: "ReceiveRemarks", width: 120 },

  ]


  AgeSexRendererPatient(params) {
    let dob = params.data.DateOfBirth;
    let gender: string = params.data.Gender;
    return CommonFunctions.GetFormattedAgeSex(dob, gender);
  }

   static ParseAmount(params){
    let amount = params.data.TotalDueAmount;
    return CommonFunctions.parseAmount(amount, 4);
  }

  BillingSearchActionsRenderer(params) {
    let templateHtml = "";
    let patient = params.data;
    templateHtml += `
             <a danphe-grid-action="insurance-billing" class="grid-action">
                         Insurance Billing</a>
             <a danphe-grid-action="update-ins-balance" class="grid-action">
                         Update Balance</a>
             `;
    return templateHtml;
  }

  static HandoverTransactionDateTimeRenderer(params) {
    return moment(params.data.LastCreditBillDate).format("YYYY-MM-DD HH:mm");
  }
}
