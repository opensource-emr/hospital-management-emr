import { FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';


export class CommonValidators {
    public static positivenum(control: AbstractControl): { [key: string]: boolean } | null {
        if ((isNaN(control.value) || control.value <= 0)) {
            return { 'positivenum': true };
        }
        return null;
    }


}
//abc
//let usr= new User();
//let objProp =  usr.UserName;
//  if(usr!=null && urs.UserName !='')