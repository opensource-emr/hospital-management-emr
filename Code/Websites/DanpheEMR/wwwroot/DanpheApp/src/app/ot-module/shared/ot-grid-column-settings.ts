import { CommonFunctions } from '../../shared/common.functions';
import * as moment from "moment/moment";
export class OTGridColumnSettings {
  constructor() { }



  public OTBookingList = [
    //{ headerName: "S.N.", field: "BookingId", width: 150},
    { headerName: "Hospital Number", field: "HospitalNumber", width: 250 },
    { headerName: "Patient Name", field: "PatientName", width: 250 },
    { headerName: "Age/Sex", field: "", width: 110, cellRenderer: this.AgeSexRendererPatient },
    { headerName: "Date/Time", field: "BookedForDate", width: 250,cellRenderer:this.BookedForDateTimeRenderer },
    { headerName: "Ward/Bed No", field: "", width: 100 },
    { headerName: "Diagnosis", field: "Diagnosis", width: 250 },
    { headerName: "Surgery Type", field: "SurgeryType", width: 200 },
    { headerName: "Procedure", field: "ProcedureType", width: 200 },
    { headerName: "Surgeon", field: "Surgeon", width: 200, cellRenderer: this.SurgeonCellRenderer },
    { headerName: "Anesthetic Doctor", field: "AnestheticDoctor", width: 200, cellRenderer: this.AnestheticDoctorCellRenderer },
    { headerName: "Anesthesia", field: "AnesthesiaType", width: 150, },
    { headerName: "Anesthesia Assistant", field: "AnestheticAssistant", width: 200, cellRenderer: this.AnestheticAssistantCellRenderer },
    { headerName: "Scrub Nurse", field: "ScrubNurse", width: 200, cellRenderer: this.ScrubNurseCellRenderer },
    { headerName: "OT Assistant", field: "OtAssistant", width: 200, cellRenderer: this.OtAssistantCellRenderer },
    { headerName: "Remarks", field: "Remarks", width: 200 },
    {
      headerName: "Actions",
      field: "",
      width: 500,
      template: `<a danphe-grid-action="edit" class="grid-action">Edit</a>
                `,
                // <a danphe-grid-action="reschedule" class="grid-action">Reschedule</a>
                // <a danphe-grid-action="cancel" class="grid-action">Cancel</a>
    }

  ]
//displays date and time in hour:minute
BookedForDateTimeRenderer(params) {
  return moment(params.data.BookedForDate).format("YYYY-MM-DD HH:mm");
}
  AgeSexRendererPatient(params) {
    let dob = params.data.DateOfBirth;
    let gender: string = params.data.Gender;
    return CommonFunctions.GetFormattedAgeSex(dob, gender);
  }

  SurgeonCellRenderer(params) {
    let value: string;
    if (params.data.OtSurgeonList && params.data.OtSurgeonList.length > 0) {
      params.data.OtSurgeonList.forEach(s => {
       if(value)value = value + ", " + s.FullName;
       else value=''+s.FullName
      });
    } else {
      value = '';
    }
    return value;
  }

  AnestheticDoctorCellRenderer(params) {
    let value: string;
    if (params.data.AnesthetistDoctor) {
      value = params.data.AnesthetistDoctor.FullName;

    } else {
      value = '';
    }
    return value;
  }
  AnestheticAssistantCellRenderer(params) {
    let value: string;
    if (params.data.AnesthetistAssistant) {
      value = params.data.AnesthetistAssistant.FullName;
    } else {
      value = '';
    }
    return value;
  }

  ScrubNurseCellRenderer(params) {
    let value: string;
    if (params.data.ScrubNurse) {
      value = params.data.ScrubNurse.FullName;
    } else {
      value = '';
    }
    return value;
  }

  OtAssistantCellRenderer(params) {
    let value: string;
    if (params.data.OtAssistantList && params.data.OtAssistantList.length > 0) {

      params.data.OtAssistantList.forEach(s => {
        if(value)value = value + ", " + s.FullName;
       else value=''+s.FullName
      });
      
    } else {
      value = '';
    }
    return value;
  }

}