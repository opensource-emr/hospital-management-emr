import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from '../../../shared/pharmacy.bl.service';

@Component({
  selector: 'phrm-stock-reconcilation',
  templateUrl: './stock-reconcilation.component.html',
  styleUrls: ['./stock-reconcilation.component.css']
})
export class StockReconcilationComponent implements OnInit {

  @Input('stock-list') stockList: any[] = [];
  @Output('call-back-conciliation-popup-close') callBackConciliationPopUpClose: EventEmitter<Object> = new EventEmitter<Object>();
  openExcelSheet: boolean = false;
  showAllStock: boolean = false;
  showSpinner: boolean = false;
  openPopUp: boolean = false;
  disableBtn: boolean = true;
  @ViewChild('inputFile') inputFile: ElementRef;
  isExcelFile: boolean;
  reconciledStocks: any[] = [];
  reconciledStocksWithQuantityChanges: any[] = [];
  confirmPopUp: boolean = false;
  loading: boolean = false;

  constructor(public msgBoxServ: MessageboxService, public pharmacyBLService: PharmacyBLService) { }

  ngOnInit() {
  }
  ClosePopUp() {
    this.disableBtn = true;
    this.reconciledStocksWithQuantityChanges = [];
    this.reconciledStocks = [];
    this.callBackConciliationPopUpClose.emit();
  }
  CloseConfirmationPopUp() {
    this.confirmPopUp = false;
    this.reconciledStocksWithQuantityChanges = [];
    this.reconciledStocks = [];
    this.inputFile.nativeElement.value = '';
    this.showAllStock = false;
  }

  ExportStocksForReconciliationToExcel() {
    this.showSpinner = true;
    this.pharmacyBLService.ExportStocksForReconciliationToExcel()
      .finally(() => { this.showSpinner = false; })
      .subscribe(res => {
        let blob = res;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "PharmacyStockReconciliation_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xlsx';
        document.body.appendChild(a);
        a.click();
      },
        err => {
          console.error(err);
          this.msgBoxServ.showMessage('Failed', [`Download Failed. Check Console.`]);
        });

  }

  openFileSelectPopUp() {
    document.getElementById('file-input').click();
  }
  onChange(evt) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    this.isExcelFile = !!target.files[0].name.match(/(.xls|.xlsx)/);
    target.files.length > 0 ? this.disableBtn = false : this.disableBtn = true;
    if (target.files.length > 1) {
      this.inputFile.nativeElement.value = '';
    }
    if (this.isExcelFile) {
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        //read workbook
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
        //grab first sheet
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        //save data
        this.reconciledStocks = XLSX.utils.sheet_to_json(ws);
      };
      reader.readAsBinaryString(target.files[0]);
    }
    else {
      this.inputFile.nativeElement.value = '';
    }
  }

  FindDifference() {
    for (let i = 0; i <= this.stockList.length - 1; i++) {
      for (let j = i; j <= this.reconciledStocks.length - 1; j++) {
        if (i == j) {

          if (this.stockList[i].AvailableQuantity != this.reconciledStocks[j].AvailableQuantity) {
            this.msgBoxServ.showMessage('Notification', ['Please Select Latest File To Import']);
            return;
          }
          if (this.stockList[i].AvailableQuantity != this.reconciledStocks[j].NewAvailableQuantity) {
            this.reconciledStocksWithQuantityChanges.push(this.reconciledStocks[j]);
          }
        }
      }
    }
    this.confirmPopUp = true;
  }
  UpdateReconciledStockFromExcelFile() {
    this.loading = true;
    this.pharmacyBLService.UpdateReconciledStockFromExcelFile(this.reconciledStocksWithQuantityChanges).finally(() => {
      this.loading = false;
      this.confirmPopUp = false;
    }).subscribe(res => {
      if (res.Status == "OK") {
        this.reconciledStocksWithQuantityChanges = [];
        this.msgBoxServ.showMessage('success', ['Stock Updated Successfully']);
        this.callBackConciliationPopUpClose.emit();
      }
      else {
        this.msgBoxServ.showMessage('Failed', [`Stock Updation Failed! ${res.ErrorMessage}`]);
        this.reconciledStocksWithQuantityChanges = [];
      }
    })
  }
  ViewAllStock() {
    this.showAllStock = true;
  }
  HideAllStock() {
    this.showAllStock = false;
  }

}
