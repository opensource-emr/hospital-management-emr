import { Component, ChangeDetectorRef } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router'
import { HttpClient } from '@angular/common/http';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import WARDGridColumns from '../../shared/ward-grid-cloumns';
import { WardSupplyBLService } from "../../shared/wardsupply.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { CommonFunctions } from "../../../shared/common.functions";
import * as moment from 'moment/moment'
import { DLService } from "../../../shared/dl.service";
import { WardInventoryConsumptionModel } from '../../shared/ward-inventory-consumption.model';
import { SecurityService } from '../../../security/shared/security.service';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
@Component({
  templateUrl: "./inventory-ward-consumption-list.html"   //"/WardSupplyView/ConsumptionList"
})
export class InventoryConsumptionListComponent {
  public CurrentStoreId: number = 0;
  public consumptionListDetailsGridColumns: Array<WARDGridColumns> = []
  public consumptionListDetailsLocal = new Array<{ DepartmentId: number, ConsumptionListByDept: Array<WardInventoryConsumptionModel> }>();
  public consumptionListDetails: Array<WardInventoryConsumptionModel> = []
  public consumptionLists: Array<WardInventoryConsumptionModel>[]
  public loading: boolean = false;
  public showConsumpList: boolean = false;
  public rowIndex: number = null;
  public showComsumptionList: boolean = true;
  public selectedItem: WardInventoryConsumptionModel = new WardInventoryConsumptionModel();
  dlService: DLService = null;
  http: HttpClient = null;
  changeDetectorRef: any;

  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public securityService: SecurityService,
    public wardSupplyBLService: WardSupplyBLService,
    public changeDetector: ChangeDetectorRef, public router: Router,
    public msgBoxServ: MessageboxService) {
    this.http = _http;
    this.dlService = _dlService;
    //this.getAllComsumptionListDetails();
    this.CheckForSubstoreActivation();
  }
  CheckForSubstoreActivation() {
    this.CurrentStoreId = this.securityService.getActiveStore().StoreId;
    try {
      if (!this.CurrentStoreId) {
        //routeback to substore selection page.
        this.router.navigate(['/WardSupply']);
      }
      else {
        //write whatever is need to be initialise in constructor here.
        this.dateRange = "None";
        this.consumptionListDetailsGridColumns = WARDGridColumns.InventoryConsumptionList;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('ConsumptionDate',false));
      }
    } catch (exception) {
      this.msgBoxServ.showMessage("Error", [exception]);
    }
  }
  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.getInventoryComsumptionList();
      } else {
        this.msgBoxServ.showMessage('failed', ['Please enter valid From date and To date']);
      }

    }
  }
  public getInventoryComsumptionList() {
    try {
      this.wardSupplyBLService.GetInventoryConsumptionListDetails(this.CurrentStoreId, this.fromDate, this.toDate)
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.length) {
              this.consumptionListDetails = [];
              this.consumptionListDetails = res.Results;
            }
            else {
              this.msgBoxServ.showMessage("notice-message", ["No records found."]);
              console.log(res.Errors);
              this.consumptionListDetails = [];
            }
          } else {
            this.msgBoxServ.showMessage("error", ["Failed to get data, please try again !"]);
            console.log(res.Errors);
          }
        });
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  ConsumptionListGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view":
        {
          var data = $event.Data;
          this.showConsumpList = true;
          this.ShowConsumptionListDetailsById(data);
        }
        break;
      default:
        break;
    }
  }
  ShowConsumptionListDetailsById(data) {
    let user = data.UsedBy;
    this.wardSupplyBLService.GetInventoryConsumptionItemList(user, this.CurrentStoreId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.consumptionLists = res.Results;
        } else {
          this.msgBoxServ.showMessage("failed", ['Failed to get List.' + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get List.' + err.ErrorMessage]);
        }
      )
  }
  Close() {
    this.showConsumpList = false;
  }
  Cancel() {
    this.loading = true;
    try {
      this.selectedItem = new WardInventoryConsumptionModel();
      this.showComsumptionList = true;
      this.loading = false;
      this.rowIndex = null;
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  AddNewConsumption() {
    this.router.navigate(["/WardSupply/Inventory/Consumption/ConsumptionAdd"]);

  }
  ////This function only for show catch messages in console 
  ShowCatchErrMessage(exception) {
    if (exception) {
      this.msgBoxServ.showMessage("error", ['error please check console lo for details'])
      this.showComsumptionList = true;
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
      this.loading = false;
    }
  }
}
