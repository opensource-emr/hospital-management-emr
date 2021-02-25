import * as moment from 'moment/moment';
import { CoreService } from '../../core/shared/core.service';
import { CommonFunctions } from '../../shared/common.functions';
import { SecurityService } from '../../security/shared/security.service';
import { Permission } from '../../security/shared/permission.model';


/*
 * Separate grid-column settings for ADT module with option to use parameter value from Core-Services.
 Created:11Jan'18-Sud
 Remarks: Most of the Properties/Methods are moved from grid-column-settings.constant.ts file (app/shared/danphe-grid)
 */

export class ADTGridColumnSettings {
  public IsWristBand: boolean = false;
  public IsGenericStickerBand: boolean = false;
  static isReceiveEnabled: any;
  static securityServ: any;
  constructor(public coreService: CoreService, public securityService: SecurityService) {
    ADTGridColumnSettings.isReceiveEnabled = this.coreService.IsReserveFeatureEnabled();
    ADTGridColumnSettings.securityServ = this.securityService;
  }



  //Start: For Search Patient
  public AdmissionSearchPatient = [

    { headerName: "Hospital Number", field: "PatientCode", width: 90 },
    { headerName: "Name", field: "ShortName", width: 180 },
    { headerName: "Age/Sex", field: "", width: 110, cellRenderer: this.AgeSexRendererPatient },
    { headerName: "Phone", field: "PhoneNumber", width: 110 },
    { headerName: "Address", field: "Address", width: 110 },
    { headerName: "Actions", field: "", width: 140, cellRenderer: this.ShowActionforADTPatientSearch }

  ]


  ShowActionforADTPatientSearch(params) {
    if (params.data.IsAdmitted == true) {
      let template =
        `<label style="font-weight: bold;border: 2px solid red;background-color:red;color: white;padding:0px 4px;margin-left: 4px;">Admitted</label>`;
      return template;
    }
    else if (params.data.BedReserved == true) {
      let template =
        `<label style="font-weight: bold;background-color:#e4de1d;color: #151515;line-height: 18px;padding: 0 5px;">Reserved</label>
              <a danphe-grid-action="view-reserved-patient" class="grid-action">View</a>
              <a danphe-grid-action="admit" class="grid-action">Admit</a>`;
      return template;
    }
    //else {
    //    let template =
    //        `<a danphe-grid-action="admit" class="grid-action">Admit</a>`
    //    return template;
    //}
    else if (params.data.AdmitButton == "admit-button") {
      let template =
        `<a danphe-grid-action="admit" class="grid-action">Admit</a>`
      return template;
    }
    else {
      let template = ``
      return template;
    }
  }

  //END: For Search Patient



  //Start: For ADMITTED LIST

