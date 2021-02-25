import { FormGroup, FormBuilder, Validators } from "@angular/forms";

export class HolidayModel {
     public HolidayId:number=0;
     public FiscalYearId:number=0; 
     public Title :string="";
     public  Description:string=null;
     public CreatedBy:number=0;
     public CreatedOn:string="";
     public IsActive :boolean=true;
     public ApprovedBy :number=0;
     public Date:string=""; 
     public  ModifiedBy :number=0;
     public ModifiedOn :string="";

     public holidayValidator: FormGroup = null;
     constructor() {
          var _formBuilder = new FormBuilder();
          this.holidayValidator = _formBuilder.group({
              'holidayTitle': ['', Validators.required],
              'holidayDate': ['', Validators.required],
          });
      }
      public IsDirty(fieldName): boolean {
          if (fieldName == undefined)
              return this.holidayValidator.dirty;
          else
              return this.holidayValidator.controls[fieldName].dirty;
      }
      public IsValidCheck(fieldName, validator): boolean {
          if (fieldName == undefined) {
              return this.holidayValidator.valid;
          }
          else
              return !(this.holidayValidator.hasError(validator, fieldName));
      }
}