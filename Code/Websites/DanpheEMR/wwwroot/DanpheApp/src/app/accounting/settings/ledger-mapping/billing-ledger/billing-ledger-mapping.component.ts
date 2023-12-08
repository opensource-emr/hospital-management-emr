import { ChangeDetectorRef, Component } from "@angular/core";
import { CoreService } from "../../../../core/shared/core.service";
import { DanpheHTTPResponse } from "../../../../shared/common-models";
import { GridEmitModel } from "../../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import { ENUM_ACC_ADDLedgerLedgerType, ENUM_BillingType, ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../../shared/shared-enums";
import { AccountingBLService } from "../../../shared/accounting.bl.service";
import { AccountingService } from "../../../shared/accounting.service";
import { SubLedger_DTO } from "../../../transactions/shared/DTOs/subledger-dto";
import AccSettingsGridColumnSettings from "../../shared/acc-settings-grid-column-settings";
import { AccountingSettingsBLService } from "../../shared/accounting-settings.bl.service";
import { AccBillingLedgerMapping_DTO } from "../../shared/dto/acc-billing-ledger-mapping.dto";
import { LedgerModel } from "../../shared/ledger.model";
import { ledgerGroupModel } from "../../shared/ledgerGroup.model";


@Component({
  selector: 'billing-ledger-mapping',
  templateUrl: "./billing-ledger-mapping.component.html"
})



export class BillingLedgerMappingComponent {

  public billingLedgerGridColumns: Array<any> = null;
  public allBillingsledgerList: Array<AccBillingLedgerMapping_DTO> = new Array<AccBillingLedgerMapping_DTO>();
  public filteredBillingLedgerList: Array<AccBillingLedgerMapping_DTO> = new Array<AccBillingLedgerMapping_DTO>();
  public selectedData: AccBillingLedgerMapping_DTO = new AccBillingLedgerMapping_DTO();
  public index: number;
  public showMapForm: boolean = false;
  public newLedgerMapping: AccBillingLedgerMapping_DTO = new AccBillingLedgerMapping_DTO();
  public ConsultantfilterType: string = "all";
  public selectedLedgerData: any;
  public totalLedgerCount: number;
  public mappedLedgerCount: number;
  public notmappedLedgerCount: number;
  public ledgerId: number = 0;
  public subLedgerCode: string = "";
  public CurrentLedger: LedgerModel;
  public selectedLedgerCount: number = 0;
  public ledgerListAutoComplete: Array<LedgerModel> = new Array<LedgerModel>();
  public ledgerTypeParamter = [{
    LedgergroupUniqueName: "",
    LedgerType: "",
    COA: "",
    LedgerName: ""
  }];
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
  public sourceLedGroupList: Array<ledgerGroupModel> = new Array<ledgerGroupModel>();
  public primaryGroupList: any[];
  public allcoaList: any[];
  public coaList: any[];
  public ledgergroupList: Array<ledgerGroupModel> = new Array<ledgerGroupModel>();
  public sourceLedgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public subLedgerMaster: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();
  public subLedgerListForBillingItems: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();
  public selectedSubLedger: any;
  public selectedLedger: any;
  public billingType: string = ENUM_BillingType.outpatient;
  public mappingState: string = 'all';
  public billingInpatientCollectionLedger: LedgerModel = new LedgerModel();
  constructor(
    public accountingSettingsBLService: AccountingSettingsBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public accountingBLService: AccountingBLService,
    public accountingService: AccountingService,
    public coreService: CoreService,

  ) {
    this.billingLedgerGridColumns = AccSettingsGridColumnSettings.BillingLedgerMappingGridColumns;
    this.subLedgerMaster = this.accountingService.accCacheData.SubLedgerAll ? this.accountingService.accCacheData.SubLedgerAll : [];
    this.sourceLedGroupList = this.accountingService.accCacheData.LedgerGroups;
    this.getPrimaryGroupList();
    this.getCoaList();
    this.getLedgerList();
    this.Getledgers();
    this.SetBillingItemsData();
  }




