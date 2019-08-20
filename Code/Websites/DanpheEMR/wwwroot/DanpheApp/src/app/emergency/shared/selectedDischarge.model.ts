import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms';

export class SelectedPatForDischargeModel {
    public ModuleName: string = null;

    public Name: string = null;
    public VisitCode: string = null;
    public PatientId: number = null;
    public PatientVisitId: number = null;
    public PatientCode: string = null;
    public IsSubmitted: boolean = null;
    public BillStatusOnDischarge: string = null;
    public DischargedDate: string = null;
    public AdmittedDate: string = null;
    public AdmittingDoctorId: number = null;
    public AdmittingDoctorName: string = null;
    public Address: string = null;
    public DateOfBirth: string = null;
    public Gender: string = null;
    public PhoneNumber: string = "";
    public AdmissionStatus: string = null;
    public BedInformation: any = null;

}

