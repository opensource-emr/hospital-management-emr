import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms';
import * as moment from 'moment/moment';
import { LabComponentModel } from '../../shared/lab-component-json.model';

export class LabTestComponentMap {

    public ComponentMapId: number = 0;
    public LabTestId: number = 0;
    public DisplaySequence: number = 100;
    public ComponentId: number = 0;
    public IndentationCount: number = 0;
    public ShowInSheet: boolean = true;
    public CreatedOn: string = null;
    public CreatedBy: number = null;
    public ModifiedOn: string = null;
    public ModifiedBy: number = null;

    public IsActive: boolean = true;

    public LabTestComponent: LabComponentModel = null;
}

