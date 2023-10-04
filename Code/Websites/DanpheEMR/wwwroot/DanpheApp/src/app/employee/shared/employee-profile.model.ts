import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'

export class EmployeeProfile {
    public EmployeeId: number = null; 
    public Salutation: string = null;
    public FirstName: string = null;
    public MiddleName: string = null;
    public LastName: string = null;
    public DateOfBirth: string = null;
    public DateOfJoining: string = null;
    public Department: string = null;
    public Email: string = null; 
    public ContactNumber: string = null;
    public ContactAddress: string = null;
    public ImageFullPath: string = null;
    public ImageName: string = null;
    public UserName: string = null;
}
