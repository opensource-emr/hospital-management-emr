import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
import { ItemMaster } from '../../inventory/shared/item-master.model';
export class WardInventoryConsumptionModel {
  public ConsumptionId: number = 0;
  public DepartmentId: number = 0;
  public DepartmentName: string = null;
  public ItemId: number = 0;
  public ItemName: string = '';
  public Quantity: number = 0;
  public Code: string = '';
  public UOMName: string = '';
  public Remark: string = '';
  public UsedBy: string = null;
  public CreatedBy: number = 0;
  public CreatedOn: string = '';
  public ConsumptionDate: string = '';
  public CounterId: number = 0;
  public StockId: number = 0;
  public StoreId: number = 0;
  public ConsumeQuantity: number = 1;
  public SelectedItem: ItemMaster = null;

  public ConsumptionValidator: FormGroup = null;
  constructor() {
    var _formBuilder = new FormBuilder();
    this.ConsumptionValidator = _formBuilder.group({
      'ConsumeQuantity': ['', Validators.compose([Validators.required,Validators.min(1)])]
    });
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.ConsumptionValidator.dirty;
    else
      return this.ConsumptionValidator.controls[fieldName].dirty;
  }


  public IsValid(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.ConsumptionValidator.valid;
    }
    else
      return !(this.ConsumptionValidator.hasError(validator, fieldName));
  }
}
