import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router'
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service"
import { QrService } from '../shared/qr-code/qr-service';
import { BillingBLService } from './shared/billing.bl.service';
import { DanpheHTTPResponse } from '../shared/common-models';
import { BillingService } from './shared/billing.service';
import { CoreService } from '../core/shared/core.service';
import { CallbackService } from '../shared/callback.service';



@Component({
  selector: 'my-app',
  templateUrl: "./billing-main.html" //"/BillingView/Billing"

})

// App Component class
export class BillingMainComponent {

  public showdenomination: boolean = false;
  public currentCounter: number = null;

  validRoutes: any;

  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;

  constructor(public securityService: SecurityService, public qrService: QrService,
    public billingBlService: BillingBLService, public billingService: BillingService, public coreService: CoreService,
    public callbackService: CallbackService,public router: Router) {
    //get the chld routes of billing from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Billing");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);

    this.LoadAllBillingItems();
    this.LoadAllDoctorsList();//sud:30Apr'20--for reusability.
    this.LoadAllEmployeeList();//sud:30Apr'20--for reusability.-- note that doctors list and employeelist can be different..
    this.GetOrganizationList(); //sud: 07May '20--for reusability    
    this.currentCounter = this.securityService.getLoggedInCounter().CounterId;
    if(this.currentCounter <1){
      //this.callbackService.CallbackRoute = '/Billing/SearchPatient'
      this.router.navigate(['/Billing/CounterActivate']);
    }
  }


  OpenQrPage() {
    this.qrService.showBilling = true;
    this.qrService.ModuleName = "billing";
  }

  OpendenominationPage() {
    this.showdenomination = true;
  }


  //we have to load all billing items into service variable, which will be used across this module. 
  public LoadAllBillingItems() {
    this.billingBlService.GetBillItemList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          console.log("bill item prices are loaded successfully (billing-main).");
          this.billingService.LoadAllBillItemsPriceList(res.Results);
        }
        else {
          console.log("Couldn't load bill item prices. (billing-main)");
        }
      });
  }

  //sud:30Apr'20--For reusability..//getting doctors list and set to the global variable.
  public LoadAllDoctorsList() {
    this.billingBlService.GetDoctorsList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          console.log("doctors list are loaded successfully (billing-main).");
          this.billingService.SetAllDoctorList(res.Results);
        }
        else {
          console.log("Couldn't get doctor's list. (billing-main)");
        }
      });
  }

  //sud:30Apr'20--For reusability.. //getting employeelist  and set to the global variable.
  public LoadAllEmployeeList() {
    this.billingBlService.GetActiveEmployeesList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          console.log("Employee list are loaded successfully (billing-main).");
          this.billingService.SetAllEmployeeList(res.Results);
        }
        else {
          console.log("Couldn't get Employee list. (billing-main)");
        }
      });
  }


  //getting credit organization list and set to the global variable.
  public GetOrganizationList() {
    this.billingBlService.GetOrganizationList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == 'OK') {
          console.log("CreditOrganization list are loaded successfully (billing-main).");
          this.billingService.SetAllCreditOrgList(res.Results);
        }
        else {
          console.log("Couldn't get CreditOrganization List(billing-main).");
        }
      });
  }


}
