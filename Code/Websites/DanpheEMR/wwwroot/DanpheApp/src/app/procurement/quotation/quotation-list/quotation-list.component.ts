import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { SecurityService } from '../../../security/shared/security.service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import ProcurementGridColumns from '../../shared/procurement-grid-column';
import { QuotationBLService } from '../quotation.bl.service';
import { QuotationModel } from '../quotation.model';

@Component({
  selector: 'app-quotation-list',
  templateUrl: './quotation-list.component.html',
  styles: []
})
export class QuotationListComponent implements OnInit {

  ngOnInit() {
  }

  public quotationList: Array<QuotationModel> = new Array<QuotationModel>();
  public index: number = 0;
  public QuotationGridColumns: Array<any> = null;
  public polistVendorwiseGridColumns: Array<any> = null;
  public QuotationItems: any;
  public disable: boolean = true;
  public localDatalist: Array<any> = [];
  public showQuotationItemsList: boolean = false;
  public quoList: any;
  public selectedDatalist: Array<any> = [];
  public showReqForQuotationId: boolean = false;
  public showQuotationPrintPage: boolean = false;

  constructor(public quotationBLService: QuotationBLService,
    public inventoryService: InventoryService,
    public changeDetectorRef: ChangeDetectorRef,
    public messageBoxService: MessageboxService,
    public securityService: SecurityService,
    public router: Router) {

    this.QuotationGridColumns = ProcurementGridColumns.QuotationList;
    let ReqForQuotationId = this.inventoryService.ReqForQuotationId;
    this.LoadQuotationListById(ReqForQuotationId);
  }

  AddQuotation() {
    this.router.navigate(['/ProcurementMain/Quotation/QuotationAdd']);
  }

  LoadQuotationListById(ReqForQuotationId) {
    this.quotationBLService.GetQuotationList(ReqForQuotationId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.quotationList = res.Results
        }
        else {
          this.messageBoxService.showMessage("failed", ['failed to get Quotation list.. please check log for details.']);
          console.log(res.ErrorMessage);
        }
      });
  }

  ngAfterViewChecked() {
    this.changeDetectorRef.detectChanges();
  }

  QuotationGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        var data = $event.Data;
        this.ShowQuotationItemsById(data.QuotationId);
      }
        break;
      default:
        break;
    }
  }

  ShowQuotationItemsById(QuotationId) {
    this.quotationBLService.GetQuotationItemsById(QuotationId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.QuotationItems = res.Results;
          this.showQuotationItemsList = true;
        } else {
          this.messageBoxService.showMessage("failed", ['Failed to get QuotationItem.' + res.ErrorMessage]);
        }
      },
        err => {
          this.messageBoxService.showMessage("error", ['Failed to get QuotationItem.' + err.ErrorMessage]);
        })
  }

  Close() {
    this.showReqForQuotationId = false;
    this.showQuotationItemsList = false;
    this.showQuotationPrintPage = false;
  }

  /// In Future client wants to print instead of view child so we can use this print func

  // print() {
  //   let popupWinindow;
  //   var printContents = document.getElementById("printpage").innerHTML;
  //   popupWinindow = window.open('');
  //   popupWinindow.document.open();
  //   popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/ReceiptList.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
  //   popupWinindow.document.close();
  // }
  Print() {
    let popupWinindow;
    var printContents = document.getElementById("quotationItemDetails").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=1200,height=1400,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();

    let documentContent = "<html><head>";
    //  documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
    // documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/PrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
    var htmlToPrint = '' + '<style type="text/css">' + '.table_data {' + 'border-spacing:0px' + '}' + '</style>';
    htmlToPrint += documentContent;
    popupWinindow.document.write(htmlToPrint);
    popupWinindow.document.close();
  }

}
