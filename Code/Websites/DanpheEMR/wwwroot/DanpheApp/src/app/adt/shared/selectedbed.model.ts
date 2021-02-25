import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import { BedInformation } from "./bedinformation.model";

export class selectedbed
{
    
    public PatientId: number = 0;
    public PatientAdmissionId: number = 0;
    public PatientVisitId: number = 0;

    public MSIPAddressInfo: string = null;
    public PatientCode: number = 0;
    public DischargedDate: string = null;
    public Name: string = null;
    public BedInformation: BedInformation = new BedInformation();
}

