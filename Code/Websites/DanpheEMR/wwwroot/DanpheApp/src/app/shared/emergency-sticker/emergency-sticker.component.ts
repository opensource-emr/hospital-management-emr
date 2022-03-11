import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { EmergencyStickerVM } from './emergency-sticker.model';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from "../../core/shared/core.service";
import { Subscription } from 'rxjs/Subscription';
import { CommonFunctions } from "../../shared/common.functions";
import { Router } from "@angular/router";
import { NepaliCalendarService } from "../calendar/np/nepali-calendar.service";
import { BillingService } from "../../billing/shared/billing.service";
import { PrinterSettingsModel, ENUM_PrintingType } from "../../settings-new/printers/printer-settings.model";

@Component({
  selector: 'emergency-sticker',
  templateUrl: "./emergency-sticker.html"
})

export class EmergencyStickerComponent {
  public stickerDetail: EmergencyStickerVM = new EmergencyStickerVM();
  @Input("patient-visitId")
  public patientVisitId: number;
  @Output("after-print-action")
  afterPrintAction: EventEmitter<Object> = new EventEmitter<Object>();

  @Input("isInsuranceBilling")
  public isInsuranceBilling: boolean = false;

  @Input("IMISCode")
  public IMISCode: string = "";

  @Input("routeFrom")
  public routeFrom: string = "";

  @Input("SelectedVisitDetails")
  public SelectedVisitDetails: any;

  public showSticker: boolean = false;
  loading = false;
  public showServerPrintBtn: boolean = false;
  public showLoading: boolean = false;

  public showQrCode: boolean = false;
  public patientQRCodeInfo: string = "";
  public printerNameSelected: any = null;
  public allPrinterName: any = null;
  public showStickerChange: boolean = false;
  public printerName: string = null;
  public showRoomNumber: boolean = false;
  public roomNo: string = null;
  public EnableShowTicketPrice: boolean = false;

  public dotPrinterDimensions: any;
  public printByDotMatrixPrinter: boolean = false;
  public localDateTime: string;
  public ageSex: string = '';

  public PrinterDisplayName: string = null;
  public PrinterNameDotMatix: string = null;
  public ModelName: string = null;
  public showPrinterChange: boolean = false;
  public billingDotMatrixPrinters: Array<any>;

  public QueueNoSetting = { "ShowInInvoice": false, "ShowInSticker": false };

  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any;

