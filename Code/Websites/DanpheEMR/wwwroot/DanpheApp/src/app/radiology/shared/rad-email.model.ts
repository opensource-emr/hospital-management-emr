import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
export class RadEmailModel {

  public EmailAddress: string = null;
  public Subject: string = null;
  public PlainContent: string = null;
  public HtmlContent: string = null;
  public PdfBase64: string = null;
  public AttachmentFileName: string = null;
  public SenderEmailAddress: string = null;
  public SenderTitle: string = null;
  public SendPdf: boolean = false;
  public SendHtml: boolean = false;

  public EmailList: Array<string> = new Array<string>();


  public RadEmailValidator: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.RadEmailValidator = _formBuilder.group({
      'EmailAddress': ['', Validators.compose([Validators.required])],
      'Subject': ['', Validators.compose([Validators.required])]
         });
  }


  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.RadEmailValidator.dirty;
    else
      return this.RadEmailValidator.controls[fieldName].dirty;
  }

  public IsValid(fieldName, validator): boolean {
    if (fieldName == undefined)
      return this.RadEmailValidator.valid;
    else
      return !(this.RadEmailValidator.hasError(validator, fieldName));
  }

  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined)
      return this.RadEmailValidator.valid;
    else
      return !(this.RadEmailValidator.hasError(validator, fieldName));
  }

}
