import { Component, OnInit } from '@angular/core';
import { PHRMStoreModel } from '../../../pharmacy/shared/phrm-store.model';
import { SecurityService } from '../../../security/shared/security.service';
import { DispensaryService } from '../../shared/dispensary.service';

@Component({
  selector: 'app-sales-main',
  templateUrl: './sales-main.component.html',
  styles: []
})
export class SalesMainComponent implements OnInit {
  validRoutes: any;
  validRoute:Array<any>;
  validinsuranceRoute:any;
  public selectedDispensary:PHRMStoreModel;
  IsCurrentDispensaryInsurace: boolean;
  constructor(private _securityService: SecurityService,private _dispensaryService:DispensaryService) {
    this.selectedDispensary = this._dispensaryService.activeDispensary;
    this.IsCurrentDispensaryInsurace = this._dispensaryService.isInsuranceDispensarySelected;
    this.validRoutes = this._securityService.GetChildRoutes("Dispensary/Sale");
    this.validRoute = this.validRoutes;
    if(this.IsCurrentDispensaryInsurace == true){
     this.validRoutes = this.validRoute.filter(a=>a.RouterLink != "ProvisionalReturn"&& a.RouterLink !="Settlement"&& a.RouterLink!="CreditBills")
    }
    else{
      this.validRoutes = this.validRoutes;
    }
    
  }
  ngOnInit() {
    this.selectedDispensary = this._dispensaryService.activeDispensary;
  }

}
