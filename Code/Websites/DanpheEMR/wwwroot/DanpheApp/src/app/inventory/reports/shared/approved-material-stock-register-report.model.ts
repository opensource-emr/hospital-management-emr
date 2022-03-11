import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
  } from '@angular/forms';
  import * as moment from 'moment/moment';
  export class ApprovedMaterialStockRegisterReportModel { 

    public FromDate: string = "";
    public ToDate: string = "";
    public MSSNO: string = null;
    public ItemNmae: string = null;
    public VendorName: string = null;
    public LocationInStores: string = null;
    

    public ApprovedMaterialStockRegisterValidator: FormGroup = null;

    constructor() {
  
      var _formBuilder = new FormBuilder();
      this.ApprovedMaterialStockRegisterValidator = _formBuilder.group({
        'FromDate': ['', Validators.compose([Validators.required, this.dateValidatorsForPast])],
        'ToDate': ['', Validators.compose([Validators.required, this.dateValidator])],
      });
    }
  
    dateValidator(control: FormControl): { [key: string]: boolean } {
      var currDate = moment().format('YYYY-MM-DD HH:mm');
      if (control.value) {
        if ((moment(control.value).diff(currDate) > 0)
          || (moment(currDate).diff(control.value, 'years') > 200))
          return { 'wrongDate': true };
      } else {
        return { 'wrongDate': true };
      }
    }
  
    dateValidatorsForPast(control: FormControl): { [key: string]: boolean } {
      var currDate = moment().format('YYYY-MM-DD');
      if (control.value) {
        if ((moment(control.value).diff(currDate) > 0)
          || (moment(currDate).diff(control.value, 'years') < -200))
          return { 'wrongDate': true };
      } else {
        return { 'wrongDate': true };
      }
    }
  
    public IsDirty(fieldName): boolean {
      if (fieldName == undefined) {
        return this.ApprovedMaterialStockRegisterValidator.dirty;
      }
      else {
        return this.ApprovedMaterialStockRegisterValidator.controls[fieldName].dirty;
      }
    }
  
    public IsValid(): boolean { if (this.ApprovedMaterialStockRegisterValidator.valid) { return true; } else { return false; } }
    public IsValidCheck(fieldName, validator): boolean {
      if (fieldName == undefined) {
        return this.ApprovedMaterialStockRegisterValidator.valid;
      } else {
        return !(this.ApprovedMaterialStockRegisterValidator.hasError(validator, fieldName));
      }
    }

   }