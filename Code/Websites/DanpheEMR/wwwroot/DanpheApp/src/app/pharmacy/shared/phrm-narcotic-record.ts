import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';

export class PHRMNarcoticRecordModel {
    public NarcoticRecordId: number = 0;
    public BuyerName: string = null;
    public EmployeId: number = 0;
    public DoctorName: string = null;
    public NMCNumber: string = null;
    public Batch: string = null;
    public Refill: string = null;
    public ImgUrl: string = null;
    //public NarcoticsValidator: FormGroup = null;

    //constructor() {
    //    var _formBuilder = new FormBuilder();
    //    this.NarcoticsValidator = _formBuilder.group({
    //        'BuyerName': ['', Validators.compose([Validators.required])],
    //        'DoctorName': ['', Validators.compose([Validators.required])],
    //        'NMCNumber': ['', Validators.compose([Validators.required])],
    //    });
    //}
    //public IsDirty(fieldName): boolean {
    //    if (fieldName == undefined)
    //        return this.NarcoticsValidator.dirty;
    //    else
    //        return this.NarcoticsValidator.controls[fieldName].dirty;
    //}

    //public IsValid(fieldName, validator): boolean {

    //    if (fieldName == undefined)
    //        return this.NarcoticsValidator.valid;
    //    else
    //        return !(this.NarcoticsValidator.hasError(validator, fieldName));
    //}
}