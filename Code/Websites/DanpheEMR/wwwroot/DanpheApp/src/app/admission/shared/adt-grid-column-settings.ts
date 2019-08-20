import * as moment from 'moment/moment';
import { CoreService } from '../../core/shared/core.service';
import { CommonFunctions } from '../../shared/common.functions';


/*
 * Separate grid-column settings for ADT module with option to use parameter value from Core-Services.
 Created:11Jan'18-Sud
 Remarks: Most of the Properties/Methods are moved from grid-column-settings.constant.ts file (app/shared/danphe-grid)
 */

export class ADTGridColumnSettings {
    constructor(public coreService: CoreService) {

    }



    //Start: For Search Patient
    public AdmissionSearchPatient = [

        { headerName: "Hospital Number", field: "PatientCode", width: 160 },
        { headerName: "Name", field: "ShortName", width: 200 },
        { headerName: "Age/Sex", field: "", width: 110, cellRenderer: this.AgeSexRendererPatient },
        { headerName: "Phone", field: "PhoneNumber", width: 110 },
        { headerName: "Address", field: "Address", width: 110 },
        { headerName: "Actions", field: "", width: 100, cellRenderer: this.ShowActionforADTPatientSearch }

    ]


    ShowActionforADTPatientSearch(params) {
        if (params.data.IsAdmitted == true) {
            let template =
                `
                <label style="font-weight: bold;border: 2px solid red;background-color:red;color: white;padding:0px 4px;margin-left: 4px;">Admitted</label>

                `
            return template
        }
        else {
            let template =
                `<a danphe-grid-action="admit" class="grid-action">Admit</a>`
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
        { headerName: "Bed Feature", field: "BedInformation.BedFeature", width: 100 },
        { headerName: "BedCode", field: "BedInformation.BedCode", width: 120 },
        {
            headerName: "Actions", field: "", width: 400,
            template: this.ShowActionsforAdmittedPatientList(this.ShowWristBand_Params(), this.ShowPatientGenericSticker_Params())
        },
    ]

    //sud:8thJan'19--get value from Parameters on whether or not to show wristband in ADT.
    public ShowWristBand_Params(): boolean {
        let retValue = false;
        let adtCustomFeaturesParam = this.coreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "ADTCustomFeatures");
        if (adtCustomFeaturesParam) {
            let wristBandParamValue = JSON.parse(adtCustomFeaturesParam.ParameterValue).wristband;
            if (wristBandParamValue && wristBandParamValue == true) {
                retValue = true;
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
            }
        }

        return retValue;
    }



    ShowActionsforAdmittedPatientList(showWristBand, showGenSticker) {

        let tmplate =   `<a danphe-grid-action="transfer" class="grid-action">Transfer</a> 
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
        { headerName: "Admitted On", field: "AdmittedDate", width: 120, cellRenderer: this.AdmissionDateRenderer },
        { headerName: "Discharged On", field: "DischargedDate", width: 120, cellRenderer: this.DischargeDateRenderer },
        { headerName: "Hospital No", field: "PatientCode", width: 120 },
        { headerName: "IP Number", field: "VisitCode", width: 100 },
        { headerName: "Name", field: "Name", width: 180 },
        { headerName: "Age/Sex", field: "", width: 100, cellRenderer: this.AgeSexRendererPatient },
        { headerName: "Phone", field: "PhoneNumber", width: 110 },
        { headerName: "BillStatus", field: "BillStatusOnDischarge", width: 100 },
        {
            headerName: "Actions",
            field: "",
            width: 210,
            cellRenderer: this.DischargeListActionRenderer
        }
    ]



    //adds action buttons dynamically based on some rules. 
    DischargeListActionRenderer(params) {
        let currDischarge = params.data;
        let templateHtml: string;
        //by default: ViewSummary action will be there
        if (currDischarge.IsSubmitted) {
            templateHtml = `<a danphe-grid-action="dischargeSummary" class="grid-action">
                            View Summary</a>`;
        }
        else {
            templateHtml = `<a danphe-grid-action="dischargeSummary" class="grid-action">
                            Add Summary</a>`;
        }
        //Show clearDue.
        if (currDischarge.BillStatusOnDischarge == "unpaid") {
            templateHtml += `<a danphe-grid-action="clear-due" class="grid-action">
                             Clear Due</a>`;
        }
        var checkHrs = CommonFunctions.findDateTimeDifference( new Date(), new Date(currDischarge.DischargedDate));
        if((((checkHrs/1000)/60))/60 < 24){
            templateHtml += `<a danphe-grid-action="discharge-cancel" class="grid-action">
            Cancel Discharge</a>`;
        }
        return templateHtml;
    }

    //End: For Discharged List


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
