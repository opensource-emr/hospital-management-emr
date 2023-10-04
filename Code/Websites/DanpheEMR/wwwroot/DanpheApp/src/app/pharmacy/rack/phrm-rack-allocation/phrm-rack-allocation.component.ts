import { Component, OnInit } from '@angular/core';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import { PHRMItemMasterModel } from '../../shared/phrm-item-master.model';
import { PhrmRackModel } from '../../shared/rack/phrm-rack.model';
import { PhrmRackService } from '../../shared/rack/phrm-rack.service';
import { PHRMMapItemToRack } from '../../shared/rack/Phrm_Map_ItemToRack';
import { Store } from '../phrm-rack.component';
import * as _ from 'lodash';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

@Component({
  selector: 'phrm-rack-allocation',
  templateUrl: './phrm-rack-allocation.component.html',
  styleUrls: ['./phrm-rack-allocation.component.css']
})
export class PhrmRackAllocationComponent {
  ItemList: Array<PHRMItemMasterModel> = new Array<PHRMItemMasterModel>();
  RackList: Array<PhrmRackModel> = new Array<PhrmRackModel>();
  StoreList: Array<Store> = new Array<Store>();
  SelectedStore: PhrmRackModel = new PhrmRackModel();
  SelectedRack: PhrmRackModel = new PhrmRackModel();
  SelectedItem: PhrmRackModel = new PhrmRackModel();
  StoreRackAllocationDetails: StoreRackAllocationDetails[] = [];
  RackData: Array<Rack> = new Array<Rack>();
  StoreWiseFilterRackList: Rack[] = [];
  RackListForAllocation: Array<Rack> = new Array<Rack>();
  StoreRackAllocationDatas: Array<StoreRackAllocationData> = new Array<StoreRackAllocationData>();
  phrmMapList: PHRMMapItemToRack[] = [];
  currentItem: PHRMMapItemToRack;
  loading: boolean = false;
  pageIndex: number = 0;
  pageSize: number = 0;
  searchTerm: string;
  collectionSize: number;
  loadingScreen: boolean = false;

