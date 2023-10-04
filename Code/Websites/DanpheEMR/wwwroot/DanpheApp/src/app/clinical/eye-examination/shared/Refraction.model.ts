import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';

export class RefractionModel {
  public Id: number = 0;
  public MasterId: number = 0;
  public Date: string;
  public TimePoint: string = null;
  public UCVA: number = 0;
  public ULett: string = null;
  public NUC: string = null;
  public Sph: number = 0;
  public Cyf: number = 0;
  public Axis: number = 0;
  public BSCVA: number = 0;
  public BLett: string = null;
  public DCNV: string = null;
  public CreatedBy: number = 0;
  public CreatedOn: Date = new Date();
  public IsOD: boolean;

  constructor() {

  }
  dateValidator(control: FormControl): { [key: string]: boolean } {
    var currDate = moment().format('YYYY-MM-DD HH:mm');
    if (control.value) { // gets empty string for invalid date such as 30th Feb or 31st Nov)
      if ((moment(control.value).diff(currDate) > 0)
        || (moment(currDate).diff(control.value, 'years') > 200)) //can select date upto 200 year past from today.
        return { 'wrongDate': true };
    }
    else
      return { 'wrongDate': true };
  }

}
