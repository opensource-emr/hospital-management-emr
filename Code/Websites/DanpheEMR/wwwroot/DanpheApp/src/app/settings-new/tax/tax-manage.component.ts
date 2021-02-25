import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { SettingsBLService } from '../shared/settings.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from "../../core/shared/core.service";
import { BillingService } from "../../billing/shared/billing.service";
@Component({
    selector: "tax-manage",
    templateUrl: "./tax-manage.html"

})
export class TaxManageComponent {
    public taxInfo: string;

    constructor(public settingsBLService: SettingsBLService,
        public coreService: CoreService,
        public msgBoxSrv: MessageboxService,
        public billingService: BillingService) {
        this.GetTaxInfo();

    }
    GetTaxInfo() {
        let _taxInfo = this.coreService.Parameters.find(a => a.ParameterName == 'TaxInfo');
        if (_taxInfo) {
            this.taxInfo = _taxInfo.ParameterValue;
        }
    }
    UpdateTaxInfo() {
        this.settingsBLService.UpdateTaxInfo(this.taxInfo)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.coreService.Parameters.find(a => a.ParameterName == 'TaxInfo').ParameterValue = this.taxInfo;
                    this.billingService.GetTaxDetails();
                    this.msgBoxSrv.showMessage("Success", ["Tax Detail Updated"]);
                }
                else {
                    this.msgBoxSrv.showMessage("failed", ["Failed to Update Tax Detail"]);
                    console.log(res.ErrorMessage);
                }
            });
    }
}