import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import { CommonValidators } from "./../../shared/common-validator";
import { ItemMaster } from './item-master.model';
import { RequestForQuotationModel } from './request-for-quotaion.model';

export class RequestForQuotationItemsModel{
    public ReqForQuotationItemId:number =0;
    public ReqForQuotationId: number = 0;
    public ItemId: number = 0;
    public VendorId:number = 0;
    public Quantity:number = 0;
    public ItemName:string = "";
    public TitleName: string ="";
    public Code:string="";
    public UOMName:string="";
    public Description: string="";
    public CreatedBy: number =0;
    public CreatedOn: string ="";
    public ItemStatus: string = null;
    public SelectedItem: ItemMaster = null;
    public Item: ItemMaster = null;
    public ReqForQuotationItemValidator: FormGroup = null;


 constructor() {

     var _formBuilder = new FormBuilder();
     this.ReqForQuotationItemValidator = _formBuilder.group({
         'ItemId': ['', Validators.compose([Validators.required])],
         'Quantity': ['', Validators.compose([Validators.required, CommonValidators.positivenum])],
     });
 }

 public IsDirty(fieldName): boolean {
     if (fieldName == undefined)
         return this.ReqForQuotationItemValidator.dirty;
     else
         return this.ReqForQuotationItemValidator.controls[fieldName].dirty;
 }


 public IsValid():boolean{if(this.ReqForQuotationItemValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
     if (fieldName == undefined) {
         return this.ReqForQuotationItemValidator.valid;
     }
     else
         return !(this.ReqForQuotationItemValidator.hasError(validator, fieldName));
 }

 }
