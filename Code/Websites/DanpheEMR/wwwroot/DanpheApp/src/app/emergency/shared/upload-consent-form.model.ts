import { FormControl, FormGroup, FormBuilder, Validators } from "@angular/forms";
import * as moment from "moment";

export class UploadCosentFormModel {
  public FileId: number = 0;
  public ERPatientId: number = 0;
  public PatientId: number = 0;
  public FileName: string = '';
  public DisplayName: string = '';
  public FileType: string = '';
  public IsActive: boolean = true;
  public CreatedOn: string = moment().format();
  public CreatedBy: number = 0;
  public ModifiedOn: string = null;
  public ModifiedBy: number = 0;
  public FileUploadValidator:FormGroup=null;

  constructor() {
    var _formBuilder = new FormBuilder();

    this.FileUploadValidator = _formBuilder.group({
        'FileType': ['', Validators.required,],
    });
}

public IsDirty(fieldname): boolean {
  if (fieldname == undefined) {
      return this.FileUploadValidator.dirty;
  }
  else {
      return this.FileUploadValidator.controls[fieldname].dirty;
  }

}
public IsValid():boolean{if(this.FileUploadValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldname, validator): boolean {
  //if nothing's has changed in insurance then return true..
  //else check if the form is valid or not.. <needs revision: Sudarshan 27Dec'16>
  if (!this.FileUploadValidator.dirty) {
      return true;
  }

  if (fieldname == undefined) {
      return this.FileUploadValidator.valid;
  }
  else {

      return !(this.FileUploadValidator.hasError(validator, fieldname));
  }
}
  }


