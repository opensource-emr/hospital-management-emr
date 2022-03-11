import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from "@angular/forms";
export class LabCategoryModel {
  public TestCategoryId: number = 0;
  public TestCategoryName: string = null;
  public CreatedOn: string = null;
  public CreatedBy: number = null;
  public ModifiedOn: string = null;
  public ModifiedBy: number = null;
  public IsDefault: boolean = false;
  public IsActive: boolean = true;
}