  public AdmittedList = [
    { headerName: "Admitted Date", field: "AdmittedDate", width: 150, cellRenderer: this.AdmissionDateRenderer },
    { headerName: "Hospital Number", field: "PatientCode", width: 150 },
    { headerName: "IP Number", field: "VisitCode", width: 120 },
    { headerName: "Name", field: "Name", width: 200 },
    { headerName: "Age/Sex", field: "", width: 110, cellRenderer: this.AgeSexRendererPatient },
    { headerName: "AdmittingDoctor", field: "AdmittingDoctorName", width: 200 },
    { headerName: "Ward", field: "BedInformation.Ward", width: 100 },
    { headerName: "BedCode", field: "BedInformation.BedCode", width: 120 },
    {
      headerName: "Actions", field: "", width: 400,
      cellRenderer: this.GetAdmittedListTemplateWithPermission
      //cellRenderer: this.GetBtnPermission//commented: sud:18Feb'20 -- changed to client side logic.
      //template: this.ShowActionsforAdmittedPatientList(this.ShowWristBand_Params(), this.ShowPatientGenericSticker_Params())
    },
  ];
  GetAdmittedListTemplateWithPermission(params) {
    let tmplate = "";

    if (ADTGridColumnSettings.isReceiveEnabled
      && !params.data.BedInformation.ReceivedBy
      && ((params.data.BedInformation.Action.toLowerCase() == "transfer" && params.data.BedInformation.BedOnHoldEnabled)
        || (params.data.BedInformation.Action.toLowerCase() == "admission"))) {
      tmplate = '<a danphe-grid-action="transfer-hold" class="blinking-btn-danger grid-action" title="Cannot do further action until Received by Nursing">Transfer</a>';
    } else {
      if (ADTGridColumnSettings.securityServ.HasPermission("transfer-button")) {
        tmplate = `<a danphe-grid-action="transfer" class="grid-action">Transfer</a>`
      }
    }

    if (ADTGridColumnSettings.securityServ.HasPermission("sticker-button")) {
      tmplate += `<a danphe-grid-action="show-sticker"  title="Print Sticker" class="grid-action">
                          <i class="glyphicon glyphicon-print"></i>&nbsp;sticker </a>`
    }

    if (ADTGridColumnSettings.securityServ.HasPermission("change-doctor-button")) {
      tmplate += ` <i danphe-grid-action="changedr" class="fa-user-md grid-action" style="padding: 3px;" title="Change Doctor"></i>`
    }

    if (ADTGridColumnSettings.securityServ.HasPermission("change-bed-feature-button")) {
      tmplate += `<i danphe-grid-action="upgrade" class="fa fa-exchange grid-action" style="padding: 3px;" title="Change Bed Feature"></i> `
    }

    if (ADTGridColumnSettings.securityServ.HasPermission("bill-history-button")) {
      tmplate += `<i danphe-grid-action="billdetail" class="fa fa-money grid-action" style="padding: 3px;" title="Bill History"></i> `
    }

    if (ADTGridColumnSettings.securityServ.HasPermission("cancel-admission-button")) {
      tmplate += `<i danphe-grid-action="cancel" class="fa fa-close grid-action" style="padding: 3px;" title="Cancel Admission"></i>  `
    }
    //if generic sticker to be shown then add below html, else it won't add.
    if (ADTGridColumnSettings.securityServ.HasPermission("generic-sticker-button")) {
      tmplate += `  <i danphe-grid-action="generic-sticker" class="glyphicon glyphicon-print grid-action" style="padding: 3px;" title="Print Generic Sticker"></i> `;
    }
    //read ShowWristBandFeature from parameter, if show then add below html, else don't add.
    if (ADTGridColumnSettings.securityServ.HasPermission("print-wristband-button")) {
      tmplate += `<i danphe-grid-action="ip-wrist-band" class="glyphicon glyphicon-print grid-action" style="padding: 3px;" title="Print WristBand"></i>`;
    }


    return tmplate;
  }


  //commented: sud: 18Feb'20-- implemented permission from client side, no need of any change in server side..
  //GetBtnPermission(params) {
  //  let tmplate;

  //  //params.data.BtnPermissionList.forEach(item => {
  //  if (params.data.TransferButton == "transfer-button") {
  //      tmplate = `<a danphe-grid-action="transfer" class="grid-action">Transfer</a>`
  //  }

  //  if (params.data.StickerButton == "sticker-button") {
  //      tmplate += `<a danphe-grid-action="show-sticker"  title="Print Sticker" class="grid-action">
  //                        <i class="glyphicon glyphicon-print"></i>&nbsp;sticker </a>`
  //  }
  //  if (params.data.ChangeDoctorButton == "change-doctor-button") {
  //      tmplate += ` <i danphe-grid-action="changedr" class="fa-user-md grid-action" style="padding: 3px;" title="Change Doctor"></i>`
  //  }
  //  if (params.data.ChangeBedButton == "change-bed-feature-button") {
  //      tmplate += `<i danphe-grid-action="upgrade" class="fa fa-exchange grid-action" style="padding: 3px;" title="Change Bed Feature"></i> `
  //  }
  //  if (params.data.BillHistoryButton == "bill-history-button") {
  //      tmplate += `<i danphe-grid-action="billdetail" class="fa fa-money grid-action" style="padding: 3px;" title="Bill History"></i> `
  //  }
  //  if (params.data.CancelAdmButton == "cancel-admission-button") {
  //      tmplate += `<i danphe-grid-action="cancel" class="fa fa-close grid-action" style="padding: 3px;" title="Cancel Admission"></i>  `
  //  }
  //  //if generic sticker to be shown then add below html, else it won't add.
  //  if (params.data.GenericStickerButton == "generic-sticker-button") {
  //      tmplate += `  <i danphe-grid-action="generic-sticker" class="glyphicon glyphicon-print grid-action" style="padding: 3px;" title="Print Generic Sticker"></i> `;
  //  }

