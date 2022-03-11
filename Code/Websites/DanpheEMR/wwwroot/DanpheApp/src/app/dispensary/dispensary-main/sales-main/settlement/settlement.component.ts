import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { PatientService } from '../../../../patients/shared/patient.service';
import { PHRMSettlementModel } from '../../../../pharmacy/shared/pharmacy-settlementModel';
import { PharmacyBLService } from '../../../../pharmacy/shared/pharmacy.bl.service';
import { PharmacyService } from '../../../../pharmacy/shared/pharmacy.service';
import { PHRMInvoiceModel } from '../../../../pharmacy/shared/phrm-invoice.model';
import { PHRMStoreModel } from '../../../../pharmacy/shared/phrm-store.model';
import { SecurityService } from '../../../../security/shared/security.service';
import { CallbackService } from '../../../../shared/callback.service';
import { DanpheHTTPResponse } from '../../../../shared/common-models';
import { CommonFunctions } from '../../../../shared/common.functions';
import { GridEmitModel } from '../../../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../../shared/routefrom.service';
import DispensaryGridColumns from '../../../shared/dispensary-grid.column';
import { DispensaryService } from '../../../shared/dispensary.service';

@Component({
  selector: 'app-settlement',
  templateUrl: './settlement.component.html',
  styleUrls: ['./settlement.component.css']
})
export class SettlementComponent implements OnInit, OnDestroy {

  public settlementRoutes:any;
  public settlementPrimaryNavItems: Array<any> = null;


  constructor(public securityService: SecurityService) {

  
    this.settlementRoutes = this.securityService.GetChildRoutes("Dispensary/Sale/Settlement");
      this.settlementPrimaryNavItems = this.settlementRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);

  }
  ngOnInit(): void {
  }
  ngOnDestroy(): void {

  }

}