  constructor(public pharmacyBLService: PharmacyBLService, public phrmRackService: PhrmRackService, public messageBoxService: MessageboxService) { }
  ngOnInit() {
    this.GetLocationList();
    this.getItemList();
    this.pageIndex = 0;
    this.pageSize = 10;
  }
  public GetLocationList(): void {
    this.pharmacyBLService.GetAllPharmacyStore().subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.StoreList = []
        this.StoreList = res.Results;
      }
    })
  }
  public getItemList(): void {
    this.loadingScreen = true;
    this.pharmacyBLService.GetItemList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.ItemList = [];
          this.ItemList = res.Results;
          this.collectionSize = this.ItemList.length;
          this.GetAllRackList();
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
          console.log(res.ErrorMessage)
        }
      });
  }
  getRackList(i: number): Array<PhrmRackModel> {
    return this.RackList.filter(r => r.StoreId == this.StoreList[i].StoreId || r.StoreId == null);
  }
  AddRackItem() {
    this.phrmRackService
      .AddRackItem(this.SelectedItem)

      .subscribe(
        res => {
          this.showMessageBox(ENUM_MessageBox_Status.Success, "Item Added");
          this.SelectedItem = new PhrmRackModel();
        });
  }
  showMessageBox(Success: any, arg1: string) {
    throw new Error('Method not implemented.');
  }

  GetAllRackList() {
    this.pharmacyBLService.GetAllRackList().subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.RackListForAllocation = res.Results;
        this.GetAllocatedRackData();
      }
    });
  }

  GetAllocatedRackData() {
    this.pharmacyBLService.GetItemRackAllocationData(null)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.RackData = [];
          this.RackData = res.Results;
          this.LoadItemRackAllocationData();
        }
      });
  }


  LoadItemRackAllocationData(): void {
    this.StoreRackAllocationDetails = [];

    this.ItemList.forEach(item => {
      let data = new StoreRackAllocationDetails();
      data.ItemId = item.ItemId;
      data.ItemName = item.ItemName;
      this.StoreRackAllocationDatas = [];
      this.StoreList.forEach(store => {
        let storeData = new StoreRackAllocationData();
        let selectedRack = this.RackData.find(a => a.StoreId == store.StoreId && a.ItemId === item.ItemId);
        storeData.selectedRack = selectedRack ? selectedRack : null;
        storeData.previouslySelectedRack = selectedRack ? selectedRack : null;
        let RackListForAllocation = this.RackListForAllocation.filter(b => b.StoreId === store.StoreId);
        RackListForAllocation.unshift({ ItemId: item.ItemId, RackId: null, RackNo: 'None', StoreId: store.StoreId });
        storeData.StoreWiseFilterRackList = RackListForAllocation;
        this.StoreRackAllocationDatas.push(storeData)
      });
      data.StoreRackAllocationDatas = this.StoreRackAllocationDatas;
      this.StoreRackAllocationDetails.push(data);
    });
    this.loadingScreen = false;
  }
  RackListFormatter(data: any): string {
    let html = data["RackNo"];
    return html;
  }
  OnRackChange($event, ItemId, previouslySelectedRack, i, j) {
    $event.ItemId = ItemId;
    let tempEvent = _.omit($event, ['toString']);
    let tempPreviouslySelectedRack = _.omit(previouslySelectedRack, ['toString']);
    if ($event && !_.isEqual(tempEvent, tempPreviouslySelectedRack)) {
      this.currentItem = new PHRMMapItemToRack();
      this.currentItem.ItemId = $event.ItemId;
      this.currentItem.StoreId = $event.StoreId;
      this.currentItem.RackId = $event.RackId;
      this.currentItem.IIndex = i;
      this.currentItem.JIndex = j;
      let index = this.phrmMapList.findIndex(item => item.ItemId === ItemId && item.StoreId === $event.StoreId);
      if (index >= 0) {
        this.phrmMapList[index] = this.currentItem;
        this.phrmMapList.slice();
      }
      else {
        this.phrmMapList.push(this.currentItem);
      }
    }
  }
  Save(indexI: number) {
    let phrmMapListToPost = this.phrmMapList.filter(p => p.IIndex === indexI);
    if (!phrmMapListToPost || phrmMapListToPost.length === 0) {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["No changes find to save in this row"]);
      return;
    }
    let phrmMapListToBeUnchanged = this.phrmMapList.filter(v => v.IIndex !== indexI);
    if (phrmMapListToBeUnchanged && phrmMapListToBeUnchanged.length > 0) {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Some data  unchanged", "Because only one row data can be saved at a time"]);
      phrmMapListToBeUnchanged.forEach(v => {
        this.StoreRackAllocationDetails[v.IIndex].StoreRackAllocationDatas[v.JIndex].selectedRack = this.StoreRackAllocationDetails[v.IIndex].StoreRackAllocationDatas[v.JIndex].previouslySelectedRack
      })
    }
    if (confirm('Are you sure you want to save changes?')) {
      this.loading = true;
      this.pharmacyBLService.PostItemToRack(phrmMapListToPost).finally(() => {
        this.loading = false;
      }).subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          for (let result of res.Results) {
            this.StoreRackAllocationDetails[indexI].StoreRackAllocationDatas[result.JIndex].previouslySelectedRack = { ItemId: result.ItemId, StoreId: result.StoreId, RackId: result.RackId, RackNo: result.RackNo };
          }
          this.phrmMapList = [];
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Item Added To Rack Successfully"]);
        };
      });
    }
  }
  search(value: string): void {
    let items = this.StoreRackAllocationDetails.filter((val) => val.ItemName.toLowerCase().includes(value));
    this.collectionSize = items.length;
  }
}


class StoreRackAllocationDetails {
  ItemId: number = 0;
  ItemName: string = '';
  StoreRackAllocationDatas: Array<StoreRackAllocationData> = new Array<StoreRackAllocationData>();
}

class StoreRackAllocationData {
  selectedRack: Rack = new Rack();
  previouslySelectedRack: Rack = new Rack();
  StoreWiseFilterRackList: Array<Rack> = new Array<Rack>();

}

class Rack {
  ItemId: number = 0;
  StoreId: number = 0;
  RackId: number = null;
  RackNo: string = '';

}
