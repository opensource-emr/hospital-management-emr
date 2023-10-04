import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { CoreService } from "../../../../core/shared/core.service";
import { SecurityService } from "../../../../security/shared/security.service";
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import { ENUM_ACC_ADDLedgerLedgerType, ENUM_DanpheHTTPResponses, ENUM_Data_Type, ENUM_MessageBox_Status } from "../../../../shared/shared-enums";
import { AccountingBLService } from "../../../shared/accounting.bl.service";
import { AccountingService } from "../../../shared/accounting.service";
import { SubLedger_DTO } from "../../../transactions/shared/DTOs/subledger-dto";
import { AccountingSettingsBLService } from "../../shared/accounting-settings.bl.service";
import { LedgerModel } from "../../shared/ledger.model";
import { ledgerGroupModel } from "../../shared/ledgerGroup.model";


@Component({
  selector: 'old-billing-ledger-mapping',
  templateUrl: "./old-billing-ledger-mapping.component.html"
})

export class Old_BillingLedgerMappingComponent implements OnInit {

  public loading: boolean = false;

  public CurrentLedger: LedgerModel;
  public CurrentLedgerGroup: ledgerGroupModel;
  public selLedgerGroup: any;
  public showAddLedgerGroupPopUp: boolean = false;
  public selLedger: Array<LedgerModel> = new Array<LedgerModel>();
  public completeledgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public ledgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public NewledgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public primaryGroupList: any[];
  public coaList: any[];
  public ledgergroupList: Array<LedgerModel> = new Array<LedgerModel>();
  public sourceLedGroupList: Array<LedgerModel> = new Array<LedgerModel>();
  public sourceLedgerList: Array<LedgerModel> = new Array<LedgerModel>();

  public Dr: boolean;
  public Cr: boolean;

  public ledgerMappingList: any;


  // for sub-navigation data info
  public isSelectAll: boolean = false;
  public ledgerTypeParamter = [{
    LedgergroupUniqueName: "",
    LedgerType: "",
    COA: "",
    LedgerName: ""
  }];

  public selectedLedgerCount: number = 0;
  public selectedLedgerData: any;
  public totalLedger: number;
  public mappedLedger: number;
  public notmappedLedger: number;
  public ledgerListAutoComplete: Array<LedgerModel> = new Array<LedgerModel>();

  public provisionalLedgerCode: number = 0;

  //START: Billin Income Ledger
  // public typeBillingLedger: boolean = false;
  public billingsledgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public billingsledgers: any;
  //END: Billin Income Ledger


  public ConsultantfilterType: string = "all";
  public disabledRow: boolean = true;
  public allcoaList: any[];

  // START: PaymentMode Ledger 
  public typePaymentMode: boolean = false;
  public paymentModeLedgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public paymentModeList: any;
  // END: PaymentMode Ledger

  public subLedgerMaster: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();
  public subLedgerListForBillingItems: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();
  public selectedSubLedger: Array<any> = [];
  public billingIncomeLedgerParam = {
    LedgergroupUniqueName: "",
    LedgerType: "",
    COA: "",
    LedgerName: ""
  }
  public subLedgerAndCostCenterSetting = {
    "EnableSubLedger": false,
    "EnableCostCenter": false
  };

