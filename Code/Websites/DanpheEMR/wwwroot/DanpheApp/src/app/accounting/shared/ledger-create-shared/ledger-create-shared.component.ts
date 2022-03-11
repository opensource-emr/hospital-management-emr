import { Component, Input, Output, EventEmitter } from "@angular/core";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { LedgerModel } from "../../settings/shared/ledger.model";
import { AccountingBLService } from "../accounting.bl.service";
import { CoreService } from "../../../core/shared/core.service";
import { AccountingService } from "../../shared/accounting.service";
import { parse } from "querystring";

@Component({
  selector: "ledger-create-shared",
  templateUrl: "./ledger-create-shared.component.html"
})
export class LedgerCreateSharedComponent {
  //NageshBB on 02 April 2020
  //This is only for create ledger from other module like incentive module ->doctor need to create ledger as consultant
  //Inventory module need to create Vendor Ledger from inventory module, Pharmacy module want to create Supplier Ledger from Pharmacy module

  //Input => referenceId is Id of that entity i.e. VendorId, SupplierId, ConsultantId(EmployeeId), etc
  //Input => ledgerType is which type of ledger want to create . we have saved LedgerType and LedgerGroupUnique name into core parameter table 
  //get uniqueledgergroup name and decide Primary group, COA, LedgerGroup for new Ledger

  //Output=> will return newly created ledger 

  //public showAddLedgerPage: boolean = false;
  //public referenceId: number = 0;
  //public ledgerType: string = "";
  public newLedger: LedgerModel = new LedgerModel();
  public loading: boolean = false;
  public Dr: boolean = false;
  public Cr: boolean = false;
  public showAddpage: boolean = false;
  public IsCOA: boolean = false;
  public ledgergroupList: Array<LedgerModel> = new Array<LedgerModel>();
  public sourceLedGroupList: Array<LedgerModel> = new Array<LedgerModel>();
  public currentSel: LedgerModel = new LedgerModel();
  //public unavailabeLedData: any;


  constructor(public msgBoxServ: MessageboxService, public accountingBLService: AccountingBLService,
    public coreService: CoreService,
    public accountingService: AccountingService) {
    this.GetLedgerGroup();
  }
  @Input("reference-id")
  public referenceId: number = 0;

  @Input("ledger-type")
  public ledgerType: string = "";

  @Input("show-add-ledger-page")
  public showAddLedgerPage: boolean = false;

  @Input("ledger-data")
  public unavailabeLedData: any = null;

  ngOnInit() {
    this.AssignLedgerValue();
    if (this.unavailabeLedData) {
      this.newLedger = new LedgerModel();
      this.newLedger = Object.assign(this.newLedger, this.unavailabeLedData);
      this.showAddLedgerPage = true;
      if (this.IsCOA) {
        this.ledgergroupList = this.sourceLedGroupList.filter(a => a.COA == this.newLedger.COA);
      }
    }
  }

  //@Input("reference-id")
  //public set referenceValue(val: number) {
  //    try {
  //        if (val) {
  //            this.referenceId = val;
  //            this.AssignLedgerValue();
  //        }
  //    }
  //    catch (ex) {
  //        this.ShowCatchErrMessage(ex);
  //    }
  //}

  //@Input("ledger-type")
  //public set ledgerTypeValue(val: string) {
  //    try {
  //        if (val) {
  //            this.ledgerType = val;
  //            this.AssignLedgerValue();
  //        }
  //    }
  //    catch (ex) {
  //        this.ShowCatchErrMessage(ex);
  //    }
  //}

  //@Input("show-add-ledger-page")
  //public set ShowHideAddLedgerPage(val:boolean){
  //    try {
  //        if (val) {
  //           this.showAddLedgerPage=val;
  //            this.AssignLedgerValue();
  //        }
  //    }
  //    catch (ex) {
  //        this.ShowCatchErrMessage(ex);
  //    }
  //}
  //@Input("ledger-data")
  //public set ledgerValue(val: any) {
  //    try {
  //        if (val) {
  //            this.unavailabeLedData = val;                
  //            if(this.unavailabeLedData){
  //            this.newLedger = new LedgerModel();
  //            this.newLedger = Object.assign(this.newLedger,this.unavailabeLedData);
  //            this.showAddLedgerPage = true;
  //            if(this.IsCOA){
  //                this.ledgergroupList = this.sourceLedGroupList.filter(a => a.COA == this.newLedger.COA);
  //            }  
  //            }
  //          }
  //    }
  //    catch (ex) {
  //        this.ShowCatchErrMessage(ex);
  //    }
  //}

  //return result 
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();


