import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'

export class BedInformation
{
    public BedId: number = 0;
    public BedCode: number = 0;
    public BedNumber: number = 0;
    public BedFeatureId: number = 0;
    public PatientBedInfoId: number = 0;

    public BedFeature: string = null;
    public Ward: string = null;
    public AdmittedDate: string = null;
    public StartedOn: string = null;
}

