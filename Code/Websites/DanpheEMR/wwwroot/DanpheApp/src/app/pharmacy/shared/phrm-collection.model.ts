import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';


export class PharmacyCollection {
    public CounterId: number = null;
    public UserId: number = null;
    public CounterName: string = null;
    public UserName: string = null;
    public CounterSale: number = 0;
    public UserSale: number = 0;
    public TotalSale: number = null;

}
