import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router'
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service"
import { AccountingBLService } from "./shared/accounting.bl.service";
import * as moment from 'moment/moment';
import { CoreService } from '../core/shared/core.service';
@Component({
  templateUrl: "./accounting-main.html",
  styles: [`.page-bar .page-breadcrumb > li{vertical-align: middle;} .margin-rt-15{margin-right: 15px;}`]
})
export class AccountingComponent {
  validRoutes: any;
  fiscalYearName: any;
  fscStartDate: string;
  fscEndDate: string;
  nepStartDate: string;
  nepEndDate: string;
  nepFiscalYear: any;
  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;
  public changeActivatedHospital: boolean = false;
  constructor(public securityService: SecurityService, public _router: Router,
    public accountingBLService: AccountingBLService,private coreService: CoreService) {
    //get the chld routes of Accounting from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Accounting");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);

    this.LoadActiveHospital();      

  }

  ngOnInit() {
  }

  LoadActiveHospital() {
    this.securityService.SetModuleName('accounting');
    let activeHospitalInfo = this.securityService.AccHospitalInfo;
    if (activeHospitalInfo && activeHospitalInfo.ActiveHospitalId) {

      // let curFiscYr = activeHospitalInfo.FiscalYearList.find(f =>
      //   moment(f.StartDate) <= moment(activeHospitalInfo.TodaysDate) && moment(activeHospitalInfo.TodaysDate) <= moment(f.EndDate)
      // );
      //activeHospitalInfo.CurrFiscalYear = ;
      this._router.navigate(['/Accounting/Transaction/VoucherEntry']);
    }
    else {
      this._router.navigate(['/Accounting/Transaction/ActivateHospital']);
    }
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


  OpenHospitalChangeWindow() {
    let isConfirm = window.confirm("Are you sure you want to change the Current Hospital?");
    //we get true/false from window.confirm. if true then go to hosptial changing page.
    if (isConfirm) {
      this._router.navigate(['/Accounting/Transaction/ActivateHospital']);
    }
  }

  activatedRouteChanged($event) {
    if ($event) {
      this.changeActivatedHospital = false;
      if ($event.activatedTenantChanged) {
        this._router.navigate(['/Accounting/Transaction/VoucherEntry']);
      }
    }

  }

}
