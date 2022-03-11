//This grid is to show list of Lab Report Templates
import * as moment from 'moment/moment';
import { CommonFunctions } from '../../shared/common.functions';
import { EmergencyPatientModel } from './emergency-patient.model';

export default class EmergencyGridColumnSettings {
  static ERPatientList = [
    { headerName: "Hospital No.", width: 140, field: "PatientCode" },
    { headerName: "Name", width: 140, field: "FullName" },
    { headerName: "Age", field: "Age", width: 80 },
    { headerName: "Gender", field: "Gender", width: 90 },
    { headerName: "Visit Date Time", width: 100, cellRenderer: EmergencyGridColumnSettings.VisitDate },
    {
      headerName: "Actions",
      field: "",
      width: 140,
      cellRenderer: EmergencyGridColumnSettings.SelectButtonsToBeDisplayed,
     
    }

  ]

  static TriagedERPatientList = [

    { headerName: "Triage Status", width: 40, cellRenderer: EmergencyGridColumnSettings.TriageRenderer },
    { headerName: "Hospital No.", width: 50, field: "PatientCode" },
    { headerName: "Name", width: 50, field: "FullName" },
    { headerName: "Age/Sex", width: 30, cellRenderer: EmergencyGridColumnSettings.AgeSexRenderer },
    { headerName: "Phone Number", width: 40, field: "ContactNo" },
    { headerName: "Visit Date Time", width: 60, cellRenderer: EmergencyGridColumnSettings.VisitDate },
    { headerName: "Visit Doctor", width: 60, field: "ProviderName" },
    //{ headerName: "Triaged By", width: 80, field: "TriagedByName" },
    //{ headerName: "Triaged On", width: 60, cellRenderer: EmergencyGridColumnSettings.TriagedDate },
    {
      headerName: "Actions",
      field: "",
      width: 230,
      template:
        `<a danphe-grid-action="edit" class="grid-action">Edit</a> 
                 <a danphe-grid-action="undo-triage" class="grid-action">Undo Triage</a> 
                 
                 <a danphe-grid-action="show-assign-doctor" class="grid-action">Assign Doctor</a>
                 <a danphe-grid-action="order" class="grid-action">Order</a>     
                 
                 <div class= "dropdown" style="display:inline-block;">
                    <button class="dropdown-toggle grid-btnCstm ER-grid-btnCstm" type="button" data-toggle="dropdown">Outcome...
                        <span class="caret"> </span>
                    </button>
                    <ul class="dropdown-menu grid-ddlCstm er-grid-ddlCstm">
                    <li><a danphe-grid-action="admitted" class="grid-action">Admit</a></li>
                    <li><a danphe-grid-action="transferred" class="grid-action">Transfer</a></li>
                    <li><a danphe-grid-action="discharged" class="grid-action">Discharge</a></li>
                    <li><a danphe-grid-action="lama" class="grid-action">LAMA</a></li>
                    <li><a danphe-grid-action="death" class="grid-action">Death</a></li>
                    <li><a danphe-grid-action="dor" class="grid-action">DOR</a></li>  
                    <li><a danphe-grid-action="dor" class="grid-action">Upload Consent</a></li>  
                    </ul> 
                </div> 
                `
    }
    //<a danphe-grid-action="view" class="grid-action"><i class="fa fa-eye"></i> View</a>
    // <a danphe-grid-action="edit" class="grid-action">Edit</a> 
    // <a danphe-grid-action="undo-triage" class="grid-action">Undo Triage</a> 
    //  <a danphe-grid-action="view" class="grid-action"><i class="fa fa-eye"></i> View</a>
    //     <a danphe-grid-action="show-assign-doctor" class="grid-action">Assign Doctor</a>
    //     <a danphe-grid-action="order" class="grid-action">Order</a>
    //     <div class= "dropdown" style="display:inline-block;">
    //         <button class="dropdown-toggle grid-btnCstm ER-grid-btnCstm" style = "background-color: #3598dc;" type="button" data-toggle="dropdown">Outcome...
    //             <span class="caret"> </span></button>
    //         <ul class="dropdown-menu grid-ddlCstm er-grid-ddlCstm">
    //             <li><a danphe-grid-action="admitted" class="er-grid-action">Admit</a></li>
    //             <li><a danphe-grid-action="transferred" class="er-grid-action">Transfer</a></li>
    //             <li><a danphe-grid-action="discharged" class="er-grid-action">Discharge</a></li>  
    //             <li><a danphe-grid-action="lama" class="er-grid-action">LAMA</a></li>
    //             <li><a danphe-grid-action="death" class="er-grid-action">Death</a></li>
    //         </ul>
    //     </div>
  ]

