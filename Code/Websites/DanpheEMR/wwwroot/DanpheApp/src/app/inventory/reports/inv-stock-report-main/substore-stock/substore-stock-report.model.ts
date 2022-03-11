import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';

export class SubstoreReportViewModel {
  constructor() {

  }
  public InventoryTotal: SubstoreGetAllModel;
  public InventoryItemTotal: Array<SubstoreGetAllBasedOnItemIdModel>;
  public InventoryStoreTotal: Array<SubstoreGetAllBasedOnStoreIdModel>;
}
class SubstoreGetAllModel {
  public TotalQuantity: number;
  public TotalValue: number;
  public ExpiryQuantity: number;
  public ExpiryValue: number;
}
class SubstoreGetAllBasedOnItemIdModel implements ISubstoreUIControl {
  public ItemId: number;
  public ItemName: string;
  public TotalQuantity: number;
  public TotalValue: number;
  public TotalConsumed: number;

  click() {

  }
}
class SubstoreGetAllBasedOnStoreIdModel implements ISubstoreUIControl {
  public StoreId: number;
  public Name: string;
  public TotalQuantity: number;
  public TotalValue: number;
  public TotalConsumed: number;

  click() {

  }
}

interface ISubstoreUIControl {

  TotalQuantity: number;
  TotalValue: number;
  TotalConsumed: number;

  click();
}
