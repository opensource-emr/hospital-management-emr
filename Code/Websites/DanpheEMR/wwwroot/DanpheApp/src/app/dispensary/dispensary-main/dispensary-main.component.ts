import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PharmacyCounter } from '../../pharmacy/shared/pharmacy-counter.model';
import { PHRMStoreModel } from '../../pharmacy/shared/phrm-store.model';
import { SecurityService } from '../../security/shared/security.service';
import { DispensaryService } from '../shared/dispensary.service';

@Component({
  selector: 'app-dispensary-main',
  templateUrl: './dispensary-main.component.html',
  styleUrls: ['./dispensary-main.component.css']
})
export class DispensaryMainComponent implements OnInit {
  validRoutes: any;
  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;

  showDispensaryInfo: boolean;
  selectedDispensary: PHRMStoreModel;

  constructor(private _securityService: SecurityService, private _dispensaryService: DispensaryService, public router: Router) {
    //get the child routes of Dispensary from valid routes available for this user.
    this.validRoutes = this._securityService.GetChildRoutes("Dispensary");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
  }

  ngOnInit() {
    this.selectedDispensary = this._dispensaryService.activeDispensary;
  }
  UnsetGlobalDispensary() {
    this.selectedDispensary = new PHRMStoreModel();
    this._dispensaryService.activeDispensary = this.selectedDispensary;
    //also unset the counter.
    this._securityService.setPhrmLoggedInCounter(new PharmacyCounter());
    this.router.navigate(['/Dispensary/ActivateDispensary']);
  }
  ShowInfo() {
    this.showDispensaryInfo = true;
    var timer = setInterval(() => { this.CloseInfo(); clearInterval(timer) }, 10000);
  }
  CloseInfo() {
    this.showDispensaryInfo = false;
  }
}
