import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { HistoryBLService } from '../../clinical/shared/history.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ClinicalSubjectivePrescriptionNotes } from "../shared/subjective-note.model";
@Component({
  selector: 'prescription-note',
  templateUrl: "./prescription-note.html"
})
export class PrescriptionNoteComponent {
    public select = [
        { id: 1, name: "Provisional" },
        { id: 2, name: "Final" }
      
    ];
    public loading = false;
    public showAddPart: boolean = false;
    @Input("patientVisitId")
    public patientVisitId: number;
    @Input("notesId")
    public notesId: number;
    @Output("emit-billItemReq")
    public emitBillItemReq: EventEmitter<Object> = new EventEmitter<Object>();
    public prescriptionNotes: ClinicalSubjectivePrescriptionNotes = new ClinicalSubjectivePrescriptionNotes();
    public showfreenotes: boolean = false;
    public medicationPrescriptions: any;
  public followUpDetails = new Object({ Number : 0, Unit : ""});
    public followUpRemarks: any;
    constructor(public changeDetector: ChangeDetectorRef, public historyBLService: HistoryBLService, public msgBoxServ: MessageboxService) {

  }
    ngOnInit() {
        if (this.patientVisitId && this.notesId) {
          this.historyBLService.GetSubjectivePrescriptionNotes(this.patientVisitId, this.notesId)
            .subscribe(res => {
              if (res.Status == "OK") {
                this.prescriptionNotes = res.Results;
                
                  this.medicationPrescriptions = res.Results.MedicationPrescriptions;
                  this.followUpDetails = JSON.parse(res.Results.FollowUp);
                  this.followUpRemarks = res.Results.Remarks;
                  console.log(this.medicationPrescriptions);                

              } else {
                this.msgBoxServ.showMessage("failed", ["Problem! Cannot get the Current Visit Context ! "])
              }
            });

        }
    }
  SaveNote() {
      this.showAddPart = true;
      this.prescriptionNotes.PatientVisitId = this.patientVisitId;
      this.historyBLService.SaveNote(this.prescriptionNotes)
          .subscribe(
              res => {
                  if (res.Status == "OK") {                   
                      this.loading = false;
                      //check if we can send back the response data so that page below don't have to do server call again.
                      this.emitBillItemReq.emit({ action: "save", data: null });
                  }
                  else {
                      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                      this.loading = false;
                  }
              });
  }

  PrintNote() {
    this.showAddPart = false;


    let popupWinindow;
    var printContents = document.getElementById("note_to_print").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    //popupWinindow.document.write('<html><head><link href="../assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" /><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');

    popupWinindow.document.close();
  }

}
