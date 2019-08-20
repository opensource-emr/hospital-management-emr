import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router'
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service"
import { AccountingBLService } from "./shared/accounting.bl.service";
import * as moment from 'moment/moment';
import { strictEqual } from 'assert';
@Component({
  templateUrl: "./accounting-main.html"
})
export class AccountingComponent {
  validRoutes: any;
  fiscalYearName: any;
  fscStartDate: string;
  fscEndDate: string;
  nepStartDate: string;
  nepEndDate: string;
  nepFiscalYear: any;
  public primaryNavItems : Array<any> = null;
  public secondaryNavItems:Array<any>=null;
  constructor(public securityService: SecurityService,
    public accountingBLService: AccountingBLService) {
    //get the chld routes of Accounting from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Accounting");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1); 
    this.setFilcalYearName();
  }

  public setFilcalYearName() {
    try {
      this.accountingBLService.GetFiscalYearList()
        .subscribe(res => {
          if (res.Results.length) {
            var data = res.Results;
            var cuurfiscyear = data.find(a => a.IsActive == true);
            this.fiscalYearName = cuurfiscyear.FiscalYearName;
            this.fscStartDate = moment(cuurfiscyear.StartDate).format('YYYY-MM-DD');
            this.fscEndDate = moment(cuurfiscyear.EndDate).format('YYYY-MM-DD');
            this.nepFiscalYear = cuurfiscyear.NpFiscalYearName;
            this.nepStartDate = cuurfiscyear.nStartDate;
            this.nepEndDate = cuurfiscyear.nEndDate;
          }
        });
    } catch (ex) {
      console.log(ex);
    }
  }
}