  static ERLamaPatientList = [
    { headerName: "Hospital Number", width: 70, field: "PatientCode" },
    { headerName: "Name", width: 110, field: "FullName" },
    { headerName: "Age", field: "Age", width: 50 },
    { headerName: "Gender", field: "Gender", width: 60 },
    { headerName: "Finalized DateTime", width: 80, cellRenderer: EmergencyGridColumnSettings.FinalizedDate },
    {
      headerName: "Actions",
      field: "",
      width: 160,
      cellRenderer: EmergencyGridColumnSettings.Action
    }

  ]

  static ERAdmittedPatientList = [
    { headerName: "Hospital Number", width: 70, field: "PatientCode" },
    { headerName: "Name", width: 110, field: "FullName" },
    { headerName: "Age", field: "Age", width: 50 },
    { headerName: "Gender", field: "Gender", width: 60 },
    { headerName: "Finalized DateTime", width: 80, cellRenderer: EmergencyGridColumnSettings.FinalizedDate },
    {
      headerName: "Actions",
      field: "",
      width: 160,
      cellRenderer: EmergencyGridColumnSettings.Action
    }

  ]

  static ERDeathPatientList = [
    { headerName: "Hospital Number", width: 70, field: "PatientCode" },
    { headerName: "Name", width: 110, field: "FullName" },
    { headerName: "Age", field: "Age", width: 50 },
    { headerName: "Gender", field: "Gender", width: 60 },
    { headerName: "Finalized DateTime", width: 80, cellRenderer: EmergencyGridColumnSettings.FinalizedDate },
    {
      headerName: "Actions",
      field: "",
      width: 160,
      cellRenderer: EmergencyGridColumnSettings.Action
    }

  ]

  static ERTransferredPatientList = [
    { headerName: "Hospital Number", width: 70, field: "PatientCode" },
    { headerName: "Name", width: 110, field: "FullName" },
    { headerName: "Age", field: "Age", width: 50 },
    { headerName: "Gender", field: "Gender", width: 60 },
    { headerName: "Finalized DateTime", width: 80, cellRenderer: EmergencyGridColumnSettings.FinalizedDate },
    {
      headerName: "Actions",
      field: "",
      width: 160,
      cellRenderer: EmergencyGridColumnSettings.Action
    }

  ]

  static ERDischargedPatientList = [
    { headerName: "Hospital Number", width: 70, field: "PatientCode" },
    { headerName: "Name", width: 110, field: "FullName" },
    { headerName: "Age", field: "Age", width: 50 },
    { headerName: "Gender", field: "Gender", width: 60 },
    { headerName: "Finalized DateTime", width: 80, cellRenderer: EmergencyGridColumnSettings.FinalizedDate },
    {
      headerName: "Actions",
      field: "",
      width: 160,
      cellRenderer: EmergencyGridColumnSettings.Action
    }

  ]


  static AgeSexRenderer(params) {
    var gender = "O";
    if (params.data.Gender && params.data.Gender.toLowerCase() == "male") {
      gender = 'M';
    } else if (params.data.Gender && params.data.Gender.toLowerCase() == "female") {
      gender = 'F';
    }
    var agesex = params.data.Age + '/' + gender;

    return agesex;
  }

  static Action(params) {
    if (params.data.ERDischargeSummaryId) {
      return `
             <i danphe-grid-action="patientoverview" class="fa fa-tv grid-action" style="padding: 3px;" title= "overview"></i>
             <a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>
             <a danphe-grid-action="order" class="grid-action">
                Order
             </a>
             <a danphe-grid-action="add-vitals" class="grid-action">
                Add Vitals
             </a>
            <a danphe-grid-action="dischargesummary" class="grid-action">
                            View Summary  
             </a>`
    } else {
      return `
            <i danphe-grid-action="patientoverview" class="fa fa-tv grid-action" style="padding: 3px;" title= "overview"></i>
            <a danphe-grid-action="edit" class="grid-action">
                Edit
             </a>
             <a danphe-grid-action="order" class="grid-action">
                Order
             </a>
             <a danphe-grid-action="add-vitals" class="grid-action">
                Add Vitals
             </a>
            <a danphe-grid-action="dischargesummary" class="grid-action">
                            Add Summary  
             </a>`
    }
  }

