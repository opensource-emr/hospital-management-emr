import {
    FormGroup,
    Validators,
    FormBuilder,
  } from '@angular/forms';
  
  export class FilmTypeValidatorModel {
    public FilmType: string = '';
    public FilmTypeValidator: FormGroup = null;
  
    constructor() {
  
      var _formBuilder = new FormBuilder();
      this.FilmTypeValidator = _formBuilder.group({
        'FilmType': ['', Validators.compose([Validators.required])],
      });
    }
    public IsDirty(fieldName): boolean {
      if (fieldName == undefined)
        return this.FilmTypeValidator.dirty;
      else
        return this.FilmTypeValidator.controls[fieldName].dirty;
    }
  
    public IsValid(): boolean { if (this.FilmTypeValidator.valid) { return true; } else { return false; } }
     public IsValidCheck(fieldName, validator): boolean {
      if (fieldName == undefined)
        return this.FilmTypeValidator.valid;
      else
        return !(this.FilmTypeValidator.hasError(validator, fieldName));
    }
    //Dynamically add validator
    public UpdateValidator(onOff: string, formControlName: string, validatorType: string) {
      let validator = null;
      if (validatorType == 'required' && onOff == "on") {
        validator = Validators.compose([Validators.required]);
      }
      else {
        validator = Validators.compose([]);
      }
      this.FilmTypeValidator.controls[formControlName].validator = validator;
      this.FilmTypeValidator.controls[formControlName].updateValueAndValidity();
    }
  }
  