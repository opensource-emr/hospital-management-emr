import { FormGroup, FormArray, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { ENUM_ValidatorTypes } from './shared-enums';


export class CommonValidators {


  public static positivenum(control: AbstractControl): { [key: string]: boolean } | null {
    if ((isNaN(control.value) || control.value <= 0)) {
      return { 'positivenum': true };
    }
    return null;
  }

  //whether or not to allow number more than 1. needed in some cases like billing-transaction. Sud:18Feb'20
  multipleQtyValidator(control: FormControl): { [key: string]: boolean } {
    if (control) {
      if (control.value > 1)
        return { 'invalidQty': true };
    }
  }

  //dynamically compose a validator for given formGroup(modelValidatorName).
  //validator types can be added as required. Sud:18Feb'20
  public static ComposeValidators(modelValidatorName: FormGroup, formControlName: string, validatorTypes: Array<ENUM_ValidatorTypes>) {
    let validator = null;
    let validatorArr: Array<ValidatorFn> = [];

    if (validatorTypes && validatorTypes.length > 0) {

      validatorTypes.forEach(curValTypeName => {
        if (curValTypeName == ENUM_ValidatorTypes.required) {
          validatorArr.push(Validators.required);
        }
        if (curValTypeName == ENUM_ValidatorTypes.phoneNumber) {
          validatorArr.push(Validators.pattern('^[0-9]{0,10}$'));
        }
        if (curValTypeName == ENUM_ValidatorTypes.positiveNumber) {
          validatorArr.push(CommonValidators.positivenum);
        }
        if (curValTypeName == ENUM_ValidatorTypes.maxLength100) {
          validatorArr.push(Validators.maxLength(100))
        }

      });
    }
    validator = Validators.compose(validatorArr);
    modelValidatorName.controls[formControlName].validator = validator;
    modelValidatorName.controls[formControlName].updateValueAndValidity();
  }

  //this is to enable or disable certain control inside a formgroup (we've called the FormGroup as Vaidators in all modules, so naming convition is kept as it is.)
  //Sud:18Feb'20
  public static EnableOrDisableFormControl(modelValidatorName: FormGroup, formControlName: string, isDisabled: boolean) {
    let currCtrol = modelValidatorName.controls[formControlName];
    if (currCtrol) {
      if (isDisabled) {
        currCtrol.disable();
      }
      else {
        currCtrol.enable();
      }
    }
  }


}