  SetBillingItemsData() {
    this.selectedLedgerCount = 0;
    this.getBillingItemsList();
    this.CurrentLedger = new LedgerModel();
    let billingParam = this.ledgerTypeParamter.find(a => a.LedgerType == 'billingincomeledger');
    let billingLedgerGroup = new ledgerGroupModel();
    if (billingParam) {
      let LedgerGroupName = billingParam.LedgergroupUniqueName;
      billingLedgerGroup = this.sourceLedGroupList.find(a => a.Name == LedgerGroupName);
      this.billingInpatientCollectionLedger = this.sourceLedgerList.find(a => a.Name === billingParam.LedgerName);
    }

    if (billingLedgerGroup != null || billingLedgerGroup != undefined) {
      let primaryGroupId = this.primaryGroupList.filter(p => p.PrimaryGroupName == billingLedgerGroup.PrimaryGroup)[0].PrimaryGroupId;
      this.coaList = this.allcoaList.filter(c => c.PrimaryGroupId == primaryGroupId);

      this.ledgergroupList = this.sourceLedGroupList.filter(a => a.COA == billingLedgerGroup.COA);
      this.CurrentLedger.PrimaryGroup = billingLedgerGroup.PrimaryGroup;
      this.CurrentLedger.COA = billingLedgerGroup.COA;
      this.CurrentLedger.LedgerGroupName = billingLedgerGroup.LedgerGroupName;
      this.CurrentLedger.LedgerGroupId = billingLedgerGroup.LedgerGroupId;
      this.ledgerListAutoComplete = this.sourceLedgerList.filter(emp => emp.LedgerGroupId == this.CurrentLedger.LedgerGroupId && emp.LedgerName != "");
      if (this.billingType === ENUM_BillingType.outpatient) {
        this.ledgerListAutoComplete = this.ledgerListAutoComplete.filter(a => a.LedgerId !== (this.billingInpatientCollectionLedger ? this.billingInpatientCollectionLedger.LedgerId : 0));
      }
      this.subLedgerListForBillingItems = this.subLedgerMaster.filter(a => this.ledgerListAutoComplete.some(b => a.LedgerId === b.LedgerId));

    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Please first create ledger group for SALES']);
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
        let index = this.billingLedgerGridColumns.findIndex(a => a.headerName === "Sub-Ledger");
        if (index >= 0) {
          this.billingLedgerGridColumns.splice(index, 1);
        }
        if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
          this.billingLedgerGridColumns.splice(3, 0, { headerName: "Sub-Ledger", field: "SubLedgerName", width: 120 });
        }
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  LedgerListFormatter(data: any): string {
    return data["Code"] + "-" + data["LedgerName"] + " | " + data["PrimaryGroup"] + " -> " + data["LedgerGroupName"];
  }

  public SubLedgerListFormatter(subLedger: SubLedger_DTO): string {
    return `${subLedger["SubLedgerName"]} (${subLedger["LedgerName"]})`;
  }


  AssignSelectedLedger(event) {
    if (this.selectedLedger) {
      this.ledgerId = event.LedgerId;
      let filteredSubLedger = this.subLedgerMaster.filter(x => x.LedgerId === this.ledgerId);
      this.subLedgerListForBillingItems = filteredSubLedger;
      this.newLedgerMapping.LedgerCode = event.Code;
      this.newLedgerMapping.LedgerName = event.LedgerName;
      this.newLedgerMapping.LedgerId = event.LedgerId;
    }
    else {
      this.selectedLedger = null;
      this.newLedgerMapping.LedgerCode = null;
      this.selectedSubLedger = null;
      this.subLedgerCode = null;

    }
  }


  AssignSelectedSubLedger(event) {
    if (event) {
      this.newLedgerMapping.SubLedgerId = event.SubLedgerId;
      this.subLedgerCode = event.SubLedgerCode;
      let ledger = this.sourceLedgerList.find(a => a.LedgerId === this.selectedSubLedger.LedgerId);
      if (ledger) {
        this.selectedLedger = ledger;
        this.newLedgerMapping.LedgerCode = this.selectedLedger.Code;
        this.newLedgerMapping.LedgerId = ledger.LedgerId;
        this.newLedgerMapping.LedgerName = ledger.LedgerName;

      }
    }
    else {
      this.selectedSubLedger = null;
      this.subLedgerCode = null;
    }
  }


  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }


