import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
  } from "@angular/forms"
  import * as moment from "moment";
  
  export class StockTransferModel {
    public TargetStoreId: number;
    public SourceStoreId: number;
    public TransferredQuantity: number = 0;
    public CreatedBy: number = 0;
    public CreatedOn: Date = null;
    public ReceivedBy: string = "";
    //ony for Display
    public TransferredDate: string = moment().format("YYYY-MM-DD");
    public ItemId: number = 0;
    public Code: string;
    public UOMName: string;
    public BatchNo: string;
    public ExpiryDate: string;
    public AvailableQuantity: number = 0;
    public ItemName: string = "";
    public IsDisQtyValid: boolean = true;
    public StoreRackName: string;
    public MRP: number;
    public CostPrice: number;
    public StandardRate: number;
    public ItemRemarks: string;
    public Remarks: string;
    public ReceivedRemarks: string;
    public SelectedItem: any;
  
    public StockTransferValidator: FormGroup = null;
    constructor() {
      var _formBuilder = new FormBuilder();
      this.StockTransferValidator = _formBuilder.group({
        //'TargetStoreId': ['', Validators.required],
        'TransferredQuantity': ['', Validators.compose([Validators.required])],
        'ItemName': ['', Validators.compose([Validators.required])],
      });
  
    }
  
    public IsDirty(fieldName): boolean {
      if (fieldName == undefined)
        return this.StockTransferValidator.dirty;
      else
        return this.StockTransferValidator.controls[fieldName].dirty;
    }
  
  
    public IsValid(): boolean { if (this.StockTransferValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
      if (fieldName == undefined) {
        return this.StockTransferValidator.valid;
      }
      else
        return !(this.StockTransferValidator.hasError(validator, fieldName));
    }
  
  }
  