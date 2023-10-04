import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';

export class HlpDskEmployeeInfo {
    //public EmployeeId : number = 0;
    public EmployeeName :string = null;
    public Designation :string = null;
    public DepartmentName :string = null;
    public ContactNumber: string = null;
    public Extension: string = null;
    public SpeedDial: string = null;
    public OfficeHour: string = null;
    public RoomNumber: string = null;
}
