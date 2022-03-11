import { Component } from "@angular/core";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from "../../../shared/danphe-grid/grid-column-settings.constant";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { AccountingSettingsBLService } from "../shared/accounting-settings.bl.service";
import { AccountingService } from '../../shared/accounting.service';
import { SectionModel } from "../shared/section.model";
import { SecurityService } from "../../../security/shared/security.service";

@Component({
  templateUrl: './transfer-rules.html'
})
export class TransferRulesComponent {
  public transferRules: Array<any> = [];
  public sectionList: Array<SectionModel> = [];
  public sectionId: number = 2;//Section like 1-Inventory, 2-Billing, 3-Pharmacy (for now it's hardcoded) you can get from parameter table also
  public TransferRulesGridColumns: Array<any> = null;
  public TransferRulesList: Array<any> = null;
  btndisabled = false;
  public showGridData: boolean = false;

  constructor(public accountingSettingsBLService: AccountingSettingsBLService,
    public msgBox: MessageboxService, public accountingservice: AccountingService,){
    this.TransferRulesGridColumns = GridColumnSettings.TransferRules;
    this.GetSection();
  }

  GetSection() {
    if (!!this.accountingservice.accCacheData.Sections && this.accountingservice.accCacheData.Sections.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
      this.sectionList = this.accountingservice.accCacheData.Sections;//mumbai-team-june2021-danphe-accounting-cache-change
      this.sectionList = this.accountingservice.accCacheData.Sections.filter(sec => sec.SectionId != 4); // 4 is Manual_Voucher (FIXED for DanpheEMR) //mumbai-team-june2021-danphe-accounting-cache-change
      this.sectionList = this.sectionList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
      let defSection = this.sectionList.find(s => s.IsDefault == true);
      if (defSection) {
        this.sectionId = defSection.SectionId;
      }
      else {
        this.sectionId = this.sectionList[0].SectionId;
      }
    }
    else {
      this.msgBox.showMessage("error", ['No Data']);
    }
  }
  loadData() {
    this.btndisabled = true;
    this.accountingSettingsBLService.getTrasferRuleData(this.sectionId)
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length) {
          this.btndisabled = false;
          this.formattingData(res.Results);
          this.showGridData = true;
        }
        else {
          this.btndisabled = false;
          this.showGridData = false;
          this.msgBox.showMessage("notice", ["no record found."]);
        }
      });
  }
  formattingData(data) {
    this.TransferRulesList = [];
    data.forEach(a => {
      let Obj = new Object();
      Obj["SectionName"] = a.SectionName;
      Obj["VoucherName"] = a.VoucherName;
      Obj["customVoucherName"] = a.customVoucherName;
      Obj["ruleName"] = a.ruleName;
      Obj["IsActive"] = a.IsActive;

      this.TransferRulesList.push(Obj);
    });
  }
  TransferRulesGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case 'ActivateDeactivateTransferRules': {
        let status = $event.Data.IsActive;
        let msg = status == true ? 'Activate' : 'Deactivate';
        if (confirm("Are you Sure want to " + msg + ' ' + $event.Data.ruleName + ' ?')) {
          this.ActivateDeactivateTransferRules($event.Data.ruleName);
        }
        break;
      }
      default:
        break;
    }
  }
  ActivateDeactivateTransferRules(ruleName: string) {
    this.accountingSettingsBLService.UpdateTransferRuleIsActive(ruleName)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.TransferRulesList.find(a => a.ruleName == ruleName).IsActive = !this.TransferRulesList.find(a => a.ruleName == ruleName).IsActive;
          this.TransferRulesList = this.TransferRulesList.slice();
          this.msgBox.showMessage('success', ['Transfer Rules Updated Successfully!!']);
        }
        else {
          this.msgBox.showMessage('failed', [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      });
  }

}