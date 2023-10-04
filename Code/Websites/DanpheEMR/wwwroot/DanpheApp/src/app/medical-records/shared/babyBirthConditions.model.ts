import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

export class BabyBirthConditionModel {
  public BabyBirthConditionId: number = 0;
  public BirthConditionType: string = null;
  public DischargeConditionId: number = null;
}
