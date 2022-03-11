import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { PurchaseOrder } from "./purchase-order.model";
import { CommonValidators } from "./../../shared/common-validator";
import { ItemMaster } from '../../inventory/shared/item-master.model';

export class PurchaseOrderItems {
  public PurchaseOrderItemId: number = 0;
  public ItemId: number = 0;
  public PurchaseOrderId: number = 0;
  public POItemSpecification: string = '';
  public Quantity: number = null;
  public StandardRate: number = 0;
  public TotalAmount: number = 0;
  public ReceivedQuantity: number = 0;
  public PendingQuantity: number = 0;
  public DeliveryDays: number = 0;
  public AuthorizedRemark: string = null;
  public Remark: string = null;
  public AuthorizedBy: number = 0;
  public AuthorizedOn: string = null;
  public CreatedBy: number = 0;
  public CreatedOn: Date = null;
  public POItemStatus: string = null;
  public PurchaseOrder: PurchaseOrder = null;
  public ModifiedBy: number = null;
  public ModifiedOn: Date = null;

  //to get the data ...and use it for calculation
  public VatPercentage: number = 0;
  public VATAmount: number = 0;
  ////to make the instance ItemMaster with new row
  public SelectedItem: ItemMaster = null;

  public Item: ItemMaster = null;
  public Code: string = null;
  public UOMName: string = null;

  public PurchaseOrderItemValidator: FormGroup = null;
  public IsActive: boolean = true;
  public CancelledBy: number;
  public CancelledOn: string;
  public CancelRemarks: string;
  public IsEdited: boolean;
  //for display purpose
  public itemPriceHistory: any[] = [];
  public MSSNO: string;
  public HSNCODE: string;

  public VendorItemCode: string = "";

  public ItemCategory: string = '';//sud:18Sep'21--For Capital/Consumable Combined..
  public filteredItemList: any[] = [];//sud:18Sep'21--For Capital/Consumable Combined..

  isItemDuplicate: boolean = false; // used in PO-Add UI for duplicate alert.
  constructor() {

    var _formBuilder = new FormBuilder();
    this.PurchaseOrderItemValidator = _formBuilder.group({
      'ItemId': ['', [Validators.required, this.registeredItemValidator]],
      'Quantity': ['', [Validators.required, CommonValidators.positivenum]],
      'StandardRate': ['', [Validators.required, CommonValidators.positivenum]],
      'VatPercentage': [0, [Validators.required]]
      // 'ItemCategory': [this.ItemCategory, Validators.required] //sud:18Sep'21--@Sanjit: Please review and correct this.
    });
  }

  ngOnInit() {
    this.PurchaseOrderItemValidator.get('ItemId').valueChanges.subscribe(() => {
      this.PurchaseOrderItemValidator.updateValueAndValidity();
    });
    this.PurchaseOrderItemValidator.get('Quantity').valueChanges.subscribe(() => {
      this.PurchaseOrderItemValidator.updateValueAndValidity();
    });
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.PurchaseOrderItemValidator.dirty;
    else
      return this.PurchaseOrderItemValidator.controls[fieldName].dirty;
  }


  public IsValid(): boolean { if (this.PurchaseOrderItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.PurchaseOrderItemValidator.valid;
    }
    else
      return !(this.PurchaseOrderItemValidator.hasError(validator, fieldName));
  }

  registeredItemValidator(control: FormControl): { [key: string]: boolean } {
    if (control.value && typeof (control.value) == "object" && control.value.ItemId > 0)
      return;
    else
      return { 'notRegisteredItem': true };
  }
}
