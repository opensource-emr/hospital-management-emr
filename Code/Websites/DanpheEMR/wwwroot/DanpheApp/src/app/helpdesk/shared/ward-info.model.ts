import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';

export class HlpDskWardInfo {
    public WardNamer: string = null;
    public TotalBeds: number = 0;
    public Available: number = 0;
    public Occupied: number = 0;
}