  static TriageRenderer(params) {
    if (params.data.TriageCode) {
      if (params.data.TriageCode.toLowerCase() == "critical") {
        return `<div style="padding-left: 3px;background: #a70b0b; color: #fff;">` + params.data.TriageCode + `</div>`;
      }
      else if (params.data.TriageCode.toLowerCase() == "moderate") {
        return `<div style="padding-left: 3px;background: #b34117; color: #fff;">` + params.data.TriageCode + `</div>`;
      }
      else if (params.data.TriageCode && params.data.TriageCode.toLowerCase() == "mild") {
        return `<div style="padding-left: 3px;background: #3fab13; color: #fff;">` + params.data.TriageCode + `</div>`;
      }
      else if (params.data.TriageCode && params.data.TriageCode.toLowerCase() == "death") {
        return `<div style="padding-left: 3px;background: #000; color: #fff;">` + params.data.TriageCode + `</div>`;
      }
    } else {
      return params.data.FullName;
    }
  }

  static VisitDate(params) {
    let date: string = params.data.VisitDateTime;
    return moment(date).format('YYYY-MM-DD HH:mm');
  }
  static FinalizedDate(params) {
    let date: string = params.data.FinalizedOn;
    return moment(date).format('YYYY-MM-DD HH:mm');
  }
  static TriagedDate(params) {
    let date: string = params.data.TriagedOn;
    return moment(date).format('YYYY-MM-DD HH:mm');
  }

  static SelectButtonsToBeDisplayed(params){
      if(params.data.IsAddVitalBeforeTriage == "true" && params.data.vitals != null 
      && params.data.PatientCases.MainCase !="1"&& params.data.uploadedfiles !=null){
        let template = `
        <a danphe-grid-action="edit" class="grid-action">
          Edit
        </a>
        <a danphe-grid-action="triage" class="grid-action">
          Triage
        </a>
        <a danphe-grid-action="add-vitals" class="grid-action">
            Add Vitals
         </a>
         <a danphe-grid-action="consent" class="grid-action">
           View Consent
         </a>`;
        return template;
      }else if(params.data.IsAddVitalBeforeTriage == "false" && params.data.PatientCases.MainCase !="1" && params.data.uploadedfiles !=null){
        let template =`<a danphe-grid-action="edit" class="grid-action">
            Edit
         </a>
         <a danphe-grid-action="triage" class="grid-action">
          Triage
        </a>
         <a danphe-grid-action="add-vitals" class="grid-action">
            Add Vitals
         </a>
         <a danphe-grid-action="consent" class="grid-action">
        View Consent
         </a>`;
         return template;
      }
      else if(params.data.IsAddVitalBeforeTriage == "true" && params.data.PatientCases.MainCase !="1" && params.data.uploadedfiles !=null){
        let template =`<a danphe-grid-action="edit" class="grid-action">
            Edit
         </a>
         
         <a danphe-grid-action="add-vitals" class="grid-action">
            Add Vitals
         </a>
         <a danphe-grid-action="consent" class="grid-action">
         View Consent
         </a>`;
         return template;
      }
      else if(params.data.IsAddVitalBeforeTriage == "true" && params.data.PatientCases.MainCase !="1" ){
        let template = `
        <a danphe-grid-action="edit" class="grid-action">
          Edit
        </a>
        <a danphe-grid-action="triage" class="grid-action">
          Triage
        </a>
        <a danphe-grid-action="add-vitals" class="grid-action">
            Add Vitals
         </a>
         <a danphe-grid-action="consent" class="grid-action">
         Upload Consent
         </a>`;
         return template;
      }
      else if(params.data.IsAddVitalBeforeTriage == "true" && params.data.PatientCases.MainCase =="1" ){
        let template = `
        <a danphe-grid-action="edit" class="grid-action">
          Edit
        </a>
        <a danphe-grid-action="triage" class="grid-action">
          Triage
        </a>
        <a danphe-grid-action="add-vitals" class="grid-action">
            Add Vitals
         </a>`;
         return template;
      }
    }
     
}
