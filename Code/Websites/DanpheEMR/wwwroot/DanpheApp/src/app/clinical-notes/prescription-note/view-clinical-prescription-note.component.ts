import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoreService } from "../../core/shared/core.service";
import { NoteTemplateBLService } from "../shared/note-template.bl.service";



@Component({
  selector: "view-clinical-prescription-note",
  templateUrl: "./view-clinical-prescription-note.component.html"
})

export class ViewClinicalPrescriptionNoteComponent implements OnInit, OnDestroy {
  public note: any = null;
  public subjectiveNote: any = null;
  public patientQRCodeInfo: any = null;
  public headerDetail: {
    CustomerName;
    Address;
    Email;
    CustomerRegLabel;
    Tel;
  };
  public ICDList: Array<any> = [];
  public OrdersList: Array<any> = [];
  public IcdVersionDisplayName: string = "";

  constructor(public noteTemplateBLService: NoteTemplateBLService, public coreService: CoreService) {
    var bilHeadparam = this.coreService.Parameters.find(
      (a) =>
        a.ParameterName == "BillingHeader" &&
        a.ParameterGroupName.toLowerCase() == "bill"
    );

    if (bilHeadparam) {
      this.headerDetail = JSON.parse(bilHeadparam.ParameterValue);
    }
    this.IcdVersionDisplayName = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "IcdVersionDisplayName").ParameterValue;
  }

  ngOnInit() {

    if (this.noteTemplateBLService.NotesId > 0) {
      this.noteTemplateBLService.GetClinicalPrescriptionNoteById(this.noteTemplateBLService.NotesId).
        subscribe((res) => {
          if (res.Status == "OK" && res.Results) {
            this.patientQRCodeInfo = res.PatientCode;
            this.note = res.Results[0];
            if (this.note && this.note.Prescription && this.note.Prescription.ICDSelected) {
              this.ICDList = JSON.parse(this.note.Prescription.ICDSelected);
            }

            if (this.note && this.note.Prescription && this.note.Prescription.OrdersSelected) {
              this.OrdersList = JSON.parse(this.note.Prescription.OrdersSelected);
            }
            if (this.note && this.note.ChiefComplaint) {
              this.note.ChiefComplaint = JSON.parse(this.note.ChiefComplaint);
            }
          }
        });
    }
  }

  ngOnDestroy() {
    this.noteTemplateBLService.NotesId = 0;
  }
}



