import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
import { ItemCategoryModel } from '../shared/item-category.model';
import { AccountHeadModel } from '../shared/account-head.model';
import { PackagingTypeModel } from '../shared/packaging-type.model';
import { UnitOfMeasurementModel } from '../shared/unit-of-measurement.model';
import { ItemSubCategoryModel } from './item-subcategory.model';

export class ItemModel {
  public ItemId: number = 0;

  public ItemCategoryId: number = null;
  public SubCategoryId: number = null;
  //public AccountHeadId: number = null;
  public PackagingTypeId: number = null;
  public UnitOfMeasurementId: number = null;
  public Code: string = null;
  public CompanyId: number = 0;
  public ItemName: string = null;
  public ItemType: string = null;
  public Description: string = null;
  public ReOrderQuantity: number = null;
  public MinStockQuantity: number = 0;//sud:25Sept'21--Made Zero from Null since it's mandatory.
  public BudgetedQuantity: number = null;
  public StandardRate: number = 0;
  public VAT: number = 0;
  public UnitQuantity: number = 0;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedBy: number = null;
  public ModifiedOn: string = null;
  public IsActive: boolean = true;
  public UOMName: string = ''; //sanjit: 24 Mar'20
  public IsVATApplicable: boolean = false; //ramesh:2 Apr'20
  public IsCssdApplicable: boolean = false;
  public IsColdStorageApplicable: boolean = false;

  public MSSNO: string = null; // Rajib:11/25/2020 for tilagnga hospital
  public HSNCODE: string = null;// Rajib:12/5/2020 for tilagnga hospital
  public VendorId: number = null;// Rajib:12/5/2020 for tilagnga hospital

  public ItemCategory: Array<ItemCategoryModel> = new Array<ItemCategoryModel>();
  public ItemSubCategory: Array<ItemSubCategoryModel> = new Array<ItemSubCategoryModel>();
  //public AccountHead: Array<AccountHeadModel> = new Array<AccountHeadModel>();
  public PackagingType: Array<PackagingTypeModel> = new Array<PackagingTypeModel>();
  public UnitOfMeasurement: Array<UnitOfMeasurementModel> = new Array<UnitOfMeasurementModel>();

  public ItemValidator: FormGroup = null;
  public IsPatConsumptionApplicable: boolean = false;
  public MaintenanceOwnerRoleId: number = null;
  public RegisterPageNumber:number=null;
  public SubCategoryName:string=null;
  public StoreId: number = null;
  constructor() {

    var _formBuilder = new FormBuilder();
    this.ItemValidator = _formBuilder.group({

      'ItemName': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
      //'ItemType': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
      'ItemCategoryId': ['', Validators.compose([Validators.required])],
      //'AccountHeadId': ['', Validators.compose([Validators.required])],
      //'PackagingTypeId': ['', Validators.compose([Validators.required])],
      'ReOrderQuantity': ['', Validators.compose([Validators.pattern('^(0|[1-9]{1}[0-9]*)$')])],
      'UnitOfMeasurementId': ['', Validators.compose([Validators.required])],
      'MinStockQuantity': ['', Validators.compose([Validators.required, Validators.pattern('^(0|[1-9]{1}[0-9]*)$')])],
      //'BudgetedQuantity': ['', Validators.compose([Validators.required])],
      'StandardRate': ['', Validators.compose([Validators.pattern('^(0|[1-9]{1}[0-9]*)$')])],
      'VAT': ['', Validators.compose([Validators.pattern('^(0|[1-9]{1}[0-9]{0,1})(\.[0-9]{2})?$')])],
      'SubCategoryId': ['', Validators.compose([Validators.required])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.ItemValidator.dirty;
    else
      return this.ItemValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.ItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.ItemValidator.valid;
      //if (this.IsValidTime())
      ////return this.EmployeeValidator.valid;
      //  return this.EmployeeValidator.valid;
      //else
      //   return false;
    }
    else
      return !(this.ItemValidator.hasError(validator, fieldName));
  }
}
