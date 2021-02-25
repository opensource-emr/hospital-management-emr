import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'

export class PriceCategory {
  
  public PriceCategoryId: number = 0;
  public PriceCategoryName: string = null;
  public DisplayName: string = null;
  public BillingColumnName: string = null;
  public IsDefault: boolean = false;

  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public IsActive: boolean = true;
 
  constructor() {

   
  }
  

}
