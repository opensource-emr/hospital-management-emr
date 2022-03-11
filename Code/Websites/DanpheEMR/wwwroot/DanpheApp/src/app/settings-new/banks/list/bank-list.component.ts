import { Component, ChangeDetectorRef } from "@angular/core";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { BanksModel } from "../../shared/banks.model";


@Component({
  templateUrl: './bank-list.html',
})
export class BankListComponent {

  public BankList: Array<BanksModel> = new Array<BanksModel>();
  public BanksGridColumns: Array<any> = null;
  public showAddNewPage: boolean = false;

  public selBankToEdit: BanksModel = null;

  constructor(public settingsServ: SettingsService,
    public settingsBlService: SettingsBLService,
    public msgBoxServ: MessageboxService) {
    this.BanksGridColumns = this.settingsServ.settingsGridCols.BanksGridCols;

    this.LoadBankList();
  }


  public LoadBankList() {
    this.settingsBlService.GetBankList()
      .subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.BankList = res.Results;
          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          }
        },
        err => {
          this.msgBoxServ.showMessage("", [err.ErrorMessage])
        }
      );



  }


  BankListGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "edit": {
        this.selBankToEdit = new BanksModel();
        this.selBankToEdit = Object.assign(this.selBankToEdit, $event.Data);
        this.showAddNewPage = true;

      }
      default:
        break;
    }

  }

  ShowAddNewPage() {
    this.selBankToEdit = null;
    this.showAddNewPage = true;
  }

  getDataFromAdd($event) {
    // if ($event.action == 'close') {
    //   this.showAddNewPage=false;
    // }
    this.LoadBankList();
    this.showAddNewPage=false;

  }

}

