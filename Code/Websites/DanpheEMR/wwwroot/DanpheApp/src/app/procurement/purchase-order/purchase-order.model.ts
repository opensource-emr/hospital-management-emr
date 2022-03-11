import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { ItemMaster } from '../../inventory/shared/item-master.model';
import { VendorMaster } from '../../inventory/shared/vendor-master.model';
import { PurchaseOrderItems } from "./purchase-order-items.model";
import { ENUM_GRItemCategory } from "../../shared/shared-enums";
import * as moment from 'moment/moment';

export class PurchaseOrder {
  public PurchaseOrderId: number = 0;
  public PurchaseOrderNo: number = 0;
  public PoDate: string = moment().format('YYYY-MM-DD');
  public DeliveryDate: string;
  public RequisitionId: number = null;
  public PRNumber: number = null;
  public VendorId: number = null;
  public POStatus: string = null;
  public PerformanceInvoiceNo: string = null;
  public SARFNo: string = null;
  public SubTotal: number = null;
  public VAT: number = 0;
  public TotalAmount: number = 0;
  public PORemark: string = null;
  public CreatedBy: number = 0;
  public CreatedOn: string = null;
  public CancelledBy: number;
  public CancelledOn: string = null;
  public CancelRemarks: string = "";
  public TermsConditions: string = null;
  public VendorName: string = "";
  public VendorNo: string = "";
  public VendorPANNumber: string = "";//sud:20Sep'21--It's used in np-po-view, which is giving prod build issue if not added here..
  public VATAmount: number = 0;
  public Terms: string = "";
  public VendorAddress: string = "";
  public ModifiedBy: number = null;
  public ModifiedOn: Date = null;
  public IsCancel: boolean = false;
  public CurrencyId: number = null;

  public PurchaseOrderItems: Array<PurchaseOrderItems> = new Array<PurchaseOrderItems>();
  public PurchaseOrderValidator: FormGroup = null;

  //sanjit: added for verification purpose
  public IsVerificationEnabled: boolean = false;
  public VerifierList: POVerifier[] = [];
  public CurrentVerificationLevel: number;
  public MaxVerificationLevel: number;
  public CurrentVerificationLevelCount: number;
  public VerificationStatus: string;
  public IsVerificationAllowed: boolean = false;
  public VerifierIds: string;
  public Item: ItemMaster = null;
  public Vendor: VendorMaster = null;
  public InvoiceHeaderId: number = null;
  public IsModificationAllowed: boolean = true;

  public BankDetails: string = "";
  public Email: string = "";
  public MSSNO: string = null;
  
  public ContactPerson: string = "";
  
  public CurrencyCode: string = null;
  public POCategory: string = ENUM_GRItemCategory.Consumables;
  public HSNNO: string = null;
  public StoreId: number;
  public PRDate: string = "";//sud:8May'19--needed in po-np-view.html > to resolve prod-build issue.
  public POGroupId: number;
  //below fields are addded for internal Inventory purpose.
  public ReferenceNo: string = "";
  public InvoicingAddress: string = "";
  public DeliveryAddress: string = "";
  public ContactPersonName: string = "";
  public ContactPersonEmail: string = "";

  constructor() {

    var _formBuilder = new FormBuilder();
    this.PurchaseOrderValidator = _formBuilder.group({
      'VendorId': ['', [Validators.required, this.registeredVendorValidator]],
      'CurrencyCode': ['', Validators.required],
    });
  }
  ngOnInit() {
    this.PurchaseOrderValidator.get('VendorId').valueChanges.subscribe(() => {
      this.PurchaseOrderValidator.updateValueAndValidity();
    });
  }

  /**
   * perform calculations and update the item level amounts such as Subtotals, Vats, Total Amounts
   * @public
   * @description created by Sanjit
   */
  calculateAndUpdateAmounts() {
    this.resetCalculation();
    for (var i = 0; i < this.PurchaseOrderItems.length; i++) {
      let item = this.PurchaseOrderItems[i];
      let isItemValid = item.PurchaseOrderItemValidator.valid;
      if (isItemValid) {
        let itemSubTotal = item.StandardRate * item.Quantity
        item.VATAmount = (itemSubTotal * item.VatPercentage) / 100;
        item.TotalAmount = itemSubTotal + item.VATAmount;

        this.SubTotal += itemSubTotal;
        this.VATAmount += item.VATAmount;
        this.VAT += item.VATAmount;
        this.TotalAmount += item.TotalAmount;
      }
    }
  }
  private resetCalculation() {
    this.SubTotal = 0;
    this.VAT = 0;
    this.VATAmount = 0;
    this.TotalAmount = 0;
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.PurchaseOrderValidator.dirty;
    else
      return this.PurchaseOrderValidator.controls[fieldName].dirty;
  }


  public IsValid(): boolean { if (this.PurchaseOrderValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.PurchaseOrderValidator.valid;
    }
    else
      return !(this.PurchaseOrderValidator.hasError(validator, fieldName));
  }


  registeredVendorValidator(control: FormControl): { [key: string]: boolean } {
    if (control.value && typeof (control.value) == "object" && control.value.VendorId > 0)
      return;
    else
      return { 'notRegisteredVendor': true };
  }

  public updateItemDuplicationStatus() {
    if (this.PurchaseOrderItems) {
      for (var i = 0; i < this.PurchaseOrderItems.length; i++) {
        // for any this-item, if there exists another this-item with same ItemId but in different index, then we must set them as duplicates
        this.PurchaseOrderItems[i].isItemDuplicate = this.PurchaseOrderItems.some((thisitem, index) => thisitem.ItemId == this.PurchaseOrderItems[i].ItemId && index != i);
      }
    }
  }
}

export class POVerifier {
  Id: number;
  Name: string = "";
  Type: string = "";
}
