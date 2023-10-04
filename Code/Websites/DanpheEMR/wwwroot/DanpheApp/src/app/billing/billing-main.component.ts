import { Component } from '@angular/core';
//Security Service for Loading Child Route from Security Service
import { CoreService } from '../core/shared/core.service';
import { SecurityService } from "../security/shared/security.service";
import { DanpheHTTPResponse } from '../shared/common-models';
import { QrService } from '../shared/qr-code/qr-service';
import { ENUM_DanpheHTTPResponses } from '../shared/shared-enums';
import { BillingMasterBlService } from './shared/billing-master.bl.service';
import { BillingBLService } from './shared/billing.bl.service';
import { BillingService } from './shared/billing.service';



@Component({
  selector: 'my-app',
  templateUrl: "./billing-main.html" //"/BillingView/Billing"

})

// App Component class
export class BillingMainComponent {

  public showDenomination: boolean = false;
  validRoutes: any;
  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;

  constructor(
    public securityService: SecurityService,
    public qrService: QrService,
    public billingBlService: BillingBLService,
    public billingService: BillingService,
    public coreService: CoreService,
    public billingMasterBlService: BillingMasterBlService
  ) {
    //get the child routes of billing from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Billing");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown === null || a.IsSecondaryNavInDropdown === 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown === 1);

    this.LoadAllBillingItems();
    this.LoadAllDoctorsList();//sud:30Apr'20--for reusability.
    this.LoadAllEmployeeList();//sud:30Apr'20--for reusability.-- note that doctors list and employeelist can be different..
    this.GetOrganizationList(); //sud: 07May '20--for reusability
    this.GetCurrenciesList();
  }


  public OpenQrPage(): void {
    this.qrService.showBilling = true;
    this.qrService.ModuleName = "billing";
  }

  public OpenDenominationPage(): void {
    this.showDenomination = true;
  }

  //we have to load all billing items into service variable, which will be used across this module.
  public LoadAllBillingItems(): void {
    this.billingBlService.GetBillItemList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          console.log("bill item prices are loaded successfully (billing-main).");
          this.billingService.LoadAllBillItemsPriceList(res.Results);
        }
        else {
          console.log("Couldn't load bill item prices. (billing-main)");
        }
      });
  }

  //sud:30Apr'20--For reusability..//getting doctors list and set to the global variable.
  public LoadAllDoctorsList(): void {
    this.billingBlService.GetDoctorsList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          console.log("doctors list are loaded successfully (billing-main).");
          this.billingService.SetAllDoctorList(res.Results);
        }
        else {
          console.log("Couldn't get doctor's list. (billing-main)");
        }
      });
  }

  //sud:30Apr'20--For reusability.. //getting employeelist  and set to the global variable.
  public LoadAllEmployeeList(): void {
    this.billingBlService.GetActiveEmployeesList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          console.log("Employee list are loaded successfully (billing-main).");
          this.billingService.SetAllEmployeeList(res.Results);
        }
        else {
          console.log("Couldn't get Employee list. (billing-main)");
        }
      });
  }

  //getting credit organization list and set to the global variable.
  public GetOrganizationList(): void {
    this.billingBlService.GetOrganizationList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          console.log("CreditOrganization list are loaded successfully (billing-main).");
          this.billingService.SetAllCreditOrgList(res.Results);
        }
        else {
          console.log("Couldn't get CreditOrganization List(billing-main).");
        }
      });
  }

  public GetCurrenciesList(): void {
    this.billingMasterBlService.GetCurrencies()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          console.log("Currency list are loaded successfully (billing-main).");
          this.billingMasterBlService.Currencies = res.Results;
        }
        else {
          console.log("Couldn't get Currency List(billing-main).");
        }
      });
  }
}
