import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';
import { Router } from '@angular/router';
import { SecurityService } from "../../security/shared/security.service"
import { MessageboxService } from '../../shared/messagebox/messagebox.service';


@Component({
  templateUrl: "./reports.html"
})
export class WardReportComponent {
  validRoutes: any;
  constructor(public securityService: SecurityService, public msgBoxServ: MessageboxService, public router: Router) {
    try {
      if (!this.securityService.getActiveStore().StoreId) {
        this.LoadSubStoreSelectionPage()
      }
    }
    catch (ex) {
      this.msgBoxServ.showMessage("Error", [ex.ErrorMessage]);
    }
    //this.validRoutes = this.securityService.GetChildRoutes("WardSupply/Reports");
  }

  LoadSubStoreSelectionPage() {
    this.router.navigate(['/WardSupply/Pharmacy']);
  }
}
