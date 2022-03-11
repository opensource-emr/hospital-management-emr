import { Injectable, Directive } from '@angular/core';
import { InventoryFiscalYearModel } from '../../inventory/shared/inventory-fiscal-year.model';

@Injectable()
export class FixedAssetService {

  public _Id: number = null;//sud:3Mar'20-removed since it's wrongly implemented all across, need to use specific Ids eg: ItemId, PoId, RequisitionId etc..


  public allFiscalYearList: InventoryFiscalYearModel[] = [];
  public RequisitionId:number=0;

  public LoadAllFiscalYearList(fiscalyearList: Array<InventoryFiscalYearModel>) {
    this.allFiscalYearList = fiscalyearList;
  }
  constructor() {

  }
}