  constructor(public accountingSettingsBLService: AccountingSettingsBLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public accountingBLService: AccountingBLService,
    public coreService: CoreService,
    public accountingService: AccountingService) {
    //this.GetProvisionalLedgerCode();
    this.subLedgerMaster = this.accountingService.accCacheData.SubLedgerAll ? this.accountingService.accCacheData.SubLedgerAll : [];
    this.GetLedgerGroup();
    this.getLedgerList();
    this.Getledgers();
    this.GetLedgerMapping();
    this.getPrimaryGroupList();
    this.getCoaList();
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
        this.billingIncomeLedgerParam = this.ledgerTypeParamter.find(a => a.LedgerType === ENUM_ACC_ADDLedgerLedgerType.BillingPriceItem);
      } else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Ledgers type not found.']);
      }
      let subLedgerParma = this.coreService.Parameters.find(a => a.ParameterGroupName === "Accounting" && a.ParameterName === "SubLedgerAndCostCenter");
      if (subLedgerParma) {
        this.subLedgerAndCostCenterSetting = JSON.parse(subLedgerParma.ParameterValue);
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }


  public SubLedgerListFormatter(subLedger: SubLedger_DTO): string {
    return `${subLedger["SubLedgerName"]} (${subLedger["LedgerName"]})`;
  }
  ngOnInit() {
    // this.showAddPage = val;
    this.NewledgerList = new Array<LedgerModel>();
    // this.AddNewLedger()
    this.Cr = this.Dr = null;
    // this.ledgerType = 'ledger';
    this.loading = false;
    this.CurrentLedger = new LedgerModel();
    this.CurrentLedgerGroup = new ledgerGroupModel();
    this.CurrentLedger.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    this.SetBillingItemsData();
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
    // this.primaryGroupList = [];
    this.coaList = [];
    this.ledgerList = new Array<LedgerModel>();
    // this.primaryGroupList = Array.from([new Set(this.sourceLedGroupList.map(i => i.PrimaryGroup))][0]);
  }

  //adding new Ledger
  AddLedger() {

    this.NewledgerList = this.billingsledgers.filter(a => a.IsSelected == true);
    this.NewledgerList.forEach(dept => {
      var deptData = this.ledgerListAutoComplete.filter(l => l.LedgerName == dept.LedgerName);
      if (deptData.length == 0) {
        dept.Code = "";
        dept.LedgerId = 0;
        // this.msgBoxServ.showMessage("warning", ["Ledger name required for"]);
      }
    });

    //this.CheckDrCrValidation();
    if (this.CurrentLedger.LedgerGroupId == 0 || this.CurrentLedger.LedgerGroupId == null) {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Please select ledger group"]);
    }
    else {
      let ledgerValidation = false;
      //for checking validations, marking all the fields as dirty and checking the validity.
      for (var ledger of this.NewledgerList) {
        for (var b in ledger.LedgerValidator.controls) {
          ledger.LedgerValidator.controls[b].markAsDirty();
          ledger.LedgerValidator.controls[b].updateValueAndValidity();
        }
        if (ledger.IsValidCheck(undefined, undefined)) {
          ledgerValidation = true;
          //return;
        }
        else {
          ledgerValidation = false;
        }
        if (ledger.SubLedgerName.trim() === "") {
          ledgerValidation = false;
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, [`Please Select SubLedger Or Give SubLedgerName.`]);
          break;
        }
      };
      if (ledgerValidation) {
        this.loading = true;
        ///During First Time Add Current Balance and Opening Balance is Equal                 
        this.accountingSettingsBLService.AddLedgerList(this.NewledgerList)
          .subscribe(
            res => {
              if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Ledgers Added"]);
                this.CallBackAddLedger(res);
                //this.GetProvisionalLedgerCode();
                this.loading = false;
              }
              else {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Duplicate ledger not allowed"]);
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

    this.ledgerSearchKey = null;

    //Billing ledger
    // this.typeBillingLedger = false;
    this.billingsledgerList = new Array<LedgerModel>();
    this.billingsledgers = null;

    this.disabledRow = true;
    this.getLedgerList();
  }
  //after adding Ledger is succesfully added  then this function is called.
  CallBackAddLedger(res) {
    if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results != null) {
      res.Results.forEach(ledger => {//mumbai-team-june2021-danphe-accounting-cache-change
        ledger.PrimaryGroup = this.CurrentLedger.PrimaryGroup;
        ledger.COA = this.CurrentLedger.COA;
        ledger.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
        ledger.LedgerGroupName = this.CurrentLedger.LedgerGroupName;
        this.getLedgerList();
        this.sourceLedgerList.push(ledger);
        this.accountingService.accCacheData.LedgersALL.push(ledger);//mumbai-team-june2021-danphe-accounting-cache-change
      });
    }
    else if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results == null) {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["Ledger under LedgerGroup already exist.Please deactivate the previous ledger to add a new one with same name"]);
    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Check log for details"]);
      console.log(res.ErrorMessage);
    }
  }
  logError(err: any) {
    console.log(err);
  }
  CheckProperSelectedLedger(selLedgerGroup) {
    try {
      for (var i = 0; i < this.ledgergroupList.length; i++) {
        if (this.ledgergroupList[i].LedgerGroupId == selLedgerGroup.LedgerGroupId) {
          this.CurrentLedger.checkSelectedLedger = false;
          break;
        }
        else {
          ////if LedgerGroupId is Undefined meanse Wrong Ledger Is Selected
          if (selLedgerGroup.LedgerGroupId == undefined) {
            this.CurrentLedger.checkSelectedLedger = true;
            break;
          }
        }
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
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
          this.disabledRow = false;
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Create ledger for this ledgerGroup from respective tab']);
        }
        else {
          this.disabledRow = true;
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
    let primaryGroupId = this.primaryGroupList.filter(p => p.PrimaryGroupName == this.CurrentLedger.PrimaryGroup)[0].PrimaryGroupId;
    this.coaList = this.allcoaList.filter(c => c.PrimaryGroupId == primaryGroupId);
    this.CurrentLedger.COA = this.coaList[0].ChartOfAccountName;
    this.COAChanged();
    //}
  }
  public COAChanged() {
    if (this.CurrentLedger.COA) {
      this.ledgergroupList = [];
      this.selLedgerGroup = null;
      this.CurrentLedger.LedgerGroupName = null;
      this.ledgergroupList = this.sourceLedGroupList.filter(a => a.COA == this.CurrentLedger.COA);
    }
  }
  //on default ledger creation time
  public CheckDuplicateLedger(index: number) {
    if (this.NewledgerList[index].LedgerName) {
      this.changeDetector.detectChanges();
      let count = this.sourceLedgerList.filter(s => s.LedgerName == this.NewledgerList[index].LedgerName).length;
      let check = this.NewledgerList.filter(s => s.LedgerName == this.NewledgerList[index].LedgerName).length;

      if (count > 0 || check > 1) {
        this.NewledgerList[index].LedgerName = null;
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['duplicate ledger not allowed']);
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
  LedgerListFormatter2(data: any): string {

    return data["EmployeeName"];;
  }
  ChangeOpeningBalType(e, index: number) {
    this.loading = false;

    if (e.target.name == "Dr") {
      if (e.target.checked) {
        this.billingsledgers[index].DrCr = true;
        this.billingsledgers[index].Cr = false;
        this.billingsledgers[index].Dr = true;
      }
    }
    if (e.target.name == "Cr") {
      if (e.target.checked) {
        this.billingsledgers[index].DrCr = false;
        this.billingsledgers[index].Dr = false;
        this.billingsledgers[index].Cr = true;
      }
    }
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

  GetLedgerMapping() {
    this.accountingBLService.GetLedgerMappingDetails()
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.ledgerMappingList = res.Results;
        }
      });
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

  //sud:1June'20- implementaiton changed after Searchbox is  replaced by Textbox for Searching
  public ledgerSearchKey: string = null;
  filterSelectedLedger(searchKey: string) {
    try {
      if (searchKey && searchKey.trim()) {

        if (this.ConsultantfilterType == 'withacchead') {
          let billData = this.billingsledgerList.filter(l => (l.LedgerId > 0));
          this.billingsledgers = billData.filter(l => (l.ServiceDepartmentName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1) || (typeof l.ItemName === "string" ? l.ItemName.toLowerCase().indexOf(searchKey) > -1 && l.LedgerId > 0 : []));

        }
        else if (this.ConsultantfilterType == 'withoutacchead') {
          let billData = this.billingsledgerList.filter(l => (l.LedgerId == 0));
          this.billingsledgers = billData.filter(l => (l.ServiceDepartmentName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1) || (typeof l.ItemName === "string" ? l.ItemName.toLowerCase().indexOf(searchKey) > -1 : []));

        }
        else {
          let billData = this.billingsledgerList;
          this.billingsledgers = billData.filter(l => (l.ServiceDepartmentName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1) || (typeof l.ItemName === "string" ? l.ItemName.toLowerCase().indexOf(searchKey) > -1 : []));

        }
      }
      else {
        if (this.ConsultantfilterType == 'withacchead') {
          this.billingsledgers = this.billingsledgerList.filter(l => l.LedgerId > 0);
        }
        else if (this.ConsultantfilterType == 'withoutacchead') {
          this.billingsledgers = this.billingsledgerList.filter(l => l.LedgerId == 0);
        }
        else {
          this.billingsledgers = this.billingsledgerList;
        }
      }
    }
    catch (ex) {

    }
  }

  SelectAllChkOnChange() {
    if (this.isSelectAll) {
      let ledgerObj = this.ledgerListAutoComplete.find(a => a.Name === this.billingIncomeLedgerParam.LedgerName);
      this.billingsledgers.forEach((a, index) => {
        a.IsSelected = true;
        a.IsActive = true;
        if (a.IsSelected) {
          if (a.IsMapped == false) {
            a.LedgerName = this.subLedgerAndCostCenterSetting.EnableSubLedger ? (ledgerObj ? ledgerObj.LedgerName : a.ServiceDepartmentName) : a.ServiceDepartmentName;
            a.Code = this.subLedgerAndCostCenterSetting.EnableSubLedger ? (ledgerObj ? ledgerObj.Code : "") : "";
            a.LedgerId = this.subLedgerAndCostCenterSetting.EnableSubLedger ? (ledgerObj ? ledgerObj.LedgerId : 0) : 0;
            a.SubLedgerName = a.ServiceDepartmentName;
            this.selectedSubLedger[index] = a.ServiceDepartmentName;
          }
        }
        a.LedgerValidator.get("LedgerName").enable();
      });
    }
    else {
      this.billingsledgers.forEach((a, index) => {
        if (a.IsMapped == false) {
          a.LedgerName = "";
          a.Code = "";
          a.LedgerId = 0;
          a.SubLedgerName = "";
          this.selectedSubLedger[index] = "";
        }
        else {
          var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == a.LedgerName);
          if (ledger.length == 0) {
            let data = this.ledgerListAutoComplete.filter(l => l.LedgerId == a.LedgerId);
            if (data.length > 0) {
              a.Code = data[0].Code;
              a.LedgerId = data[0].LedgerId;
              a.LedgerName = data[0].LedgerName;
            }

          }
        }
        a.IsSelected = false;
        a.LedgerValidator.get("LedgerName").disable();
      });

    }
    // this.ShowSaveButtonOnCkboxChange();
  }

  SingleCkboxChange(index) {

    this.selectedLedgerCount = this.billingsledgers.filter(a => a.IsSelected == true).length;

    if (this.billingsledgers[index].IsSelected) {
      if (this.billingsledgers[index].IsMapped == false) {
        this.billingsledgers[index].LedgerName = "";//remove autocomplete Ledgername
        this.billingsledgers[index].Code = "";
        this.billingsledgers[index].LedgerId = 0;
        this.billingsledgers[index].IsActive = true;
      }
      this.billingsledgerList[index].LedgerValidator.get("LedgerName").enable();
    }
    else if ((this.billingsledgers[index].IsSelected == false)) {
      if (this.billingsledgers[index].IsMapped == false) {
        this.billingsledgers[index].LedgerName = "";
        this.billingsledgers[index].Code = "";
        this.billingsledgers[index].LedgerId = 0;
        this.billingsledgers[index].SubLedgerId = 0;
        this.billingsledgers[index].SubLedgerName = "";
        this.billingsledgers[index] = "";
      }
      else {
        var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == this.billingsledgers[index].LedgerName);
        if (ledger.length == 0) {
          let data = this.ledgerListAutoComplete.filter(l => l.LedgerId == this.billingsledgers[index].LedgerId);
          if (data.length > 0) {
            this.billingsledgers[index].Code = data[0].Code;
            this.billingsledgers[index].LedgerId = data[0].LedgerId;
            this.billingsledgers[index].LedgerName = data[0].LedgerName;
            this.billingsledgers[index].IsActive = true;
          }
        }
      }
      this.billingsledgerList[index].LedgerValidator.get("LedgerName").disable();
    }
  }

  // START: Billings Items Income Ledgers
  SetBillingItemsData() {
    this.selectedLedgerCount = 0;
    this.getBillingItemsList();
    this.CurrentLedger = new LedgerModel();
    let LedgerGroupName = this.ledgerTypeParamter.find(a => a.LedgerType == 'billingincomeledger').LedgergroupUniqueName;
    let billingLedger = this.sourceLedGroupList.find(a => a.Name == LedgerGroupName);

    if (billingLedger != null || billingLedger != undefined) {
      let primaryGroupId = this.primaryGroupList.filter(p => p.PrimaryGroupName == billingLedger.PrimaryGroup)[0].PrimaryGroupId;
      this.coaList = this.allcoaList.filter(c => c.PrimaryGroupId == primaryGroupId);

      this.ledgergroupList = this.sourceLedGroupList.filter(a => a.COA == billingLedger.COA);
      this.CurrentLedger.PrimaryGroup = billingLedger.PrimaryGroup;
      this.CurrentLedger.COA = billingLedger.COA;
      this.CurrentLedger.LedgerGroupName = billingLedger.LedgerGroupName;
      this.CurrentLedger.LedgerGroupId = billingLedger.LedgerGroupId;
      this.ledgerListAutoComplete = this.sourceLedgerList.filter(emp => emp.LedgerGroupId == this.CurrentLedger.LedgerGroupId && emp.LedgerName != "");
      this.subLedgerListForBillingItems = this.subLedgerMaster.filter(a => this.ledgerListAutoComplete.some(b => a.LedgerId === b.LedgerId));

    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Please first create ledger group for SALES']);
    }

  }
  getBillingItemsList() {

    this.accountingSettingsBLService.GetBillingItemsList()
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {

          this.billingsledgerList = new Array<LedgerModel>();
          let data = res.Results;

          data.forEach((dep, index) => {
            var led = new LedgerModel();
            led = Object.assign(led, dep);
            led.LedgerId = (dep.LedgerId != null) ? dep.LedgerId : 0;
            led.LedgerGroupId = (dep.LedgerGroupId != null) ? dep.LedgerGroupId : this.CurrentLedger.LedgerGroupId;
            led.LedgerName = (dep.LedgerName != null) ? dep.LedgerName : "";
            led.LedgerReferenceId = (dep.LedgerReferenceId != null) ? dep.LedgerReferenceId : dep.ServiceDepartmentId;
            led.IsActive = (dep.IsActive != null) ? dep.IsActive : false;
            led.Dr = (dep.DrCr == true) ? dep.DrCr : null;
            led.Cr = (dep.DrCr == false) ? true : null;
            led.LedgerType = ENUM_ACC_ADDLedgerLedgerType.BillingPriceItem;
            led.LedgerValidator.get("COA").setValue(this.CurrentLedger.COA);
            led.LedgerValidator.get("PrimaryGroup").setValue(this.CurrentLedger.PrimaryGroup);
            led.LedgerValidator.get("LedgerGroupName").setValue(this.CurrentLedger.LedgerGroupName);
            if (!led.IsSelected)
              led.LedgerValidator.get("LedgerName").disable();
            led.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
            this.billingsledgerList.push(led);
            this.selectedSubLedger[index] = dep.SubLedgerName;
          });
          this.billingsledgers = this.billingsledgerList;
          this.totalLedger = this.billingsledgers.length;
          this.mappedLedger = this.billingsledgers.filter(l => l.IsMapped == true).length;
          this.notmappedLedger = this.billingsledgers.filter(l => l.IsMapped == false).length;
          // this.typeBillingLedger = (this.ledgerType ==ENUM_ACC_ADDLedgerLedgerType.BillingPriceItem) ? true:false;


        }
      });
  }

  ToggleBillingLedger(mapped) {
    if (mapped == 'true') {
      this.ConsultantfilterType = 'withacchead';
      this.changeDetector.detectChanges();
      this.billingsledgers = this.billingsledgerList.filter(led => led.LedgerId > 0);
      this.changeDetector.detectChanges();
      this.selectedLedgerData = null;
    }
    else if (mapped == 'false') {
      this.ConsultantfilterType = 'withoutacchead';
      this.changeDetector.detectChanges();
      this.billingsledgers = this.billingsledgerList.filter(led => led.LedgerId == 0);
      this.changeDetector.detectChanges();
      this.selectedLedgerData = null;
    }
    else {
      this.ConsultantfilterType = 'all';
      this.changeDetector.detectChanges();
      this.billingsledgers = this.billingsledgerList;
      this.changeDetector.detectChanges();
      this.selectedLedgerData = null;
    }

  }
  AssignSelectedBillingLedger(index) {
    try {
      let oldLedgerId = this.billingsledgerList[index] ? this.billingsledgerList[index].LedgerId : 0;
      var ledgerNameSelected = (typeof (this.billingsledgers[index].LedgerName) === ENUM_Data_Type.Object) ? this.billingsledgers[index].LedgerName.LedgerName.trim().toLowerCase() : this.billingsledgers[index].LedgerName.trim().toLowerCase();
      var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName.trim().toLowerCase() == ledgerNameSelected);
      //var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName.trim().toLowerCase() == this.billingsledgers[index].LedgerName.trim().toLowerCase() );
      if (ledger.length > 0) {
        this.billingsledgers[index].Code = ledger[0].Code;
        this.billingsledgers[index].LedgerId = ledger[0].LedgerId;
        this.billingsledgers[index].LedgerName = ledger[0].LedgerName;
      } else {
        this.billingsledgers[index].Code = "";
        this.billingsledgers[index].LedgerId = 0;
      }
      if (oldLedgerId !== this.billingsledgers[index].LedgerId) {
        this.billingsledgers[index].SubLedgerName = "";
        this.billingsledgers[index].SubLedgerId = 0;
        this.selectedSubLedger[index] = new SubLedger_DTO();
      }
    }
    catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  // END: Billings Items Income Ledgers


  //Get Provisional Ledger code , this code used for show for new ledger before ledger creation
  //provisional ledger code is not final may be it will different than showed 
  GetProvisionalLedgerCode() {
    try {
      this.accountingSettingsBLService.GetProvisionalLedgerCode()
        .subscribe(res => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.provisionalLedgerCode = parseInt(res.Results);
          }
          else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
          }
        },
          err => {
            this.ShowCatchErrMessage(err);
          });
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  AssignSelectedSubLedger(index) {
    if (typeof this.selectedSubLedger[index] === ENUM_Data_Type.Object && this.selectedSubLedger[index].SubLedgerId > 0) {
      this.billingsledgers[index].Code = this.selectedSubLedger[index].SubLedgerCode
      this.billingsledgers[index].LedgerId = this.selectedSubLedger[index].LedgerId;
      this.billingsledgers[index].SubLedgerName = this.selectedSubLedger[index].SubLedgerName;
      this.billingsledgers[index].SubLedgerId = this.selectedSubLedger[index].SubLedgerId;
      var Ledger = this.ledgerListAutoComplete.find(a => a.LedgerId === this.selectedSubLedger[index].LedgerId);
      if (Ledger) {
        this.billingsledgers[index].LedgerName = Ledger.LedgerName;
      }
    }
    else {
      if (this.selectedSubLedger[index] && this.selectedSubLedger[index].trim() === "") {
        this.billingsledgers[index].LedgerId = 0;
        this.billingsledgers[index].SubLedgerId = 0;
        this.billingsledgers[index].LedgerName = "";
        this.billingsledgers[index].SubLedgerName = "";
      }
      else {
        this.billingsledgers[index].SubLedgerName = this.selectedSubLedger[index];
      }
    }
  }
}