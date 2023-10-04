import { Component } from '@angular/core';
import { NursingGridColSetting } from './nursing-inpatient.component';
import { SecurityService } from '../../security/shared/security.service';
import { NursingBLService } from '../shared/nursing.bl.service';
import { CommonFunctions } from '../../shared/common.functions';
import * as moment from "moment/moment";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';

@Component({
  selector: 'transferred-patient-pending-list',
  templateUrl: './transferred-patient-pending.html'
})
export class TransferredPatientPendingComponent {

  public TransferPatPendingList = [];
  public IsReceiveFeatureEnabled: boolean = false;
  public TransferPatPendingListColums: Array<any> = null;

  isValidUser: boolean = false;
  showUndoPopUp: boolean = false;
  selectedPatVisitId: number;
  remarks: string;

  constructor(public securityService: SecurityService, public nursingBlServ: NursingBLService, public msgServ: MessageboxService) {
    this.TransferPatPendingListColums = this.GetGridCols();
  }



  ngOnInit() {
    this.GetPendingTransferPatientList();
    this.isValidUser = this.securityService.HasPermission('nursing-ip-undo-pending-transfer-patient');
  }

  public GetPendingTransferPatientList() {
    this.nursingBlServ
      .GetPendingReceiveTransferredList()
      .subscribe((res) => {
        if (res.Status == "OK") {
          this.TransferPatPendingList = res.Results;
        } else {
          this.msgServ.showMessage('error', ['Cannot get the data. Please try later.'])
        }
      }, error => {
        console.log(error);
      });
  }



  TransferPatPendingListGridActions($event) {
    switch ($event.Action) {
      case "undo-transfer":
        {
          if ($event.Data) {
            this.selectedPatVisitId = $event.Data.PatientVisitId;
            this.showUndoPopUp = true;
          }
        }
        break;
    }
  }

  public UndoTransfer() {
    if (this.selectedPatVisitId && this.selectedPatVisitId > 0) {
      this.nursingBlServ.UndoPatientTransfer(this.selectedPatVisitId, this.remarks).subscribe((res) => {
        if (res.Status == "OK") {
          this.msgServ.showMessage("success", ["Transfer successsfully undone."])
          this.GetPendingTransferPatientList();
          this.selectedPatVisitId = 0;
        }
      }, (error) => {
        console.log(error);
      });
    }
  }

  ClosePopUp() {
    this.remarks = '';
    this.showUndoPopUp = false;
    this.selectedPatVisitId = 0;
  }
  public GetGridCols() {
    let gridCol = [
      {
        headerName: "Admitted Date",
        field: "AdmittedDate",
        width: 140,
        sort: "desc",
        cellRenderer: this.AdmissionDateRenderer,
      },
      { headerName: "Hospital Number", field: "PatientCode", width: 110 },
      { headerName: "IP Number", field: "VisitCode", width: 100 },
      { headerName: "Patient Name", field: "Name", width: 170 },
      {
        headerName: "Age/Sex",
        field: "",
        width: 70,
        cellRenderer: this.AgeSexRendererPatient,
      },
      {
        headerName: "From Bed",
        field: "",
        cellRenderer: this.TransferredFromRenderer,
        width: 120,
      },
      {
        headerName: "To Bed",
        field: "",
        cellRenderer: this.TransferredToRenderer,
        width: 120,
      },
      {
        headerName: "Transferred By",
        cellRenderer: this.TransferredByRenderer,
        width: 160,
      },
      {
        headerName: "Transferred Date",
        field: "",
        cellRenderer: this.TransferredDateRenderer,
        width: 130,
      },
      
      {
        headerName: "Actions",
        field: "",
        width: 140,
        template: this.UndoAction(),
      },
    ];
    return gridCol;
  }

  public TransferredFromRenderer(params) {
    return (
      `<b>`+
      params.data.BedInformation[1].Ward.WardName +
      "/" +
      params.data.BedInformation[1].BedCode
      +`</b>`
    );
  }

  public TransferredToRenderer(params) {
    return (
      `<b>`+
      params.data.BedInformation[0].Ward.WardName +
      "/" +
      params.data.BedInformation[0].BedCode
      +`</b>`
    );
  }

  public TransferredDateRenderer(params) {
    let dat = params.data.BedInformation[0].StartedOn;
    return moment(dat).format("YYYY-MM-DD HH:mm");
  }

  public TransferredByRenderer(params) {
    return (params.data.BedInformation[0].CreatedBy);
  }


  public AdmissionDateRenderer(params) {
    let date: string = params.data.AdmittedDate;
    return moment(date).format("YYYY-MM-DD HH:mm");
  }
  public AgeSexRendererPatient(params) {
    let dob = params.data.DateOfBirth;
    let gender: string = params.data.Gender;
    return CommonFunctions.GetFormattedAgeSex(dob, gender);
  }
  public UndoAction() {
    return `<a danphe-grid-action="undo-transfer" class="grid-action" title="Receive Transferred Patient">
                        Undo-Transfer
                    </a>`;
  }


}
