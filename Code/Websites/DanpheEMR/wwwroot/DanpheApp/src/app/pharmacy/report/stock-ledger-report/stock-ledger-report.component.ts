import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import * as moment from "moment";
import { DetailStockLedger } from "../../../inventory/shared/detail-stock-ledger.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";

@Component({
    templateUrl: "./stock-ledger-report.html"
})
export class StockLedgerReportComponent  implements OnInit{
  fromDate: string;
  toDate: string;
  allItemList: any[] = [];
  sourceStoreList: any[] = [];
  targetStoreList: any[] = [];
  public ItemId: number = null;
  public selectedItem: any;
  public footerContent='';
  public dateRange:string="";
  public pharmacy:string = "pharmacy";
  stockledgerReportGridColumns:Array<any> = null;
  stockLedgerReport:Array<any>=new Array<DetailStockLedger>();
  

  constructor(private phrmBLService: PharmacyBLService, private msgBoxServ: MessageboxService,public changeDetector: ChangeDetectorRef) {
    this.stockledgerReportGridColumns = PHRMReportsGridColumns.StockLedgerReport;
    this.GetItemList();
    this.fromDate = moment().format("YYYY-MM-DD");
    this.toDate = moment().format("YYYY-MM-DD");
  }

  ngOnInit() {
  }
  ngAfterViewChecked(){
      if(document.getElementById("print_summary")!=null){
    this.footerContent=document.getElementById("print_summary").innerHTML;
      }  
  }
  GetItemList() {
    this.phrmBLService.GetItemList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.allItemList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("Notice-Message", ["Failed to load item data."]);
        }
      }, () => {
        this.msgBoxServ.showMessage("Failed", ["Failed to load item data."]);
      });
  }
  GetReportData() {
    if (this.checkDateValidation()) {
      
    }
  }
  checkDateValidation() {
    if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
      return true;
    } else {
      this.msgBoxServ.showMessage('failed', ['Please enter valid From date and To date']);
      return false;
    }
  }
  myItemListFormatter(data: any): string {
    let html = data["GenericName"] + " | " + data["ItemName"];
    return html;
  }
  onChangeItem($event) {
    try {
      if ($event.ItemId != null) {
        this.ItemId = this.selectedItem.ItemId;
      }
      else {
        this.ItemId = null;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  CheckProperSelectedItem() {
    try {
      if ((typeof this.selectedItem !== 'object') || (typeof this.selectedItem === "undefined") || (typeof this.selectedItem === null)) {
        this.selectedItem = null;
        this.ItemId = null;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
    this.dateRange="<b>Date:</b>&nbsp;"+this.fromDate+"&nbsp;<b>To</b>&nbsp;"+this.toDate;
  }
  gridExportOptions = {
    fileName: 'StockLedgerReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };


}