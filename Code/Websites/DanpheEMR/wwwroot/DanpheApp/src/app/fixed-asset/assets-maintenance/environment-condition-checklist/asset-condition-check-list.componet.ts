import { Component, EventEmitter, Output, Input } from "@angular/core";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { Router } from "@angular/router";
import { FixedAssetConditionCheckListModel } from "./fixed-asset-condition-check-list.model";
import { FixedAssetBLService } from "../../shared/fixed-asset.bl.service";


@Component({
  selector: "asset-condition-check-list",
  templateUrl: "./asset-condition-check-list.html",
})


export class AssetConditionCheckListComponent {
  public assetConditionCheck: FixedAssetConditionCheckListModel = new FixedAssetConditionCheckListModel();
  public allCheckList: Array<FixedAssetConditionCheckListModel> = new Array<FixedAssetConditionCheckListModel>();

  @Output('show-callback')
  public showEmitter: EventEmitter<Object> = new EventEmitter<Object>()
  editEmitter: any;
  public ProperAirFlow: boolean = null;
  public MoistureAndTemperature: boolean = null;
  public InterDepartmentMovement: boolean = null;
  public MaintenanceOfPressure: boolean = null;
  public UseOfTrainedProfessionals: boolean = null;
  public KnowledgeOfAssets: boolean = null;

  public assetCheckList: any = [
    { Id: 1, Name: 'Proper Air Flow' },
    { Id: 2, Name: 'Maintenance Of Moisture And Temperature' },
    { Id: 3, Name: 'Inter Department Movement' },
    { Id: 4, Name: 'Maintenance Of Pressure' },
    { Id: 5, Name: 'Use Of Trained Professionalst' },
    { Id: 6, Name: 'Knowledge Of Assets' },
  ];
  public fixedAssetStockId: any;


  constructor(
    public msgBoxServ: MessageboxService,
    public fixedAssetBLService: FixedAssetBLService,
    public router: Router
  ) {


  }


  @Input('fixedAssetStockId')
  public set Value(val) {
    if (val) {
      this.fixedAssetStockId = val;

      if (this.fixedAssetStockId > 0) {
        this.GetAssetsConditionCheckList();
      }
    }
  }

  Save() {
    if (this.ProperAirFlow != null && this.MoistureAndTemperature != null && this.MaintenanceOfPressure != null && this.InterDepartmentMovement != null && this.UseOfTrainedProfessionals != null && this.KnowledgeOfAssets != null) {
      let check = true;
      this.allCheckList = [];
      this.assetCheckList.forEach(a => {
        switch (a.Id) {
          case 1: {
            var conditionCheckList: FixedAssetConditionCheckListModel = new FixedAssetConditionCheckListModel();
            conditionCheckList.FixedAssetStockId = this.fixedAssetStockId;
            conditionCheckList.AssetConditionId = 1;
            conditionCheckList.Condition = this.ProperAirFlow;
            this.allCheckList.push(conditionCheckList);

            break;
          }
          case 2: {
            var conditionCheckList: FixedAssetConditionCheckListModel = new FixedAssetConditionCheckListModel();
            conditionCheckList.FixedAssetStockId = this.fixedAssetStockId;
            conditionCheckList.AssetConditionId = 2;
            conditionCheckList.Condition = this.MoistureAndTemperature;
            this.allCheckList.push(conditionCheckList);
            break;
          }
          case 3: {
            var conditionCheckList: FixedAssetConditionCheckListModel = new FixedAssetConditionCheckListModel();
            conditionCheckList.FixedAssetStockId = this.fixedAssetStockId;
            conditionCheckList.AssetConditionId = 3;
            conditionCheckList.Condition = this.InterDepartmentMovement;
            this.allCheckList.push(conditionCheckList);
            this.InterDepartmentMovement = a.Condition;
            break;
          }
          case 4: {
            var conditionCheckList: FixedAssetConditionCheckListModel = new FixedAssetConditionCheckListModel();
            conditionCheckList.FixedAssetStockId = this.fixedAssetStockId;
            conditionCheckList.AssetConditionId = 4;
            conditionCheckList.Condition = this.MaintenanceOfPressure;
            this.allCheckList.push(conditionCheckList);
            break;
          }
          case 5: {
            var conditionCheckList: FixedAssetConditionCheckListModel = new FixedAssetConditionCheckListModel();
            conditionCheckList.FixedAssetStockId = this.fixedAssetStockId;
            conditionCheckList.AssetConditionId = 5;
            conditionCheckList.Condition = this.UseOfTrainedProfessionals;
            this.allCheckList.push(conditionCheckList);
            break;
          }
          case 6: {
            var conditionCheckList: FixedAssetConditionCheckListModel = new FixedAssetConditionCheckListModel();
            conditionCheckList.FixedAssetStockId = this.fixedAssetStockId;
            conditionCheckList.AssetConditionId = 6;
            conditionCheckList.Condition = this.KnowledgeOfAssets;
            this.allCheckList.push(conditionCheckList);
            break;
          }
          default: {
            break;
          }
        }
      });
      this.PostCheckList();

    } else {
      this.msgBoxServ.showMessage("Faile", ["Assets Condtion valu null"]);

    }

  }

  public PostCheckList() {
    this.fixedAssetBLService.PostAssetCheckList(this.allCheckList)
      .subscribe(res => {
        if (res.Status == "OK") {

          this.msgBoxServ.showMessage("success", ["Assets Check List  has been Add."]);
          this.Close();

        }
        else {
          this.msgBoxServ.showMessage("Failed", [res.ErrorMessage]);

        }
      });
  }


  public Close() {
    this.showEmitter.emit({ status: "Close" });
  }


  GetAssetsConditionCheckList() {
    this.fixedAssetBLService.GetAssetsConditionCheckList(this.fixedAssetStockId) // where fixedAssetStockId
      .subscribe(res => {
        if (res.Status == "OK") {
          if (res.Results) {
            this.allCheckList = res.Results;

            this.allCheckList.forEach(a => {
              switch (a.AssetConditionId) {
                case 1: {
                  this.ProperAirFlow = a.Condition; // emum id should match the properAirFlow
                  break;
                }
                case 2: {
                  this.MoistureAndTemperature = a.Condition;
                  break;
                }
                case 3: {
                  this.InterDepartmentMovement = a.Condition;
                  break;
                }
                case 4: {
                  this.MaintenanceOfPressure = a.Condition;

                  break;
                }
                case 5: {
                  this.UseOfTrainedProfessionals = a.Condition;
                  break;
                }
                case 6: {
                  this.KnowledgeOfAssets = a.Condition;
                  break;
                }
                default: {
                  break;
                }
              }
            });
          }

        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to get AssetConditionCheckList. " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Failed to get AssetConditionCheckList. " + err.ErrorMessage]);
        });
  }


}
