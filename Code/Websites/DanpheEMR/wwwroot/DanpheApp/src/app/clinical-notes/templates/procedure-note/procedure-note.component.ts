import { Component, EventEmitter, Output, Input } from '@angular/core'
import { Visit } from '../../../appointments/shared/visit.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ProcedureNotesModel } from '../../shared/procedure-note.model';
import { NoteTemplateBLService } from '../../shared/note-template.bl.service';


@Component({
    selector:"procedure-notes",
    templateUrl: "./procedure-note.html",
})


export class ProcedureNoteComponent {
    //@Input("procedureNote")
    public procedureNote: ProcedureNotesModel = new ProcedureNotesModel();
    public SelecetdItemList: Array<ProcedureNotesModel> = [];
    public patDetail: Visit = new Visit();
    public patVisit: Visit = new Visit();
  constructor(public messageBoxService: MessageboxService,
    public notetemplateBLService: NoteTemplateBLService,) {
        this.AddRow();
    }

  @Input("patDetail")
  public set obtainPatDetail(val: any) {
    this.patDetail = val ? val : "";
      console.log(this.patDetail);
      //this.Focusit();
  }

  @Input("editProcedureNote")
  public set procedureNoteForEdit(pn: any) {
    if (this.notetemplateBLService.NotesId != 0) {
      this.procedureNote = pn;
    }
  }
   
   @Output("callback-procedurenotes")
   public CallBackProcedureNotes: EventEmitter<Object> = new EventEmitter<Object>();


    AddRow() {
        try {
            var tempSale: ProcedureNotesModel = new ProcedureNotesModel();
            this.SelecetdItemList.push(tempSale);
        }
        catch (exception) {
            this.messageBoxService.showMessage("Error", [exception]);
        }
    }

    DeleteRow(index) {
        try {
            this.SelecetdItemList.splice(index, 1);
            if (this.SelecetdItemList.length == 0) {
                this.AddRow();
            }
   
        }
        catch (exception) {
            this.messageBoxService.showMessage("Error", [exception]);
        }
    }

  //ngOnChanges() {
  // // this.CallBackProcedureNotes.emit({ procedurenote: this.procedureNote });
  //}

  Focusit() {
    this.procedureNote.PatientId = this.patDetail.PatientId;
    this.procedureNote.PatientVisitId = this.patDetail.PatientVisitId;
    if (this.procedureNote) {
      this.CallBackProcedureNotes.emit({ procedurenote: this.procedureNote });
    }
  }
 

}
