import * as moment from 'moment/moment';
import { CommonFunctions } from '../common.functions';
export default class GridColumnSettings {


  static AppointmentSearch = [
    { headerName: "Status", field: "", width: 110, cellRenderer: GridColumnSettings.GetApptStatus },
    { headerName: "Date", field: "", width: 100, cellRenderer: GridColumnSettings.ApptDateOnlyRenderer },
    { headerName: "Time", field: "", width: 100, cellRenderer: GridColumnSettings.ApptTimeRenderer },
    { headerName: "App. Id", field: "AppointmentId", width: 100 },
    { headerName: "Name", field: "FirstName", width: 140, cellRenderer: GridColumnSettings.FullNameRenderer },
    { headerName: "Phone", field: "ContactNumber", width: 110 },
    { headerName: "Doctor", field: "ProviderName", width: 150 },
    //{ headerName: "Type", field: "AppointmentType", width: 120 },
    {
      headerName: "Actions",
      field: "",
      width: 150,
      cellRenderer: GridColumnSettings.GetApptActions


      //< /a><a danphe-grid-action="admit" class="grid-action">
      //   Admit
      //    </a >
    }
  ]
  static EmployeeInfoSearch = [

    { headerName: "Employee Name", field: "EmployeeName", width: 200 },
    { headerName: "Designation", field: "Designation", width: 110 },
    { headerName: "Department", field: "DepartmentName", width: 130 },
    { headerName: "Phone No.", field: "ContactNumber", width: 150 },
    { headerName: "Ext.", field: "Extension", width: 80 },
    { headerName: "SpeedDial", field: "SpeedDial", width: 80 },
    { headerName: "Room No.", field: "RoomNumber", width: 80 },
    {
      headerName: "Office Hours", field: "", width: 280, cellRenderer: GridColumnSettings.EmpOfficeHrsRenderer
    }

  ]
  static DesignationList = [

    { headerName: "Designation Name", field: "DesignationName", width: 200 },
    { headerName: "Description", field: "Description", width: 200 },
    { headerName: "Created On", field: "CreatedOn", width: 200, cellRenderer: GridColumnSettings.CreatedDateTimeRenderer },
    {
      headerName: "Action",
      field: "",
      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }



  ]
  static FractionApplicableItemList = [
    { headerName: "Item Name", field: "ItemName", width: 350 },
    { headerName: "Hospital Percent", field: "HospitalPercent", width: 150 },
    { headerName: "Doctor Percent", field: "DoctorPercent", width: 150 },
    { headerName: "Description", field: "Description", width: 300 },
    {
      headerName: "Action",
      field: "",
      width: 100,
      cellRenderer: GridColumnSettings.parseTemplateForFractionApplicable
    }
  ]
  static FractionReportByItem = [
    { headerName: "Item Name", field: "ItemName", width: 350 },
    { headerName: "Service Department Name", field: "ServiceDepartmentName", width: 150 },
    { headerName: "Price", field: "Price", width: 150 },
    { headerName: "Total Fraction Amount", field: "FractionAmount", width: 300 },
  ]
  static FractionReportByDoctor = [
    { headerName: "Doctor Name", field: "DoctorName", width: 200 },
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "Price", field: "Price", width: 100 },
    { headerName: "Fraction Amount", field: "FractionAmount", width: 100 },
    { headerName: "5% TDS", field: "TDS", width: 100 },
    { headerName: "Net Amount", field: "NetAmount", width: 100 },
  ]
  static BedInfoSearch = [

    { headerName: "Ward", field: "WardName", width: 200 },
    { headerName: "Bed No.", field: "BedNumber", width: 100 },
    { headerName: "Bed Feature", field: "BedFeatureName", width: 200 },
    { headerName: "Price", field: "BedPrice", width: 100 },
    { headerName: "Is Occupied", field: "IsOccupied", width: 100, cellRenderer: GridColumnSettings.TrueFalseViewer }

  ]
  static WardInfoSearch = [

    { headerName: "Ward Name", field: "WardName", width: 200 },
    { headerName: "Total Beds", field: "TotalBeds", width: 180 },
    { headerName: "Available", field: "Available", width: 180 },
    { headerName: "Occupied", field: "Occupied", width: 180 },
    //{ headerName: "Maintainance", field: "", width: 180 }

  ]


  // static PendingLabResults = [
  //   { headerName: "Hospital No.", field: "PatientCode", width: 100 },
  //   { headerName: "Patient Name", field: "PatientName", width: 160 },
  //   { headerName: "Age/Sex", field: "", width: 70, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
  //   { headerName: "Phone Number", field: "PhoneNumber", width: 100 },
  //   { headerName: "Test Name", field: "LabTestCSV", width: 200 },
  //   { headerName: "Category", field: "TemplateName", width: 180 },
  //   { headerName: "Requesting Dept.", field: "WardName", width: 90 },
  //   { headerName: "Run No.", width: 80, field: "SampleCodeFormatted" },
  //   { headerName: "Bar Code", width: 90, field: "BarCodeNumber" },
  //   {
  //     headerName: "Actions",
  //     field: "",
  //     width: 250,
  //     template:
  //       `<a danphe-grid-action="addresult" class="grid-action">
  //                   Add Result
  //                </a> 
  //                <a danphe-grid-action="labsticker" class="grid-action"><i class="glyphicon glyphicon-print"></i> Sticker</a>
  //                <a danphe-grid-action="undo" class="grid-action">Undo</a>
  //               `
  //   }

  // ]



  static PatientSearch = [
    { headerName: "Hospital Number", field: "PatientCode", width: 160 },
    { headerName: "Patient Name", field: "ShortName", width: 200 },
    { headerName: "Age/Sex", field: "", width: 110, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
    { headerName: "Address", field: "Address", width: 110 },
    { headerName: "Phone", field: "PhoneNumber", width: 110 },
    {
      headerName: "Actions",
      field: "",
      resizable: true,
      template:
        `<a danphe-grid-action="edit" class="grid-action">Edit</a>
             <a danphe-grid-action="showHistory" class="grid-action">History</a>  
                <div class="dropdown" style="display:inline-block;">
                 <button class="dropdown-toggle grid-btnCstm" type="button" data-toggle="dropdown">...
                 <span class="caret"></span></button>
                 <ul class="dropdown-menu grid-ddlCstm">
                   <li><a danphe-grid-action="uploadfiles" >Upload Files</a></li>
                   <li><a danphe-grid-action="showHealthCard" >Health Card</a></li>
                   <li><a danphe-grid-action="showNeighbourCard" >Neighbour Card</a></li>
                 </ul>
                </div>`
    }
  ]
  //this is same to that of PatientSearch with only few fields added.
  //needs review whether it is required or not--sudarshan

  //< a danphe-grid - action="deposit" class="grid-action color-red " >
  //Deposit
  //< /a>

  //static AdmissionSearchPatient = [

  //    { headerName: "Hospital Number", field: "PatientCode", width: 160 },
  //    { headerName: "Name", field: "ShortName", width: 200 },
  //    { headerName: "Age/Sex", field: "", width: 110, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
  //    { headerName: "Phone", field: "PhoneNumber", width: 110 },
  //    { headerName: "Address", field: "Address", width: 110 },
  //    { headerName: "Actions", field: "", width: 100, cellRenderer: GridColumnSettings.ShowActionforADTPatientSearch }

  //]

  //static AdmittedList = [
  //    { headerName: "Admitted Date", field: "AdmittedDate", width: 150, cellRenderer: GridColumnSettings.AdmissionDateRenderer },
  //    { headerName: "Hospital Number", field: "PatientCode", width: 150 },
  //    { headerName: "IP Number", field: "VisitCode", width: 120 },
  //    { headerName: "Name", field: "Name", width: 200 },
  //    { headerName: "Age/Sex", field: "", width: 110, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
  //    { headerName: "AdmittingDoctor", field: "AdmittingDoctorName", width: 200 },
  //    { headerName: "Bed Feature", field: "BedInformation.BedFeature", width: 100 },
  //    { headerName: "BedCode", field: "BedInformation.BedCode", width: 120 },
  //    {
  //        headerName: "Actions",
  //        field: "",
  //        width: 400,
  //        template:
  //            //   `<a danphe-grid-action="discharge" class="grid-action">
  //            //  Discharge
  //            //</a>
  //            `<a danphe-grid-action="transfer" class="grid-action">
  //           Transfer
  //         </a> 
  //            <a danphe-grid-action="show-sticker"  title="Print Sticker" class="grid-action">
  //          <i class="glyphicon glyphicon-print"></i>&nbsp;sticker 
  //         </a>       
  //            <div class="dropdown" style="display:inline-block;">
  //              <button class="dropdown-toggle grid-btnCstm" style="background-color: #3598dc;" type="button" data-toggle="dropdown">...
  //              <span class="caret"></span></button>
  //                <ul class="dropdown-menu grid-ddlCstm">
  //                    <li><a danphe-grid-action="upgrade">Change Bed Feature</a></li>
  //                    <li><a danphe-grid-action="billdetail">Bill Details</a></li>

  //                    <li><a danphe-grid-action="generic-sticker" title="Generic Sticker"><i class="glyphicon glyphicon-print"></i>&nbsp;Patient Generic Sticker</a></li>
  //                    <li><a danphe-grid-action="cancel">Cancel</a> </li>
  //                     <li><a danphe-grid-action="ip-wrist-band" title="WristBand"><i class="glyphicon glyphicon-print"></i>&nbsp;Wrist-Band</a></li>
  //                </ul>
  //            </div>`
  //    }
  //]

  ////moved to adt-grid-column-settings inside adt module.:sud- 10Jan'19
  //static DischargedList = [
  //    { headerName: "Admitted On", field: "AdmittedDate", width: 120, cellRenderer: GridColumnSettings.AdmissionDateRenderer },
  //    { headerName: "Discharged On", field: "DischargedDate", width: 120, cellRenderer: GridColumnSettings.DischargeDateRenderer },
  //    { headerName: "Hospital No", field: "PatientCode", width: 120 },
  //    { headerName: "IP Number", field: "VisitCode", width: 100 },
  //    { headerName: "Name", field: "Name", width: 180 },
  //    { headerName: "Age/Sex", field: "", width: 100, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
  //    { headerName: "Phone", field: "PhoneNumber", width: 110 },
  //    { headerName: "BillStatus", field: "BillStatusOnDischarge", width: 100 },
  //    {
  //        headerName: "Actions",
  //        field: "",
  //        width: 210,
  //        cellRenderer: GridColumnSettings.DischargeListActionRenderer
  //    }
  //]


  //replaced template in actions by cell-renderer, which will give us the html dynamically.. —   
  static VisitSearch = [

    { headerName: "Date", field: "", width: 100, cellRenderer: GridColumnSettings.VisitDateOnlyRenderer },
    { headerName: "Time", field: "", width: 90, cellRenderer: GridColumnSettings.VisitTimeOnlyRenderer },
    { headerName: "Hospital No.", field: "PatientCode", width: 140 },
    { headerName: "Name", field: "ShortName", width: 170 },
    { headerName: "Phone", field: "PhoneNumber", width: 125 },
    { headerName: "Age/Sex", field: "", width: 90, cellRenderer: GridColumnSettings.VisitListAgeSexRenderer },
    { headerName: "Department", field: "DepartmentName", width: 190 },
    { headerName: "Doctor", field: "ProviderName", width: 190 },
    { headerName: "VisitType", field: "VisitType", width: 120 },
    { headerName: "Appt. Type", field: "AppointmentType", width: 130 },
    { headerName: "Days-Passed", field: "", width: 90, cellRenderer: GridColumnSettings.VisitDaysPassedRenderer },


    {
      headerName: "Actions",
      field: "",
      width: 320,
      cellRenderer: GridColumnSettings.VisitActionsRenderer
    }
  ]


  static VisitDaysPassedRenderer(params) {
    let date: string = params.data.VisitDate;
    let daysPassed = moment().diff(moment(date), 'days');


    return daysPassed;

  }


  static BillPatientSearch = [
    { headerName: "Type", field: "BillingType", width: 60, cellRenderer: GridColumnSettings.PatientTypeCellRenderer },
    { headerName: "Hospital No.", field: "PatientCode", width: 120 },
    { headerName: "Patient Name", field: "ShortName", width: 200 },
    { headerName: "Age/Sex", field: "", width: 90, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
    { headerName: "Address", field: "Address", width: 120 },
    { headerName: "Phone", field: "PhoneNumber", width: 110 },
    {
      headerName: "Actions",
      field: "",
      width: 280,
      cellRenderer: GridColumnSettings.BillingSearchActionsRenderer
      //template:
      //    `<a danphe-grid-action="billingRequest" class="grid-action">
      //    Billing Request
      // </a>
      // <a danphe-grid-action="deposit" class="grid-action">
      //    Deposit
      // </a>
      // <a danphe-grid-action="bill-history" class="grid-action">
      //               Bill History
      //   </a>
      //`
    }
  ]

  static BillingSearchActionsRenderer(params) {
    let templateHtml = "";
    let patient = params.data;
    templateHtml += `<a danphe-grid-action="billingRequest" class="grid-action">
                Billing Request
             </a>
             <a danphe-grid-action="deposit" class="grid-action">
                Deposit
             </a>
             <a danphe-grid-action="bill-history" class="grid-action">
                           Bill History
               </a>`;

    //if (patient.Insurance) {
    //  templateHtml += `<div class="dropdown" style="display:inline-block;">
    //             <button class="dropdown-toggle grid-btnCstm" style="background-color:#3598dc" data-toggle="dropdown">...
    //                    <span class="caret"></span>
    //                </button>
    //             <ul class="dropdown-menu grid-ddlCstm">
    //               <li><a danphe-grid-action="insurance-billing" class="grid-action">
    //                     Insurance Billing</a></li>
    //                </ul>
    //              </div>`
    //}
    return templateHtml;
  }

  static PatientTypeCellRenderer(params) {
    let row = params.data;

    if (row.BillingType == "IP") {
      return `<div style="color:#030620;color: #030620;background-color: #dcb7b7;width: 100%;font-weight: bold;">IP</div>`;
    }
    else {
      return `<b style="color:#57575c;">OP</b>`;
    }

  }

  //for gridview inside : Billing/BillOrderRequests
  static BillPendingOrderSearch = [

    { headerName: "Department", field: "ServiceDepartmentName", width: 110 },
    { headerName: "Hospital Number", field: "Patient.PatientCode", width: 100 },
    { headerName: "Patient Name.", field: "Patient.ShortName", width: 160 },
    { headerName: "Age/Sex", field: "", width: 80, cellRenderer: GridColumnSettings.AgeSexRenderer_BillOrders },
    { headerName: "Phone", field: "Patient.PhoneNumber", width: 110 },
    { headerName: "Total", field: "TotalAmount", width: 80 },
    { headerName: "RequestedBy", field: "RequestedBy", width: 120 },
    { headerName: "Last Req Date", field: "RequestDate", width: 130, cellRenderer: GridColumnSettings.BilPendingOrderDateTimeRenderer },

    {
      headerName: "Actions",
      field: "",
      width: 200,
      template:
        `<a danphe-grid-action="payOne" class="grid-action">
                Pay Request
             </a>
             <a danphe-grid-action="payAll" class="grid-action">
                Pay All
             </a>`
    }
  ]

  static BillCreditBillSearch = [

    { headerName: "Hospital Number", field: "PatientCode", width: 170, pinned: true },
    { headerName: "Patient Name", field: "ShortName", width: 160, pinned: true },
    { headerName: "Age/Sex", field: "", width: 110, cellRenderer: GridColumnSettings.AgeSexRendererPatient, pinned: true },
    { headerName: "Date", field: "LastCreditBillDate", width: 180, pinned: true, cellRenderer: GridColumnSettings.BilProvisionalDateTimeRenderer },
    { headerName: "Total", field: "TotalCredit", width: 110, pinned: true },
    {
      headerName: "Action",
      field: "",
      pinned: true,
      width: 200,
      template:
        `<a danphe-grid-action="showDetails" class="grid-action">
                Show Details
             </a>
              <a danphe-grid-action="view" class="grid-action">
                        Print
                     </a>`
    }
  ]
  static InsuranceBillCreditBillSearch = [

    { headerName: "Hospital Number", field: "PatientCode", width: 170, pinned: true },
    { headerName: "Patient Name", field: "ShortName", width: 160, pinned: true },
    { headerName: "Age/Sex", field: "", width: 110, cellRenderer: GridColumnSettings.AgeSexRendererPatient, pinned: true },
    { headerName: "LastCreditBillDate", field: "LastCreditBillDate", width: 180, pinned: true, cellRenderer: GridColumnSettings.BilProvisionalDateTimeRenderer },
    { headerName: "Total", field: "TotalCredit", width: 110, pinned: true },
    {
      headerName: "Action",
      field: "",
      pinned: true,
      width: 200,
      template:
        `<a danphe-grid-action="showDetails" class="grid-action">
                Show Details
             </a>
              <a danphe-grid-action="view" class="grid-action">
                        Print
                     </a>`
    }
  ]

  static BillSettlementBillSearch = [

    { headerName: "Hospital No.", field: "PatientCode", width: 120 },
    { headerName: "Patient Name", field: "PatientName", width: 150 },
    { headerName: "Age/Sex", field: "", width: 110, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
    { headerName: "Credits", field: "CreditTotal", width: 110 },
    { headerName: "Provisional", field: "ProvisionalTotal", width: 110 },
    { headerName: "Deposits", field: "DepositBalance", width: 110 },
    { headerName: "Balance", field: "", width: 110, cellRenderer: GridColumnSettings.SettlementBalanceRenderer },
    { headerName: "Last Transaction", field: "LastTxnDate", width: 160, cellRenderer: GridColumnSettings.BilCreditDateTimeRenderer },
    {
      headerName: "Action",
      field: "",
      width: 200,
      template:
        `<a danphe-grid-action="showDetails" class="grid-action">
                Show Details
             </a>`
    }
  ]



  static SettlementBalanceRenderer(params) {
    let data = params.data;
    let credit: number = data.CreditTotal;
    let depositBal: number = data.DepositBalance;
    let provBal: number = data.ProvisionalTotal;

    let balAmt: number = depositBal - credit - provBal;

    balAmt = CommonFunctions.parseAmount(balAmt);

    if (balAmt > 0) {
      return "(+)" + balAmt.toString() + "";
    }
    else {
      return "(-)" + (-balAmt).toString() + "";
    }


    //if (balAmt < 0) {
    //    balAmt = -balAmt;
    //    return `<label style="font-weight: bold;border: 2px solid red;background-color:red;color: white;padding:0px 4px;margin-left: 4px;">` + balAmt + `</label>`;
    //}
    //else
    //    return `<label style="font-weight: bold;border: 2px solid green;background-color:green;color: white;padding:0px 4px;margin-left: 4px;">` + balAmt + `</label>`;

  }



  static BillCancelSearch = [
    { headerName: "Hospital Number", field: "PatientCode", width: 170 },
    { headerName: "Patient Name.", field: "ShortName", width: 160 },
    { headerName: "Age/Sex", field: "", width: 110, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
    { headerName: "Phone", field: "PhoneNumber", width: 110 },
    { headerName: "Total", field: "TotalAmount", width: 110 },
    {
      headerName: "Action",
      field: "",
      width: 200,
      template:
        `<a danphe-grid-action="showDetails" class="grid-action">
                Show Details
             </a>`
    }
  ]

  static CreditCancelSearch = [
    { headerName: "Hospital Number", field: "PatientCode", width: 170 },
    { headerName: "Patient Name.", field: "ShortName", width: 160 },
    { headerName: "Age/Sex", field: "", width: 110, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
    { headerName: "Last Credit Date", field: "LastCreditBillDate", width: 110 },
    { headerName: "Total", field: "TotalCredit", width: 110 },
    {
      headerName: "Action",
      field: "",
      width: 200,
      template:
        `<a danphe-grid-action="showCreditDetails" class="grid-action">
                Show Details
             </a>`
    }
  ]





  static ImagingRequisitionListSearch = [

    { headerName: "Requested On", field: "CreatedOn", width: 100, cellRenderer: GridColumnSettings.DateTimeRenderer },
    { headerName: "Hospital Number", field: "Patient.PatientCode", width: 90 },
    { headerName: "Patient Name", field: "Patient.ShortName", width: 160 },
    { headerName: "Age/Sex", field: "", width: 45, cellRenderer: GridColumnSettings.AgeSexCombineRenderer },
    //{ headerName: "Phone", field: "Patient.PhoneNumber", width: 110 },
    { headerName: "Doctor", field: "ProviderName", width: 120 },
    { headerName: "Type", field: "ImagingTypeName", width: 80 },
    { headerName: "Imaging Name", field: "ImagingItemName", width: 150 },
    { headerName: "Insurance", field: "", width: 100, cellRenderer: GridColumnSettings.IsUnderInsurance },

    {
      headerName: "Action",
      field: "",
      width: 100,
      cellRenderer: GridColumnSettings.parseTemplateForRADReportList
    }
  ]

  static IsUnderInsurance(params) {
    if (params.data.HasInsurance) {
      return `<span style="color: green;"><b>Under Insurance</b></span>`;
    } else {
      return '';
    }
  }

  static parseTemplateForRADReportList(params) {
    //below part should be shown when PACS is enabled..sud:6sept'18 

    //`<a danphe-grid-action="upload-imging-files" class="grid-action">
    //        Attach Files
    //     </a>`
    if (params.data.IsShowButton) {
      let template =
        `<a danphe-grid-action="show-add-report" class="grid-action">
                Add Report
             </a>
            `
      return template
    }
    else {
      let template =
        `<a danphe-grid-action="show-add-report" class="grid-action">
                Add Report
             </a>
           `
      return template;
    }
  }

  static parseTemplateForFractionApplicable(params) {
    //below part should be shown when PACS is enabled..sud:6sept'18 

    //`<a danphe-grid-action="upload-imging-files" class="grid-action">
    //        Attach Files
    //     </a>`
    if (params.data.PercentSettingId) {
      let template =
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>
            `
      return template
    }
    else {
      let template =
        `<a danphe-grid-action="edit" class="grid-action">
                Add
             </a>
           `
      return template;
    }
  }

  static ImagingReportListSearch = [
    { headerName: "S.No", width: 50, cellRenderer: GridColumnSettings.SerialNumberRenderer },
    { headerName: "Date", field: "CreatedOn", width: 140, cellRenderer: GridColumnSettings.DateTimeRenderer },
    { headerName: "Hospital Number", field: "PatientCode", width: 90 },
    { headerName: "Patient Name", field: "PatientName", width: 200 },
    { headerName: "Age/Sex", field: "", width: 70, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
    { headerName: "Phone", field: "PhoneNumber", width: 110 },
    { headerName: "Reporting Doctor", field: "ReportingDoctorNamesFromSignatories", width: 140 },
    { headerName: "Imaging Type", field: "ImagingTypeName", width: 110 },
    { headerName: "Insurance", field: "", width: 110, cellRenderer: GridColumnSettings.IsUnderInsurance },
    { headerName: "Imaging Item", field: "ImagingItemName", width: 170 },
    {
      headerName: "Report",

      width: 150,
      cellRenderer: GridColumnSettings.ImagingReportViewActionRenderer
    }
  ]

  // static LabRequsistionPatientSearch = [
  //   { headerName: "Requisition Date", field: "LastestRequisitionDate", width: 150, cellRenderer: GridColumnSettings.RequisitionDateTimeRenderer },
  //   { headerName: "Hospital Number", field: "PatientCode", width: 125 },
  //   { headerName: "Patient Name", field: "PatientName", width: 150 },
  //   { headerName: "Age/Sex", field: "", width: 75, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
  //   { headerName: "Phone Number", field: "PhoneNumber", width: 100 },
  //   { headerName: "Requesting Dept.", field: "WardName", width: 120 },
  //   { headerName: "Visit Type", field: "IsAdmitted", width: 75, cellRenderer: GridColumnSettings.PatientTypeRenderer },
  //   { headerName: "Run Number Type", field: "RunNumberType", width: 100 },

  //   {
  //     headerName: "Action",
  //     field: "",
  //     width: 120,
  //     cellRenderer: GridColumnSettings.BtnByBillStatusRenderer
  //   }
  // ]




  static WardBilling = [
    { headerName: "Hospital No.", field: "PatientCode", width: 90 },
    { headerName: "Patient Name", field: "Name", width: 160 },
    { headerName: "Age/Sex", field: "", width: 70, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
    { headerName: "Contact", field: "PhoneNumber", width: 100 },
    { headerName: "Admitted Date", field: "AdmittedDate", width: 120, cellRenderer: GridColumnSettings.AdmissionDateRenderer },
    { headerName: "Admitting Doctor", field: "AdmittingDoctorName", width: 140 },
    { headerName: "Inpatient No.", field: "VisitCode", width: 100 },
    { headerName: "Ward/Bed", field: "BedInformation.Ward", width: 90, cellRenderer: GridColumnSettings.WardBedRenderer },
    {
      headerName: "Action",
      field: "",
      width: 100,
      template:
        `<a danphe-grid-action="ViewDetails" class="grid-action">
                View Detail
             </a>                
                     `
    }
  ]

  static RadiologyWardBillingColumns = [
    { headerName: "Hospital No.", field: "PatientCode", width: 90 },
    { headerName: "Patient Name", field: "Name", width: 160 },
    { headerName: "Age/Sex", field: "", width: 70, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
    { headerName: "Contact", field: "PhoneNumber", width: 100 },
    { headerName: "Admitted Date", field: "AdmittedDate", width: 120, cellRenderer: GridColumnSettings.AdmissionDateRenderer },
    { headerName: "Admitting Doctor", field: "AdmittingDoctorName", width: 140 },
    { headerName: "Inpatient No.", field: "VisitCode", width: 100 },
    { headerName: "Ward/Bed", field: "BedInformation.Ward", width: 90, cellRenderer: GridColumnSettings.WardBedRenderer },
    {
      headerName: "Action",
      field: "",
      width: 100,
      template:
        `<a danphe-grid-action="ViewDetails" class="grid-action">
                View Details
             </a>                
                     `
    }
  ]


  static LabReportPatientSearch = [
    { headerName: "Patient Name", field: "PatientName", width: 150 },
    { headerName: "Hospital Number", field: "PatientCode", width: 160 },

    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="ViewDetails" class="grid-action">
                View Details
             </a>`
    }
  ]

  // static LabTestPendingReportList = [
  //   { headerName: "Hospital No.", field: "PatientCode", width: 80 },
  //   { headerName: "Patient Name", field: "PatientName", width: 130 },
  //   { headerName: "Age/Sex", field: "", width: 90, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
  //   { headerName: "Phone Number", field: "PhoneNumber", width: 100 },
  //   { headerName: "Test Name", field: "LabTestCSV", width: 170 },
  //   //ashim: 01Sep2018: We're now grouping by sample code only.
  //   //{ headerName: "Template", field: "TemplateName", width: 160 },
  //   { headerName: "Requesting Dept.", field: "WardName", width: 70 },
  //   { headerName: "Run Num", field: "SampleCodeFormatted", width: 60 },
  //   { headerName: "BarCode Num", field: "BarCodeNumber", width: 70 },
  //   {
  //     headerName: "Action",
  //     field: "",
  //     width: 200,
  //     cellRenderer: GridColumnSettings.VerifyRenderer
  //     //   template: `<a danphe-grid-action="ViewDetails" class="grid-action">
  //     //   View Details
  //     //   </a>
  //     //  <a danphe-grid-action="labsticker" class="grid-action"><i class="glyphicon glyphicon-print"></i> Sticker</a>
  //     //  <a danphe-grid-action="Verify" class="grid-action">
  //     //   Verify
  //     //   </a>
  //     //  ` 
  //   }
  // ]

  // static LabTestFinalReportList = [
  //   { headerName: "Hospital No.", field: "PatientCode", width: 100 },
  //   { headerName: "Patient Name", field: "PatientName", width: 140 },
  //   { headerName: "Age/Sex", field: "", width: 60, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
  //   { headerName: "Phone Number", field: "PhoneNumber", width: 110 },
  //   { headerName: "Test Name", field: "LabTestCSV", width: 200 },
  //   //ashim: 01Sep2018: We're now grouping by sample code only.
  //   { headerName: "Report Generated By", field: "ReportGeneratedBy", width: 120 },
  //   { headerName: "Requesting Dept.", field: "WardName", width: 80 },
  //   { headerName: "Run Num", field: "SampleCodeFormatted", width: 80 },
  //   { headerName: "Is Printed", field: "", width: 70, cellRenderer: GridColumnSettings.LabReptIsPrintedRenderer },
  //   {
  //     headerName: "Action",
  //     field: "",

  //     width: 120,
  //     cellRenderer: GridColumnSettings.BillPaidRenderer
  //   }
  // ]

  static BillPaidRenderer(params) {
    let visitType = params.data.VisitType;
    let isBillPaid: boolean = false;

    if (visitType && visitType.toLowerCase() == "inpatient") {
      isBillPaid = true;
    }
    else {
      if (params.data.BillingStatus && (params.data.BillingStatus.toLowerCase() == "paid" || params.data.BillingStatus.toLowerCase() == "unpaid")) {
        isBillPaid = true;
      } else {
        isBillPaid = false;
      }
    }

    if (isBillPaid) {
      return `<a danphe-grid-action="ViewDetails" class="grid-action">
                View Details
             </a>`;
    }
    else {
      return `<b style="color: red;">Bill Not Paid</b>`;
    }

  }

  static LabReptIsPrintedRenderer(params) {
    let isPrinted = params.data.IsPrinted;

    if (isPrinted) {
      return `<b style="color: green;">YES</b>`;
    }
    else {
      return `<b style="color: red;">NO</b>`;
    }
  }


  static ItemwiseRequisitionList = [
    { headerName: "ItemName", field: "ItemName", width: 150 },
    { headerName: "Quantity", field: "Quantity", width: 150 },
    { headerName: "Available Qty", field: "AvailableQuantity", width: 150 },
    {
      headerName: "Action",
      field: "",
      width: 120,
      template:
        `<a danphe-grid-action="itemDispatch" class="grid-action">
                Dispatch Item
             </a>`
    }
  ]


  //remove text-transform for username and email since those might be case sensitive.
  static UserGridCellStyle(params) {
    return { 'text-transform': 'none' };
  }


  static StockList = [
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Available Quantity", field: "AvailQuantity", width: 150, cellRenderer: GridColumnSettings.ThresholdMargin },
    { headerName: "Minimum Quantity", field: "MinQuantity", width: 150 },
    {
      headerName: "Action", field: "", width: 150,
      template: `
            <a danphe-grid-action="view" class="grid-action">View</a>
            <a danphe-grid-action="manageStock" class="grid-action">Manage Stock</a >
            `
    },
  ]
  static StockDetails = [
    { headerName: "Batch No", field: "BatchNo", width: 150 },
    { headerName: "Available Quantity", field: "AvailQuantity", width: 150 },
    { headerName: "Unit Price", field: "ItemRate", width: 150 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 150 }
  ]
  static POlistVendorwise = [
    { headerName: "Name", field: "vName", width: 100 },
    { headerName: "Contact", field: "vContactNo", width: 100 },
    { headerName: "Address", field: "vAddress", width: 100 },
    { headerName: "Purchase Order Nos.", field: "POIds", width: 100, cellRenderer: GridColumnSettings.PurchaseOrderNosrenderer },
    {
      headerName: "Actions",
      field: "",
      width: 200,
      template: `<a danphe-grid-action="genGR" class="grid-action">Add Goods Receipt</a>`
    }

  ]
  static POList = [
    { headerName: "Vendor Name", field: "VendorName", width: 110 },
    { headerName: "Vendor Contact", field: "VendorContact", width: 110 },
    { headerName: "PO Date", field: "PoDate", width: 100, cellRenderer: GridColumnSettings.PurchaseOrderDateOnlyRenderer },
    { headerName: "Total Amount", field: "TotalAmount", width: 80 },
    { headerName: "PO Status", field: "POStatus", width: 110 },

    {
      headerName: "Actions",
      field: "",
      width: 200,
      ///this is used to action according to status
      cellRenderer: GridColumnSettings.ShowActionForPOList
    }

  ]
  static VendorsList = [
    { headerName: "S.N", field: "Sno", width: 25 },
    { headerName: "Vendor Name", field: "VendorName", width: 150 },
    { headerName: "Vendor Contact", field: "ContactNo", width: 100 },
    { headerName: "GR Date", field: "GoodReceiptDate", width: 100, },
    { headerName: "Total Amount", field: "TotalAmount", width: 100 },
    { headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="view" class="grid-action">View</a>' }
  ]

  static GRList = [
    { headerName: "S.N", field: "Sno", width: 25 },
    { headerName: "PO No.", field: "PurchaseOrderId", width: 50 },
    { headerName: "GR No.", field: "GoodsReceiptID", width: 50 },
    { headerName: "Vendor Name", field: "VendorName", width: 100 },
    { headerName: "Vendor Contact", field: "ContactNo", width: 80 },
    { headerName: "GR Date", field: "GoodReceiptDate", width: 75, cellRenderer: GridColumnSettings.GRDateOnlyRenderer },
    { headerName: "Total Amount", field: "TotalAmount", width: 75 },
    { headerName: "Remarks", field: "Remarks", width: 100 },
    { headerName: "Action", field: "", width: 50, template: '<a danphe-grid-action="view" class="grid-action">View</a>' }
  ]
  static DepartmentwiseRequisitionList = [
    { headerName: "Department", field: "DepartmentName", width: 120 },
    { headerName: "Date", field: "RequisitionDate", width: 150, cellRenderer: GridColumnSettings.RequisitionDateOnlyRenderer },
    { headerName: "Status", field: "RequisitionStatus", width: 150 },
    { headerName: "Actions", field: "", width: 230, cellRenderer: GridColumnSettings.ShowActionForRequisitionList }
  ]

  static AppointmentPatientSearch = [

    { headerName: "Hospital Number", field: "PatientCode", width: 160 },
    { headerName: "Patient Name", field: "ShortName", width: 200 },
    { headerName: "Age/Sex", field: "", width: 110, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
    { headerName: "Address", field: "Address", width: 110 },
    { headerName: "Phone", field: "PhoneNumber", width: 110 },


    {
      headerName: "Actions",
      field: "",
      width: 180,
      template:
        `
             <a danphe-grid-action="appoint" class="grid-action">
                Check In
             </a>`
    }
  ]

  static AppointmentAllPatientSearch = [

    { headerName: "Hospital Number", field: "PatientCode", width: 160 },
    { headerName: "Patient Name", field: "ShortName", width: 200 },
    { headerName: "Age/Sex", field: "", width: 110, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
    { headerName: "Address", field: "Address", width: 110 },
    { headerName: "Phone", field: "PhoneNumber", width: 110 },


    {
      headerName: "Actions",
      field: "",
      width: 180,
      template:
        `
             <a danphe-grid-action="create" class="grid-action">
                Create Appointment
             </a>`
    }
  ]

  static TxnItemList = [
    { headerName: "Date", field: "Date", width: 90, cellRenderer: GridColumnSettings.FractionDateRenderer },
    { headerName: "Billing", field: "BillingType", width: 90 },
    { headerName: "BillTransactionItemId", field: "BillTransactionItemId", width: 90 },
    //{ headerName: "Provider", field: "ProviderName", width: 90 },
    { headerName: "Patient Name", field: "FullName", width: 120 },
    { headerName: "Item Name", field: "ItemName", width: 100 },
    { headerName: "Service Department Name", field: "ServiceDepartmentName", width: 120 },
    { headerName: "TotalAmount", field: "TotalAmount", width: 120 },
    {
      headerName: "Action",
      field: "",
      width: 200,
      cellRenderer: GridColumnSettings.ManageFractionTemplate
    }
  ]

  static EditDoctorItemList = [
    { headerName: "Date", field: "Date", width: 90, cellRenderer: GridColumnSettings.EditDoctorDateRenderer },
    { headerName: "Receipt No", field: "ReceiptNo", width: 85 },
    { headerName: "Hospital No", field: "PatientCode", width: 100 },
    { headerName: "Patient Name", field: "PatientName", width: 100 },
    { headerName: "Age/ Sex", field: "PatientName", width: 80, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
    { headerName: "Phone Number", field: "PhoneNumber", width: 100 },
    { headerName: "Item Name", field: "ItemName", width: 100 },
    { headerName: "Service Department Name", field: "ServiceDepartmentName", width: 160 },
    { headerName: "Doctor Name", field: "ProviderName", width: 120 },
    // { headerName: "TotalAmount", field: "Receipt", width: 120 },
    {
      headerName: "Action",
      field: "",
      width: 100,
      template:
        `
                 <a danphe-grid-action="edit" class="grid-action">
                    Edit
                 </a>`
    }
  ]
  static EditDoctorDateRenderer(params) {
    let date: string = params.data.Date;
    return moment(date).format('YYYY-MM-DD');
  }

  static FractionDateRenderer(params) {
    let date: string = params.data.Date;
    return moment(date).format('YYYY-MM-DD HH:mm');
  }

  static EditDoctorDOBDateRenderer(params) {
    let date: string = params.data.DateOfBirth;
    return moment(date).format('YYYY-MM-DD');
  }


  static returnToVendorItemList = [

    { headerName: "Vendor Name", field: "VendorName", width: 150 },
    { headerName: "Credit Note No", field: "CreditNoteNo", width: 150 },
    { headerName: "Created On", field: "CreatedOn", width: 150 },
    {
      headerName: "Actions",
      field: "",
      width: 180,
      template:
        `
                 <a danphe-grid-action="view" class="grid-action">
                    View
                 </a>`
    }

  ]

  static writeOffItemColumn = [

    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Batch No.", field: "BatchNO", width: 150 },
    { headerName: "Write Off Qty", field: "WriteOffQuantity", width: 150 },
    { headerName: "Write Off Date", field: "WriteOffDate", width: 150 },
    { headerName: "Rate", field: "ItemRate", width: 150 },
    { headerName: "Total Amount", field: "TotalAmount", width: 150 },
    { headerName: "Remark", field: "Remark" }

  ]


  static vendorList = [

    { headerName: "Vendor Name", field: "VendorName", width: 150 },
    { headerName: "Vendor Code", field: "VendorCode", width: 150 },
    { headerName: "Contact Person", field: "ContactPerson", width: 120 },
    { headerName: "Contact Address", field: "ContactAddress", width: 120 },
    { headerName: "Contact Number", field: "ContactNo", width: 150 },
    { headerName: "Pan No", field: "PanNo", width: 150 },
    { headerName: "Email Address", field: "Email", width: 150, cellStyle: GridColumnSettings.UserGridCellStyle },
    { headerName: "Is Active", field: "IsActive", width: 100 },

    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]

  static TermsConditionsList = [
    { headerName: "ShortName", field: "ShortName", width: 100 },
    { headerName: "Text", field: "Text", width: 100 },
    { headerName: "Is Active", field: "IsActive", width: 100 },
    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]

  static ItemList = [

    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Item Code", field: "Code", width: 100 },
    { headerName: "Item Type", field: "ItemType", width: 120 },
    { headerName: "Description", field: "Description", width: 150 },
    { headerName: "MinStock Quantity", field: "MinStockQuantity", width: 150 },
    { headerName: "Standard Rate", field: "StandardRate", width: 150 },
    { headerName: "Budgeted Quantity", field: "BudgetedQuantity", width: 150 },

    { headerName: "Is Active", field: "IsActive", width: 100 },

    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]

  static CurrencyList = [

    { headerName: "Currency Code", field: "CurrencyCode", width: 150 },
    { headerName: "Description", field: "Description", width: 150 },
    { headerName: "Is Active", field: "IsActive", width: 100 },

    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]

  static CompanyList = [

    { headerName: "Name", field: "CompanyName", width: 150 },
    { headerName: "Code", field: "Code", width: 150 },
    { headerName: "Address", field: "ContactAddress", width: 150 },
    { headerName: "Contact", field: "ContactNo", width: 150 },
    { headerName: "Email", field: "Email", width: 150 },
    { headerName: "Description", field: "Description", width: 150 },
    {
      headerName: "Action",
      field: "",
      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]

  static ItemCategoryList = [

    { headerName: "Item Category Name", field: "ItemCategoryName", width: 150 },
    { headerName: "Description", field: "Description", width: 150 },
    { headerName: "Is Active", field: "IsActive", width: 100 },

    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]
  static ItemSubCategoryList = [

    { headerName: "Sub Category Name", field: "SubCategoryName", width: 150 },
    { headerName: "Code", field: "Code", width: 150 },
    { headerName: "Description", field: "Description", width: 150 },
    { headerName: "Account Head", field: "AccountHeadName", width: 150 },
    { headerName: "Is Active", field: "IsActive", width: 100 },

    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]

  static AccountHeadList = [

    { headerName: "AccountHead Name", field: "AccountHeadName", width: 150 },
    { headerName: "Description", field: "Description", width: 150 },
    { headerName: "Is Active", field: "IsActive", width: 100 },

    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]
  // ------Start: Accounting Grid Data ----------------

  static companyList = [

    { headerName: "Company Name", field: "CompanyName", width: 150 },
    { headerName: "Contact Address", field: "ContactAddress", width: 120 },
    { headerName: "Contact Number", field: "ContactNo", width: 150 },
    { headerName: "Email Address", field: "Email", width: 150 },
    { headerName: "Is Active", field: "IsActive", width: 100 },

    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]

  static itemList = [

    { headerName: "Item Name", field: "ItemName", width: 150 },
    //{ headerName: "Ledger Name", field: "LedgerName", width: 120 },
    { headerName: "Available Qty", field: "AvailableQuantity", width: 100 },
    { headerName: "Description", field: "Description", width: 100 },
    { headerName: "IsActive", field: "IsActive", width: 100 },
    {
      headerName: "Action",
      field: "",
      width: 200,
      cellRenderer: GridColumnSettings.ManageUsesActionTemplate

    }

  ]

  static ledgerList = [
    { headerName: "Primary Group", field: "PrimaryGroup", width: 100 },
    { headerName: "Chart Of Account", field: "COA", width: 100 },
    { headerName: "Ledger Group", field: "LedgerGroupName", width: 100 },
    { headerName: "Ledger Name", field: "LedgerName", width: 150 },
    { headerName: "Is Active", field: "IsActive", width: 100 },
    {
      headerName: "Action",
      field: "",
      width: 200,
      cellRenderer: GridColumnSettings.ManageUserActionLedgerTemplate
    }
  ]
  static FiscalYearList = [
    { headerName: "Fiscal Year Name", field: "FiscalYearName", width: 150 },
    { headerName: "Start Date", field: "StartDate", width: 100 },
    { headerName: "End Date", field: "EndDate", width: 100 },
    { headerName: "Description", field: "Description", width: 100 },
    { headerName: "IsActive", field: "IsActive", width: 100 },
    //{
    //    headerName: "Action",
    //    field: "",
    //    width: 200,
    //    cellRenderer: GridColumnSettings.ManageFiscalYearActionTemplate
    //}
  ]

  static AccDailyTxnReport = [
    { headerName: "Voucher No", field: "VoucherNumber", width: 80 },
    { headerName: "Transaction Date", field: "TransactionDate", width: 100, cellRenderer: GridColumnSettings.AccTxnDateRenderder },
    { headerName: "Ledger Name", field: "LedgerName", width: 120 },
    { headerName: "DrAmount", field: "DrAmount", width: 100, cellRenderer: GridColumnSettings.AccDrAmountRenderder },
    { headerName: "CrAmount", field: "CrAmount", width: 100, cellRenderer: GridColumnSettings.AccCrAmountRenderder },
    { headerName: "Option", field: "", width: 100, cellRenderer: GridColumnSettings.AccDailyTxnActionTemplate }
  ]

  static CostCenterItemsList = [
    { headerName: "CostCenter ItemName", field: "CostCenterItemName", width: 150 },
    { headerName: "Description", field: "Description", width: 100 },
    { headerName: "IsActive", field: "IsActive", width: 100 },
    {
      headerName: "Action",
      field: "",
      width: 200,
      cellRenderer: GridColumnSettings.ManageUsesActionTemplate

    }

  ]
  static ledgerGroupList = [
    { headerName: "Primary Group", field: "PrimaryGroup", width: 100 },
    { headerName: "Chart Of Account", field: "COA", width: 100 },
    { headerName: "Ledger Group", field: "LedgerGroupName", width: 100 },
    { headerName: "Description", field: "Description", width: 100 },
    { headerName: "Is Active", field: "IsActive", width: 100 },
    {
      headerName: "Action",
      field: "",
      width: 200,
      cellRenderer: GridColumnSettings.ManageUsesActionTemplate
    }
  ]
  static ledgerGroupCategoryList = [
    { headerName: "Ledger GRP Category Name", field: "LedgerGroupCategoryName", width: 150 },
    { headerName: "Chart Of Account Name", field: "ChartOfAccountName", width: 150 },
    { headerName: "Description", field: "Description", width: 100 },
    { headerName: "Is Active", field: "IsActive", width: 100 },
    { headerName: "Is Debit", field: "IsDebit", width: 100 },
    {
      headerName: "Action",
      field: "",
      width: 200,
      cellRenderer: GridColumnSettings.ManageUsesActionTemplate

    }
  ]
  static voucherList = [

    { headerName: "Voucher Name", field: "VoucherName", width: 100 },
    { headerName: "Voucher Code", field: "VoucherCode", width: 100 },
    { headerName: "Description", field: "Description", width: 100 },
    { headerName: "Is Active", field: "IsActive", width: 100 }

  ]

  static voucherHeadList = [

    { headerName: "Voucher Head Name", field: "VoucherHeadName", width: 150 },
    { headerName: "Description", field: "Description", width: 150 },
    { headerName: "Created On", field: "CreatedOn", width: 150, cellRenderer: GridColumnSettings.AccCreatedOnDateRenderer },
    { headerName: "Is Active", field: "IsActive", width: 100 },
    {
      headerName: "Action",
      field: "",
      width: 200,
      cellRenderer: GridColumnSettings.ManageVoucherHead
    }
  ]

  static VoucherTransactionList = [
    { headerName: "Voucher No.", field: "VoucherNumber", width: 120 },
    { headerName: "Fiscal Year", field: "FiscalYear", width: 80 },
    { headerName: "TransactionDate", field: "TransactionDate", width: 80, cellRenderer: GridColumnSettings.AccTxnDateRenderder },
    { headerName: "Voucher Type", field: "VoucherType", width: 120 },
    { headerName: "TotalAmount", field: "Amount", width: 100, cellRenderer: GridColumnSettings.AccAmountRenderder },
    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="view-detail" class="grid-action">
                View Detail
             </a>`
    }
  ]
  static LedgerTransactionList = [
    { headerName: "Fiscal Year", field: "FiscalYear", width: 80 },
    { headerName: "Voucher No.", field: "VoucherNumber", width: 120 },
    { headerName: "Reference Voucher No.", cellRenderer: GridColumnSettings.AccTxnRefRenderer, width: 120 },
    { headerName: "Date", field: "TransactionDate", width: 80, cellRenderer: GridColumnSettings.AccTransactionDateRenderer },
    { headerName: "Ledger", field: "LedgerName", width: 120 },
    { headerName: "Dr/Cr", field: "", width: 50, cellRenderer: GridColumnSettings.DrCrRenderer },
    { headerName: "Amount", field: "Amount", width: 80 },
    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="view-detail" class="grid-action">
                View Detail
             </a>`
    }
  ]

  static AccTransactionDateRenderer(params) {
    let date: string = params.data.TransactionDate;
    return moment(date).format('YYYY-MM-DD HH:mm');
  }

  static AccCreatedOnDateRenderer(params) {
    let date: string = params.data.TransactionDate;
    return moment(date).format('YYYY-MM-DD');
  }
  static AccTxnRefRenderer(params) {
    let refVno: number = params.data.ReferenceVoucherNumber;
    return refVno ? refVno : '';
  }
  static DrCrRenderer(params) {
    if (params.data.IsDebit) {
      return "Dr.";
    }
    else
      return "Cr.";
  }

  public static ManageUsesActionTemplate(params) {
    let template;
    if (params.data.IsActive == true) {
      template =
        `<a danphe-grid-action="activateDeactivateBasedOnStatus" class="grid-action">
              Deactivate
            </a>`
    }
    else {
      template =
        `<a danphe-grid-action="activateDeactivateBasedOnStatus" class="grid-action">
                Activate
               </a>`
    }
    template = template + `&nbsp;<a danphe-grid-action="edit" class="grid-action">
                                Edit</a>`;
    return template;
  }

  public static ManageFractionTemplate(params) {
    let template;
    if (params.data.BillTxnItemId) {
      template =
        `<a danphe-grid-action="view">
             View Fraction
            </a>`
    }
    else {
      template =
        `<a danphe-grid-action="add">
                Add Fraction
               </a>`
    }
    return template;
  }


  public static ManageUserActionLedgerTemplate(params) {

    if (params.data.IsActive == true) {
      let template = `
            <a danphe-grid-action="activateDeactivateBasedOnStatus" class="grid-action">Deactivate</a>
            <a danphe-grid-action="edit" class="grid-action">Edit</a >
            `
      return template
    }
    else {
      let template = `
            <a danphe-grid-action="activateDeactivateBasedOnStatus" class="grid-action">Activate</a>
            <a danphe-grid-action="edit" class="grid-action">Edit</a >
            `
      return template;
    }

  }

  public static ManageVoucherHead(params) {

    let template = `
            <a danphe-grid-action="edit" class="grid-action">Edit</a >
            `
    return template

  }
  public static ManageFiscalYearActionTemplate(params) {

    if (params.data.IsActive == true) {
      let template =
        `
            <a danphe-grid-action="endFiscalYear" class="grid-action">
              End Year
            </a>`
      return template
    }
    else {
      return null;
    }
  }
  public static ManageLedgerGrpVouchersTemplate(params) {

    if (params.data.IsActive == true) {
      let template =
        `
            <a danphe-grid-action="ManageLedgerGrpVouchers" class="grid-action">
              Manage Vouchers
            </a>

            <a danphe-grid-action="activateDeactivateBasedOnStatus" class="grid-action">
              Deactivate
            </a>`
      return template
    }
    else {
      let template =
        `<a danphe-grid-action="activateDeactivateBasedOnStatus" class="grid-action">
                Activate
               </a>`
      return template;
    }

  }
  // ------End: Accounting Grid Data ----------------
  static PackagingTypeList = [

    { headerName: "PackagingType Name", field: "PackagingTypeName", width: 150 },
    { headerName: "Description", field: "Description", width: 150 },
    { headerName: "Is Active", field: "IsActive", width: 100 },

    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]

  static UnitOfMeasurementList = [

    { headerName: "UnitOfMeasurement Name", field: "UOMName", width: 150 },
    { headerName: "Description", field: "Description", width: 150 },
    { headerName: "Is Active", field: "IsActive", width: 100 },

    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>`
    }
  ]


  //start:nursing

  static NurOPDList = [

    { headerName: "Date", field: "", width: 80, cellRenderer: GridColumnSettings.VisitDateOnlyRenderer },
    { headerName: "Time", field: "", width: 80, cellRenderer: GridColumnSettings.VisitTimeOnlyRenderer },
    { headerName: "Hospital Number", field: "Patient.PatientCode", width: 120 },
    { headerName: "Name", field: "Patient.ShortName", width: 160 },
    { headerName: "Phone", field: "Patient.PhoneNumber", width: 125 },
    { headerName: "Age/Sex", field: "", width: 90, cellRenderer: GridColumnSettings.AgeSexRenderer },
    { headerName: "ProviderName", field: "ProviderName", width: 160 },
    {
      headerName: "Action",
      field: "",

      width: 160,
      template:
        `<i danphe-grid-action="patient-overview" class="fa fa-tv grid-action" style="padding: 3px;" title= "overview"></i>
              <a danphe-grid-action="clinical" class="grid-action">
                Clinical
             </a>
                <i danphe-grid-action="upload-files" class="fa fa-upload grid-action" style="padding: 3px;" title="upload files"></i>`
    }
  ]
  static NurIPDList = [
    { headerName: "Admitted Date", field: "AdmittedDate", width: 90, cellRenderer: GridColumnSettings.AdmissionDateRenderer },
    { headerName: "Hospital Number", field: "PatientCode", width: 80 },
    { headerName: "IP Number", field: "VisitCode", width: 80 },
    { headerName: "Name", field: "Name", width: 150 },
    { headerName: "Age/Sex", field: "", width: 70, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
    { headerName: "Bed Detail", field: "", cellRenderer: GridColumnSettings.BedDetailRenderer, width: 110 },
    {
      headerName: "Actions",
      field: "",
      width: 250,
      template:
        `<i danphe-grid-action="patient-overview" class="fa fa-tv grid-action" style="padding: 3px;" title= "overview"></i>
                    <a danphe-grid-action="orders" class="grid-action" title="Click to add Orders">
                        Ward Billing
                    </a>
                    <a danphe-grid-action="clinical" class="grid-action">
                        Clinical
                    </a>              
                    <a danphe-grid-action="drugs-request" class="grid-action">
                        Drugs Request
                    </a>
                <i danphe-grid-action="upload-files" class="fa fa-upload grid-action" style="padding: 3px;" title="upload files"></i>
                `
    }
  ]
  static NurNEPHList = [
    { headerName: "Hospital Number", field: "PatientCode", width: 120 },
    { headerName: "Name", field: "ShortName", width: 160 },
    { headerName: "Phone", field: "PhoneNumber", width: 125 },
    { headerName: "Age", field: "Age", width: 90 },
    { headerName: "Sex", field: "Gender", width: 90 },
    { headerName: "ProviderName", field: "ProviderName", width: 160 },
    {
      headerName: "Action",
      field: "",

      width: 160,
      template:
        `<i danphe-grid-action="patient-overview" class="fa fa-tv grid-action" style="padding: 3px;" title= "overview"></i>
              
              <a danphe-grid-action="add-report" class="grid-action">
                  Add Report
              </a>
              <a danphe-grid-action="show-report" class="grid-action">
                Show Report
             </a>`
    }
  ]
  //end:nursing

  //  START: SCHEDULING

  static ShiftsMasterList = [
    { headerName: "Shifts Name", field: "ShiftName", width: 100 },
    { headerName: "Start Time", field: "StartTime", width: 100 },
    { headerName: "End Time", field: "EndTime", width: 100 },
    //Is Default will be true temporary.
    //{ headerName: "Is Default", field: "IsDefault", width: 100 },
    { headerName: "Total Hrs", field: "TotalHrs", width: 100 },
    {
      headerName: "Actions",
      field: "",
      width: 200,
      template:
        `<a danphe-grid-action="edit" class="grid-action">Edit</a>`
    }
  ]

  static WorkingHoursList = [
    { headerName: "Employee Id", field: "EmployeeId", width: 100 },
    { headerName: "Employee Name", field: "EmployeeName", width: 100 },
    { headerName: "Department Name", field: "DepartmentName", width: 100 },
    { headerName: "Role", field: "EmployeeRoleName", width: 100 },
    { headerName: "No Of Shifts", field: "NoOfShifts", width: 100 },
    { headerName: "Total Working Hrs", field: "TotalWorkingHrs", width: 100 },
    {
      headerName: "Actions",
      field: "",
      width: 200,
      template:
        `<a danphe-grid-action="edit" class="grid-action">Edit Working Hours</a>`
    }
  ]
  //  END: SCHEDULING

  //START: Inpatient Billing
  static IpBillPatientSearch = [
    { headerName: "Hosptial No.", field: "PatientNo", width: 120 },
    { headerName: "Patient Name", field: "PatientName", width: 200 },
    { headerName: "IP Number", field: "IpNumber", width: 120 },
    { headerName: "Age/Sex", field: "", width: 120, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
    { headerName: "Contact", field: "PhoneNumber", width: 120 },
    { headerName: "Admitted On", field: "AdmittedDate", width: 150, cellRenderer: GridColumnSettings.AdmissionDateRenderer },
    { headerName: "Deposit Amount", field: "DepositAmount", width: 120, cellRenderer: GridColumnSettings.IpDepositRenderer },
    { headerName: "Ward/Bed", field: "", width: 120, cellRenderer: GridColumnSettings.ADTBedRenderer },
    {
      headerName: "Actions",
      field: "",
      width: 280,
      template:
        `<a danphe-grid-action="view-summary" class="grid-action">
                       View Details
                 </a>`
    }
  ]

  static IpDepositRenderer(params) {
    return params.data.DepositAdded - params.data.DepositReturned;
  }
  static ADTBedRenderer(params) {
    return params.data.BedInformation.Ward + "/" + params.data.BedInformation.BedNumber;
  }
  //END: Inpaient Billing





  //column setting for Database backup log
  static DataBaseBakupLog = [
    { headerName: "Date", field: "CreatedOn", cellRenderer: GridColumnSettings.DBBakupDateRender, width: 200 },
    { headerName: "File Name", field: "FileName", width: 200 },

    { headerName: "Database Name", field: "DatabaseName", Width: 120 },
    { headerName: "Database Version", field: "DatabaseVersion", Width: 50 },
    { headerName: "Action", field: "Action", Width: 20 },
    { headerName: "Status", field: "Status", Width: 20 },
    {
      headerName: "Action Detail", field: "MessageDetail", width: 400
    },


  ]
  ////BillingInvoiceDetails
  ////Column setting for SystemAdmin module Billing Invoice details
  //static BillingInvoiceDetails = [
  //    { headerName: "Fiscal_Year", field: "Fiscal_Year", width: 150 },
  //    { headerName: "Bill_No", field: "Bill_No", width: 150 },

  //    { headerName: "Customer Name", field: "Customer_name", Width: 120 },
  //    { headerName: "Customer_PAN", field: "PANNumber", Width: 100 },
  //    { headerName: "BillDate", field: "BillDate", Width: 80 },
  //    { headerName: "Amount", field: "Amount", Width: 50 },
  //    { headerName: "DiscountAmount", field: "DiscountAmount", Width: 50 },
  //    { headerName: "Taxable_Amount", field: "Taxable_Amount", Width: 50 },
  //    { headerName: "Tax_Amount", field: "Tax_Amount", Width: 50 },
  //    { headerName: "Is_Printed", field: "Is_Printed", Width: 50 },
  //    { headerName: "Printed_Time", field: "Printed_Time", Width: 50 },
  //    { headerName: "Entered_by", field: "Entered_by", Width: 100 },
  //    { headerName: "Printed_by", field: "Printed_by", Width: 100 },
  //    { headerName: "Print_Count", field: "Print_Count", Width: 100 },
  //    { headerName: "Is_Active", field: "Is_Active", Width: 100 }
  //]

  //BillingInvoiceDetails
  //Column setting for SystemAdmin module Billing Invoice details--for
  static BillingInvoiceDetails = [
    { headerName: "Fiscal_Year", field: "Fiscal_Year", width: 150 },
    { headerName: "Bill_No", field: "Bill_No", width: 150 },
    { headerName: "Customer Name", field: "Customer_name", Width: 120 },
    { headerName: "Customer_PAN", field: "PANNumber", Width: 100 },
    { headerName: "BillDate", field: "BillDate", Width: 80 },
    { headerName: "BillDate(BS)", field: "BillDate_BS", Width: 80 },
    { headerName: "Amount", field: "Amount", Width: 50 },
    { headerName: "DiscountAmount", field: "DiscountAmount", Width: 50 },
    { headerName: "Taxable_Amount", field: "Taxable_Amount", Width: 50 },
    { headerName: "Tax_Amount", field: "Tax_Amount", Width: 50 },
    { headerName: "Total_Amount", field: "Total_Amount", Width: 50 },
    { headerName: "Synced With IRD", field: "SyncedWithIRD", Width: 50 },
    { headerName: "Is_Printed", field: "Is_Printed", Width: 50 },
    { headerName: "Printed_Time", field: "Printed_Time", Width: 50 },
    { headerName: "Entered_by", field: "Entered_by", Width: 100 },
    { headerName: "Printed_by", field: "Printed_by", Width: 100 },
    { headerName: "Print_Count", field: "Print_Count", Width: 100 },
    { headerName: "Is_RealTime", field: "Is_Realtime", Width: 100 },
    { headerName: "Is_bill_Active", field: "Is_Bill_Active", Width: 100 }
  ]
  //This for createdOn date format rendering
  static DBBakupDateRender(params) {
    let createdDate: string = params.data.CreatedOn;
    if (createdDate)
      return moment(createdDate).format('DD-MMM-YYYY hh:mm A');
    else
      return null;
  }

  //Colum setting for SQL Audit log details 
  static SqlAuditLog = [
    { headerName: "Event Time", field: "Event_Time", cellRenderer: GridColumnSettings.DBSqlAuditEventTimeRender, width: 180 },
    { headerName: "Server Name", field: "Server_Instance_Name", width: 120 },
    { headerName: "Action", field: "Action_Id", width: 100 },
    { headerName: "Statement", field: "Statement", width: 220 },
    { headerName: "Schema Name", field: "Schema_Name", width: 120 },
    { headerName: "Database Name", field: "Database_Name", width: 120 },
    { headerName: "Server Principal Name", field: "Server_Principal_Name", width: 150 },
    { headerName: "Object Name", field: "Object_Name", width: 150 },
    { headerName: "Session Id", field: "Session_Id", width: 150 },
    //event_time,server_instance_name,action_id,statement,schema_name,server_principal_name,database_name,object_name,session_id
  ]

  //start: doctor's module//
  static DoctorAppointmentList = [
    { headerName: "Name", field: "Patient.ShortName", width: 200 },
    { headerName: "Hospital No.", width: 150, field: "Patient.PatientCode" },
    { headerName: "VisitType", field: "VisitType", width: 150 },
    { headerName: "Visit On", width: 120, field: "", cellRenderer: GridColumnSettings.DoctorAppointmentDateRenderer },
    { headerName: "Age/Sex", field: "", width: 100, cellRenderer: GridColumnSettings.AgeSexRenderer },
    { headerName: "Provider Name", field: "ProviderName", width: 100 },
    {
      headerName: "Actions",
      field: "",
      width: 200,
      template:
        `<a danphe-grid-action="preview" class="d-icon icon-user" title="Preview" style="display: inherit; float:left;"></a>
             <a danphe-grid-action="notes" class="d-icon icon-note hidden" title="Notes""></a>
             <a danphe-grid-action="medication" class="d-icon icon-medication hidden" title="Medication""></a>
             <a danphe-grid-action="labs" class="d-icon icon-lab" title="Labs""></a>
             <a danphe-grid-action="imaging" class="d-icon icon-imaging" title="Imaging""></a>`
    }
  ]

  //Colum setting for Audit Trail details 
  static AuditTrailDetails = [
    { headerName: "AuditId", field: "AuditId", width: 50 },
    { headerName: "InsertedDate", field: "InsertedDate", width: 100 },
    { headerName: "DbContext", field: "DbContext", width: 150 },
    { headerName: "MachineUserName", field: "MachineUserName", width: 100 },
    { headerName: "MachineName", field: "MachineName", width: 150 },
    { headerName: "DomainName", field: "DomainName", width: 150 },
    { headerName: "CallingMethodName", field: "CallingMethodName", width: 250 },
    { headerName: "ChangedByUserId", field: "ChangedByUserId", width: 50 },
    { headerName: "ChangedByUserName", field: "ChangedByUserName", width: 100 },
    { headerName: "Table_Database", field: "Table_Database", width: 150 },
    { headerName: "ActionName", field: "ActionName", width: 100 },
    { headerName: "Table_Name", field: "Table_Name", width: 150 },
    { headerName: "PrimaryKey", field: "PrimaryKey", width: 200 },
    { headerName: "ColumnsValue", field: "ColumnValues", width: 350 },
  ]

  static CustomAuditTrailDetails = [
    { headerName: "Employee Id", field: "EmployeeId", width: 50 },
    { headerName: "UserName", field: "UserName", width: 200 },
    { headerName: "Action Name", field: "ActionName", width: 140 },
    { headerName: "Created On", field: "CreatedOn", width: 180 },
  ]

  static DoctorDepartmentAppointmentList = [
    { headerName: "Date", width: 100, field: "", cellRenderer: GridColumnSettings.DoctorAppointmentDateRenderer },
    { headerName: "Time", width: 100, field: "VisitTime" },
    { headerName: "Hospital No.", width: 100, field: "Patient.PatientCode" },
    { headerName: "Name", field: "Patient.ShortName", width: 180 },
    { headerName: "VisitType", field: "VisitType", width: 120 },
    { headerName: "Age/Sex", field: "", width: 100, cellRenderer: GridColumnSettings.AgeSexRenderer },
    { headerName: "Current Doctor", field: "ProviderName", width: 180 },
    {
      headerName: "Actions",
      field: "",
      width: 150,
      template:
        `<a danphe-grid-action="AssignToMe" class="grid-action">Assign to me</a>`
    }
  ]

  static DoctorAppointmentDateRenderer(params) {
    var tempdate = GridColumnSettings.DateRenderer(params.data.VisitDate, 'YYYY-MM-DD');
    return tempdate + " " + params.data.VisitTime;
  }

  //end: doctor's module

  //start: billing duplicate prints
  static DuplicateInvoiceList = [
    { headerName: "Date", field: "PaidDate", cellRenderer: GridColumnSettings.BilCreditDateTimeRendererForPaidaDate },
    { headerName: "Hospital No.", field: "PatientCode" },
    { headerName: "Patient Name", field: "ShortName" },
    { headerName: "Age/Sex", field: "", width: 120, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
    //{ headerName: "Phone", field: "PhoneNumber", width: 110 },
    { headerName: "Total", field: "TotalAmount" },
    { headerName: "FiscalYear", field: "FiscalYear" },
    //{ headerName: "Invoice No.", field: "InvoiceNumber" },
    { headerName: "Invoice No.", field: "InvoiceNumFormatted" },
    //{ headerName: "Invoice No.", field: "", width: 110, cellRenderer: GridColumnSettings.DupInv_InvCodeRenderer }, doesn't work: won't be able to search with invoice number.
    {
      headerName: "Action",
      field: "",
      template:
        `<a danphe-grid-action="showDetails" class="grid-action">
                Show Details
             </a>`
    }
  ]

  static BilProvisionalDate(params) {
    return moment(params.data.CreatedOn).format("YYYY-MM-DD HH:mm");
  }

  static ProvFiscalYearFormat(params) {
    let FiscalYear = params.data.FiscalYear;
    let ProvReceiptNo = params.data.ProvisionalReceiptNo;
    return FiscalYear + "/" + "PR" + "/" + ProvReceiptNo;
  }

  //start: billing provisional duplicate prints
  static DuplicateProvisionalReceiptList = [
    { headerName: "Date", field: "CreatedOn", cellRenderer: GridColumnSettings.BilProvisionalDate },
    { headerName: "Hospital No.", field: "PatientCode" },
    { headerName: "Patient Name", field: "ShortName" },
    //{ headerName: "Age/Sex", field: "", width: 120, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
    //{ headerName: "Phone", field: "PhoneNumber", width: 110 },
    { headerName: "Total Amount", field: "Total" },
    { headerName: "Current Status", field: "CurrentBillStatus" },
    { headerName: "FiscalYear", field: "FiscalYear" },
    { headerName: "Receipt No.", field: "ProvReceiptNumFormatted" },
    //{ headerName: "Receipt No.", field: "", cellRenderer: GridColumnSettings.ProvFiscalYearFormat },
    //{ headerName: "Is Insurance", field: "IsInsurance" },
    {
      headerName: "Action",
      field: "",
      template:
        `<a danphe-grid-action="showDetails" class="grid-action">
                Show Details
             </a>`
    }
  ]
  static DupInv_InvCodeRenderer(params) {
    return params.data.InvoiceCode + params.data.InvoiceNumber;
  }

  //static DepositDateTimeRenderer(params) {
  //  return moment(params.data.CreatedOn).format("YYYY-MM-DD HH:mm");
  //}


  static DuplicateDepositReceiptList = [

    { headerName: "Hospital No.", field: "PatientCode" },
    { headerName: "Patient Name", field: "PatientName" },
    { headerName: "Age/Sex", field: "", width: 120, cellRenderer: GridColumnSettings.AgeSexRendererPatient },
    { headerName: "DepositDate", field: "CreatedOn", cellRenderer: GridColumnSettings.DepositDateTimeRenderer },
    { headerName: "Phone", field: "PhoneNumber", width: 110 },
    { headerName: "Amount", field: "Amount", cellRenderer: GridColumnSettings.AmtRenderer_DepositDupPrint },
    { headerName: "FiscalYear", field: "FiscalYear" },
    { headerName: "Receipt No.", field: "ReceiptNo" },
    {
      headerName: "Action",
      field: "",
      template:
        `<a danphe-grid-action="showDetails" class="grid-action">
                Show Details
             </a>`
    }
  ]

  static ReqQuotationList = [

    { headerName: "Subject", field: "Subject", width: 120 },
    { headerName: "Description", field: "Description", width: 200 },
    { headerName: "Requested Date", field: "RequestedOn", width: 100, cellRenderer: GridColumnSettings.DepositDateTimeRenderer },
    { headerName: "Status", field: "Status", width: 100 },
    { headerName: "Action", field: "", width: 180, cellRenderer: GridColumnSettings.ShowActionForRFQList },

  ]

  static ShowActionForRFQList(params) {
    if (params.data.Status == "active" || params.data.Status == "partial") {

      let template = `<a danphe-grid-action="View" class="grid-action">RFQ Details</a>
             <a danphe-grid-action="AttachQuotationDocuments" class="grid-action">Attach Quo Files</a>
            
                  <div class="dropdown" style="display:inline-block;">
                 <button class="dropdown-toggle grid-btnCstm" type="button" data-toggle="dropdown">...
                 <span class="caret"></span></button>
                 <ul class="dropdown-menu grid-ddlCstm">
                     <li><a danphe-grid-action="AddQuotationDetails" class="grid-action">Add Supp Quotation</a></li>
                    <li><a danphe-grid-action="AnalyseQuotation" class="grid-action">Analyse Quotation</a></li>
                  
                 </ul>
               </div>`
      return template

    }
    else {
      let template =
        `<a danphe-grid-action="View" class="grid-action">RFQ Details</a>
          <a danphe-grid-action="QuotationList" class="grid-action">Quotation List</a>
 <a danphe-grid-action="SelectedQuotation" class="grid-action"> Selected Quotation </a>`
      return template;
    }
  }

  static QuotationList = [
    { headerName: "RFQ Subject", field: "Subject" },
    { headerName: "Vendor Name", field: "VendorName" },
    { headerName: "Created Date", field: "CreatedOn", cellRenderer: GridColumnSettings.DepositDateTimeRenderer },
    { headerName: "Status", field: "Status" },
    {
      headerName: "Action",
      field: "",
      template:
        `<a danphe-grid-action="view" class="grid-action">
               View
             </a>`
    }
  ]

  static DepositDateTimeRenderer(params) {
    return moment(params.data.CreatedOn).format("YYYY-MM-DD HH:mm");
  }

  static AmtRenderer_DepositDupPrint(params) {
    return CommonFunctions.parseAmount(params.data.Amount);
  }


  static SettlementDuplicateColumns = [

    { headerName: "Hospital No.", field: "Patient.PatientCode" },
    { headerName: "Patient Name", field: "Patient.ShortName" },
    { headerName: "Age/Sex", field: "", width: 120, cellRenderer: GridColumnSettings.AgeSexRenderer_Settlmnt },
    { headerName: "Phone", field: "Patient.PhoneNumber", width: 110 },
    { headerName: "SettlementDate", field: "CreatedOn", cellRenderer: GridColumnSettings.DateRenderer_Settlmnt },

    { headerName: "Receipt No", field: "SettlementReceiptNo" },
    {
      headerName: "Action",
      field: "",
      template:
        `<a danphe-grid-action="showDetails" class="grid-action">
                Show Details
             </a>`
    }
  ]
  static DaywiseVoucherTransactionList = [
    { headerName: "Voucher No.", field: "VoucherNumber", width: 120, cellRenderer: GridColumnSettings.LeadingZeroVoucherNumber },
    { headerName: "Fiscal Year", field: "FiscalYear", width: 80 },
    { headerName: "TransactionDate", field: "TransactionDate", width: 80, cellRenderer: GridColumnSettings.AccTxnDateRenderder },
    { headerName: "Voucher Type", field: "VoucherType", width: 120 },
    { headerName: "TotalAmount", field: "Amount", width: 100, cellRenderer: GridColumnSettings.AccAmountRenderder },
    {
      headerName: "Action",
      field: "",

      width: 120,
      template:
        `<a danphe-grid-action="view-detail" class="grid-action">
                View Detail
             </a>`
    }
  ]
  static DateRenderer_Settlmnt(params) {
    return moment(params.data.SettlementDate).format("YYYY-MM-DD HH:mm");
  }

  //added: sud--18may'18'
  static AgeSexRenderer_Settlmnt(params) {
    let dob = params.data.Patient.DateOfBirth;
    let gender: string = params.data.Patient.Gender;
    return CommonFunctions.GetFormattedAgeSex(dob, gender);
  }



  //end : billing duplicate prints


  //This for Event_Time format rendering
  static DBSqlAuditEventTimeRender(params) {
    let eventTime: string = params.data.Event_Time;
    if (eventTime)
      return moment(eventTime).format('DD-MMM-YYYY hh:mm A');
    else
      return null;
  }
  static NameRenderer(params) {

    let mName = params.data.MiddleName != null ? params.data.MiddleName : "";

    var fullName = params.data.LastName + ", " + params.data.FirstName + " " + mName;
    return fullName;
  }

  static GenderRenderer(params) {

    let gender: string = params.data.Gender;
    return gender;
    //return gender.charAt(0).toUpperCase();
  }
  static EmpNameRenderer(params) {
    let sal: string = params.data.Salutation;
    let first: string = params.data.FirstName;
    let middle: string = params.data.MiddleName;
    let last: string = params.data.LastName;
    if (!middle)
      middle = "";
    if (sal)
      sal = sal + '.'
    else
      sal = "";
    return sal + first + ' ' + middle + " " + last;
  }



  static VisitTimeOnlyRenderer(params) {
    let time: string = params.data.VisitTime;
    return moment(time, "hhmm").format('hh:mm A');
  }
  static VisitDateOnlyRenderer(params) {
    let date: string = params.data.VisitDate;
    return moment(date).format('YYYY-MM-DD');
  }
  //displays date and time in hour:minute
  static DateTimeRenderer(params) {
    return moment(params.data.CreatedOn).format("YYYY-MM-DD HH:mm");
  }
  //displays date and time in hour:minute
  static RequisitionDateTimeRenderer(params) {
    return moment(params.data.LastestRequisitionDate).format("YYYY-MM-DD HH:mm");
  }

  //displays date and time in hour:minute
  static BilPendingOrderDateTimeRenderer(params) {
    return moment(params.data.RequestDate).format("YYYY-MM-DD HH:mm");
  }

  //displays date and time in hour:minute
  static BilCreditDateTimeRenderer(params) {
    return moment(params.data.LastTxnDate).format("YYYY-MM-DD HH:mm");
  }

  //displays date and time in hour:minute
  static BilProvisionalDateTimeRenderer(params) {
    return moment(params.data.LastCreditBillDate).format("YYYY-MM-DD HH:mm");
  }

  //displays date and time in hour:minute
  static BilCreditDateTimeRendererForPaidaDate(params) {
    //changed from data.PaidDate to data.TransactionDate: sud--1-OCT-18
    //since paid date will be null in case of CreditInvoices.
    return moment(params.data.TransactionDate).format("YYYY-MM-DD HH:mm");
  }
  //to format C# TimeSpan to 12 Hours format.
  //here input (AppointmentTime) would be
  static ApptTimeRenderer(params) {
    //splitting into array of hh, mm & ss
    let HHmmss = params.data.AppointmentTime.split(':');
    let appTimeHHmm = "";
    if (HHmmss.length > 1) {
      //add hours and then minute to 00:00 and then format to 12hrs hh:mm AM/PM format. 
      //using 00:00:00 time so that time part won't have any impact after adding.
      appTimeHHmm = moment("2017-01-01 00:00:00").add(HHmmss[0], 'hours').add(HHmmss[1], 'minutes').format('hh:mm A');
    }

    return appTimeHHmm;
  }
  static AdmissionDateRenderer(params) {
    let date: string = params.data.AdmittedDate;
    return moment(date).format('YYYY-MM-DD HH:mm');
  }
  static WardBedRenderer(params) {
    let wardBedInfo: string = params.data.BedInformation.Ward + '-' + params.data.BedInformation.BedNumber;
    return wardBedInfo;
  }

  ////moved to adt-grid-column-settings inside adt module.:sud- 10Jan'19
  //static DischargeDateRenderer(params) {
  //    let date: string = params.data.DischargedDate;
  //    return moment(date).format('YYYY-MM-DD HH:mm');
  //}

  static ApptDateOnlyRenderer(params) {
    let date: string = params.data.AppointmentDate;
    return moment(date).format('YYYY-MM-DD');
  }

  static GetApptActions(params) {

    if (params.data.AppointmentStatus == "checkedin" || params.data.AppointmentStatus == "cancelled") {
      return `<button class="grid-action" disabled style="background: #90a8b9;border-color:#90a8b9;">
            CheckIn </button>
            <button class="grid-action" disabled style="background: #90a8b9;border-color:#90a8b9;">
                Cancel
                </button>`
    } else {
      return `<a danphe-grid-action="checkin" class="grid-action">
            CheckIn </a>
            <a danphe-grid-action="cancel" class="grid-action">
                Cancel
                </a>`
    }
  }


  static GetApptStatus(params) {
    if (params.data.AppointmentStatus == "checkedin") {
      return `
                <p class="text-center" style="color:green;margin:0;font-weight:700;line-height: 20px;">CheckedIn</p>    
                `
    } else if (params.data.AppointmentStatus == "cancelled") {
      return `<p class="text-center" style="margin:0;color:red;font-weight:700;line-height: 20px;">Cancelled</p>`
    } else {
      return `<p class="text-center" style="margin:0;color:blue;font-weight:700;line-height: 20px;">Initiated</p>`
    }
  }

  //makes use of commonfunction to get the formatted value.
  //output format will be: 21 D/F, 3 Y/M, 19 M/M, 24 Y/F, etc..
  static VisitListAgeSexRenderer(params) {
    let dob = params.data.DateOfBirth;
    let gender: string = params.data.Gender;
    return CommonFunctions.GetFormattedAgeSex(dob, gender);
  }

  static AgeSexRenderer(params) {
    let dob = params.data.Patient.DateOfBirth;
    let gender: string = params.data.Patient.Gender;
    return CommonFunctions.GetFormattedAgeSex(dob, gender);

  }
  static AgeSexCombineRenderer(params) {
    let Age = params.data.Patient.Age;
    let gender: string = params.data.Patient.Gender;
    return Age + " / " + gender[0].toUpperCase();
  }
  static AgeSexRendererPatient(params) {
    let dob = params.data.DateOfBirth;
    let gender: string = params.data.Gender;
    return CommonFunctions.GetFormattedAgeSex(dob, gender);
  }
  static VerifyRenderer(params) {
    let verification = params.data.verificationEnabled;
    if (verification) {
      return `<a danphe-grid-action="ViewDetails" class="grid-action">
                 View Details
            </a>
                <a danphe-grid-action="labsticker" class="grid-action"><i class="glyphicon glyphicon-print"></i> Sticker</a>
                <a danphe-grid-action="verify" class="grid-action">Verify</a>
                `;
    } else {
      return `<a danphe-grid-action="ViewDetails" class="grid-action">
                 View Details
            </a>
                <a danphe-grid-action="labsticker" class="grid-action"><i class="glyphicon glyphicon-print"></i> Sticker</a>
                `;
    }
  }
  static PatientTypeRenderer(params) {
    let type = params.data.VisitType;

    if (type) {
      if (type.toLowerCase() == "outpatient") {
        return 'OP';
      } else if (type.toLowerCase() == "inpatient") {
        return 'IP';
      } else {
        return 'ER';
      }
    }
    else {
      return 'OP';//default is Outpatient
    }
  }

  static BtnByBillStatusRenderer(params) {
    let billingStatus = params.data.BillingStatus;

    if (billingStatus == "cancel") {
      return `<button class="grid-action" style="background-color: #ed6b75 !important;border: 2px solid #ed6b75; width:91px;text-align: center;">Cancelled</button>`;
    }
    else {
      return `<a danphe-grid-action="ViewDetails" class="grid-action">
                View Details
             </a>`;
    }
  }


  static AgeSexRenderer_BillOrders(params) {
    let dob = params.data.Patient.DateOfBirth;
    let gender: string = params.data.Patient.Gender;
    return CommonFunctions.GetFormattedAgeSex(dob, gender);
  }




  static FullNameRenderer(params) {
    return CommonFunctions.GetFullName(params.data.FirstName, params.data.MiddleName, params.data.LastName);
  }
  static HandoverFullNameRenderer(params) {
    return CommonFunctions.GetFullName(params.data.hFirstName, params.data.hMiddleName, params.data.hLastName);
  }
  static FullNameRendererPatient(params) {
    return CommonFunctions.GetFullName(params.data.Patient.FirstName, params.data.Patient.MiddleName, params.data.Patient.LastName);
  }
  //displays date and time in hour:minute
  static CreatedDateTimeRenderer(params) {
    return moment(params.data.CreatedOn).format("YYYY-MM-DD HH:mm");
  }

  //gets serial number of the rendered rows.
  //SerialNo =  RowIndex + 1
  static SerialNumberRenderer(params) {
    let serialNo = params.rowIndex + 1;
    return serialNo;
  }



  static ImagingReportViewActionRenderer(params): string {
    // let retValue = '<a danphe-grid-action="view-report"  class="icon-' + params.data.ImagingTypeName + '"';//sud:31May'19--use this line later if required.
    let retValue = '<a danphe-grid-action="view-report"  class="grid-action"';
    retValue += ' title= "ViewReport" style= "cursor:pointer">&nbsp;&nbsp;View</a>';
    return retValue;

  }
  static PurchaseOrderNosrenderer(params) {
    let POids = params.data.POIds;
    let string_POIds: string = POids[0];
    for (var i = 1; i < POids.length; i++) {
      string_POIds = string_POIds + "," + POids[i];
    }
    return string_POIds
  }
  static PurchaseOrderDateOnlyRenderer(params) {
    let date: string = params.data.PoDate;
    return moment(date).format('YYYY-MM-DD');

  }
  //Inventory GR date renderer
  static GRDateOnlyRenderer(params) {
    let date: string = params.data.GoodReceiptDate;
    return moment(date).format('YYYY-MM-DD');
  }

  static RequisitionDateOnlyRenderer(params) {
    let date: string = params.data.RequisitionDate;
    return moment(date).format('YYYY-MM-DD');
  }
  static GetIRDCustomer_PAN(params) {
    return "";
  }

  static GetIRDIsActive(params) {
    return "True";
  }

  static ShowActionForPOList(params) {
    if (params.data.POStatus == "active" || params.data.POStatus == "partial") {
      let template =
        `</a>
                <a danphe-grid-action="view" class="grid-action">
                View
             </a>

<a  danphe-grid-action="genReceipt" class="grid-action">
                Add Goods Receipt
             `
      return template
    }
    else {
      let template =
        `<a danphe-grid-action="view" class="grid-action">
                View
             </a>`
      return template;
    }

  }
  //template return for Department wise requisition list
  static ShowActionForRequisitionList(params) {
    if ((params.data.RequisitionStatus == "active" || params.data.RequisitionStatus == "partial") && params.data.canDispatchItem == true) {
      let template =
        `<a danphe-grid-action="view" class="grid-action">
                    View
                 </a>
                  <a danphe-grid-action="requisitionDispatch" class="grid-action">
                  Dispatch Requisition
                 </a> `
      return template
    }
    else {
      let template =
        `<a danphe-grid-action="view" class="grid-action">
                    View
                 </a>`
      return template;
    }
  }


  //moved to adt-grid-column-settings inside adt module.:sud- 10Jan'19
  ////adds action buttons dynamically based on some rules. 
  //static DischargeListActionRenderer(params) {
  //    let currDischarge = params.data;
  //    let templateHtml: string;
  //    //by default: ViewSummary action will be there
  //    if (currDischarge.IsSubmitted) {
  //        templateHtml = `<a danphe-grid-action="dischargeSummary" class="grid-action">
  //                        View Summary</a>`;
  //    }
  //    else {
  //        templateHtml = `<a danphe-grid-action="dischargeSummary" class="grid-action">
  //                        Add Summary</a>`;
  //    }
  //    //Show clearDue.
  //    if (currDischarge.BillStatusOnDischarge == "unpaid") {
  //        templateHtml += `<a danphe-grid-action="clear-due" class="grid-action">
  //                         Clear Due</a>`;
  //    }
  //    return templateHtml;
  //}


  //adds action buttons dynamically based on some rules. 
  static VisitActionsRenderer(params) {
    let currVisit = params.data;
    let todaysdate = moment().format('YYYY-MM-DD');
    let visitdate = moment(currVisit.VisitDate).format('YYYY-MM-DD');
    //by default: print sticker wil be there in the action.
    let templateHtml = "";

    if (currVisit.VisitType != "emergency") {
      //Show transfer/referr button only for today's visits and followup for past visits.

      //Ashim: 6thJune'18 
      //Req Changed: Only Today's visit can be transfered/referred to another doctor.
      //Transfer/Referr option is not available from previous doctor.
      if ((moment(todaysdate).diff(visitdate)) == 0 && !currVisit.IsVisitContinued) {

        //Transfer Option not required for Followup Visits.: Sud-26June'19:[EMR-450]
        if (currVisit.AppointmentType != "followup") {
          templateHtml += `<a danphe-grid-action="transfer" class="grid-action">
                               transfer </a>`;
        }

        templateHtml += `<a danphe-grid-action="referral" class="grid-action">
                               refer </a>`;

      }
      //show followup button only for past visits. 
      //else {
      if ((moment(todaysdate).diff(visitdate)) > 0) {
        //Ashim:31stOct2017- Commented the below condition as the requirement was changed.
        //New Req: Followup should be available to all the transfered/referred doctors.
        //if (!currVisit.IsVisitContinued)
        templateHtml += `<a danphe-grid-action="followup" class="grid-action">
                                followup </a>`;

      }
    }

    templateHtml += `<a danphe-grid-action="printsticker" class="grid-action" title="Print OPD-Sticker">
                               <i class="glyphicon glyphicon-print" ></i>&nbsp;sticker </a>`;

    //sud:1June'19-commented below for MNK. un-comment it if needed for some other hospital.
    //templateHtml += `<a danphe-grid-action="generic-sticker" title="Generic Sticker" class="grid-action">
    //                     <i class="glyphicon glyphicon-print"></i>&nbsp;Generic Sticker</a>`;

    return templateHtml;
  }

  //     templateHtml += ` <div class="dropdown" style="display:inline-block;">
  //     <button class="dropdown-toggle grid-btnCstm" style="background-color: #3598dc;" type="button" data-toggle="dropdown">...
  //     <span class="caret"></span></button>
  //     <ul class="dropdown-menu grid-ddlCstm">
  //           <li><a danphe-grid-action="generic-sticker" title="Generic Sticker">
  //            <i class="glyphicon glyphicon-print"></i>&nbsp;Patient Generic Sticker</a></li>
  //       </ul>
  //   </div>`;

  //need to display it such that office hours will apear as tool-tip.--pending--sud:16Aug
  static EmpOfficeHrsRenderer(params) {
    let officeHrs = params.data.OfficeHour;
    //by default: ViewSummary action will be there
    let templateHtml = `<div>` + officeHrs + `</div>`;
    return templateHtml
  }


  static TrueFalseViewer(params) {
    if (params.data.IsOccupied == true) {
      let template =
        `
                    <span style="background-color:#F44336">&nbsp;&nbsp;&nbsp; True &nbsp;&nbsp;&nbsp;</span>
                `
      return template
    }
    else {
      let template =
        `
                    <span style="background-color:#4CAF50">&nbsp;&nbsp;&nbsp; False&nbsp;&nbsp;&nbsp;</span>
                `
      return template;
    }
  }
  //ashim: 07Sep2018 : SampleCode Formatting Logic moved to server side
  //concatenate samplecode for pending lab results GRID eg: 171214-1
  //static ConcatenateSampleCode(params) {
  //    return CommonFunctions.ConcatenateSampleCode(params.data.SampleDate, params.data.SampleCode);
  //}


  //used in nursing Inpatient List
  static BedDetailRenderer(params) {
    return params.data.BedInformation.BedFeature + "/" + params.data.BedInformation.BedCode;
  }

  static DateRenderer(value, dateFormat) {
    let currDate = moment().format(dateFormat);
    let diff = moment(currDate).diff(moment(value).format(dateFormat), 'days').toString();

    if (parseInt(diff) == 0) {
      return "today";
    }
    else if (parseInt(diff) == 1) {
      return "yesterday";
    }
    else {
      return moment(value).format(dateFormat);
    }
  }

  //static ShowActionforADTPatientSearch(params) {
  //    if (params.data.IsAdmitted == true) {
  //        let template =
  //            `
  //            <label style="font-weight: bold;border: 2px solid red;background-color:red;color: white;padding:0px 4px;margin-left: 4px;">Admitted</label>

  //            `
  //        return template
  //    }
  //    else {
  //        let template =
  //            `<a danphe-grid-action="admit" class="grid-action">Admit</a>`
  //        return template;
  //    }
  //}

  static AccTxnDateRenderder(params) {
    if (params.data.TransactionDate)
      return moment(params.data.TransactionDate).format('YYYY-MM-DD');
    else
      return "";
  }
  static LeadingZeroVoucherNumber(params) {
    if (params.data.VoucherNumber)
      return ("00000" + params.data.VoucherNumber).slice(-6)
    else
      return "";
  }
  static AccDrCrAmountRenderer(params) {
    let str = "";
    if (params.data.DrCr)
      str = params.data.Amount + ' <b style="color:red">(Dr)</b>';
    else
      str = params.data.Amount + ' <b style="color:green">(Cr)</b>';
    return str;
  }

  static AccDailyTxnActionTemplate(params) {
    let template = "";
    if (params.data.showOptions) {
      if (params.data.SectionId != 4) {
        template = `<a danphe-grid-action="viewDetails" class="grid-action">View Details</a>`
      }
    }
    return template;
  }

  static AccDrAmountRenderder(params) {
    let amt = "";
    if (params.data.DrAmount > 0) {
      amt = CommonFunctions.parseAmount(params.data.DrAmount);
    }
    return amt;
  }
  static AccCrAmountRenderder(params) {
    let amt = "";
    if (params.data.CrAmount > 0) {
      amt = CommonFunctions.parseAmount(params.data.CrAmount);
    }
    return amt;
  }
  static AccAmountRenderder(params) {
    let amt = "";
    if (params.data.Amount > 0) {
      amt = CommonFunctions.parseAmount(params.data.Amount);
    }
    return amt;
  }

  static ThresholdMargin(params) {
    let thresholdmargin = params.data.MinQuantity;
    let availablequantity = params.data.AvailQuantity;
    if (availablequantity == 0) {
      return "<div style='width:50%;background-color:red;'>" + availablequantity + "</div>";
    }
    else if (availablequantity <= thresholdmargin) {
      return "<div style='width:50%;background-color:yellow;'>" + availablequantity + "</div>";
    }
    else {
      return "<div style='width:50%'>" + availablequantity + "</div>";
    }

  }
}


