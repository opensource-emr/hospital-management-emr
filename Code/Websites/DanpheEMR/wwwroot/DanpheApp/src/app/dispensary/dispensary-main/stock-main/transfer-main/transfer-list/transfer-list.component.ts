import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../../../../../core/shared/core.service';
import { PharmacyBLService } from '../../../../../pharmacy/shared/pharmacy.bl.service';
import { PharmacyService } from '../../../../../pharmacy/shared/pharmacy.service';
import { PHRMStoreModel } from '../../../../../pharmacy/shared/phrm-store.model';
import { GridEmitModel } from '../../../../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../../../shared/routefrom.service';
import DispensaryGridColumns from '../../../../shared/dispensary-grid.column';
import { DispensaryService } from '../../../../shared/dispensary.service';
import { TransferService } from '../transfer.service';

@Component({
  selector: 'app-transfer-list',
  templateUrl: './transfer-list.component.html',
  styleUrls: ['./transfer-list.component.css']
})
export class TransferListComponent implements OnInit {
  transferGridColumns: Array<any> = [];
  transferGridData: Array<any> = [];
  currentActiveDispensary: PHRMStoreModel;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(public coreService: CoreService, private _dispensaryService: DispensaryService,
    public dispensaryTransferService: TransferService,
    public pharmacyBLService: PharmacyBLService,
    public pharmacyService: PharmacyService,
    public router: Router,
    public routeFrom: RouteFromService,
    public messageBoxService: MessageboxService) {
    this.transferGridColumns = DispensaryGridColumns.DispensaryTransferRecords;
    this.currentActiveDispensary = this._dispensaryService.activeDispensary;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail('TransferredDate', false), new NepaliDateInGridColumnDetail('ExpiryDate', false)]);

    this.LoadTransferRecords();
  }

  public LoadTransferRecords() {
    this.dispensaryTransferService.GetAllTransferRecordById(this.currentActiveDispensary.StoreId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.transferGridData = res.Results;
        }
        else {
          this.messageBoxService.showMessage("Failed", ["Failed to load transfer list."]);
        }
      }, err => {
        this.messageBoxService.showMessage("Failed", ["Failed to load transfer list."]);
      });
  }

  ngOnInit() {
  }
  TransferGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      default:
        break;

    }
  }
  Transfer() {
    this.router.navigate(['/Dispensary/Stock/Transfer/Add']);
  }

}
