import { Component, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SlicePipe } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { INSStickerViewModel } from './ins-sticker.model';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CommonFunctions } from "../../../shared/common.functions";
import { CoreService } from "../../../core/shared/core.service";
import { NepaliCalendarService } from '../../../shared/calendar/np/nepali-calendar.service';
import { InsuranceService } from "../ins-service";
import { Subscription } from "rxjs";
import { Renderer2 } from "@angular/core";
import { PrinterSettingsModel, ENUM_PrintingType } from "../../../settings-new/printers/printer-settings.model";

@Component({
  selector: 'ins-sticker',
  templateUrl: "./ins-sticker-print.html"
})

export class InsStickerComponent {
  public ageSex: string = '';
  public insStickerDetails: INSStickerViewModel = new INSStickerViewModel();

  @Input("popup-action")
  popupAction: string = "add";//add or edit.. logic will change accordingly.

  public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
  @Input("isInsuranceBilling")
  public isInsuranceBilling: boolean = false;

  @Input("SelectedVisitDetails")
  public SelectedVisitDetails: any;


  public ClaimCode: number = null;

  loading = false;

  public localDateTime: string;
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };

  public showLoading: boolean = false;


  //for QR-specific purpose only--sud.
  public showQrCode: boolean = false;
  public patientQRCodeInfo: string = "";


  public EnableShowTicketPrice: boolean = false;
  public hospitalCode: string = '';
  public QueueNoSetting = { "ShowInInvoice": false, "ShowInSticker": false };


  public showRoomNumber: boolean = false;
  public roomNo: string = null;


  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any;
  public defaultFocus: string = null;

  constructor(
    public http: HttpClient,
    public msgBoxServ: MessageboxService,
    public router: Router,
    public nepaliCalendarServ: NepaliCalendarService,
    public coreService: CoreService,
    public insuranceService: InsuranceService,
    public changeDetector: ChangeDetectorRef,
    public renderer: Renderer2,
  ) {

    this.hospitalCode = this.coreService.GetHospitalCode();
    this.hospitalCode = (this.hospitalCode && this.hospitalCode.trim().length > 0) ? this.hospitalCode : "allhosp";

    this.EnableShowTicketPrice = this.GetEnableShowTicketPrice();
    var room = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() == 'appointment' && a.ParameterName == 'RoomNumberInSticker');
    if (room) {
      let roomValue = JSON.parse(room.ParameterValue);
      this.showRoomNumber = roomValue.Show;
      this.roomNo = roomValue.DisplayName;
    }

  }




  ngOnInit() {
    if (this.SelectedVisitDetails) {
      this.GetVisitforStickerPrint(this.SelectedVisitDetails.PatientVisitId);
    }
    this.QueueNoSetting = this.coreService.GetQueueNoSetting();
  }

  ngAfterViewInit() {
    let btnObj1 = document.getElementById('btnPrintInsSticker');
    if (btnObj1) {
      btnObj1.focus();
    }
  }


  public isStickerInfoLoaded: boolean = false;


  GetVisitforStickerPrint(PatientVisitId) {
    try {
      this.http.get<any>('/api/Insurance?reqType=getVisitInfoforStickerPrint&visitId=' + PatientVisitId, this.options)
        .map(res => res)
        .subscribe(res => {
          if (res.Status = "OK") {
            this.CallBackStickerOnly(res);
          }
          else {
            this.AfterPrintAction();
            this.msgBoxServ.showMessage("error", ["Sorry!!! not able to get date for opd-sticker of this patient"]);
          }
        },
          err => this.Error(err)

        );
    }
    catch (ex) {
      this.msgBoxServ.showMessage('Error', ['Failed to get data']);
    }

  }
  CallBackStickerOnly(res) {
    this.insStickerDetails = res.Results[0];
    this.localDateTime = this.GetLocalDate() + " BS";
    //get Formatted age/sex to give as input to qr-code value.
    this.ageSex = CommonFunctions.GetFormattedAgeSex(this.insStickerDetails.DateOfBrith, this.insStickerDetails.Gender);
    this.patientQRCodeInfo = `Name: ` + this.insStickerDetails.PatientName + `
Hospital No: `+ this.insStickerDetails.PatientCode + `
Age/Sex: `+ this.ageSex + `
Contact No: `+ this.insStickerDetails.PhoneNumber + `
Address: `+ this.insStickerDetails.Address;
    //set this to true only after all values are set.
    //this.showQrCode = true;

    this.isStickerInfoLoaded = true;


  }


  Error(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! not able to get for opd- sticker"]);
    console.log(err.ErrorMessage);
  }

  AfterPrintAction() {
    // this is after print action ..and it pass some event to the parent component
    this.router.navigate(['Insurance/Patient']);
  }

  //06April2018 print from server
  printStickerServer() {
    let printContents = document.getElementById("insSticker").innerHTML;
    var printableHTML = '<html><head><link rel="stylesheet" type="text/css" href="Style/DanphePrintStyle.css" />';
    printableHTML += `<style>
      .opdstickercontainer {
      width: 370px;
      height: 180px;
      margin: 0px;
      display: block;
      font-size: 13px;
    }

    .stkrtopsection {
      width: 100%;
    }

   .dptdesc-left {
      width: 80%;
      display: inline-block;
      margin - top: 5px
    }

    .opd-qrcode {
      width: 15%;
      display: inline-block;
      vertical-align: top;
      float: right;
      margin: 8px 15px 0 0;
    }
    </style>`;
    printableHTML += '<meta http-equiv="X-UA-Compatible" content="IE= edge"/></head>';
    printableHTML += '<body>' + printContents + '</body></html>';
    var printFileName = "INS_Sticker_" + this.insStickerDetails.PatientCode;

    var filePath = this.coreService.AllPrinterSettings.find(a => a.PrintingType == 'server' && a.GroupName == 'reg-sticker').ServerFolderPath;
    var lastCharacter = filePath.substr(filePath.length - 1);
    if (lastCharacter != '\\') {
      filePath += '\\';
    }
    this.loading = true;
    this.showLoading = true;
    this.http.post<any>("/api/Insurance?reqType=saveHTMLfile&PrinterName=" + printFileName + "&FilePath=" + filePath, printableHTML, this.options)
      .map(res => res).subscribe(res => {
        if (res.Status = "OK") {
          this.timerFunction();
        }
        else {
          this.loading = false;
          this.showLoading = false;
        }
      });

    this.AfterPrintAction();
  }


  //timer function
  timerFunction() {
    var timer = Observable.timer(10000);
    var sub: Subscription;
    sub = timer.subscribe(t => {
      this.showLoading = false;
    });
  }

  GetLocalDate(): string {
    return this.nepaliCalendarServ.ConvertEngToNepDateString(this.insStickerDetails.VisitDate);
  }


  GetEnableShowTicketPrice(): boolean {
    let retVal: boolean = false;

    let opdTicketParam = this.coreService.Parameters.find(p => p.ParameterGroupName == "Appointment" && p.ParameterName == "EnableTicketPriceInVisit");
    if (opdTicketParam && opdTicketParam.ParameterValue && opdTicketParam.ParameterValue.toLowerCase() == "true") {
      retVal = true;
    }
    return retVal;
  }


  public PrintDotMatrix() {

    let nline = '\n';
    let finalDataToPrint = "";
    finalDataToPrint = finalDataToPrint + "Date:" + moment(this.insStickerDetails.VisitDate).format("YYYY-MM-DD") + '(' + this.localDateTime + ')' + '-' + this.insStickerDetails.VisitTime + nline;
    finalDataToPrint += "Name:" + this.insStickerDetails.PatientName + " " + this.ageSex + nline;
    finalDataToPrint += "Hosp. No:" + this.insStickerDetails.PatientCode + " " + (this.insStickerDetails.PhoneNumber ? "Ph:" + this.insStickerDetails.PhoneNumber : "") + nline;

    let address = '';
    if (this.insStickerDetails.CountryName == 'Nepal') {
      address = "Address:" + (this.insStickerDetails.Address ? this.insStickerDetails.Address : "") + " " + this.insStickerDetails.District + nline;
    } else {
      address = "Address:" + (this.insStickerDetails.Address ? this.insStickerDetails.Address : "") + " " + this.insStickerDetails.CountryName + nline;
    }
    finalDataToPrint += address;

    finalDataToPrint += "Dept:" + this.insStickerDetails.Department + (this.insStickerDetails.DeptRoomNumber ? (" Room No:" + this.insStickerDetails.DeptRoomNumber) : "") + nline;

    let tktChrgQnoNshiStr = "";

    if (this.EnableShowTicketPrice && this.insStickerDetails.OpdTicketCharge > 0) {
      tktChrgQnoNshiStr += "Tkt. Charge:" + this.coreService.currencyUnit + this.insStickerDetails.OpdTicketCharge + "  ";
    }

    if (this.QueueNoSetting.ShowInSticker && this.insStickerDetails.QueueNo) {
      tktChrgQnoNshiStr += "Q.No:" + this.insStickerDetails.QueueNo;
    }
    tktChrgQnoNshiStr += " NSHI:" + this.insStickerDetails.Ins_NshiNumber + nline;

    finalDataToPrint += tktChrgQnoNshiStr;
    finalDataToPrint += this.insStickerDetails.AppointmentType + "   " + "User:" + this.insStickerDetails.User + "  " + ("Claim Code:" + this.insStickerDetails.ClaimCode);

    return finalDataToPrint;


  }

  public print() {
    this.coreService.loading = true;
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType == ENUM_PrintingType.browser) {
      this.browserPrintContentObj = document.getElementById("insSticker");
      this.openBrowserPrintWindow = true;
      this.changeDetector.detectChanges();
      this.router.navigate(['Insurance/Patient']);
      this.coreService.loading = true;
    } else if (this.selectedPrinter.PrintingType == ENUM_PrintingType.dotmatrix) {
      //-----qz-tray start----->
      this.coreService.QzTrayObject.websocket.connect()
        .then(() => {
          return this.coreService.QzTrayObject.printers.find();
        })
        .then(() => {
          var config = this.coreService.QzTrayObject.configs.create(this.selectedPrinter.PrinterName);
          //passing "reg-sticker" as printOutType parameter since we're implementing charcter margin and different font size in registration stickers.
          //need to make it dynamic such that we can remove that variable..
          let printOutType = "reg-sticker";
          let dataToPrint = this.PrintDotMatrix();
          return this.coreService.QzTrayObject.print(config, CommonFunctions.GetEpsonPrintDataForPage(dataToPrint, this.selectedPrinter.mh, this.selectedPrinter.ml, this.selectedPrinter.ModelName, printOutType));
        })
        .catch(function (e) {
          console.error(e);
          this.msgBoxServ.showMessage('error', [e]);
        })
        .finally(() => {
          this.router.navigate(['Insurance/Patient']);
          this.coreService.loading = true;
          return this.coreService.QzTrayObject.websocket.disconnect();
        });
      //-----qz-tray end----->
    } else if (this.selectedPrinter.PrintingType == ENUM_PrintingType.server) {
      this.printStickerServer();
      this.coreService.loading = true;
    }
    else {
      this.msgBoxServ.showMessage('error', ["Printer Not Supported."]);
      this.coreService.loading = true;
      return;
    }
  }


  OnPrinterChanged($event) {
    this.selectedPrinter = $event;
  }


}
