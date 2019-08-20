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
@Component({
  templateUrl: "./inventory-ward-consumption-list.html"   //"/WardSupplyView/ConsumptionList"
})
export class InventoryConsumptionListComponent {

  public consumptionListDetailsGridColumns: Array<WARDGridColumns> = []
  public consumptionListDetailsLocal = new Array<{ DepartmentId: number, ConsumptionListByDept: Array<WardInventoryConsumptionModel> }>();
  public consumptionListDetails: Array<WardInventoryConsumptionModel> = []
  public consumptionLists: Array<WardInventoryConsumptionModel>[]
  public loading: boolean = false;
  public showWardList: boolean = false;
  public showConsumpList: boolean = false;
  public DepartmentId: number = 1;
  public rowIndex: number = null;
  public showComsumptionList: boolean = true;
  public selectedItem: WardInventoryConsumptionModel = new WardInventoryConsumptionModel();
  dlService: DLService = null;
  http: HttpClient = null;
  public DepartmentList: Array<any> = []
  changeDetectorRef: any;
  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public wardSupplyBLService: WardSupplyBLService,
    public changeDetector: ChangeDetectorRef, public router: Router,
    public msgBoxServ: MessageboxService) {
    this.http = _http;
    this.dlService = _dlService;
    this.consumptionListDetailsGridColumns = WARDGridColumns.InventoryConsumptionList;
    this.GetDepartmentList();
    //this.getAllComsumptionListDetails();
  }

  GetDepartmentList() {
    try {
      this.wardSupplyBLService.GetDepartments()
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.length) {
              this.DepartmentList = res.Results;
              this.getInventoryComsumptionList();
            }
            else {
              this.msgBoxServ.showMessage("Empty", ["Ward List is not available."]);
              console.log(res.Errors);
            }
          }
        });

    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }


  public getInventoryComsumptionList() {
    try {
      let consumpList = this.consumptionListDetailsLocal.find(a => a.DepartmentId == this.DepartmentId);
      if (consumpList && this.DepartmentId) {
        this.consumptionListDetails = [];
        this.consumptionListDetails = consumpList.ConsumptionListByDept;
      } else {
        this.wardSupplyBLService.GetInventoryConsumptionListDetails(this.DepartmentId)
          .subscribe(res => {
            if (res.Status == "OK") {
              if (res.Results.length) {
                this.consumptionListDetails = [];
                this.consumptionListDetails = res.Results;
                //this.consumptionListDetailsLocal.push({
                //    "WardId": this.WardId, "ConsumptionListByWard": res.Results
                //});

              }
              else {
                this.msgBoxServ.showMessage("Notice", ["no records found"]);
                console.log(res.Errors);
                this.consumptionListDetails = [];
              }
            } else {
              this.msgBoxServ.showMessage("error", ["Failed to get data, please try again !"]);
              console.log(res.Errors);
            }
          });
      }


    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  onChange() {
    this.showWardList = true;
    this.getInventoryComsumptionList();


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
    let departmentId = this.DepartmentId;
    this.wardSupplyBLService.GetInventoryConsumptionItemList(user, departmentId)
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
    this.router.navigate(["/WardSupply/Inventory/ConsumptionItem"]);

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
