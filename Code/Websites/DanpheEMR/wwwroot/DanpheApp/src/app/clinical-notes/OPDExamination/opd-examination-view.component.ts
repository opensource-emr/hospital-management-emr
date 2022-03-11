import { Component, OnInit, OnDestroy, Input, EventEmitter, Output } from "@angular/core";
import { NoteTemplateBLService } from "../shared/note-template.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { CoreService } from "../../core/shared/core.service";
import { PatientService } from "../../patients/shared/patient.service";
import { VisitService } from "../../appointments/shared/visit.service";

//@Component({
//  selector: "view-history-and-physical-note",
//  templateUrl: "./view-history-and-physical-note.html",
//})

@Component({
  selector: "opd-examination-view",
  templateUrl: "./opd-examination-view.html"
})

export class OpdexaminationViewComponent {
  public hpNote: any=null;
  public subjectiveNote: any=null;
  public objectiveNote: any=null;
  public diagnosisOrderList: Array<any> = null;
  public freeText:any = null;
  public Prescription : any = null;
  public OrdersList: Array<any> = [];
  public headerDetail: { header1, header2, header3, header4, hospitalName; address; email; PANno; tel; DDA };
 public pat :number=0;
 public patVisit:number=0;
 public patientQRCodeInfo:string="";
 public notesId:number=0;
  @Input("patientVisitId")
  public patientVisitId: number;

  @Output("callback-view")
  public CallBackView: EventEmitter<Object> = new EventEmitter<Object>();
  constructor(public noteTemplateBLService: NoteTemplateBLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public patientService:PatientService,
    public visitService:VisitService) {
      this.pat = this.patientService.getGlobal().PatientId;
      this.patVisit =  this.visitService.getGlobal().PatientVisitId;
      this.notesId= this.noteTemplateBLService.NotesId;
      this.GetHeaderParameter();
      this.getOpdExaminationData()

  }
getOpdExaminationData(){
  //if ( > 0) {
    this.noteTemplateBLService.GetOpdExaminationdetailsById(this.pat,this.patVisit,this.notesId).
      subscribe((res) => {

        if (res.Status == "OK" && res.Results) {
          this.hpNote = res.Results;
          this.subjectiveNote = this.hpNote.SubjectiveNote;
          this.objectiveNote = this.hpNote.ObjectiveNote;
          this.diagnosisOrderList = this.hpNote.DiagnosisOrdersList;
          this.Prescription = this.hpNote.Prescription;
          if (this.Prescription && this.Prescription.OrdersSelected) {
            this.OrdersList = JSON.parse(this.Prescription.OrdersSelected);
          }
          if(this.Prescription && this.Prescription.ICDSelected){
            this.diagnosisOrderList = JSON.parse(this.Prescription.ICDSelected)
          }
          console.log(this.hpNote);
          console.log(this.diagnosisOrderList);
        }
      });
  //}
}

  GetHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(
      (a) => a.ParameterName == "CustomerHeader"
    ).ParameterValue;
    if (paramValue) this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", [
        "Please enter parameter values for CustomerHeader",
      ]);
  }
  ngOnDestroy() {
    this.noteTemplateBLService.NotesId = 0;
  }

}



