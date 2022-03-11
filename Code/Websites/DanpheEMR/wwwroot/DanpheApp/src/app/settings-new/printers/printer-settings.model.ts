import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export class PrinterSettingsModel {

  public PrinterSettingId: number = 0;//make this as identity(1,1), PK.
  public PrintingType: string = 'browser';//available values: [browser,dotmatrix,server] -- make a dropdown in UI.
  public GroupName: string = null;//available values: [bill-receipt,reg-sticker,lab-sticker,phrm-receipt]
  public PrinterDisplayName: string = null;
  public PrinterName: string = null;
  public ModelName: string = null;
  public Width_Lines: number = 0;
  public Height_Lines: number = 0;
  public HeaderGap_Lines: number = 0;
  public FooterGap_Lines: number = 0;
  public mh: number = 0;//this is specific to Dotmatrix>EPSON printer.
  public ml: number = 0;//this is specific to Dotmatrix>EPSON printer.
  public ServerFolderPath: string = null;//specific to server PrintingType='server'
  public Remarks: string = null;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedBy: number = null;
  public ModifiedOn: string = null;
  public IsActive: boolean = true;

  public PrinterSettingsValidator: FormGroup = null;


  constructor() {
    var _formBuilder = new FormBuilder();
    this.PrinterSettingsValidator = _formBuilder.group({
      'GroupName': ['', Validators.compose([Validators.required])],
      'PrinterDisplayName': ['', Validators.compose([Validators.required])],
      //'PrinterName': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined) {
      return this.PrinterSettingsValidator.dirty;
    }

    else
      return this.PrinterSettingsValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.PrinterSettingsValidator.valid) {
      return true;
    }
    else {
      return false;
    }
  }

  public IsValidCheck(fieldName, validator): boolean {

    if (fieldName == undefined) {
      return this.PrinterSettingsValidator.valid;
    }
    else {
      return !(this.PrinterSettingsValidator.hasError(validator, fieldName));
    }

  }

}


export enum ENUM_PrintingType {
  browser = "browser",
  dotmatrix = "dotmatrix",
  server = "server",
  receiptDotMatrix = "receipt-dotmatrix"
}

export enum ENUM_PrintingGroupName {
  bill_receipt = "bill-receipt",
  phrm_receipt = "phrm-receipt",
  reg_sticker = "reg-sticker",
  lab_sticker = "lab-sticker"
}

export enum ENUM_PrinterModels {
  LQ_310 = "LQ-310",
  LX_310 = "LX-310"
}