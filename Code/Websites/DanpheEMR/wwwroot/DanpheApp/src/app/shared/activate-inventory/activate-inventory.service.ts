import { Injectable } from '@angular/core';
import { PHRMStoreModel } from '../../pharmacy/shared/phrm-store.model';
import * as _ from 'lodash';
import { ActivateInventoryEndpoint } from './activate-inventory.endpoint';

@Injectable()
export class ActivateInventoryService {
  constructor(public activateInventoryEndpoint: ActivateInventoryEndpoint) { }

  //sanjit: 14 May'20, to implement authorization in Dispensary  Module.
  private _activeInventory: PHRMStoreModel;
  public get activeInventory(): PHRMStoreModel {
    return this._activeInventory;
  }
  public set activeInventory(inventory: PHRMStoreModel) {
    this._activeInventory = inventory;
  }


  GetAllInventoryList() {
    return this.activateInventoryEndpoint.GetAllInventoryList().map(res => res);
  }
}
