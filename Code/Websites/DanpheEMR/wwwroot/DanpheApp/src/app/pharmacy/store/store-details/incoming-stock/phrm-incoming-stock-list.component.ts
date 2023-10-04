import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import DispensaryGridColumns from '../../../../dispensary/shared/dispensary-grid.column';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { GridEmitModel } from '../../../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from '../../../shared/pharmacy.bl.service';

@Component({
  selector: 'app-phrm-incoming-stock-list',
  templateUrl: './phrm-incoming-stock-list.component.html',
  styleUrls: ['./phrm-incoming-stock-list.component.css'],
  animations: [
    trigger(
      'enterAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-10%)', opacity: 0 }),
        animate('500ms', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate('500ms', style({ transform: 'translateY(-10%)', opacity: 0 }))
      ])
    ]
    )
  ],
})
export class PhrmIncomingStockListComponent implements OnInit {
  isPageLoadedForFirstTime: boolean = true;
  showReceiveStockPopUp: boolean;
  incomingStockList: any[];
  incomingStockGridColumns: any[];
  selectedDispatchId: number;
  showIncomingStockGrid: boolean = false;
  totalNumberOfPendingStock: number = 0;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  @Output("call-back-new-stock-receive") callBackNewStockReceive: EventEmitter<object> = new EventEmitter<object>();
  constructor(public pharmacyBLService: PharmacyBLService, public messageBoxService: MessageboxService,) {
    this.incomingStockGridColumns = DispensaryGridColumns.IncomingStockList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail('DispatchedDate', false), new NepaliDateInGridColumnDetail('ReceivedOn', false)]);
    this.GetIncomingStock();
  }

  private GetIncomingStock() {
    this.pharmacyBLService.GetMainStoreIncomingStock()
      .subscribe(
        res => {
          if (res.Status == "OK") {
            this.incomingStockList = res.Results.incomingStockList;
            if (this.isPageLoadedForFirstTime) {
              this.totalNumberOfPendingStock = this.incomingStockList.filter(s => s.CanUserReceiveStock == true).length;
              this.showIncomingStockGrid = this.totalNumberOfPendingStock > 0;
              this.isPageLoadedForFirstTime = false;
            }
          }
        },
        err => {
          console.log("Failed to load incoming stock. Detail: ", err);
        });
  }

  ngOnInit() {
  }
  incomingStockGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "receiveStock": {
        this.showReceiveStockPopUp = true;
        this.selectedDispatchId = $event.Data.DispatchId;
        break;
      }
      default:
        break;
    }
  }
  OnReceiveIncomingStockClosed($event) {
    if ($event.event == 'success') {
      this.callBackNewStockReceive.emit();
    }
    this.selectedDispatchId = null;
    this.showReceiveStockPopUp = false;
    this.GetIncomingStock();
  }

}
