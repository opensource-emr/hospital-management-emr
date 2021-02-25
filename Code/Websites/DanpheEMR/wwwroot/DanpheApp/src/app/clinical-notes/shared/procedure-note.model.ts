import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import * as moment from "moment/moment"


export class ProcedureNotesModel {

    public ProcedureNoteId: number = 0;
    public Date = moment().format("YYYY-MM-DD");
    public PatientId: number = 0;
    public PatientVisitId: number = 0;
    public LinesProse: string = null;
    public Site: string = null;
    public Remarks: string = null;
    public FreeText: string = null
    public NotesId: number = 0;
    public CreatedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedBy: number = null;
    public ModifiedOn: string = null;
    public IsActive: boolean = true;
    public ProcedureNoteValidator: FormGroup = null;



    //constructor() {
    //    var _formBuilder = new FormBuilder();
    //    this.ProcedureNoteValidator = _formBuilder.group({
    //        '': ['', Validators.compose([Validators.maxLength(2000)])],
    //        '': ['', Validators.compose([Validators.maxLength(2000)])],
    //        '': ['', Validators.compose([Validators.maxLength(2000)])]
    //    });
    //}


}
