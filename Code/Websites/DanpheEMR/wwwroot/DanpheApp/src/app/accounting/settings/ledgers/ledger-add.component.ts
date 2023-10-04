
import { ChangeDetectorRef, Component, EventEmitter, Output } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from '../../../security/shared/security.service';
import { SettingsBLService } from "../../../settings-new/shared/settings.bl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { AccountingBLService } from '../../shared/accounting.bl.service';
import { AccountingService } from "../../shared/accounting.service";
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';
import { LedgerModel } from '../shared/ledger.model';
import { ledgerGroupModel } from '../shared/ledgerGroup.model';

@Component({
  selector: 'ledger-add',
  templateUrl: './ledger-add.html'
})
export class LedgersAddComponent {

  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

  public CurrentLedger: LedgerModel;
  public CurrentLedgerGroup: ledgerGroupModel;
  public selLedgerGroup: any;
  public showAddLedgerGroupPopUp: boolean = false;
  public selLedger: Array<LedgerModel> = new Array<LedgerModel>();
  public loading: boolean = false;
  public completeledgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public ledgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public NewledgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public primaryGroupList: any[];
  public coaList: any[];
  public ledgergroupList: Array<LedgerModel> = new Array<LedgerModel>();
  public sourceLedGroupList: Array<LedgerModel> = new Array<LedgerModel>();
  public sourceLedgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public butDisabled: boolean = true;

  public provisionalLedgerCode: number = 0;

  public allcoaList: any[];
  public ledgerTypeParamter: any;

  constructor(public accountingSettingsBLService: AccountingSettingsBLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public accountingBLService: AccountingBLService,
    public settingBlService: SettingsBLService,
    public coreService: CoreService,
    public accountingService: AccountingService) {
    this.GetProvisionalLedgerCode();
    this.GetLedgerGroup();
    this.getLedgerList();
    this.Getledgers();
    this.getPrimaryGroupList();
    this.getCoaList();
  }
  ngOnInit() {

    this.NewledgerList = new Array<LedgerModel>();
    this.AddNewLedger()
    this.loading = false;
    this.CurrentLedger = new LedgerModel();
    this.CurrentLedgerGroup = new ledgerGroupModel();
    this.CurrentLedger.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  }

  public getCoaList() {
    if (!!this.accountingService.accCacheData.COA && this.accountingService.accCacheData.COA.length > 0) { //mumbai-team-june2021-danphe-accounting-cache-change
      this.allcoaList = this.accountingService.accCacheData.COA; //mumbai-team-june2021-danphe-accounting-cache-change
      this.allcoaList = this.allcoaList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
    }
  }

