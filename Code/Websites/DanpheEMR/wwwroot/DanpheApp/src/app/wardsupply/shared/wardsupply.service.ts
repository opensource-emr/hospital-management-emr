import { Injectable, Directive } from '@angular/core';
import { PHRMStoreModel } from '../../pharmacy/shared/phrm-store.model';
import { ActivateInventoryEndpoint } from '../../shared/activate-inventory/activate-inventory.endpoint';
@Injectable()
export class wardsupplyService {
    constructor(public activateInventoryEndpoint: ActivateInventoryEndpoint) { }
  //sanjit: 14 May'20, to implement authorization in Dispensary  Module.
  public  activeSubstoreId: number = 0;
  private _inventoryList: any=[]; 
  public ReturnId:number=0;  //swapnil-2-april-2021
  public isModificationAllowed:boolean=true;  //swapnil-2-april-2021
  public DepartmentName:string=null;  //swapnil-2-april-2021
  public RequisitionId:number=0;//swapnil-2-april-2021
  public get inventoryList() {
    return this._inventoryList;
  }
  public set inventoryList(inventory) {
    this._inventoryList = inventory;
  }
  
}