import { Component, EventEmitter, Output, Input } from "@angular/core";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { VisitService } from '../../../appointments/shared/visit.service';
import { Visit } from '../../../appointments/shared/visit.model';
import { Patient } from "../../../patients/shared/patient.model";
import { PatientService } from "../../../patients/shared/patient.service";
import * as moment from 'moment/moment';
import { FreeTextNotesModel } from "../../shared/freetext.model";
import { NoteTemplateBLService } from "../../shared/note-template.bl.service";

@Component({
  selector: "freetext",
  templateUrl: "./freetext.html"
})

export class FreeTextComponent {
  public pat: Patient = new Patient();
  public patDetail: Visit = new Visit();
  public freeText: FreeTextNotesModel = new FreeTextNotesModel();
  public patVisit: Visit = new Visit();
  public date: string = null;
  public showCKeditor: boolean = false;
  constructor(public visitService: VisitService,
    public notetemplateBLService: NoteTemplateBLService,
    public msgBoxServ: MessageboxService,
    public patientService: PatientService) {
    this.pat = this.patientService.globalPatient;
    this.patVisit = this.visitService.globalVisit,
      this.date = moment().format("YYYY-MM-DD,h:mm:ss a");
   
  }

  //FreetextNoteTemplate(NotesId: number) {
  //      this.notetemplateBLService.PutFreetextNoteTemplateByNotesId(NotesId)
  //          .subscribe(res => {
  //              if (res.Status == "OK") {
  //                  this.msgBoxServ.showMessage("Success", ["Update Succesful."]);

  //              }
  //              else {
  //                  this.msgBoxServ.showMessage("Failed", ["No Template."]);
  //              }
  //          });
  //  }

  @Input("patDetail")
  public set obtainPatDetail(val: any) {
    this.patDetail = val ? val : "";
    console.log(this.patDetail);
    this.freeText.PatientId = this.patVisit.PatientId;
    //this.Focusout();
  }

  @Input("editFreeText")
  public set freeTextForEdit(ft: any) {
    if (this.notetemplateBLService.NotesId != 0) {
      this.freeText = ft;
      this.showCKeditor = true;
    } else {
      this.showCKeditor = true;
    }
  }

  @Output("callback-freetextnotes")
  public CallBackFreeTexts: EventEmitter<Object> = new EventEmitter<Object>();


  //Focusout() {
  //  this.freeText.PatientId = this.patDetail.PatientId;
  //  this.freeText.PatientVisitId = this.patDetail.PatientVisitId;
  //  if (this.freeText) {
  //    this.CallBackFreeTexts.emit({ freetexts: this.freeText });
  //  }
  //}
  onChangeEditorData(data) {
    try {
      this.freeText.FreeText = data;

      this.freeText.PatientId = this.patDetail.PatientId;
      this.freeText.PatientVisitId = this.patDetail.PatientVisitId;
      if (this.freeText) {
        this.CallBackFreeTexts.emit({ freetexts: this.freeText });
      }

    } catch (exception) {
      this.msgBoxServ.showMessage("error", ["Please check log for details error"]);
      this.ShowCatchErrMessage(exception);
    }

  }
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }

}
