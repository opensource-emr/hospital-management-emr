import { Component } from "@angular/core";
import { CoreBLService } from "../../core/shared/core.bl.service";
import { CoreService } from "../../core/shared/core.service";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { CfgPaymentModesSettings } from "../shared/CfgPaymentModesSettings";
import { SettingsService } from "../shared/settings-service";
import { SettingsBLService } from "../shared/settings.bl.service";
import * as _ from 'lodash';


@Component({
    templateUrl: './payment-mode.main.html',
  })
export class PaymentModeMainComponent {
  public PaymentModeColumns = null;
  public ShowEditPage = false;
  public PaymentPages : any;
  public PaymentModeSettings:any;
  public SettingToEdit : CfgPaymentModesSettings = null;
  public SettingValue : any;
  public loading : boolean = false;
  public PageName : string = '';
  constructor(public settingsServ: SettingsService,
      public settingsBlService: SettingsBLService,
      public msgBoxServ: MessageboxService,
      public coreService: CoreService,
      private coreBlService: CoreBLService) {
      this.PaymentModeColumns = this.settingsServ.settingsGridCols.PaymentModeColumns;
      //this.PaymentPages = this.coreService.paymentPages;
      this.GetPaymentModePages();
      //this.PaymentModeSettings = coreService.paymentModeSettings;
      this.GetPaymentModeSettings();
  }

  GetPaymentModePages(){
    this.coreBlService.GetPaymentPages().subscribe((res) => {
      if (res.Status == "OK") {
        this.PaymentPages = res.Results;
      }
    });
  }
  GetPaymentModeSettings(){
    this.coreBlService.GetPaymentModeSettings().subscribe((res) => {
      if (res.Status == "OK") {
       this.PaymentModeSettings = res.Results;
      }
    });
  }
  ConfigurationGridActions($event: GridEmitModel) {
      switch ($event.Action) {
        case "edit": {
          this.SettingToEdit = new CfgPaymentModesSettings();
          this.SettingToEdit = Object.assign(this.SettingToEdit, $event.Data);
          this.PageName = this.SettingToEdit.PageName;
          this.SettingValue = _.cloneDeep(this.PaymentModeSettings.filter(a => a.PaymentPageId === this.SettingToEdit.PaymentPageId));
          this.ShowEditPage = true;
        }
        default:
          break;
      }
    }
    close(){
      this.SettingValue = [];
      this.ShowEditPage = false;
    }

    UpdateConfiguration(){
      //this.SettingValue = JSON.stringify(this.SettingValue);
      this.settingsBlService.UpdatePaymentModeSetting(this.SettingValue).subscribe((res)=>{
        if(res.Status == "OK"){
          this.msgBoxServ.showMessage('success',["Payment mode Setting is successfully updated"]);
          this.coreService.GetPaymentPages();
          setTimeout(() =>{
            this.PaymentPages = this.coreService.paymentPages;
          },500)
          this.GetPaymentModeSettings();
        }
      },
      (err)=>{
        this.msgBoxServ.showMessage('error',["Unable to Update setting."]);
      },
      ()=>{ this.loading = false;}
      );
      this.close();
    }
    
}