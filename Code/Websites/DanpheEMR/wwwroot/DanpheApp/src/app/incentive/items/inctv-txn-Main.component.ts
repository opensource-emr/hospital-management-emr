import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { DanpheHTTPResponse } from "../../shared/common-models";
import { SecurityService } from "../../security/shared/security.service";

@Component({
  templateUrl: './inctv-txn-Main.html'
})
export class IncentiveTxnMainComponent {

  validRoutes: any;
  constructor(public securityService: SecurityService) {
    this.validRoutes = this.securityService.GetChildRoutes('Incentive/Transactions');
  }

 }
