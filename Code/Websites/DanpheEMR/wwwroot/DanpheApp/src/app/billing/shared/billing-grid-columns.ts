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

  AgeSexRendererPatient(params) {
    let dob = params.data.DateOfBirth;
    let gender: string = params.data.Gender;
    return CommonFunctions.GetFormattedAgeSex(dob, gender);
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


}