  //  //read ShowWristBandFeature from parameter, if show then add below html, else don't add.
  //  if (params.data.PrintWristButton == "print-wristband-button") {
  //      tmplate += `<i danphe-grid-action="ip-wrist-band" class="glyphicon glyphicon-print grid-action" style="padding: 3px;" title="Print WristBand"></i>`;
  //  }
  //  return tmplate;
  //}


  //sud:8thJan'19--get value from Parameters on whether or not to show wristband in ADT.
  public ShowWristBand_Params(): boolean {
    let retValue = false;
    let adtCustomFeaturesParam = this.coreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "ADTCustomFeatures");
    if (adtCustomFeaturesParam) {
      let wristBandParamValue = JSON.parse(adtCustomFeaturesParam.ParameterValue).wristband;
      if (wristBandParamValue && wristBandParamValue == true) {
        retValue = true;
        this.IsWristBand = true;
      }
    }

    return retValue;
  }

  //sud:10thJan'19--get value from Parameters on whether or not to show Generic Sticker in ADT list.
  public ShowPatientGenericSticker_Params(): boolean {
    let retValue = false;
    let adtCustomFeaturesParam = this.coreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "ADTCustomFeatures");
    if (adtCustomFeaturesParam) {
      let genStickerParamValue = JSON.parse(adtCustomFeaturesParam.ParameterValue).patient_generic_sticker;
      if (genStickerParamValue && genStickerParamValue == true) {
        retValue = true;
        this.IsGenericStickerBand = true;
      }
    }
    return retValue;
  }



  ShowActionsforAdmittedPatientList(showWristBand, showGenSticker) {

    let tmplate = `<a danphe-grid-action="transfer" class="grid-action">Transfer</a> 
                         <a danphe-grid-action="show-sticker"  title="Print Sticker" class="grid-action">
                              <i class="glyphicon glyphicon-print"></i>&nbsp;sticker </a>   

                <i danphe-grid-action="changedr" class="fa-user-md grid-action" style="padding: 3px;" title="Change Doctor"></i>    
                <i danphe-grid-action="upgrade" class="fa fa-exchange grid-action" style="padding: 3px;" title="Change Bed Feature"></i>   
                <i danphe-grid-action="billdetail" class="fa fa-money grid-action" style="padding: 3px;" title="Bill History"></i>   
                <i danphe-grid-action="cancel" class="fa fa-close grid-action" style="padding: 3px;" title="Cancel Admission"></i>   
                    `;

    //if generic sticker to be shown then add below html, else it won't add.
    if (showGenSticker) {
      tmplate += `  <i danphe-grid-action="generic-sticker" class="glyphicon glyphicon-print grid-action" style="padding: 3px;" title="Print Generic Sticker"></i> `;
    }

    //read ShowWristBandFeature from parameter, if show then add below html, else don't add.
    if (showWristBand) {
      tmplate += `<i danphe-grid-action="ip-wrist-band" class="glyphicon glyphicon-print grid-action" style="padding: 3px;" title="Print WristBand"></i>`;
    }

    return tmplate;
  }
  //END: For ADMITTED LIST

  //Start: For Discharged List
  public DischargedList = [
    { headerName: "Admitted On", field: "AdmittedDate", width: 140, cellRenderer: this.AdmissionDateRenderer },
    { headerName: "Discharged On", field: "DischargedDate", width: 140, cellRenderer: this.DischargeDateRenderer },
    { headerName: "Hospital No", field: "PatientCode", width: 130 },
    { headerName: "IP Number", field: "VisitCode", width: 110 },
    { headerName: "Name", field: "Name", width: 180 },
    { headerName: "Age/Sex", field: "", width: 100, cellRenderer: this.AgeSexRendererPatient },
    { headerName: "Phone", field: "PhoneNumber", width: 110 },
    { headerName: "BillStatus", field: "BillStatusOnDischarge", width: 100 },
    {
      headerName: "Actions",
      field: "",
      width: 260,
      cellRenderer: this.DischargedListActionRenderer
    }
  ]



  //adds action buttons dynamically based on some rules. 
  DischargedListActionRenderer(params) {
    let currDischarge = params.data;
    let templateHtml: string;
    //by default: ViewSummary action will be there
    if (currDischarge.DischargeSummaryId > 0 && currDischarge.IsSubmitted == 1 && ADTGridColumnSettings.securityServ.HasPermission("adt-nursing-discharge-summary-add-view-btn-permission")) {
      templateHtml = `<a danphe-grid-action="dischargeSummary" class="grid-action">
                            View Summary</a>`;
    }
    else if (currDischarge.DischargeSummaryId > 0 && currDischarge.IsSubmitted == 0 && ADTGridColumnSettings.securityServ.HasPermission("adt-nursing-discharge-summary-edit-btn-permission")) {
      templateHtml = `<a danphe-grid-action="dischargeSummary" class="grid-action">
                            Edit Summary </a>`;
    }
    else if (currDischarge.DischargeSummaryId == 0 && ADTGridColumnSettings.securityServ.HasPermission("adt-nursing-discharge-summary-add-view-btn-permission")) {
      templateHtml = `<a danphe-grid-action="dischargeSummary" class="grid-action">
                            Add Summary </a>`;
    } else {
      templateHtml = "";
    }

    //Show clearDue.
    if (currDischarge.BillStatusOnDischarge == "unpaid" && ADTGridColumnSettings.securityServ.HasPermission("adt-discharge-summary-clear-due-btn-permission")) {
      templateHtml += `<a danphe-grid-action="clear-due" class="grid-action">
                             Clear Due</a>`;
    }
    var checkHrs = CommonFunctions.findDateTimeDifference(new Date(), new Date(currDischarge.DischargedDate));
    if ((((checkHrs / 1000) / 60)) / 60 < 120 && ADTGridColumnSettings.securityServ.HasPermission("adt-discharge-summary-cancel-btn-permission")) {
      templateHtml += `<a danphe-grid-action="discharge-cancel" class="grid-action">
            Cancel Discharge</a>`;
    }
    return templateHtml;
  }
  //End: For Discharged List

  //nursing discharged list grid colums
  public NursingDischargedList = [
    { headerName: "Admitted On", field: "AdmittedDate", width: 140, cellRenderer: this.AdmissionDateRenderer },
    { headerName: "Discharged On", field: "DischargedDate", width: 140, cellRenderer: this.DischargeDateRenderer },
    { headerName: "Hospital No", field: "PatientCode", width: 130 },
    { headerName: "IP Number", field: "VisitCode", width: 110 },
    { headerName: "Name", field: "Name", width: 180 },
    { headerName: "Age/Sex", field: "", width: 100, cellRenderer: this.AgeSexRendererPatient },
    { headerName: "Phone", field: "PhoneNumber", width: 110 },
    { headerName: "BillStatus", field: "BillStatusOnDischarge", width: 100 },
    {
      headerName: "Actions",
      field: "",
      width: 260,
      cellRenderer: this.NursingDischargedListActionRenderer
    }
  ]

  // used in nursing discharged list
  NursingDischargedListActionRenderer(params) {
    let currDischarge = params.data;
    let templateHtml: string;
    //by default: ViewSummary action will be there
    if (currDischarge.IsSubmitted && ADTGridColumnSettings.securityServ.HasPermission("adt-nursing-discharge-summary-add-view-btn-permission")) {
      templateHtml = `<a danphe-grid-action="dischargeSummary" class="grid-action">
                            View Summary</a>`;
    }
    else if (currDischarge.DischargeSummaryId > 0 && currDischarge.IsSubmitted == 0 && ADTGridColumnSettings.securityServ.HasPermission("adt-nursing-discharge-summary-edit-btn-permission")) {
      templateHtml = `<a danphe-grid-action="dischargeSummary" class="grid-action">
                            Edit Summary </a>`;
    } else if (currDischarge.DischargeSummaryId == 0 && ADTGridColumnSettings.securityServ.HasPermission("adt-nursing-discharge-summary-add-view-btn-permission")) {
      templateHtml = `<a danphe-grid-action="dischargeSummary" class="grid-action">
                            Add Summary </a>`;
    } else {
      templateHtml = "";
    }

    return templateHtml;
  }

  public DischargeSummaryAdmittedList = [
    { headerName: "Admitted Date", field: "AdmittedDate", width: 140, cellRenderer: this.AdmissionDateRenderer },
    { headerName: "Hospital Number", field: "PatientCode", width: 140 },
    { headerName: "IP Number", field: "VisitCode", width: 120 },
    { headerName: "Name", field: "Name", width: 180 },
    { headerName: "Age/Sex", field: "", width: 110, cellRenderer: this.AgeSexRendererPatient },
    { headerName: "AdmittingDoctor", field: "AdmittingDoctorName", width: 200 },
    { headerName: "Bed Feature", field: "BedInformation.BedFeature", width: 120 },
    { headerName: "BedCode", field: "BedInformation.BedCode", width: 120 },
    {
      headerName: "Action",
      field: "",
      width: 210,
      cellRenderer: this.DSAdmittedListActionRenderer
    }
  ]

  DSAdmittedListActionRenderer(params) {
    let currDischarge = params.data;
    let templateHtml: string;

    if (currDischarge.DischargeSummaryId > 0 && currDischarge.IsSubmitted == 1 && ADTGridColumnSettings.securityServ.HasPermission("adt-nursing-discharge-summary-add-view-btn-permission")) {
      templateHtml = `<a danphe-grid-action="dischargeSummary" class="grid-action">
                            View Summary</a>`;
    }
    else if (currDischarge.DischargeSummaryId > 0 && currDischarge.IsSubmitted == 0 && ADTGridColumnSettings.securityServ.HasPermission("adt-nursing-discharge-summary-edit-btn-permission")) {
      templateHtml = `<a danphe-grid-action="dischargeSummary" class="grid-action">
                            Edit Summary </a>`;
    } else if (currDischarge.DischargeSummaryId == 0 && ADTGridColumnSettings.securityServ.HasPermission("adt-nursing-discharge-summary-add-view-btn-permission")) {
      templateHtml = `<a danphe-grid-action="dischargeSummary" class="grid-action">
        Add Summary </a>`;
    } else {
      templateHtml = "";
    }
    return templateHtml;
  }


  //Start: Common Functions used inside ADT-Grids
  AgeSexRendererPatient(params) {
    let dob = params.data.DateOfBirth;
    let gender: string = params.data.Gender;
    return CommonFunctions.GetFormattedAgeSex(dob, gender);
  }

  AdmissionDateRenderer(params) {
    let date: string = params.data.AdmittedDate;
    return moment(date).format('YYYY-MM-DD HH:mm');
  }

  DischargeDateRenderer(params) {
    let date: string = params.data.DischargedDate;
    return moment(date).format('YYYY-MM-DD HH:mm');
  }
  //End: Common Functions used inside ADT-Grids
}
