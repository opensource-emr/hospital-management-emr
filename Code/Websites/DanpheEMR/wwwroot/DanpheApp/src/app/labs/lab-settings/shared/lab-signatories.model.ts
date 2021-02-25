import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms';
import * as moment from 'moment/moment';
import { CFGParameterModel } from '../../../settings-new/shared/cfg-parameter.model';
import { Employee } from '../../../employee/shared/employee.model';

export class LabSignatoriesViewModel{
    public AllSignatories: Array<CFGParameterModel> = [];
    public AllDoctors: Array<Employee> = [];
}

