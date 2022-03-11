import * as moment from 'moment/moment';
import { CoreService } from '../../core/shared/core.service';
import { CommonFunctions } from '../../shared/common.functions';


/*
 * Separate grid-column settings for Insurance Module with option to use parameter value from Core-Services.
 Remarks: Used only for Insurance now, later use for other pages as well.
 */

export class INSGridColumnSettings {
  constructor(public coreService: CoreService) {

  }

  //Start: For Search Patient
  public InsurancePatientList = [
    { headerName: "Hospital No.", field: "PatientCode", width: 100 },
    { headerName: "Patient Name", field: "ShortName", width: 150 },
    { headerName: "NSHI Code", field: "Ins_NshiNumber", width: 100 },
    { headerName: "Age/Sex", field: "", width: 70, cellRenderer: this.AgeSexRendererPatient },
    { headerName: "Phone", field: "PhoneNumber", width: 110 },
    { headerName: "Address", field: "Address", width: 120 },

    { headerName: "Balance Amt.", field: "Ins_InsuranceBalance", width: 120, cellRenderer: this.InsBalanceAmtRoundOff },
    { headerName: "Latest ClaimCode", field: "LatestClaimCode", width: 100 },
    {
      headerName: "Actions",
      field: "",
      width: 250,
      cellRenderer: this.BillingSearchActionsRenderer
    }

  ]

  AgeSexRendererPatient(params) {
    let dob = params.data.DateOfBirth;
    let gender: string = params.data.Gender;
    let ageSex = params.data.Age + "/" + gender.charAt(0).toUpperCase();
    return ageSex;
  }

  public InsBalanceAmtRoundOff(params) {
    let balanceAmt: string = params.data.Ins_InsuranceBalance;
    let retValue = CommonFunctions.parseAmount(balanceAmt);
    return retValue;
  }

  BillingSearchActionsRenderer(params) {
    let templateHtml = "";
    let patient = params.data;
    templateHtml += `
             <a danphe-grid-action="insurance-billing" class="grid-action">Insurance Billing</a>
             <a danphe-grid-action="new-visit" class="grid-action">New Visit</a> 
             <div class="dropdown" style="display:inline-block;">
                 <button class="dropdown-toggle grid-btnCstm" type="button" data-toggle="dropdown">...
                 <span class="caret"></span></button>
                 <ul class="dropdown-menu grid-ddlCstm">
                   <li><a danphe-grid-action="update-ins-balance">Update Balance</a></li>
                   <li><a danphe-grid-action="balance-history">Ins Balance History</a> </li>
                 </ul>
                </div>`;


    // let template = `<a danphe-grid-action="edit" class="grid-action">Edit</a>
    //          <a danphe-grid-action="showHistory" class="grid-action">History</a>
    //             <div class="dropdown" style="display:inline-block;">
    //              <button class="dropdown-toggle grid-btnCstm" type="button" data-toggle="dropdown">...
    //              <span class="caret"></span></button>
    //              <ul class="dropdown-menu grid-ddlCstm">
    //                <li><a danphe-grid-action="uploadfiles" >Upload Files</a></li>
    //                <li><a danphe-grid-action="showHealthCard" >Health Card</a></li>
    //                <li><a danphe-grid-action="showNeighbourCard" >Visitor Card</a></li>
    //              </ul>
    //             </div>`,

    return templateHtml;
  }

  //START: Insurance Module 
  public InsuranceVisitList = [
    {
      headerName: "Date",
      field: "",
      width: 100,
      cellRenderer: INSGridColumnSettings.VisitDateOnlyRenderer,
    },
    {
      headerName: "Time",
      field: "",
      width: 90,
      cellRenderer: INSGridColumnSettings.VisitTimeOnlyRenderer,
    },
    { headerName: "Hospital No.", field: "PatientCode", width: 140 },
    { headerName: "Name", field: "ShortName", width: 170 },
    {
      headerName: "Age/Sex",
      field: "",
      width: 90,
      cellRenderer: INSGridColumnSettings.VisitListAgeSexRenderer,
    },
    { headerName: "NSHI No", field: "Ins_NshiNumber", width: 190 },
    { headerName: "Department", field: "DepartmentName", width: 190 },
    { headerName: "Claim Code", field: "ClaimCode", width: 190 },
    { headerName: "VisitType", field: "VisitType", width: 120 },
    { headerName: "Appt. Type", field: "AppointmentType", width: 130 },
    {
      headerName: "Days-Passed",
      field: "",
      width: 90,
      cellRenderer: INSGridColumnSettings.VisitDaysPassedRenderer,
    },

    {
      headerName: "Actions",
      field: "",
      width: 320,
      cellRenderer: INSGridColumnSettings.InsVisitActionsRenderer,
    },
  ];
  static VisitDateOnlyRenderer(params) {
    let date: string = params.data.VisitDate;
    return moment(date).format("YYYY-MM-DD");
  }

