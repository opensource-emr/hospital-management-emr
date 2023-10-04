//This grid is to show list of Lab Report Templates
import * as moment from 'moment/moment';
import { SecurityService } from '../../security/shared/security.service';
import { CommonFunctions } from '../../shared/common.functions';
import { VaccinationService } from './vaccination.service';

export default class VaccinationGridColumnSettings {

  static securityServ: any;
  constructor(public securityService: SecurityService) {
    VaccinationGridColumnSettings.securityServ = this.securityService;
  }

  static vaccinationPatientGridColumns = [
    { headerName: "Vacc. Regd. No.", field: "VaccinationRegNo", width: 60 },
    { headerName: "Baby's Name", field: "PatientName", width: 120 },
    { headerName: "Age/Sex", field: "", width: 60, cellRenderer: VaccinationGridColumnSettings.AgeSexRenderer },
    { headerName: "Hospital No.", field: "PatientCode", width: 80 },
    { headerName: "Mother's Name", field: "MotherName", width: 100 },
    //{ headerName: "Father's Name", field: "FatherName", width: 50 },
    // { headerName: "Ethnicity", field: "EthnicGroup", width: 80 },
    { headerName: "Address", field: "Address", width: 80 },
    //{ headerName: "Phone No.", field: "PhoneNumber", width: 80 },
    { headerName: "Last Vis. Date", field: "VisitDateTime", width: 80 },
    { headerName: "Days Passed", field: "DaysPassed", width: 80 },
    {
      headerName: "Actions",
      field: "",
      width: 170,
      cellRenderer: VaccinationGridColumnSettings.VaccPatListActionRenderer,
    }
  ];



  //adds action buttons dynamically based on some rules.
  static VaccPatListActionRenderer(params) {
    let currVisit = params.data;
    let todaysdate = moment().format("YYYY-MM-DD");
    let visitdate = moment(currVisit.VisitDateTime).format("YYYY-MM-DD");
    //by default: print sticker wil be there in the action.
    let templateHtml = "";

    templateHtml += `<a danphe-grid-action="sticker" class="grid-action">Sticker</a>`;

    //show followup button only for past days visits.
    if (moment(todaysdate).diff(visitdate, "days") > 0) {
      templateHtml += `<a danphe-grid-action="followup" class="grid-action">Followup</a>`;
    }

    templateHtml += `<div class="dropdown" style="display:inline-block;">
                      <button class="dropdown-toggle grid-btnCstm" type="button" data-toggle="dropdown">...
                      <span class="caret"></span></button>
                      <ul class="dropdown-menu grid-ddlCstm">
                        <li><a danphe-grid-action="edit">Edit Patient Info</a></li>
                        <li><a danphe-grid-action="vaccination">Vaccination</a></li>
                      </ul>
                    </div>`;

    return templateHtml;
  }



  static vaccinationPatientReportGridColumns = [
    { headerName: "Vacc. Date", field: "VaccinationDate", width: 30 },
    { headerName: "Vacc. Regd. No.", field: "VaccinationRegNo", width: 30 },
    { headerName: "Baby's Name", field: "ShortName", width: 70 },
    { headerName: "Age/Sex", field: "", width: 40, cellRenderer: VaccinationGridColumnSettings.AgeSexRenderer },
    { headerName: "Hospital No.", field: "PatientCode", width: 55 },
    { headerName: "Mother's Name", field: "MotherName", width: 50 },
    { headerName: "Father's Name", field: "FatherName", width: 50 },
    { headerName: "Date Of Birth", field: "DateOfBirth", width: 50, cellRenderer: VaccinationGridColumnSettings.DOBRenderer },
    { headerName: "Ethnicity", field: "EthnicGroup", width: 40 },
    { headerName: "Address", field: "Address", width: 50 },
    { headerName: "PhoneNumber", field: "PhoneNumber", width: 40 },
    { headerName: "Vacc. Name", field: "VaccineName", width: 40 },
    { headerName: "Dose", field: "DoseNumber", width: 40 }
  ];

  static vaccinationAppointmentDetailsReportColumns = [
    { headerName: "Date/Time", field: "VisitDateTime", width: 30 },
    { headerName: "Vacc. Regd. No.", field: "VaccinationRegNo", width: 30 },
    { headerName: "Baby's Name", field: "PatientName", width: 70 },
    { headerName: "Hospital No.", field: "PatientCode", width: 55 },
    { headerName: "Age/Sex", field: "", width: 40, cellRenderer: VaccinationGridColumnSettings.AgeSexRenderer },
    { headerName: "Baby's DOB", field: "DateOfBirth", width: 50, },
    { headerName: "Mother's Name", field: "MotherName", width: 50 },
    { headerName: "Ethnicity", field: "EthnicGroup", width: 40 },
    { headerName: "District", field: "DistrictName", width: 40 },
    { headerName: "Address", field: "Address", width: 40 },
    { headerName: "Appt. Type", field: "AppointmentType", width: 40 },
    { headerName: "UserName", field: "UserName", width: 40 },
  ];

  static DOBRenderer(params) {
    let date: string = params.data.DateOfBirth;
    return moment(date).format("YYYY-MM-DD");
  }
  static patientVaccinationListGridColumns = [
    { headerName: "Vacc.Date", field: "VaccineDate", width: 30 },
    { headerName: "Vacc. Name", field: "VaccineName", width: 50 },
    { headerName: "Remarks", field: "Remarks", width: 80 },
    { headerName: "Dose", field: "DoseNumberStr", width: 30 },
    { headerName: "EnteredBy", field: "EnteredBy", width: 50 },
    {
      headerName: "Actions",
      field: "",
      width: 40,
      template: `<a danphe-grid-action="edit" class="grid-action">Edit</a>`
    }
  ];

  static AgeSexRenderer(params) {
    let dob = params.data.DateOfBirth;
    let age = VaccinationService.GetFormattedAge(dob);
    let gender: string = params.data.Gender;
    return age + "/" + gender;
  }

}
