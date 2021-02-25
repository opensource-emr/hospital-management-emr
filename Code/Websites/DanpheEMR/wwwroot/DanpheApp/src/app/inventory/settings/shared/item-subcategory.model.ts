import {
      NgForm,
      FormGroup,
      FormControl,
      Validators,
      FormBuilder,
      ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';


export class ItemSubCategoryModel {
      public SubCategoryId: number = 0;
      public SubCategoryName: string = null;
      public Code: string = null;
      public AccountHeadId: number = null;
      public AccountHeadName: string = null;
      public Description: string = null;
      public CreatedBy: number = 0;
      public CreatedOn: string = null;
      public IsActive: boolean = true;
      public IsConsumable: boolean = null;

      public ItemSubCategoryValidator: FormGroup = null;
      public LedgerName: string = null;
      public LedgerId: number = null;
      constructor() {

            var _formBuilder = new FormBuilder();
            this.ItemSubCategoryValidator = _formBuilder.group({
                  'SubCategoryName': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
                  //'LedgerId': ['', Validators.compose([Validators.required])],
                  'IsConsumable': ['', Validators.compose([Validators.required])],
                  'Code': ['', Validators.compose([Validators.maxLength(4), Validators.minLength(4), Validators.pattern("([A-Z]*)?([0-9]*)")])]
            });
      }

      public IsDirty(fieldName): boolean {
            if (fieldName == undefined)
                  return this.ItemSubCategoryValidator.dirty;
            else
                  return this.ItemSubCategoryValidator.controls[fieldName].dirty;
      }

      public IsValid(): boolean { if (this.ItemSubCategoryValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
            if (fieldName == undefined) {
                  return this.ItemSubCategoryValidator.valid;
            }
            else
                  return !(this.ItemSubCategoryValidator.hasError(validator, fieldName));
      }
}
