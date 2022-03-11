//This grid is to show list of Lab Report Templates
import * as moment from 'moment/moment';
import { SecurityService } from '../../security/shared/security.service';
import { CommonFunctions } from '../../shared/common.functions';

export default class MaternityGridColumnSettings {

  static securityServ: any;
  constructor(public securityService: SecurityService) {
    MaternityGridColumnSettings.securityServ = this.securityService;
  }


  static MaternityPatientColSettings = [
    { headerName: "Hosp No.", field: "PatientCode", width: 50 },
    { headerName: "Name", field: "ShortName", width: 70 },
    { headerName: "Age/Sex", field: "Age", width: 40},
    { headerName: "Address", field: "Address", width: 55 },
    { headerName: "Phone No.", field: "PhoneNumber", width: 50 },
    { headerName: "Husband's Name", field: "HusbandName", width: 70 },
    { headerName: "Ht", field: "Height", width: 25 },
    { headerName: "Wt", field: "Weight", width: 25 },
    { headerName: "LMP", field: "LastMenstrualPeriod", width: 45, cellRenderer: MaternityGridColumnSettings.MenstrualPeriodDateOnlyRenderer  },
    { headerName: "EDD", field: "ExpectedDeliveryDate", width: 45, cellRenderer: MaternityGridColumnSettings.ExpectedDeliveryDateOnlyRenderer  },

    {
      headerName: "Action",
      field: "",
      width: 150,
      cellRenderer: MaternityGridColumnSettings.MaternityListButtonRenderer
    }
  ]

  static MaternityPaymentPatientColSettings = [
    { headerName: "Hospital No.", field: "PatientCode", width: 80 },
    { headerName: "Patient Name", field: "ShortName", width: 80 },
    { headerName: "Age/Sex", field: "", width: 70, cellRenderer: MaternityGridColumnSettings.AgeSexRendererPatient },
    { headerName: "Contact No.", field: "PhoneNumber", width: 60 },
    { headerName: "Address", field: "Address", width: 60 },
    { headerName: "IP Number", field: "VisitCode", width: 70 },
    { headerName: "Discharge Date", field: "DischargeDate", width: 60, cellRenderer: MaternityGridColumnSettings.DiscahrgeDateOnlyRenderer },
    {
      headerName: "Actions",
      field: "",
      width: 80,
      template: `<a danphe-grid-action="payment" class="grid-action">Payment</a>`,
    }
  ]
  static MaternityPaymentHistory = [
    { headerName: "Type", field: "TransactionType", width: 70 },
    { headerName: "Date", field: "CreatedOn", width: 50 ,cellRenderer: MaternityGridColumnSettings.PatientPaymentDateOnlyRenderer},
    { headerName: "Amount", field: "InOrOutAmount", width: 55,},
    { headerName: "User", field: "EmployeeName", width: 50 },
    { headerName: "Remarks", field: "Remarks", width: 100 },
]

  static AgeSexRenderer(params) {
    let dob = params.data.DateOfBirth;
    let gender: string = params.data.Gender;
    if (dob && gender) {
      return CommonFunctions.GetFormattedAgeSex(dob, gender);
    } else {
      return "";
    }
  }

  static MaternityListButtonRenderer(params) {
    if (params.data.IsConcluded) {
      return `<a danphe-grid-action="view-concluded-patient" class="grid-action">
                View
             </a>`
    } else {
      return `<a danphe-grid-action="view_active_patient" class="grid-action">View</a>
              <a danphe-grid-action="anc" class="grid-action">ANC</a>
              <div class="dropdown" style="display:inline-block;">
                 <button class="dropdown-toggle grid-btnCstm" type="button" data-toggle="dropdown">...
                 <span class="caret"></span></button>
                 <ul class="dropdown-menu grid-ddlCstm">
                   <li><a danphe-grid-action="maternity_register" >Mat-Register</a></li>
                   <li><a danphe-grid-action="upload_files" >Upload</a></li>
                   <li><a danphe-grid-action="conclude" >Conclude</a></li>
                   <li><a danphe-grid-action="remove" >Remove</a></li>
                 </ul>
                </div>
            `
    }    
  }

  static MenstrualPeriodDateOnlyRenderer(params) {
    let date: string = params.data.LastMenstrualPeriod;
    return moment(date).format("YYYY-MM-DD");
  }

  static ExpectedDeliveryDateOnlyRenderer(params) {
    let date: string = params.data.ExpectedDeliveryDate;
    return moment(date).format("YYYY-MM-DD");
  }

  
  static MaternityAllowanceReportColSettings = [
    { headerName: "Date.", field: "CreatedOn", width: 80 ,cellRenderer: MaternityGridColumnSettings.MatAllowanceDateOnlyRenderer },
    { headerName: "Receipt No", field: "ReceiptNo", width: 80 },
    { headerName: "Patient Name", field: "ShortName", width: 100},
    { headerName: "Hospital No", field: "HospitalNo", width: 80 },
    { headerName: "Age/Sex.", field: "Age", width: 80 },
    { headerName: "Type", field: "TransactionType", width: 150 },
    { headerName: "Amount", field: "Amount", width: 80 },
    { headerName: "User", field: "FullName", width: 80 },
    {
      headerName: "Action",
      field: "",
      width: 100,
      template: `<a danphe-grid-action="viewDetails" class="grid-action">
      View Details
        </a>`,
    }
  ]

  static MatAllowanceDateOnlyRenderer(params) {
    let date: string = params.data.CreatedOn;
    return moment(date).format("YYYY-MM-DD");
  }

  static PatientPaymentDateOnlyRenderer(params) {
    let date: string = params.data.CreatedOn;
    return moment(date).format("YYYY-MM-DD");
  }

  static DiscahrgeDateOnlyRenderer(params) {
    let date: string = params.data.DischargeDate;
    return moment(date).format("YYYY-MM-DD");
  }
  static AgeSexRendererPatient(params) {
    let gender: string = params.data.Gender;
    let ageSex = params.data.Age + "/" + gender.charAt(0).toUpperCase();
    return ageSex;
  }
}
