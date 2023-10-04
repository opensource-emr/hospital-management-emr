import { Component } from '@angular/core';
import { SecurityBLService } from '../security/shared/security.bl.service';
import { SecurityService } from "../security/shared/security.service";
import { DanpheHTTPResponse } from '../shared/common-models';
import { ENUM_DanpheHTTPResponseText, ENUM_DanpheHTTPResponses } from '../shared/shared-enums';
import { PharmacyBLService } from './shared/pharmacy.bl.service';
import { PharmacyService } from './shared/pharmacy.service';

@Component({
  templateUrl: "./pharmacy-main.html"
})
//Module's main component class
export class PharmacyMainComponent {
  validRoutes: any;
  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;
  constructor(public securityService: SecurityService, public securityBLService: SecurityBLService, public pharmacyBLService: PharmacyBLService, public pharmacyService: PharmacyService) {
    //get the chld routes of PatientMain from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Pharmacy");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
    this.LoadINVHospitalInfo();
    this.loadItemRateHistory();
    this.loadMRPHistory();
    this.LoadAllFiscalYears();
    this.loadFreeQuantityHistory();
    this.GetStores();
  }
  //NageshBB- 10 Sep 2020- This function will load basic info for inventory module like fiscal Year list, today date, current fiscal year, etc
  LoadINVHospitalInfo() {
    this.securityService.SetModuleName('inventory');
    if (!(this.securityService.INVHospitalInfo.CurrFiscalYear.FiscalYearId > 0)) {//if information not there then get and set
      this.securityBLService.GetINVHospitalInfo()
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == 'OK') {
            this.securityService.SetINVHospitalInfo(res.Results);
          }
        },
          err => {
            alert('failed to get inventory hospsital info. Please try again.');
          });
    }
  }
  //this loads the pharmacy item rate history
  public loadItemRateHistory() {
    this.pharmacyBLService.getItemRateHistory()
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length > 0) {
          this.pharmacyService.setItemRateHistory(res.Results);
        }
      }, err => {
        console.log(err.error.ErrorMessage);
      })
  }
  public loadMRPHistory() {
    this.pharmacyBLService.getMRPHistory()
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length > 0) {
          this.pharmacyService.setMRPHistory(res.Results);
        }
      }, err => {
        console.log(err.error.ErrorMessage);
      })
  }

  public LoadAllFiscalYears() {
    this.pharmacyBLService.GetFiscalYearList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == ENUM_DanpheHTTPResponseText.OK) {
          this.pharmacyService.LoadAllFiscalYearList(res.Results);
        }
        else {
          console.log("Couldn't load fiscal years. (pharmacy-main)");
        }
      });
  }

  public loadFreeQuantityHistory() {
    this.pharmacyBLService.getItemFreeQuantityHistory()
      .subscribe(res => {
        if (res.Status == ENUM_DanpheHTTPResponses.OK && res.Results.length > 0) {
          this.pharmacyService.setItemFreeQuantityHistory(res.Results);
        }
      }, err => {
        console.log(err.error.ErrorMessage);
      })
  }


  public GetStores() {
    this.pharmacyBLService.GetStores().subscribe((res: DanpheHTTPResponse) => {
      if (res.Status == ENUM_DanpheHTTPResponses.OK) {
        this.pharmacyService.setStores(res.Results);
      }
    }, err => {
      console.log(err.error.ErrorMessage);
    })
  }
}
