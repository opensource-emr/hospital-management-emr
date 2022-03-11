//This grid is to show list of Lab Report Templates
import * as moment from 'moment/moment';
import { CommonFunctions } from '../../shared/common.functions';
import { DanpheDateTime } from '../../shared/pipes/danphe-datetime.pipe';

export default class MRGridColumnSettings {
  static BirthList = [
    { headerName: "Certificate No.", field: "CertificateNumber", width: 150 },
    { headerName: "Mother Name", field: "ShortName", width: 125 },
    { headerName: "Father Name", field: "FathersName", width: 150 },
    { headerName: "Baby Gender", field: "Sex", width: 75 },
    { headerName: "Birth Date", field: "BirthDate", width: 100, cellRenderer: MRGridColumnSettings.MRBirthDateRenderer },
    { headerName: "Birth Time", field: "BirthTime", width: 120 },
    { headerName: "Weight(gm)", field: "WeightOfBaby", width: 75 },
    {
      headerName: "Action",
      field: "",
      width: 120,
      template: `<a danphe-grid-action="view-birth-certificate" class="grid-action">Certificate</a>`
    }
  ];
  static DeathList = [
    { headerName: "Certificate No.", field: "CertificateNumber", width: 150 },
    { headerName: "Patient Name", field: "ShortName", width: 125 },
    { headerName: "Death Date", field: "DeathDate", width: 100, cellRenderer: MRGridColumnSettings.MRDeathDateRenderer },
    { headerName: "Death Time", field: "DeathTime", width: 120 },
    {
      headerName: "Action",
      field: "",
      width: 120,
      template: `<a danphe-grid-action="view-death-certificate" class="grid-action">Certificate</a>`
    }
  ];
  static datTime: DanpheDateTime = new DanpheDateTime();

  static MRDateRenderer(params) {
    var tempdate = MRGridColumnSettings.DateRenderer(
      params.data.VisitDate,
      "YYYY-MM-DD"
    );
    return tempdate;
  }

  static MRAgeSexRendererPatient(params) {
    let dob = params.data.DateOfBirth;
    let gender: string = params.data.Gender;
    if (dob && gender) {
      return CommonFunctions.GetFormattedAgeSex(dob, gender);
    } else {
      return "";
    }
  }

  static MRDeathDateRenderer(params) {
    var tempdate = MRGridColumnSettings.DateRenderer(
      params.data.DeathDate,
      "YYYY-MM-DD"
    );
    return tempdate;
  }

  static MRBirthDateRenderer(params) {
    var tempdate = MRGridColumnSettings.DateRenderer(
      params.data.BirthDate,
      "YYYY-MM-DD"
    );
    return tempdate;
  }

  static DateRenderer(value, dateFormat) {
    return moment(value).format(dateFormat);
  }

  static OutpatientList = [
    // { headerName: "SN", field: "", width: 150, cellRenderer: MRGridColumnSettings.SerialNoGeneratior },
    { headerName: "Hospital No", field: "PatientCode", width: 150 },
    { headerName: "Patient Name", field: "PatientName", width: 75 },
    { headerName: "Age", field: "Age", width: 120 },
    { headerName: "Gender", field: "Gender", width: 75 },
    { headerName: "Doctor Name", field: "ProviderName", width: 100 },
    { headerName: "Appointment Date", field: "VisitDate", width: 125, cellRenderer: MRGridColumnSettings.MRDateRenderer },
    { headerName: "Visit Type", field: "VisitType", width: 100 },
    { headerName: "Department", field: "DepartmentName", width: 100 },
    { headerName: "Final Diagnosis", field: "FinalDiagnosis", width: 100, cellRenderer: MRGridColumnSettings.FinalDiagnosisRenderer },
    // FinalDiagnosisCount
    {
      headerName: "Action",
      field: "",
      width: 120,
      cellRenderer: MRGridColumnSettings.OPListActionRenderer
    }
  ];

  static OPListActionRenderer(params) {
    if (params.data && params.data.FinalDiagnosisCount && params.data.FinalDiagnosisCount > 0)
      return `<a danphe-grid-action="add-diagnosis" class="grid-action" style="background-color: #247e58!important;">
      Edit Final Diagnosis</a>`
    else return `<a danphe-grid-action="add-diagnosis" class="grid-action">Add Final Diagnosis</a>`
  }

  static FinalDiagnosisRenderer(params) {
    if (params.data && params.data.FinalDiagnosis && params.data.FinalDiagnosis.length > 0) {
      let temp: Array<any> = Array<any>();
      temp = params.data.FinalDiagnosis;
      let str: string = "";
      temp.forEach(a => { str = str + a.ICD10Description + "; " });
      return str;
    } else {
      return "No Diagnosis Recorded";
    }

  }

  static SerialNoGeneratior(params) {
    return 1;
  }

  
  static InpatientList = [ 
    // { headerName: "SN", field: "", width: 150, cellRenderer: MRGridColumnSettings.SerialNoGeneratior },
    { headerName: "Adm. Date ", field: "AdmittedDate", width: 120 },
    { headerName: "Dis. Date", field: "DischargedDate", width: 120 },
    { headerName: "Patient No.", field: "PatientCode", width: 120 },
    { headerName: "InPatient No.", field: "VisitCode", width: 120 },
    { headerName: "Patient Name", field: "Name", width: 150 },
    { headerName: "Age/Gender", field: "DateOfBirth", width: 80, cellRenderer: MRGridColumnSettings.MRAgeSexRendererPatient  },
    // { headerName: "Gender", field: "Gender", width: 100 },
    { headerName: "Ward", field: "BedInformation.Ward", width: 100 },
    { headerName: "Department", field: "Department" , width: 120 },
    { headerName: "Doctor", field: "AdmittingDoctorName", width: 100},
    { headerName: "MR ?", field: "", width: 80, cellRenderer: MRGridColumnSettings.MRIpStatusRenderer },
    // FinalDiagnosisCount
    {
      headerName: "Action",
      field: "",
      width: 120,
      cellRenderer: MRGridColumnSettings.IPListActionRenderer
    }
  ];

  static IPListActionRenderer(params) {
    if (params.data && params.data.MedicalRecordId > 0)
      return `<a danphe-grid-action="view-mr" class="grid-action btn btn-primary actionbtn margin-7-hr" style="background-color: #247e58!important;">
      View MR</a>`
    else return `<a danphe-grid-action="add-mr" class="grid-action btn btn-primary actionbtn margin-7-hr">Add MR</a>`;

  }

  static MRIpStatusRenderer(params) {    
    var tempMsg ;
    if(params.data.MedicalRecordId > 0){
      tempMsg = `<b style="background-color: lightgreen;">Added</b>`
    }else{
      tempMsg = `<b style="background-color: yellow; padding:3px;">Pending</b>`
    }
    return tempMsg;
  }


}