  // get ledger groups list
  GetLedgerGroup() {
            if(!!this.accountingService.accCacheData.LedgerGroups && this.accountingService.accCacheData.LedgerGroups.length>0){//mumbai-team-june2021-danphe-accounting-cache-change
            this.CallBackLedgerGroup(this.accountingService.accCacheData.LedgerGroups);//mumbai-team-june2021-danphe-accounting-cache-change
            }
  }
  CallBackLedgerGroup(res) {
    this.sourceLedGroupList = new Array<LedgerModel>();
    this.sourceLedGroupList = res;//mumbai-team-june2021-danphe-accounting-cache-change
    this.sourceLedGroupList = this.sourceLedGroupList.slice(); //mumbai-team-june2021-danphe-accounting-cache-change
    this.ledgergroupList = [];
  }
  onledgerGroupChange() {
    this.newLedger.LedgerGroupId = this.currentSel.LedgerGroupId;
  }
  //assign details to new Ledger model
  AssignLedgerValue() {
    try {

      //this.referenceId &&
      if (this.ledgerType.length > 0 && this.showAddLedgerPage == true) {
        this.showAddpage = true;
        this.newLedger = new LedgerModel();
        let param = this.coreService.Parameters.filter(p => p.ParameterGroupName == "Accounting" && p.ParameterName == "LedgerGroupMapping");
        if (param.length > 0) {
          let ledgerTypeParamter = JSON.parse(param[0].ParameterValue);
          var LedgerGroupData = ledgerTypeParamter.filter(a => a.LedgerType == this.ledgerType);
          if (LedgerGroupData.length > 0) {
            this.IsCOA = (LedgerGroupData[0].COA == undefined || LedgerGroupData[0].COA == "") ? false : true;
            this.accountingBLService.GetProvisionalLedger(this.referenceId, this.ledgerType)
              .subscribe(
                res => {
                  if (res.Status == "OK" && res.Results != null) {
                    this.CallBackProvisionalLedger(res);
                  }
                  else if (res.Status == "Failed" && res.Results == null) {
                    this.msgBoxServ.showMessage("notice-message", [res.ErrorMessage]);
                    this.Clear();
                  }
                },
                err => {
                  this.ShowCatchErrMessage(err);
                });
          }
          else {
            this.Clear();
          }
        } else {
          this.msgBoxServ.showMessage("error", ['Ledgers type not found.']);
          this.Clear();
        }

      }

    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  CallBackProvisionalLedger(res) {
    if (res.Status == "OK" && res.Results != null) {
      this.newLedger = new LedgerModel();
      this.newLedger = Object.assign(this.newLedger, res.Results);

      // this.newLedger.PrimaryGroup = this.CurrentLedger.PrimaryGroup;
      // this.newLedger.COA = this.CurrentLedger.COA;
      // this.newLedger.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
      // this.newLedger.LedgerGroupName = this.CurrentLedger.LedgerGroupName;
      // this.newLedger.LedgerName = this.CurrentLedger.LedgerName;
      this.showAddLedgerPage = true;
      if (this.IsCOA) {
        this.ledgergroupList = this.sourceLedGroupList.filter(a => a.COA == this.newLedger.COA);
      }
    }
  }

  //save ledger details 
  SaveLedger() {
    try {
      this.CheckDrCrValidation();
      //for checking validations, marking all the fields as dirty and checking the validity.
      for (var i in this.newLedger.LedgerValidator.controls) {
        this.newLedger.LedgerValidator.controls[i].markAsDirty();
        this.newLedger.LedgerValidator.controls[i].updateValueAndValidity();
      }
      if (this.newLedger.IsValidCheck(undefined, undefined)) {
        this.loading = true;
        this.newLedger.LedgerType = this.ledgerType;
        this.newLedger.LedgerReferenceId = this.referenceId;
        this.accountingBLService.AddLedger(this.newLedger)
          .subscribe(
            res => {
              if (res.Status == "OK" && res.Results != null) {
                this.msgBoxServ.showMessage("success", ["Ledger saved."]);
                this.CallBackAddLedger(res);
              }
              else if (res.Status == "Failed" && res.Results == null) {
                this.msgBoxServ.showMessage("notice-message", [res.ErrorMessage]);
                this.Clear();
              } else if (res.Status == "Failed") {
                this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                this.Clear();
              }
            },
            err => {
              this.ShowCatchErrMessage(err);
            });
      } else {
        this.loading = false;
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  CallBackAddLedger(res) {
    if (res.Status == "OK" && res.Results != null) {
      let temp = new LedgerModel();
      this.newLedger = new LedgerModel();
      this.newLedger = Object.assign(this.newLedger, res.Results);
      //  this.newLedger.PrimaryGroup = this.CurrentLedger.PrimaryGroup;
      //  this.newLedger.COA = this.CurrentLedger.COA;
      //  this.newLedger.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
      //  this.newLedger.LedgerGroupName = this.CurrentLedger.LedgerGroupName;
      //  this.newLedger.LedgerName = this.CurrentLedger.LedgerName;
      this.Clear();
    }
  }
  //This function only for show catch messages
  public ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage("error", [ex.message]);
      this.msgBoxServ.showMessage("error", ["Check error details in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
      this.Clear();
    }
  }

  //this method will clear all data and close popup and send back ledgerModel
  public Clear() {
    this.showAddLedgerPage = false;
    this.referenceId = 0;
    this.ledgerType = "";
    this.loading = false;
    this.showAddpage = false;
    this.callbackAdd.emit({ ledger: this.newLedger });
    //callback blanck ledger     
    this.IsCOA = false;
  }
  CheckDrCrValidation() {
    //if Opening balance is greater than 0 then add required validation to opening balance type
    if (this.newLedger.OpeningBalance > 0) {
      //set validator on
      this.newLedger.UpdateValidator("on", "Dr", "required");
      this.newLedger.UpdateValidator("on", "Cr", "required");
    }
    else {
      //set validator off
      this.newLedger.UpdateValidator("off", "Dr", "required");
      this.newLedger.UpdateValidator("off", "Cr", "required");
    }
  }

  ChangeOpeningBalType(e) {
    this.loading = false;
    if (e.target.name == "Dr") {
      if (e.target.checked) {
        this.newLedger.DrCr = true;
        this.Cr = false;
        this.Dr = true;
      }
    }
    if (e.target.name == "Cr") {
      if (e.target.checked) {
        this.newLedger.DrCr = false;
        this.Dr = false;
        this.Cr = true;
      }
    }
  }

}
