import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';

export class HlpDskBedInfo {
    public BedId: number = 0;
    public BedNumber: number = 0;
    public BedTypeName: string = null;
    public Price: number = 0;
    public IsOccupied: boolean = null;
    public WardName: string = null;
    public WardId: number = 0;
}