  public getPrimaryGroupList() {
    if (!!this.accountingService.accCacheData.PrimaryGroup && this.accountingService.accCacheData.PrimaryGroup.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
      this.primaryGroupList = this.accountingService.accCacheData.PrimaryGroup;//mumbai-team-june2021-danphe-accounting-cache-change
      this.primaryGroupList = this.primaryGroupList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
    }
  }
  public Getledgers() {
    try {
      let ledgers = this.coreService.Parameters.filter(p => p.ParameterGroupName == "Accounting" && p.ParameterName == "LedgerGroupMapping");
      if (ledgers.length > 0) {
        this.ledgerTypeParamter = JSON.parse(ledgers[0].ParameterValue);
      } else {
        this.msgBoxServ.showMessage("error", ['Ledgers type not found.']);
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  GetLedgerGroup() {
    if (!!this.accountingService.accCacheData.LedgerGroups && this.accountingService.accCacheData.LedgerGroups.length > 0) { //mumbai-team-june2021-danphe-accounting-cache-change
      this.CallBackLedgerGroup(this.accountingService.accCacheData.LedgerGroups);//mumbai-team-june2021-danphe-accounting-cache-change
    }
  }

  CallBackLedgerGroup(res) {
    this.sourceLedGroupList = new Array<LedgerModel>();
    this.sourceLedGroupList = res;
    this.sourceLedGroupList = this.sourceLedGroupList.slice();
    this.ledgergroupList = [];
    this.coaList = [];
    this.ledgerList = new Array<LedgerModel>();
  }

  //adding new Ledger
  AddLedger() {
    this.CheckDrCrValidation();
    if (this.CurrentLedger.LedgerGroupId == 0 || this.CurrentLedger.LedgerGroupId == null) {
      this.msgBoxServ.showMessage("error", ["Please select ledger group"]);
    }
    else {
      let ledgerValidation = true;
      //for checking validations, marking all the fields as dirty and checking the validity.
      for (var ledger of this.NewledgerList) {
        for (var b in ledger.LedgerValidator.controls) {
          ledger.LedgerValidator.controls[b].markAsDirty();
          ledger.LedgerValidator.controls[b].updateValueAndValidity();
        }
        if (ledger.IsValidCheck(undefined, undefined) || ledger.LedgerName === null || ledger.LedgerName.trim() === "") {
          if (ledger.LedgerName && ledger.LedgerName.trim() === "") {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Invalid LedgerName."]);
          }
          ledgerValidation = false;
          return;
        }
      };
      if (ledgerValidation) {
        this.loading = true;
        ///During First Time Add Current Balance and Opening Balance is Equal                 
        this.accountingSettingsBLService.AddLedgerList(this.NewledgerList)
          .subscribe(
            res => {
              if (res.Status == "OK") {
                this.msgBoxServ.showMessage("success", ["Ledgers Added"]);
                // this.CurrentLedger
                this.CallBackAddLedger(res);
                this.CurrentLedger = new LedgerModel();
                this.NewledgerList = new Array<LedgerModel>();
                this.selLedgerGroup = null; ////Null the Selected Ledger Group   
                this.GetProvisionalLedgerCode();
                // this.loading = false;
                // this.typeConsultant = false;
                this.Close();
              }
              else {
                this.msgBoxServ.showMessage("error", ["Duplicate ledger not allowed"]);
                this.loading = false;
              }
            },
            err => {
              this.logError(err);
              this.loading = false;
            });
      } else {
        this.loading = false;
      }
    }
  }


  Close() {
    //this.selectedLedger = null;
    this.ledgerList = this.completeledgerList;
    this.CurrentLedger = new LedgerModel();
    this.selLedgerGroup = null;
    this.NewledgerList = new Array<LedgerModel>();;
    this.ledgergroupList = new Array<LedgerModel>();
    this.coaList = [];
    this.ledgerList = new Array<LedgerModel>();

    this.loading = false;

    this.selLedger = new Array<LedgerModel>();
    this.getLedgerList();


    // this.showAddPage = false;
    this.callbackAdd.emit(true);


  }

  CheckDrCrValidation() {
    if (this.NewledgerList.length > 0) {
      this.NewledgerList.forEach(itm => {
        if (itm.OpeningBalance > 0) {
          //set validator on
          itm.UpdateValidator("on", "Dr", "required");
          itm.UpdateValidator("on", "Cr", "required");
        }
        else {
          //set validator off
          itm.UpdateValidator("off", "Dr", "required");
          itm.UpdateValidator("off", "Cr", "required");
        }
      })
    }
  }

  //after adding Ledger is succesfully added  then this function is called.
  CallBackAddLedger(res) {
    if (res.Status == "OK" && res.Results != null) {
      res.Results.forEach(ledger => {//mumbai-team-june2021-danphe-accounting-cache-change
        ledger.PrimaryGroup = this.CurrentLedger.PrimaryGroup;
        ledger.COA = this.CurrentLedger.COA;
        ledger.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
        ledger.LedgerGroupName = this.CurrentLedger.LedgerGroupName;
        this.getLedgerList();
        this.sourceLedgerList.push(ledger);
        this.accountingService.accCacheData.LedgersALL.push(ledger);//mumbai-team-june2021-danphe-accounting-cache-change
      });
      this.ledgergroupList = new Array<LedgerModel>();
      this.ledgerList = new Array<LedgerModel>();
      this.callbackAdd.emit(true);
    }
    else if (res.Status == "OK" && res.Results == null) {
      this.msgBoxServ.showMessage("notice-message", ["Ledger under LedgerGroup already exist.Please deactivate the previous ledger to add a new one with same name"]);
    }
    else {
      this.msgBoxServ.showMessage("error", ["Check log for details"]);
      console.log(res.ErrorMessage);
    }
  }
  logError(err: any) {
    console.log(err);
  }

  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }

  public AssignSelectedLedgerGroup() {
    if (this.CurrentLedger.LedgerGroupName) {
      let AllowToCreateLedgers = JSON.parse(this.coreService.Parameters.filter(p => p.ParameterGroupName == "Accounting" && p.ParameterName == "AllowToCreateAllLedgersFromDefaultTab")[0].ParameterValue);
      this.selLedgerGroup = this.ledgergroupList.filter(s => s.LedgerGroupName == this.CurrentLedger.LedgerGroupName)[0];

      if (!AllowToCreateLedgers) {
        let ledgerGroupUnqName = this.ledgerTypeParamter.filter(l => l.LedgergroupUniqueName == this.selLedgerGroup.Name);
        if (ledgerGroupUnqName.length > 0) {
          this.msgBoxServ.showMessage('Notice', ['Create ledger for this ledgerGroup from respective tab']);
        }
        else {
        }
      }

      if ((this.selLedgerGroup.LedgerGroupId != 0) && (this.selLedgerGroup.LedgerGroupId != null)) {
        this.CurrentLedger.LedgerGroupId = this.selLedgerGroup.LedgerGroupId;
        this.CurrentLedger.LedgerGroupName = this.selLedgerGroup.LedgerGroupName;
        this.ledgerList = this.sourceLedgerList.filter(a => a.LedgerGroupName == this.CurrentLedger.LedgerGroupName);
      }
      this.NewledgerList.forEach(a => {
        a.PrimaryGroup = this.CurrentLedger.PrimaryGroup;
        a.COA = this.CurrentLedger.COA;
        a.LedgerGroupName = this.CurrentLedger.LedgerGroupName;
        a.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
        a.CreatedBy = this.CurrentLedger.CreatedBy;
      });

    }
  }

  public PrimaryGroupChanged() {
    // if (this.CurrentLedger.PrimaryGroup) {
    this.coaList = [];
    this.ledgergroupList = [];
    this.selLedgerGroup = null;
    this.CurrentLedger.LedgerGroupName = null;
    //  this.CurrentLedger.LedgerName = null;
    //  this.ledgerList = new Array<LedgerModel>();
    // let selectedPrimaryGroupList = this.sourceLedGroupList.filter(a => a.PrimaryGroup == this.CurrentLedger.PrimaryGroup);
    // this.coaList = Array.from([new Set(selectedPrimaryGroupList.map(i => i.COA))][0]);
    let primaryGroupId = this.primaryGroupList.filter(p => p.PrimaryGroupName == this.CurrentLedger.PrimaryGroup)[0].PrimaryGroupId;
    this.coaList = this.allcoaList.filter(c => c.PrimaryGroupId == primaryGroupId);
    this.CurrentLedger.COA = this.coaList[0].ChartOfAccountName;
    this.COAChanged();
    //}
  }
  // Keepit 
  public COAChanged() {
    if (this.CurrentLedger.COA) {
      this.ledgergroupList = [];
      this.selLedgerGroup = null;
      this.CurrentLedger.LedgerGroupName = null;
      //   this.CurrentLedger.LedgerName = null;
      //   this.ledgerList = new Array<LedgerModel>();
      this.ledgergroupList = this.sourceLedGroupList.filter(a => a.COA == this.CurrentLedger.COA);
    }
  }
  //keep it
  //on default ledger creation time
  public CheckDuplicateLedger(index: number) {
    if (this.NewledgerList[index].LedgerName) {
      this.changeDetector.detectChanges();
      // let count = this.sourceLedgerList.filter(s => s.LedgerName.trim().toLowerCase() == this.NewledgerList[index].LedgerName.trim().toLowerCase()).length;
      // let check = this.NewledgerList.filter(s => s.LedgerName.trim().toLowerCase() == this.NewledgerList[index].LedgerName.trim().toLowerCase()).length;
      let count = this.sourceLedgerList.filter(s => s.LedgerName == this.NewledgerList[index].LedgerName).length;
      let check = this.NewledgerList.filter(s => s.LedgerName == this.NewledgerList[index].LedgerName).length;

      if (count > 0 || check > 1) {
        this.NewledgerList[index].LedgerName = null;
        this.msgBoxServ.showMessage("notice", ['duplicate ledger not allowed']);
        this.loading = false;
      }

    }
  }

  public getLedgerList() {
    if (!!this.accountingService.accCacheData.LedgersALL && this.accountingService.accCacheData.LedgersALL.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
      this.sourceLedgerList = this.accountingService.accCacheData.LedgersALL;//mumbai-team-june2021-danphe-accounting-cache-change
      this.sourceLedgerList = this.sourceLedgerList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
    }
  }

  LedgerGroupListFormatter(data: any): string {
    return data["LedgerGroupName"];
  }

  LedgerListFormatter(data: any): string {
    //return data["LedgerName"];
    return data["Code"] + "-" + data["LedgerName"] + " | " + data["PrimaryGroup"] + " -> " + data["LedgerGroupName"];
  }

  ChangeOpeningBalType(e, index: number) {
    this.loading = false;
    if (e.target.name == "Dr") {
      if (e.target.checked) {
        this.NewledgerList[index].DrCr = true;
        this.NewledgerList[index].Cr = false;
        this.NewledgerList[index].Dr = true;
      }
    }
    if (e.target.name == "Cr") {
      if (e.target.checked) {
        this.NewledgerList[index].DrCr = false;
        this.NewledgerList[index].Dr = false;
        this.NewledgerList[index].Cr = true;
      }
    }
  }

  //for LedgerGroup add popup
  AddLedgerGroupPopUp() {
    this.showAddLedgerGroupPopUp = false;
    this.changeDetector.detectChanges();
    this.showAddLedgerGroupPopUp = true;
  }
  OnNewLedgerGroupAdded($event) {
    this.showAddLedgerGroupPopUp = false;
    var ledgerGroup = new LedgerModel();
    ledgerGroup.LedgerGroupId = $event.currentLedger.LedgerGroupId;
    ledgerGroup.PrimaryGroup = $event.currentLedger.PrimaryGroup;
    ledgerGroup.COA = $event.currentLedger.COA;
    ledgerGroup.LedgerGroupName = $event.currentLedger.LedgerGroupName;
    ledgerGroup.IsActive = $event.currentLedger.IsActive;
    ledgerGroup.Description = $event.currentLedger.Description;
    ledgerGroup.Name = $event.currentLedger.Name;
    this.ledgergroupList.push(ledgerGroup);
    this.ledgergroupList = this.ledgergroupList.slice();
    this.GetLedgerGroup();
  }
  //this is only for default ledger creation check not for other types
  checkUniqueLedgerName() {
    if (this.NewledgerList.length) {
      this.changeDetector.detectChanges();
      var temp = true;
      let foundDuplicate = 0;
      // if (!this.typeConsultant && !this.typeBillingLedger) {
      this.NewledgerList.forEach(itm => {
        let existedInDatabase = this.sourceLedgerList.filter(s => s.LedgerName.trim().toLowerCase() == itm.LedgerName.trim().toLowerCase()).length;
        let existedIncurrentList = this.NewledgerList.filter(s => s.LedgerName.trim().toLowerCase() == itm.LedgerName.trim().toLowerCase()).length;

        if (existedInDatabase > 0 || existedIncurrentList > 1) {
          this.loading = false;
          temp = false;
          foundDuplicate = foundDuplicate + 1;
        }
      });
      // }
      if (foundDuplicate > 0) {
        this.msgBoxServ.showMessage("notice", ['duplicate ledger not allowed, please check.']);
      }
      return temp;
    }
    else {
      this.msgBoxServ.showMessage("notice", ['LedgerName required.']);
      this.loading = false;
    }
  }

  DeleteLedgerRow(index: number) {
    try {
      if (this.NewledgerList.length > 1) {
        this.NewledgerList.splice(index, 1);
        this.selLedger.splice(index, 1);
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  AddNewLedger() {
    try {
      var ledger = new LedgerModel();
      if (this.CurrentLedger) {
        ledger.PrimaryGroup = this.CurrentLedger.PrimaryGroup;
        ledger.COA = this.CurrentLedger.COA;
        ledger.LedgerGroupName = this.CurrentLedger.LedgerGroupName;
        ledger.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
        ledger.CreatedBy = this.CurrentLedger.CreatedBy;

      }
      if (this.NewledgerList.length > 0) {
        if (this.checkUniqueLedgerName()) {
          this.NewledgerList.push(ledger);
        }
      }
      else {
        this.NewledgerList.push(ledger);
      }
      this.SetProvisionalLedgerCode();
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }


  //Get Provisional Ledger code , this code used for show for new ledger before ledger creation
  //provisional ledger code is not final may be it will different than showed 
  GetProvisionalLedgerCode() {
    // try {
    //   this.accountingSettingsBLService.GetProvisionalLedgerCode()
    //     .subscribe(res => {
    //       if (res.Status == "OK") {
    //         this.provisionalLedgerCode = parseInt(res.Results);
    //       }
    //       else {
    //         this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    //       }
    //     },
    //       err => {
    //         this.ShowCatchErrMessage(err);
    //       });
    // } catch (ex) {
    //   this.ShowCatchErrMessage(ex);
    // }
  }

  //This function we will call every list item remove or add in ledger creation page
  //This function will generate all provisional ledger and reassign provisional ledger code and arrange 
  //Provisioanl Ledger code only for Normal Ledger not for Consultant, Credit Organization, Inventory vendor, etc type ledger
  SetProvisionalLedgerCode() {
    try {
      if (this.provisionalLedgerCode == 0) {
        this.GetProvisionalLedgerCode();
      }
      var pLedCode = this.provisionalLedgerCode;
      this.NewledgerList.forEach(l => {
        if (!l.Code) {
          l.Code = pLedCode.toString();

        }
        pLedCode++;
      });
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
}