  static VisitTimeOnlyRenderer(params) {
    let time: string = params.data.VisitTime;
    return moment(time, "hhmm").format("hh:mm A");
  }
  static VisitListAgeSexRenderer(params) {
    let dob = params.data.DateOfBirth;
    let gender: string = params.data.Gender;
    return CommonFunctions.GetFormattedAgeSex(dob, gender);
  }

  static VisitDaysPassedRenderer(params) {
    let date: string = params.data.VisitDate;
    let daysPassed = moment().diff(moment(date), "days");

    return daysPassed;
  }
  static InsVisitActionsRenderer(params) {
    let currVisit = params.data;
    let todaysdate = moment().format("YYYY-MM-DD");
    let visitdate = moment(currVisit.VisitDate).format("YYYY-MM-DD");
    //by default: print sticker wil be there in the action.
    let templateHtml = "";

    if (currVisit.VisitType != "emergency") {

      if (moment(todaysdate).diff(visitdate) > 0) {

        templateHtml += `<a danphe-grid-action="followup" class="grid-action">
                                followup </a>`;
      }
    }
    templateHtml += `<a danphe-grid-action="printsticker" class="grid-action" title="Print OPD-Sticker">
                               <i class="glyphicon glyphicon-print" ></i>&nbsp;sticker </a>`;

    return templateHtml;
  }
  //END: Insurance Module
  public IPBillItemGridCol = [

    { headerName: "Date", field: "CreatedOn", width: 100 },
    { headerName: "Department", field: "ServiceDepartmentName", width: 120 },
    { headerName: "ItemName", field: "ItemName", width: 160 },
    { headerName: "Qty.", field: "Quantity", width: 60, },
    // { headerName: "Sub Total", field: "SubTotal", width: 85 },
    // { headerName: "Disc%", field: "DiscountPercent", width: 70 },
    { headerName: "Total Amount", field: "TotalAmount", width: 85 },
    { headerName: "AssignedTo Dr.", field: "ProviderName", width: 100 },
    {
      headerName: "Action",
      field: "",
      width: 70,
      template:
        `<a danphe-grid-action="edit" class="grid-action fa fa-pencil" title="click to edit this item">
               Edit
             </a>
          `,
    },
    { headerName: "User", field: "CreatedBy", width: 70, cellRenderer: INSGridColumnSettings.IPBillItemRenderer_CreatedBy },
    { headerName: "Modified By", field: "", width: 110, cellRenderer: INSGridColumnSettings.IPBillItemRenderer_ModifiedBy }
  ]

  static IPBillItemRenderer_CreatedBy(params) {
    if (params.data) {
      let CreatedDocObj = params.data.CreatedByObj;
      if (CreatedDocObj) {
        return `<span  title='`
          + CreatedDocObj.FullName + ` 
Department:`+ CreatedDocObj.DepartmentName + `'>` + CreatedDocObj.FirstName + `</span>`;
      }
    }
  }

  static IPBillItemRenderer_ModifiedBy(params) {
    if (params.data) {
      let ModifiedDocObj = params.data.ModifiedByObj;
      if (ModifiedDocObj) {
        return `<span style="background-color:yellow;"  title='`
          + ModifiedDocObj.FullName + ` 
Department:`+ ModifiedDocObj.DepartmentName + `'>` + ModifiedDocObj.FirstName + `</span>`;
      }
    }
  }

}
