import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms'
import * as moment from 'moment/moment';

export class EyeScanModel {

  public PatientFileId: number = 0;
  public PatientId: number = 0;
  /// public ROWGUID: any = null;
  public FileType: string = "";
  public Title: string = "";
  public UploadedOn: string = moment().format("YYYY-MM-DD");;
  public UploadedBy: number = 0;
  public Description: string = null;
  public FileBinaryData: string = "";
  public FileName: string = "";
  public FileExtention: string = "";
  public EyeScanValidator: FormGroup = null;
  public IsActive: boolean = true;
  public FileBase64String: string = null;

  constructor() {
    var _formBuilder = new FormBuilder();

    this.EyeScanValidator = _formBuilder.group({
      'Title': ['', Validators.required,],
    });
  }

  public IsDirty(fieldname): boolean {
    if (fieldname == undefined) {
      return this.EyeScanValidator.dirty;
    }
    else {
      return this.EyeScanValidator.controls[fieldname].dirty;
    }

  }

  public IsValid(): boolean { if (this.EyeScanValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldname, validator): boolean {
    //if nothing's has changed in insurance then return true..
    //else check if the form is valid or not.. <needs revision: Sudarshan 27Dec'16>
    if (!this.EyeScanValidator.dirty) {
      return true;
    }

    if (fieldname == undefined) {
      return this.EyeScanValidator.valid;
    }
    else {

      return !(this.EyeScanValidator.hasError(validator, fieldname));
    }
  }
}
