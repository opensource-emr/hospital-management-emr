import * as moment from "moment";
import { retry } from "rxjs/operators";
import { CommonFunctions } from "../../shared/common.functions";

export default class QueueManagementGridColumns{
    static VisitSearch = [
        {
          headerName: "Date",
          field: "",
          width: 120,
          cellRenderer: QueueManagementGridColumns.VisitDateOnlyRenderer
        },
        { headerName: "Hospital No.", field: "PatientCode", width: 140 },
        { headerName: "Name", field: "ShortName", width: 170 },
        { headerName: "Phone", field: "PhoneNumber", width: 125 },
        {
          headerName: "Age/Sex",
          field: "",
          width: 90,
          cellRenderer:QueueManagementGridColumns.VisitListAgeSexRenderer
        },
        { headerName: "Department", field: "DepartmentName", width: 190 },
        { headerName: "Doctor", field: "ProviderName", width: 190 },
        { headerName: "VisitType", field: "VisitType", width: 120 },
        { headerName: "Appt. Type", field: "AppointmentType", width: 130 },
        {
          headerName: "Days-Passed",
          field: "",
          width: 90,
          cellRenderer:QueueManagementGridColumns.VisitDaysPassedRenderer
        },
        {
          headerName: "Queue No.",
          field: "QueueNo",
          width: 140,
        },
        {
          headerName: "Actions",
          field: "",
          width: 320,
          cellRenderer: QueueManagementGridColumns.ShowAction
        },
      ];

      static VisitDaysPassedRenderer(params) {
        let date: string = params.data.VisitDate;
        let daysPassed = moment().diff(moment(date), "days");
        return daysPassed;
      }
      static VisitDateOnlyRenderer(params) {
        let date: string = params.data.VisitDate;
        return moment(date).format("YYYY-MM-DD");
      }
      static VisitListAgeSexRenderer(params) {
        let dob = params.data.DateOfBirth;
        let gender: string = params.data.Gender;
        return CommonFunctions.GetFormattedAgeSex(dob, gender);
      }

       static ShowAction(params) {
        if (params.data.QueueStatus == "checkedin") {
          let template =
            `<label style="font-weight: bold;border: 2px solid green;background-color:green;color: white;padding:0px 4px;margin-left: 4px;">CheckedIn.</label>`;
            template +=`<a danphe-grid-action="undo" class="grid-action">
            <i class="fa fa-undo"></i>Undo
           </a>`;
          return template;
        }
        else if (params.data.QueueStatus == "skipped") {
          let template =
            `<label style="font-weight: bold;border: 2px solid red;background-color:red;color: white;padding:0px 4px;margin-left: 4px;">Skipped.</label>`;
            template +=`<a danphe-grid-action="undo" class="grid-action">
            <i class="fa fa-undo"></i>Undo
           </a>`;
          return template;
        }
        else {
          let template =` <a danphe-grid-action="checkin" class="grid-action">
          <i class="fa fa-check"></i>CheckIn
         </a>
         <a danphe-grid-action="skip" class="grid-action">
          <i class="fa fa-fast-forward"></i>Skip
         </a>`
        return template;
        }
      }
}