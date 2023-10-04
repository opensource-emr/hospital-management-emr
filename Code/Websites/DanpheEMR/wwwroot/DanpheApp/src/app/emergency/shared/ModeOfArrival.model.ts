import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';

export class ModeOfArrivalModel {
  public ModeOfArrivalId: number = null;
  public ModeOfArrivalName: string = null;
  public IsActive: boolean = null;
  public CreatedBy: number = null;
  public CreatedOn: number = null;
  public ModifiedBy: number = null;
  public ModifiedOn: number = null; 
}
