import { Component, Input, EventEmitter, Output } from '@angular/core';
import { LabSticker } from '../shared/lab-sticker.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { LabTestRequisition } from './lab-requisition.model';
import { LabsBLService } from './labs.bl.service';

import { CoreService } from '../../core/shared/core.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { LabService } from './lab.service';

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
  public showLabStickerPrintOption: boolean = false;

  //public CloseSticker() {
  //    this.requisitionIdList = [];
  //    this.name = null;
  //    this.sendDataBack.emit({ exit: true });
  //}

  constructor(public msgBoxServ: MessageboxService, public coreService: CoreService,
    public labBLService: LabsBLService, public labService: LabService) {
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
    this.showLabStickerPrintOption = this.coreService.ShowLabStickerPrintOption();
  }


  ngAfterViewInit() {
    if (document.getElementById('numberOfPrint')) {
      document.getElementById('numberOfPrint').focus();
    }
  }

  ngOnInit() {
    if (this.requisitionIdList && this.requisitionIdList.length > 0) {
      this.GetAllRequisitionsFromIdList(this.requisitionIdList);
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
    if (numberOfPrint > 5) {
      this.msgBoxServ.showMessage('Failed', ["Unable to Print.. Print Count cannot be more than 5 !"]);
    }
    else {
      let popupWinindow;
      var printContents = document.getElementById("LabSticker").innerHTML;
      popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
      popupWinindow.document.open();
      let documentContent = '<html><head>';
      documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
      documentContent += '<style>@media print {@page { size: 2 in 1 in;}} .labBarCodeSticker{border: none !important;marging-top: 10px;} .lbl-rotate {height: 20px;width: 70px;transform: translateX(25%) translateY(-50%) rotate(90deg);font-weight: bold;float: right;font-size: 14px;line-height: 0.8;position: absolute;right: 0;top: 50%;z-index: 2;text-align: center;}</style></head>';
      documentContent += '<body style="margin: 0;" onload="window.print()">' + printContents + '</body></html>';
      popupWinindow.document.write(documentContent);
      popupWinindow.document.close();
    }
  }

  PrintLabSticker_Server(numberOfPrint: number) {
    if (!this.printerName || this.printerName.trim() == '') {
      this.msgBoxServ.showMessage('error', ["Please select your printer "]);
      this.loading = false;
      return;
    }
    if (numberOfPrint > 5) {
      this.msgBoxServ.showMessage('Failed', ["Unable to Print.. Print Count cannot be more than 5 !"]);
      this.loading = false;
    }
    else {

      let printContents = document.getElementById("LabSticker").innerHTML;
      var printableHTML = '<html><head><link rel="stylesheet" type="text/css" href="DanpheStyle.css" />';

      printableHTML += '<meta http-equiv="X-UA-Compatible" content="IE= edge"/>';
      printableHTML += '<style>@media print {@page { size: 2 in 1 in;}} .labBarCodeSticker{border: none !important;} .lbl-rotate {height: 20px;width: 70px;transform: translateX(25%) translateY(-50%) rotate(90deg);font-weight: bold;float: right;font-size: 14px;line-height: 0.8;position: absolute;right: 0;top: 50%;z-index: 2;text-align: center;}</style></head>';
      printableHTML += '<body style="margin: 0;">' + printContents + '</body></html>';

      let fileName = "LabStickerPrinter_" + this.patientinfos.HospitalNumber + "_";///not sure if we need it..


      //below code sends the sticker content to server, it'll there create a file and store to the required location.
      //from there our printer application will send the file to required printer. 
      this.labBLService.SaveLabStickersHTML(this.printerName, fileName, printableHTML, numberOfPrint)
        .subscribe((res: DanpheHTTPResponse) => {
          console.log("lab sticker printed successfully.. ");
          this.loading = false;
          this.sendDataBack.emit({ exit: true });
        });



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

}
