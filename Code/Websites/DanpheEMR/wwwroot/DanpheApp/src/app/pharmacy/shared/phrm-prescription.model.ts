
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'
import * as moment from 'moment/moment';
import { PHRMPrescriptionItem } from "./phrm-prescription-item.model";

export class PHRMPrescription {
    public PrescriptionId: number = 0;
    public PatientId: number = null;
    // public ProviderId: number = null;
    public PrescriberId: number = null; // Krishna, 17th,jun'22, changed ProviderId to PrescriberId.
    public Notes: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    // public ProviderFullName: string = null; 
    public PrescriberName: string = null; // Krishna, 17th,jun'22, changed ProviderName to PrescriberName..
    public IsInPatient: boolean = true;
    public PrescriptionStatus: string = null;
    public PHRMPrescriptionItems: Array<PHRMPrescriptionItem> = new Array<PHRMPrescriptionItem>();
    public PHRMPrescriptionValidator: FormGroup = null;
    //only for show into grid list
    public PatientName: string = null;
    public CreatedByName: string = null;
    public PatientCode: string = null;
    //Constructor of class
    constructor() {
        var _formBuilder = new FormBuilder();
        this.PHRMPrescriptionValidator = _formBuilder.group({
            'PrescriberId': ['', Validators.compose([]),],
            'PrescriberName': ['', Validators.compose([]),],
        });
    }

    //Check is dirt or not control
    public IsDirty(fieldname): boolean {
        if (fieldname == undefined) {
            return this.PHRMPrescriptionValidator.dirty;
        }
        else {
            return this.PHRMPrescriptionValidator.controls[fieldname].dirty;
        }
    }
    //Check Is valid or not control
    public IsValid():boolean{if(this.PHRMPrescriptionValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldname, validator): boolean {
        if (this.PHRMPrescriptionValidator.valid) {
            return true;
        }
        if (fieldname == undefined) {
            return this.PHRMPrescriptionValidator.valid;
        }
        else {
            return !(this.PHRMPrescriptionValidator.hasError(validator, fieldname));
        }
    }
    //conditional sets ON and OFF the validation on provider id and provider fullname in case of indoor or outdoor patient
    public UpdateValidator(onOff: string, formControlName: string) {
        let validator = null;
        if (formControlName == "PrescriberId" && onOff == "on") {
            this.PHRMPrescriptionValidator.controls['PrescriberId'].validator = Validators.compose([Validators.required]);
            this.PHRMPrescriptionValidator.controls['PrescriberName'].validator = Validators.compose([]);
        } else {
            this.PHRMPrescriptionValidator.controls['PrescriberName'].validator = Validators.compose([Validators.required, Validators.maxLength(30)]);
            this.PHRMPrescriptionValidator.controls['PrescriberId'].validator = Validators.compose([]);
        }
    }
}