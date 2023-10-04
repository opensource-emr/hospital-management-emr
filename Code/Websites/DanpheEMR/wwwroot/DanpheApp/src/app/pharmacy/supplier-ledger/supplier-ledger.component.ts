import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import PHRMGridColumns from '../shared/phrm-grid-columns';
import { SupplierLedgerService } from './supplier-ledger.service';

@Component({
  selector: 'app-supplier-ledger',
  templateUrl: './supplier-ledger.component.html',
  styleUrls: ['./supplier-ledger.component.css']
})
export class SupplierLedgerComponent implements OnInit {
  public supplierLedgerGridColumns: Array<any> = null;
  supplierLedgerTxnData: any;
  constructor(private router: Router, private _supplierLedgerService: SupplierLedgerService, private msgBox: MessageboxService) {
    this.supplierLedgerGridColumns = PHRMGridColumns.SupplierLedgerList;
  }

  ngOnInit() {
    this.getAllSuppliersLedgerTxn();
  }
  getAllSuppliersLedgerTxn() {
    this._supplierLedgerService.getAllSuppliersLedgerTxn()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.supplierLedgerTxnData = res.Results.SupplierLedgers;
        }
        else {
          this.msgBox.showMessage("Failed", ["Failed to load supplier ledgers."]);
        }
      }, err => {
        this.msgBox.showMessage("Failed", ["Failed to load supplier ledgers."]);
      });
  }

  SupplierLedgerGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        var data = $event.Data;
        this.router.navigate(['/Pharmacy/SupplierLedgerView'], { queryParams: { id: data.SupplierId } });
        //this.router.navigate(['/Pharmacy/SupplierLedgerView',data.SupplierId]);
        break;
      }
      default:
        break;
    }

  }
}

