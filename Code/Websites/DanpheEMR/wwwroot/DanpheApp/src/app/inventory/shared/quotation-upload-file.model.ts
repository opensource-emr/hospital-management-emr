import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';

export class QuotationUpLoadFileModel {
     public QuotationUploadedFileId:number = 0;
    
      public QuotationId:number =0;
       public RequestForQuotationId: number =0;
       public ROWGUID: string=null;
       public FileType: string = null;
       public VendorId:number = null;
       public VendorName:string = "";
       public FileBinaryData: string ="";
       public FileName: string ="";
       public FileNo: number = 0;
       public FileExtention:string = "";
       public UpLoadedOn: string ="";
      public UpLoadedBy: number = null;
      public url:string = null;
     //  public Quantity:number =0;
      public SelectedItem: any = null;
  public QuotationFileValidator: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();

    this.QuotationFileValidator = _formBuilder.group({
        'Vendorname': ['', Validators.required,],
    });
}

public IsDirty(fieldname): boolean {
    if (fieldname == undefined) {
        return this.QuotationFileValidator.dirty;
    }
    else {
        return this.QuotationFileValidator.controls[fieldname].dirty;
    }

}

public IsValid():boolean{if(this.QuotationFileValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldname, validator): boolean {
   
    if (!this.QuotationFileValidator.dirty) {
        return true;
    }

    if (fieldname == undefined) {
        return this.QuotationFileValidator.valid;
    }
    else {

        return !(this.QuotationFileValidator.hasError(validator, fieldname));
    }
}
}