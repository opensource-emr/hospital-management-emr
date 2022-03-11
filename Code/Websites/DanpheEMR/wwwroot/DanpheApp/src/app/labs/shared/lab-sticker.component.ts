import { Component, Input, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { LabSticker } from '../shared/lab-sticker.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { LabTestRequisition } from './lab-requisition.model';
import { LabsBLService } from './labs.bl.service';

import { CoreService } from '../../core/shared/core.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { LabService } from './lab.service';
import { PrinterSettingsModel, ENUM_PrintingType } from '../../settings-new/printers/printer-settings.model';
import { Router } from '@angular/router';

@Component({
  selector: 'lab-sticker',
  templateUrl: './lab-sticker.html'
})

export class LabStickerComponent {

  @Input("showlabsticker")
  public showlabsticker: boolean;

  @Input("requisitionIdList")
  public requisitionIdList: Array<number>;

  @Input("PatientLabInfo")
  public patientinfos: LabSticker = new LabSticker();

  @Input("isFromLabRequisition")
  public fromLabRequisition: boolean = false;

  @Output("callback-Add") sendDataBack: EventEmitter<object> = new EventEmitter<object>();

  public loading = false;

  public name: string;
  public barcode: number;

  public numberOfPrint: number = 1;
  public showServerSidePrinting: boolean = false;//sud:5-Nov-18 to show/hide the print button of server side.

  public allLabRequisitions: Array<LabTestRequisition> = new Array<LabTestRequisition>();

  public allLabprinterName: any = null;
  public printerName: string = null;
  public printerNameSelected: any = null;
  public showStickerChange: boolean = false;
  public printOptionParam: any = false;
  public serverPrintFolderPath: any;
  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any;
  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();

  //public CloseSticker() {
  //    this.requisitionIdList = [];
  //    this.name = null;
  //    this.sendDataBack.emit({ exit: true });
  //}

  constructor(public msgBoxServ: MessageboxService, public coreService: CoreService,
    public labBLService: LabsBLService, public labService: LabService, public changeDetector: ChangeDetectorRef, public router: Router) {
    this.name = this.patientinfos.PatientName;
    this.barcode = this.patientinfos.BarCodeNumber;
    this.showServerSidePrinting = this.IsPrintFromServer();
    this.printerName = this.labService.defaultPrinterName;
    var allLabStickerFolderDetail = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() == 'lab' && a.ParameterName == 'LabStickerSettings');
    if (allLabStickerFolderDetail) {
      this.allLabprinterName = JSON.parse(allLabStickerFolderDetail.ParameterValue);
      if (this.allLabprinterName.length > 1 && !this.printerName) {
        this.showStickerChange = true;
      }
    }
    this.printOptionParam = this.coreService.ShowLabStickerPrintOption();
  }


  ngAfterViewInit() {
    if (document.getElementById('numberOfPrint')) {
      this.coreService.FocusInputById("numberOfPrint");
    }
  }

  ngOnInit() {
    if (this.requisitionIdList && this.requisitionIdList.length > 0) {
      this.GetAllRequisitionsFromIdList(this.requisitionIdList);
    }
    if (document.getElementById('numberOfPrint')) {
      this.coreService.FocusInputById("numberOfPrint");
    }
  }

  public GetAllRequisitionsFromIdList(reqIdList: Array<number>) {
    //LabTestRequisition
    this.labBLService.GetLabRequisitionsFromReqIdList(this.requisitionIdList)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allLabRequisitions = res.Results;
        }
      });
  }

  PrintLabSticker_Client(numberOfPrint: number) {
    let limit = this.printOptionParam.maximumPrintCount ? this.printOptionParam.maximumPrintCount : 5;
    if (numberOfPrint > limit) {
      this.msgBoxServ.showMessage('Failed', ["Unable to Print.. Print Count cannot be more than " + limit + "!"]);
    }
    else {
      if (!(numberOfPrint > 0)) {
        this.msgBoxServ.showMessage('Failed', ["Unable to Print.. Please provide Print Count greater than 0."]);
        return;
      }
      let popupWinindow;
      var printContents = document.getElementById("LabSticker").innerHTML;
      popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
      popupWinindow.document.open();
      let documentContent = '<html><head>';
      documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
      documentContent += '<style>@media print {@page { size: 2 in 1 in;}} .labBarCodeSticker{border: none !important;marging-top: 10px;} .lbl-rotate {height: 20px;width: 70px;transform: translateX(25%) translateY(-50%) rotate(90deg);font-weight: bold;float: right;font-size: 14px;line-height: 0.8;position: absolute;right: 0;top: 50%;z-index: 2;text-align: center;}</style></head>';
      documentContent += '<body style="margin: 0;">';
      for (let index = 0; index < numberOfPrint; index++) {
        documentContent += printContents;
      }
      documentContent += '</body></html>';

      popupWinindow.document.write(documentContent);
      popupWinindow.document.close();

      let tmr = setTimeout(function () {
        popupWinindow.print();
        popupWinindow.close();
      }, 300);
      this.sendDataBack.emit({ exit: true });
    }
  }

  PrintLabSticker_Server(numberOfPrint: number) {
    // if (!this.printerName || this.printerName.trim() == '') {
    //   this.msgBoxServ.showMessage('error', ["Please select your printer "]);
    //   this.loading = false;
    //   return;
    // }
    let limit = this.printOptionParam.maximumPrintCount ? this.printOptionParam.maximumPrintCount : 5;
    if (numberOfPrint > limit) {
      this.msgBoxServ.showMessage('Failed', ["Unable to Print.. Print Count cannot be more than " + limit + "!"]);
      this.loading = false;
    }
    else {

      let printContents = document.getElementById("LabSticker").innerHTML;
      var printableHTML = '<html><head><link rel="stylesheet" type="text/css" href="DanpheStyle.css" />';

      printableHTML += '<meta http-equiv="X-UA-Compatible" content="IE= edge"/>';
      printableHTML += '<style>@media print {@page { size: 2 in 1 in;}} .labBarCodeSticker{border: none !important;} .lbl-rotate {height: 20px;width: 70px;transform: translateX(25%) translateY(-50%) rotate(90deg);font-weight: bold;float: right;font-size: 14px;line-height: 0.8;position: absolute;right: 0;top: 50%;z-index: 2;text-align: center;}</style></head>';
      printableHTML += '<body style="margin: 0;">' + printContents + '</body></html>';

      let fileName = "LabStickerPrinter_" + this.patientinfos.HospitalNumber + "_";///not sure if we need it..

      var filePath = this.coreService.AllPrinterSettings.find(a => a.PrintingType == 'server' && a.GroupName == 'lab-sticker').ServerFolderPath;
      var lastCharacter = filePath.substr(filePath.length - 1);
      if (lastCharacter != '\\') {
        filePath += '\\';
      }
      //below code sends the sticker content to server, it'll there create a file and store to the required location.
      //from there our printer application will send the file to required printer. 
      this.labBLService.SaveLabStickersHTML(this.printerName, filePath, printableHTML, numberOfPrint)
        .subscribe((res: DanpheHTTPResponse) => {
          console.log("lab sticker printed successfully.. ");
          this.loading = false;
          this.sendDataBack.emit({ exit: true });
        });



    }

  }

  public print(numberOfPrint) {
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType == ENUM_PrintingType.browser) {
      this.browserPrintContentObj = document.getElementById("LabSticker");
      this.PrintLabSticker_Client(numberOfPrint);
      //this.openBrowserPrintWindow = true;
      this.changeDetector.detectChanges();
      this.router.navigate(['Lab/PendingLabResults']);
    } else if (this.selectedPrinter.PrintingType == ENUM_PrintingType.server) {
      this.PrintLabSticker_Server(numberOfPrint);
    }
    else {
      this.msgBoxServ.showMessage('error', ["Printer Not Supported."]);
      return;
    }
  }



  IsPrintFromServer(): boolean {

    let labPrintParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "LAB" && a.ParameterName == "LabSticker_PrintServerSide");
    if (labPrintParam && labPrintParam.ParameterValue == "true") {
      return true;
    }
    else {
      return false;
    }
  }

  public ChangePrinterLocationName() {
    if (this.printerNameSelected) {
      if (localStorage.getItem('Danphe_LAB_Default_PrinterName')) {
        localStorage.removeItem('Danphe_LAB_Default_PrinterName');
      }
      localStorage.setItem('Danphe_LAB_Default_PrinterName', this.printerNameSelected);
      this.labService.defaultPrinterName = this.printerNameSelected;
      this.printerName = this.printerNameSelected;
      this.showStickerChange = false;
    } else {
      this.msgBoxServ.showMessage('error', ["Please select Printer Location"]);
    }
  }

  public ShowStickerLocationChange() {
    this.printerNameSelected = this.printerName;
    this.showStickerChange = true;
  }

  SetFocusById(IdToBeFocused: string) {
    window.setTimeout(function () {
      if (document.getElementById(IdToBeFocused)) {
        document.getElementById(IdToBeFocused).focus();
      }
    }, 100);
  }


  OnPrinterChanged($event) {
    this.selectedPrinter = $event;
  }

}
