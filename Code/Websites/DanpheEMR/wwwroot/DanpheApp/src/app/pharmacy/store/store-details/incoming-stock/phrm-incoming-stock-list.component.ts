import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import DispensaryGridColumns from '../../../../dispensary/shared/dispensary-grid.column';
import { GridEmitModel } from '../../../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
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
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  @Output("call-back-new-stock-receive") callBackNewStockReceive: EventEmitter<object> = new EventEmitter<object>();
  constructor(public pharmacyBLService: PharmacyBLService, public messageBoxService: MessageboxService,) {
    this.dateRange = 'last1Week';
    this.incomingStockGridColumns = DispensaryGridColumns.IncomingStockList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail('DispatchedDate', false), new NepaliDateInGridColumnDetail('ReceivedOn', false)]);
    //to be loaded for the first time
    this.toDate = moment(new Date()).format('YYYY-MM-DD');
    this.fromDate = moment(new Date().setDate(new Date().getDate() - 7)).format('YYYY-MM-DD');
    this.GetIncomingStock();
  }

  private GetIncomingStock() {
    this.pharmacyBLService.GetMainStoreIncomingStock(this.fromDate, this.toDate)
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
  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetIncomingStock();
      } else {
        this.messageBoxService.showMessage('failed', ['Please enter valid From date and To date']);
      }
    }
  }
}