  getBillingItemsList() {
    this.accountingSettingsBLService.GetBillingItemsList()
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.allBillingsledgerList = this.filteredBillingLedgerList = res.Results;
          this.filterBillintType();
        }
      });
  }


  public getPrimaryGroupList() {
    if (!!this.accountingService.accCacheData.PrimaryGroup && this.accountingService.accCacheData.PrimaryGroup.length > 0) {
      this.primaryGroupList = this.accountingService.accCacheData.PrimaryGroup;
      this.primaryGroupList = this.primaryGroupList.slice();
    }
  }

  public getCoaList() {
    if (!!this.accountingService.accCacheData.COA && this.accountingService.accCacheData.COA.length > 0) {
      this.allcoaList = this.accountingService.accCacheData.COA;
      this.allcoaList = this.allcoaList.slice();
    }
  }
  public getLedgerList() {
    if (!!this.accountingService.accCacheData.LedgersALL && this.accountingService.accCacheData.LedgersALL.length > 0) {
      this.sourceLedgerList = this.accountingService.accCacheData.LedgersALL;
      this.sourceLedgerList = this.sourceLedgerList.slice();
    }
  }
  ToggleBillingLedger() {
    if (this.mappingState === 'mapped') {
      this.ConsultantfilterType = 'withacchead';
      this.changeDetector.detectChanges();
      this.filteredBillingLedgerList = this.allBillingsledgerList.filter(led => led.LedgerId > 0 && led.BillingType === this.billingType);
      this.changeDetector.detectChanges();
      this.selectedLedgerData = null;
    }
    else if (this.mappingState === 'notMapped') {
      this.ConsultantfilterType = 'withoutacchead';
      this.changeDetector.detectChanges();
      this.filteredBillingLedgerList = this.allBillingsledgerList.filter(led => led.LedgerId == 0 && led.BillingType === this.billingType);
      this.changeDetector.detectChanges();
      this.selectedLedgerData = null;
    }
    else {
      this.ConsultantfilterType = 'all';
      this.changeDetector.detectChanges();
      this.filteredBillingLedgerList = this.allBillingsledgerList.filter(led => led.BillingType === this.billingType);
      this.changeDetector.detectChanges();
      this.selectedLedgerData = null;
    }

  }
  BillingLedgerMappingGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "activateDeactivateBillingLedgerMapping": {
        this.selectedData = null;
        this.index = $event.RowIndex;
        this.selectedData = $event.Data;
        this.ActivateDeactivateBillingLedgerMappingStatus(this.selectedData)
        break;
      }
      case "map": {
        this.showMapForm = true;
        this.selectedData = $event.Data;
        this.selectedSubLedger = null;
        this.subLedgerCode = null;
        this.selectedLedger = null;
        this.newLedgerMapping.ItemId = this.selectedData.ItemId;
        this.newLedgerMapping.ServiceDepartmentId = this.selectedData.ServiceDepartmentId;
        this.newLedgerMapping.LedgerCode = this.selectedData.LedgerCode;
        var led = new AccBillingLedgerMapping_DTO();
        led = Object.assign(led, this.selectedData);
        led.LedgerGroupId = (this.selectedData.LedgerGroupId != null) ? this.selectedData.LedgerGroupId : this.CurrentLedger.LedgerGroupId;
        this.newLedgerMapping = led;

        //If mapping is found, bind that to ngModel of MainLedger Dropdown and SubLedger Dropdown
        if (this.newLedgerMapping.LedgerId) {
          this.selectedLedger = new LedgerModel();
          this.selectedLedger["LedgerName"] = this.newLedgerMapping.LedgerName;
          this.selectedLedger["LedgerId"] = this.newLedgerMapping.LedgerId;
          this.selectedLedger["Code"] = this.newLedgerMapping.LedgerCode;


          this.selectedSubLedger = new SubLedger_DTO();
          this.selectedSubLedger["SubLedgerName"] = this.newLedgerMapping.SubLedgerName;
          this.selectedSubLedger["SubLedgerId"] = this.newLedgerMapping.SubLedgerId;

          if (this.subLedgerMaster && this.subLedgerMaster.find(s => s.SubLedgerId == this.newLedgerMapping.SubLedgerId) != null) {
            this.subLedgerCode = this.subLedgerMaster.find(s => s.SubLedgerId == this.newLedgerMapping.SubLedgerId).SubLedgerCode;
          }



        }
      }
    }
  }
  ActivateDeactivateBillingLedgerMappingStatus(selectedData: AccBillingLedgerMapping_DTO) {
    if (selectedData != null) {
      let status = selectedData.IsActive == true ? false : true;
      let msg = status == true ? 'Activate' : 'Deactivate';
      if (confirm("Are you Sure want to " + msg + ' ' + selectedData.LedgerName + ' ?')) {
        selectedData.IsActive = status;
        this.accountingSettingsBLService.UpdateBillingLedgerMappingStatus(selectedData.BillLedgerMappingId, status)
          .subscribe(
            (res: DanpheHTTPResponse) => {
              if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                let responseMessage = res.Results.IsActive ? " Ledger is now Activated." : "Ledger is now Deactivated.";
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [responseMessage]);
                this.getBillingItemsList()

              }
              else {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Something wrong' + res.ErrorMessage]);
              }
            },
            err => {
              this.logError(err);
            });
      }
      else {
        this.selectedData = new AccBillingLedgerMapping_DTO();
      }
    }
  }
  logError(err: any) {
    console.log(err);
  }

  clearFields() {
    this.selectedSubLedger = null;
    this.subLedgerCode = null;
    this.selectedLedger = null;
    this.newLedgerMapping.LedgerCode = null;
  }
  Close() {
    this.showMapForm = false;
    this.clearFields();
  }
  SaveLedgerMapping() {
    if (this.newLedgerMapping && this.newLedgerMapping.LedgerId > 0) {
      if (this.subLedgerAndCostCenterSetting.EnableSubLedger ? this.newLedgerMapping.SubLedgerId > 0 : true) {
        this.accountingBLService.SaveBillingLedgerMapping(this.newLedgerMapping).subscribe
          (res => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Ledger Added"]);
              this.getBillingItemsList();
              this.Close();
            }
          },
            (err => {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [`Error: ${err.ErrorMessage}`]);
            }));
      }
      else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Please select Sub-Ledger."]);
      }
    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Please select Ledger."]);
    }
  }

  UpdateLedgerMapping() {
    if (this.newLedgerMapping && this.newLedgerMapping.LedgerId > 0) {
      if (this.subLedgerAndCostCenterSetting.EnableSubLedger ? this.newLedgerMapping.SubLedgerId > 0 : true) {
        this.accountingBLService.UpdateBillLedgerMapping(this.newLedgerMapping).subscribe
          (res => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Ledger Updated"]);
              this.getBillingItemsList();
              this.Close();
            }
          },
            (err => {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [`Error: ${err.ErrorMessage}`]);
            }));
      }
      else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Please select Sub-Ledger."]);
      }
    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Please select Ledger."]);
    }
  }

  public filterBillintType() {
    this.ToggleBillingLedger();
    this.totalLedgerCount = this.allBillingsledgerList.filter(a => a.BillingType === this.billingType).length;
    this.mappedLedgerCount = this.allBillingsledgerList.filter(a => a.BillingType === this.billingType && a.IsMapped == true).length;
    this.notmappedLedgerCount = this.allBillingsledgerList.filter(a => a.BillingType === this.billingType && a.IsMapped == false).length;
    this.ledgerListAutoComplete = this.sourceLedgerList.filter(emp => emp.LedgerGroupId == this.CurrentLedger.LedgerGroupId && emp.LedgerName != "");
    if (this.billingType === ENUM_BillingType.outpatient) {
      this.ledgerListAutoComplete = this.sourceLedgerList.filter(a => a.LedgerGroupId == this.CurrentLedger.LedgerGroupId && a.LedgerName != "" && a.LedgerId !== (this.billingInpatientCollectionLedger ? this.billingInpatientCollectionLedger.LedgerId : 0));
    }
    else {
      this.ledgerListAutoComplete = this.sourceLedgerList.filter(a => a.LedgerGroupId == this.CurrentLedger.LedgerGroupId && a.LedgerName != "" && a.LedgerId === (this.billingInpatientCollectionLedger ? this.billingInpatientCollectionLedger.LedgerId : 0));
    }
    this.subLedgerListForBillingItems = this.subLedgerMaster.filter(a => this.ledgerListAutoComplete.some(b => a.LedgerId === b.LedgerId));
    this.newLedgerMapping = new AccBillingLedgerMapping_DTO();
    this.selectedLedger = null;
    this.selectedSubLedger = null;
  }
}