  constructor(
    public http: HttpClient,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public router: Router,
    public nepaliCalendarServ: NepaliCalendarService,
    public changeDetector: ChangeDetectorRef) {
    this.showHidePrintButton();

    this.printerName = localStorage.getItem('Danphe_ER_Default_PrinterName');

    var allStickerFolderDetail = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() == 'common' && a.ParameterName == 'StickerPrinterSettings');
    if (allStickerFolderDetail) {
      this.allPrinterName = JSON.parse(allStickerFolderDetail.ParameterValue);
    }
    var room = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() == 'appointment' && a.ParameterName == 'RoomNumberInSticker');
    if (room) {
      let roomValue = JSON.parse(room.ParameterValue);
      this.showRoomNumber = roomValue.Show;
      this.roomNo = roomValue.DisplayName;
    }
    this.EnableShowTicketPrice = this.GetEnableShowTicketPrice();
    this.SetPrinterFromParam();
  }

  ngOnInit() {
    this.QueueNoSetting = this.coreService.GetQueueNoSetting();
  }

  ngAfterViewInit() {
    let btnElem = document.getElementById('btnPrintSticker');
    if (btnElem) {
      btnElem.focus();
    }
  }

  @Input("showSticker")
  public set value(val: boolean) {
    this.showSticker = val;
    if (this.showSticker && this.patientVisitId) {
      this.GetVisitforStickerPrint(this.patientVisitId);
    }
  }

  GetVisitforStickerPrint(PatientVisitId) {
    this.http.get<any>('/api/Visit?reqType=getVisitInfoforStickerPrint' + '&visitId=' + PatientVisitId)
      .map(res => res)
      .subscribe(res => this.CallBackStickerOnly(res),
        res => this.Error(res));
  }
  CallBackStickerOnly(res) {
    if (res.Status = "OK" && res.Results.length != 0) {
      this.stickerDetail.PatientCode = res.Results[0].PatientCode;
      this.stickerDetail.PatientName = res.Results[0].PatientName;
      this.stickerDetail.CountrySubDivisionName = res.Results[0].District;
      this.stickerDetail.Address = res.Results[0].Address;
      this.stickerDetail.DateOfBirth = res.Results[0].DateOfBrith;
      this.stickerDetail.ProviderName = res.Results[0].DoctorName;
      this.stickerDetail.PhoneNumber = res.Results[0].PhoneNumber;
      this.stickerDetail.User = res.Results[0].User;
      this.stickerDetail.CountryName = res.Results[0].CountryName;
      this.stickerDetail.Gender = res.Results[0].Gender;
      this.stickerDetail.VisitDate = moment(res.Results[0].VisitDate).format('YYYY-MM-DD')
      this.stickerDetail.VisitTime = moment(res.Results[0].VisitTime, "hhmm").format('hh:mm A');
      this.stickerDetail.VisitType = res.Results[0].VisitType;
      this.stickerDetail.VisitCode = res.Results[0].VisitCode;
      this.stickerDetail.DeptRoomNumber = res.Results[0].DeptRoomNumber;
      this.stickerDetail.OpdTicketCharge = res.Results[0].OpdTicketCharge;
      this.stickerDetail.District = res.Results[0].District;
      this.stickerDetail.Department = res.Results[0].Department;
      this.stickerDetail.AppointmentType = res.Results[0].AppointmentType;
      this.localDateTime = this.GetLocalDate() + " BS";
      this.ageSex = CommonFunctions.GetFormattedAgeSex(this.stickerDetail.DateOfBirth, this.stickerDetail.Gender);

      this.patientQRCodeInfo = `Name: ` + this.stickerDetail.PatientName + `
      Hospital No: `+ this.stickerDetail.PatientCode + `
      Age/Sex: `+ this.ageSex + `
      Contact No: `+ this.stickerDetail.PhoneNumber + `
      Address: `+ this.stickerDetail.Address;
      //set this to true only after all values are set.
      this.showQrCode = true;
    }
    else {
      this.showSticker = false;
      this.AfterPrintAction();
      this.msgBoxServ.showMessage("error", ["Sorry!!! not able to get date for emergency-sticker of this patient"]);
    }
  }

  printStickerDotMatrix() {
    this.PrintDotMatrix();
  }

  printStickerClient() {
    let popupWinindow;
    var printContents = document.getElementById("EmergencySticker").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    let documentContent = '<html><head>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
    /// documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
    this.AfterPrintAction();
  }
  Close() {
    this.showSticker = false;
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! not able to get for opd- sticker"]);
    console.log(err.ErrorMessage);
  }
  AfterPrintAction() {
    // this is after print action ..and it pass some event to the parent component
    // if (this.routeFrom && (this.routeFrom == "appointment-check-in")) {
    //   this.afterPrintAction.emit({ showOpdSticker: false, routeTo: "new-visit" });
    // } else {
    //   this.afterPrintAction.emit({ showOpdSticker: false, });
    // }
    this.router.navigate(['Appointment/ListVisit']);
    this.afterPrintAction.emit({ showOpdSticker: false });
  }

  //06April2018 print from server
  printStickerServer() {
    let printContents = document.getElementById("EmergencySticker").innerHTML;
    var printableHTML = '<html><head><link rel="stylesheet" type="text/css" href="DanpheStyle.css" />';
    printableHTML += '<meta http-equiv="X-UA-Compatible" content="IE= edge"/></head>';
    printableHTML += '<body>' + printContents + '</body></html>';
    var PrinterName = this.LoadPrinterSetting();
    PrinterName += this.stickerDetail.PatientCode;
    var filePath = this.coreService.AllPrinterSettings.find(a => a.PrintingType == 'server' && a.GroupName == 'reg-sticker').ServerFolderPath;
    var lastCharacter = filePath.substr(filePath.length - 1);
    if (lastCharacter != '\\') {
      filePath += '\\';
    }
    this.loading = true;
    this.showLoading = true;
    this.http.post<any>("/api/Billing?reqType=saveHTMLfile&PrinterName=" + PrinterName + "&FilePath=" + filePath, printableHTML)
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
  //loads Printer Setting from Paramter Table (database) -- ramavtar
  LoadPrinterSetting() {
    let Parameter = this.coreService.Parameters;
    Parameter = Parameter.filter(parms => parms.ParameterName == "DefaultPrinterName");
    let JSONobject = JSON.parse(Parameter[0].ParameterValue);
    let PrinterName = JSONobject.OPDSticker;
    return PrinterName;
  }
  //set button for preview
  showHidePrintButton() {
    let params = this.coreService.Parameters;
    params = params.filter(p => p.ParameterName == "showServerPrintBtn");
    let jsonObj = JSON.parse(params[0].ParameterValue);
    let value = jsonObj.OPDSticker;
    if (value == "true") {
      this.showServerPrintBtn = true;
    }
    else {
      this.showServerPrintBtn = false;
    }
  }

  //timer function
  timerFunction() {
    var timer = Observable.timer(10000);
    var sub: Subscription;
    sub = timer.subscribe(t => {
      this.showLoading = false;
    });
  }

  //Multiple sticker printer change 
  public ChangeStickerPrinter() {
    this.showStickerChange = true;
    this.printerNameSelected = this.printerName;
  }

  public CloseChangeStickerPrinter() {
    this.showStickerChange = false;
    this.printerNameSelected = null;
  }

  public UpdateNewPrinter() {
    if (this.printerNameSelected) {
      if (localStorage.getItem('Danphe_ER_Default_PrinterName')) {
        localStorage.removeItem('Danphe_ER_Default_PrinterName');
      }
      localStorage.setItem('Danphe_ER_Default_PrinterName', this.printerNameSelected);
      this.printerName = this.printerNameSelected;
      this.showStickerChange = false;
    } else {
      this.msgBoxServ.showMessage('error', ["Please select Printer Location"]);
    }
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

    // get this from parameter: Name='DotMatrixPrinterDimensionSetting_RegStickers'

    let nline = '\n';
    let finalDataToPrint = "";
    finalDataToPrint = finalDataToPrint + "Date:" + this.stickerDetail.VisitDate + '(' + this.localDateTime + ')' + '-' + this.stickerDetail.VisitTime + nline;
    finalDataToPrint += "Name:" + this.stickerDetail.PatientName + " " + this.ageSex + nline;
    finalDataToPrint += "Hosp. No:" + this.stickerDetail.PatientCode + " " + "Ph:" + this.stickerDetail.PhoneNumber + nline;

    let address = '';
    if (this.stickerDetail.CountryName == 'Nepal') {
      address = "Address:" + (this.stickerDetail.Address ? this.stickerDetail.Address : "") + this.stickerDetail.District + nline;
    } else {
      address = "Address:" + this.stickerDetail.Address + this.stickerDetail.CountryName + nline;
    }
    finalDataToPrint += address;

    finalDataToPrint += "Dept:" + this.stickerDetail.Department + (this.stickerDetail.DeptRoomNumber ? (" Room No:" + this.stickerDetail.DeptRoomNumber) : "") + nline;
    let newLineReq = false;
    if (this.EnableShowTicketPrice && this.stickerDetail.OpdTicketCharge > 0) {
      finalDataToPrint += "Tkt. Charge:" + this.coreService.currencyUnit + this.stickerDetail.OpdTicketCharge + "  ";
      newLineReq = true;
    }
    if (this.QueueNoSetting.ShowInSticker && this.stickerDetail.QueueNo) {
      finalDataToPrint += "Q.No:" + this.stickerDetail.QueueNo + (this.isInsuranceBilling ? "IMIS Code:" + this.IMISCode : "");
      newLineReq = true;
    }
    finalDataToPrint += (newLineReq ? nline : "");
    finalDataToPrint += this.stickerDetail.AppointmentType + "   " + "User:" + this.stickerDetail.User + "  " + (this.isInsuranceBilling ? "Claim Code:" + this.SelectedVisitDetails.ClaimCode : "");

    return finalDataToPrint;
    //passing "reg-sticker" as printOutType parameter since we're implementing charcter margin and different font size in registration stickers.
    //need to make it dynamic such that we can remove that variable..

  }

  GetLocalDate(): string {
    var currParameter = this.coreService.Parameters.find(a => a.ParameterName == "CalendarTypes")
    if (currParameter) {
      let visitCalendar = JSON.parse(currParameter.ParameterValue).PatientVisit;
      if (visitCalendar == "en,np") {
        return this.nepaliCalendarServ.ConvertEngToNepDateString(this.stickerDetail.VisitDate);
      }
    }
    else {
      this.msgBoxServ.showMessage("error", ["Please set local date view configuration."]);
      return null;
    }
  }


  public SetPrinterFromParam() {
    this.printByDotMatrixPrinter = this.coreService.EnableDotMatrixPrintingInEmergencySticker();
    if (this.printByDotMatrixPrinter) {
      this.printByDotMatrixPrinter = true;

      if (!this.coreService.billingDotMatrixPrinters || !this.coreService.billingDotMatrixPrinters.length) {
        this.coreService.billingDotMatrixPrinters = this.coreService.GetBillingDotMatrixPrinterSettings();
      }

      this.billingDotMatrixPrinters = this.coreService.billingDotMatrixPrinters;


      this.dotPrinterDimensions = this.coreService.GetDotMatrixPrinterRegStickerDimensions();

      let prntrInStorage = localStorage.getItem('BillingERStickerPrinter');
      if (prntrInStorage) {
        //this.printerName_Storage = prntrInStorage;
        let val = this.billingDotMatrixPrinters.find(p => p.DisplayName == prntrInStorage);
        this.PrinterDisplayName = val ? val.DisplayName : '';
        this.PrinterNameDotMatix = val ? val.PrinterName : '';
      } else {
        this.showPrinterChange = true;
      }
    }
  }

  public ChangePrinterLocationName() {
    if (this.PrinterDisplayName) {
      if (localStorage.getItem('BillingERStickerPrinter')) {
        localStorage.removeItem('BillingERStickerPrinter');
      }
      localStorage.setItem('BillingERStickerPrinter', this.PrinterDisplayName);
      let ptr = this.billingDotMatrixPrinters.find(p => p.DisplayName == this.PrinterDisplayName);
      //this.PrinterDisplayName = ptr ? ptr.DisplayName : '';
      this.PrinterNameDotMatix = ptr ? ptr.PrinterName : '';
      this.showPrinterChange = false;
    } else {
      this.msgBoxServ.showMessage('error', ["Please select Printer."]);
    }
  }

  public ShowPrinterLocationChange() {
    let ptr = this.billingDotMatrixPrinters.find(p => p.DisplayName == this.PrinterDisplayName);
    this.PrinterNameDotMatix = ptr ? ptr.PrinterName : '';
    this.showPrinterChange = true;
  }

  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
  OnPrinterChanged($event) {
    this.selectedPrinter = $event;
  }

  public print() {
    this.coreService.loading = true;
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType == ENUM_PrintingType.browser) {
      this.browserPrintContentObj = document.getElementById("emergencyStickerPrint");
      this.openBrowserPrintWindow = true;
      this.changeDetector.detectChanges();
      this.AfterPrintAction();
      this.coreService.loading = false;
    } else if (this.selectedPrinter.PrintingType == ENUM_PrintingType.dotmatrix) {
      //-----qz-tray start----->
      this.coreService.QzTrayObject.websocket.connect()
        .then(() => {
          return this.coreService.QzTrayObject.printers.find();
        })
        .then(() => {
          var config = this.coreService.QzTrayObject.configs.create(this.selectedPrinter.PrinterName);
          let printOutType = "reg-sticker";
          let dataToPrint = this.PrintDotMatrix();
          return this.coreService.QzTrayObject.print(config, CommonFunctions.GetEpsonPrintDataForPage(dataToPrint, this.selectedPrinter.mh, this.selectedPrinter.ml, this.selectedPrinter.ModelName, printOutType));

        })
        .catch(function (e) {
          console.error(e);
        })
        .finally(() => {
          this.AfterPrintAction();
          this.coreService.loading = false;
          return this.coreService.QzTrayObject.websocket.disconnect();
        });
      //-----qz-tray end----->
    } else if (this.selectedPrinter.PrintingType == ENUM_PrintingType.server) {
      this.printStickerServer();
      this.coreService.loading = false;
    }
    else {
      this.msgBoxServ.showMessage('error', ["Printer Not Supported."]);
      this.coreService.loading = true;
      return;
    }
  }

}
