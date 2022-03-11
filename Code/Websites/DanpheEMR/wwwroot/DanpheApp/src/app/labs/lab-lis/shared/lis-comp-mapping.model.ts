import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms';
import * as moment from 'moment/moment';
import { LabComponentModel } from '../../shared/lab-component-json.model';

export class LabToLisComponentMap {
    public LISComponentMapId: number = 0;
    public ComponentId: number;
    public LISComponentId: number;
    public MachineId: number;
    public IsActive: boolean = true;
    public ConversionFactor: number;
}

export class LabToLisComponentMapTemp {
    public DanpheComponent: any;
    public LISComponent: any;
    public IsDuplicate: boolean;
    public ConversionFactor: number = 1;

    public IsValidComponent: boolean = true;
    public IsValidLISComponent: boolean = true;
}


