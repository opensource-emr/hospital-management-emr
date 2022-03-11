import { Component, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SlicePipe } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { OPDStickerViewModel } from './opd-sticker.model';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CommonFunctions } from "../../shared/common.functions";
import { CoreService } from "../../core/shared/core.service";
import { NepaliCalendarService } from '../../shared/calendar/np/nepali-calendar.service';
import { NepaliDate } from '../../shared/calendar/np/nepali-dates';
import { BillingService } from "../../billing/shared/billing.service";
import { InsuranceVM } from "../../billing/shared/patient-billing-context-vm";
import { VisitService } from "../shared/visit.service";
import { Subscription } from "rxjs";
import { ENUM_PrintingType, PrinterSettingsModel } from "../../settings-new/printers/printer-settings.model";

@Component({
  selector: 'opd-sticker',
  templateUrl: "./opd-sticker-print.html"
})

export class PrintStickerComponent {
  public ageSex: string = '';
  public OpdStickerDetails: OPDStickerViewModel = new OPDStickerViewModel();

  @Input("isInsuranceBilling")
  public isInsuranceBilling: boolean = false;
  @Input("IMISCode")
  public IMISCode: string = "";

  @Input("routeFrom")
  public routeFrom: string = "";

  @Input("SelectedVisitDetails")
  public SelectedVisitDetails: any;

  @Input("showDateOfBirth")
  public showDateOfBirth: any;

  public showOpdSticker: boolean = false;
  @Output("after-print-action")
  afterPrintAction: EventEmitter<Object> = new EventEmitter<Object>();
  loading = false;
  //public Patient: Patient = new Patient();
  public currentDateTime: string;
  public localDateTime: string;
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };

  public showServerPrintBtn: boolean = false;
  public showLoading: boolean = false;
  public printerNameSelected: any = null;

  //for QR-specific purpose only--sud.
  public showQrCode: boolean = false;
  public patientQRCodeInfo: string = "";
  public maxFollowUpDays: number = null;
  public doctorOrDepartment: string = null;
  public EnableShowTicketPrice: boolean = false;
  public hospitalCode: string = '';
  public QueueNoSetting = { "ShowInInvoice": false, "ShowInSticker": false };
  public allPrinterName: any = null;
  public showStickerChange: boolean = false;
  public printerName: string = null;
  public showRoomNumber: boolean = false;
  public roomNo: string = null;

  public dotPrinterDimensions: any;
  public printByDotMatrixPrinter: boolean = false;
  public PrinterDisplayName: string = null;
  public PrinterNameDotMatix: string = null;
  public ModelName: string = null;
  public showPrinterChange: boolean = false;
  public billingDotMatrixPrinters: Array<any>;
  public serverPrintFolderPath: any;
  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any;
  public defaultFocus: string = null;

  public closePopUpAfterStickerPrint: boolean = true;

  constructor(
    public http: HttpClient,
    public msgBoxServ: MessageboxService,
    public router: Router,
    public nepaliCalendarServ: NepaliCalendarService,
    public coreService: CoreService,
    public visitService: VisitService,
    public changeDetector: ChangeDetectorRef,
    public billingService: BillingService
  ) {
    this.showHidePrintButton();
    this.loadMaximumFollowUpDays();

    let paramValue = this.coreService.EnableDepartmentLevelAppointment();
    this.hospitalCode = this.coreService.GetHospitalCode();

    this.hospitalCode = (this.hospitalCode && this.hospitalCode.trim().length > 0) ? this.hospitalCode : "allhosp";
    if (paramValue) {
      this.doctorOrDepartment = "Department";
    }
    else {
      this.doctorOrDepartment = "Doctor";
    }

    this.EnableShowTicketPrice = this.GetEnableShowTicketPrice();
    this.printerName = localStorage.getItem('Danphe_OPD_Default_PrinterName');
    var allStickerFolderDetail = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() == 'reg-sticker' && a.ParameterName == 'StickerPrinterSettings');
    if (allStickerFolderDetail) {
      this.allPrinterName = JSON.parse(allStickerFolderDetail.ParameterValue);
    }

    var room = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() == 'appointment' && a.ParameterName == 'RoomNumberInSticker');
    if (room) {
      let roomValue = JSON.parse(room.ParameterValue);
      this.showRoomNumber = roomValue.Show;
      this.roomNo = roomValue.DisplayName;
    }

    this.SetPrinterFromParam();
  }

  ngOnInit() {
    this.QueueNoSetting = this.coreService.GetQueueNoSetting();
    let val = this.coreService.Parameters.find(p => p.ParameterGroupName == 'Appointment' && p.ParameterName == 'VisitPrintSettings');
    let param = JSON.parse(val && val.ParameterValue);
    if (param) {
      this.defaultFocus = param.DefaultFocus;
      this.closePopUpAfterStickerPrint = param.closePopUpAfterStickerPrint;
    }
    //if (this.showOpdSticker && this.SelectedVisitDetails) {
    //  this.GetVisitforStickerPrint(this.SelectedVisitDetails.PatientVisitId);
    //}
  }

  ngAfterViewInit() {
    //this.SetFocusById("btnPrintSticker");
    let btnObj = document.getElementById('btnPrintOpdSticker');
    if (btnObj && this.defaultFocus.toLowerCase() == "sticker") {
      btnObj.focus();
    }

  }

  @Input("showOpdSticker")
  public set value(val: boolean) {
    this.showOpdSticker = val;
    if (this.showOpdSticker && this.SelectedVisitDetails) {
      this.GetVisitforStickerPrint(this.SelectedVisitDetails.PatientVisitId);
    }
  }
  GetVisitforStickerPrint(PatientVisitId) {
    this.http.get<any>('/api/Visit?reqType=getVisitInfoforStickerPrint' + '&visitId=' + PatientVisitId, this.options)
      .map(res => res)
      .subscribe(res => this.CallBackStickerOnly(res),
        res => this.Error(res));
  }
  CallBackStickerOnly(res) {
    if (res.Status = "OK" && res.Results.length != 0) {
      this.OpdStickerDetails.PatientCode = res.Results[0].PatientCode;
      this.OpdStickerDetails.PatientName = res.Results[0].PatientName;
      this.OpdStickerDetails.District = res.Results[0].District;
      this.OpdStickerDetails.Address = res.Results[0].Address;
      this.OpdStickerDetails.DateOfBrith = res.Results[0].DateOfBrith;
      this.OpdStickerDetails.DepartmentName = res.Results[0].Department;
      this.OpdStickerDetails.DoctorName = res.Results[0].DoctorName;
      this.OpdStickerDetails.PhoneNumber = res.Results[0].PhoneNumber;
      this.OpdStickerDetails.User = res.Results[0].User;
      this.OpdStickerDetails.Age = res.Results[0].Age;
      this.OpdStickerDetails.CountryName = res.Results[0].CountryName;
      this.OpdStickerDetails.Gender = res.Results[0].Gender;
      this.OpdStickerDetails.VisitDate = moment(res.Results[0].VisitDate).format('YYYY-MM-DD')
      this.OpdStickerDetails.VisitTime = moment(res.Results[0].VisitTime, "hhmm").format('hh:mm A');
      this.OpdStickerDetails.AppointmentType = res.Results[0].AppointmentType;
      this.OpdStickerDetails.RoomNo = res.Results[0].RoomNo;
      this.OpdStickerDetails.OpdTicketCharge = res.Results[0].OpdTicketCharge;
      this.OpdStickerDetails.QueueNo = res.Results[0].QueueNo;
      this.OpdStickerDetails.DeptRoomNumber = res.Results[0].DeptRoomNumber;
      this.OpdStickerDetails.MunicipalityName = res.Results[0].MunicipalityName;
      if (this.OpdStickerDetails.DepartmentName.toLowerCase() == 'immunization') {
        this.showDateOfBirth = true;
      }
      this.localDateTime = this.GetLocalDate() + " BS";
      //get Formatted age/sex to give as input to qr-code value.
      this.ageSex = CommonFunctions.GetFormattedAgeSexforSticker(this.OpdStickerDetails.DateOfBrith, this.OpdStickerDetails.Gender, this.OpdStickerDetails.Age);
      //Create an specific format for QR-Value. 
      //current format:   
      //PatientName: XYZ
      //Hospital No : XYZ
      //Age/Sex: XYZ
      //Contact No: XYZ
      //Address: XYZ

      this.patientQRCodeInfo = `Name: ` + this.OpdStickerDetails.PatientName + `
Hospital No: `+ this.OpdStickerDetails.PatientCode + `
Age/Sex: `+ this.ageSex + `
Contact No: `+ this.OpdStickerDetails.PhoneNumber + `
Address: `+ this.OpdStickerDetails.Address;
      //set this to true only after all values are set.
      //this.showQrCode = true;
    }
    else {
      this.showOpdSticker = false;
      this.AfterPrintAction();
      this.msgBoxServ.showMessage("error", ["Sorry!!! not able to get date for opd-sticker of this patient"]);
    }
  }

  printStickerDotMatrix() {
    if (this.printByDotMatrixPrinter) {
      this.PrintDotMatrix();
      return;
    }
  }

  printStickerClient() {

    let popupWinindow;
    var printContents = document.getElementById("OPDsticker").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    let documentContent = '<html><head>';
    documentContent += `<style>
      .opdstickercontainer {
      width: 370px;
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
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanphePrintStyle.css"/>';
    /// documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body>' + printContents + '</body></html>'
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();

    let tmr = setTimeout(function () {
      popupWinindow.print();
      popupWinindow.close();
    }, 200);

    this.AfterPrintAction();
  }
  Close() {
    this.showOpdSticker = false;
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! not able to get for opd- sticker"]);
    console.log(err.ErrorMessage);
  }
  AfterPrintAction() {
    if (this.closePopUpAfterStickerPrint) {
      // this is after print action ..and it pass some event to the parent component
      this.router.navigate(['Appointment/PatientSearch']);
      this.afterPrintAction.emit({ showOpdSticker: false });
    }

  }

  //06April2018 print from server
  printStickerServer() {
    let printContents = document.getElementById("OPDsticker").innerHTML;
    var printableHTML = `<style>
      .opdstickercontainer {
      width: 370px;
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
    printableHTML += '<meta charset="utf-8">';
    printableHTML += '<body>' + printContents + '</body></html>';
    var PrinterName = this.coreService.AllPrinterSettings.find(a => a.PrintingType == 'server' && a.GroupName == 'reg-sticker').PrinterDisplayName;;
    PrinterName += this.OpdStickerDetails.PatientCode;
    var filePath = this.coreService.AllPrinterSettings.find(a => a.PrintingType == 'server' && a.GroupName == 'reg-sticker').ServerFolderPath;
    var lastCharacter = filePath.substr(filePath.length - 1);
    if (lastCharacter != '\\') {
      filePath += '\\';
    }
    this.loading = true;
    this.showLoading = true;
    this.http.post<any>("/api/Billing?reqType=saveHTMLfile&PrinterName=" + PrinterName + "&FilePath=" + filePath, printableHTML, this.options)
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
  GetLocalDate(): string {
    var currParameter = this.coreService.Parameters.find(a => a.ParameterName == "CalendarTypes")
    if (currParameter) {
      let visitCalendar = JSON.parse(currParameter.ParameterValue).PatientVisit;
      if (visitCalendar == "en,np") {
        return this.nepaliCalendarServ.ConvertEngToNepDateString(this.OpdStickerDetails.VisitDate);
      }
    }
    else {
      this.msgBoxServ.showMessage("error", ["Please set local date view configuration."]);
      return null;
    }
  }
  //loads maximum follow up days limit from parameters
  loadMaximumFollowUpDays() {
    let maxLimit = this.coreService.Parameters.filter(p => p.ParameterGroupName == "Appointment" && p.ParameterName == "MaximumLastVisitDays");
    if (maxLimit[0]) {
      this.maxFollowUpDays = maxLimit[0].ParameterValue;
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



  public print() {
    this.coreService.loading = true;
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType == ENUM_PrintingType.browser) {
      this.browserPrintContentObj = document.getElementById("opdprintpage");
      this.openBrowserPrintWindow = false;
      this.changeDetector.detectChanges();
      this.openBrowserPrintWindow = true;
      if (this.closePopUpAfterStickerPrint) {
        this.router.navigate(['Appointment/PatientSearch']);
      }
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
          if (this.closePopUpAfterStickerPrint) {
            this.router.navigate(['Appointment/PatientSearch']);
          }
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


  public printDetaiils: any;


  public PrintDotMatrix() {
    let nline = '\n';
    let finalDataToPrint = "";
    finalDataToPrint = finalDataToPrint + "Date:" + this.OpdStickerDetails.VisitDate + '(' + this.localDateTime + ')' + '-' + this.OpdStickerDetails.VisitTime + nline;
    finalDataToPrint += "Name:" + this.OpdStickerDetails.PatientName + " " + this.ageSex + nline;
    finalDataToPrint += "Hosp. No:" + this.OpdStickerDetails.PatientCode + " " + (this.OpdStickerDetails.PhoneNumber ? "Ph:" + this.OpdStickerDetails.PhoneNumber : "") + nline;

    let address = '';
    if (this.OpdStickerDetails.CountryName == 'Nepal') {
      address = "Address:" + (this.OpdStickerDetails.Address ? this.OpdStickerDetails.Address : "") + " " + this.OpdStickerDetails.District + nline;
    } else {
      address = "Address:" + (this.OpdStickerDetails.Address ? this.OpdStickerDetails.Address : "") + " " + this.OpdStickerDetails.CountryName + nline;
    }
    finalDataToPrint += address;

    finalDataToPrint += "Dept: " + this.OpdStickerDetails.DepartmentName + " " + ((this.showRoomNumber && this.OpdStickerDetails.DeptRoomNumber) ? " Room.No:" + this.OpdStickerDetails.DeptRoomNumber : "") +  nline;
    finalDataToPrint += (this.OpdStickerDetails.DoctorName ? "Doc: "+this.OpdStickerDetails.DoctorName + "  " : "");
    finalDataToPrint += ((this.QueueNoSetting.ShowInSticker && this.OpdStickerDetails.QueueNo) ? "Q.No: "+ this.OpdStickerDetails.QueueNo : "") + nline;
    // if(this.OpdStickerDetails.DoctorName){
    //   finalDataToPrint += "Doctor:" + this.OpdStickerDetails.DoctorName + nline;
    // }
    //let newLineReq = false;
    // if (this.EnableShowTicketPrice && this.OpdStickerDetails.OpdTicketCharge > 0) {
    //   finalDataToPrint += "Tkt. Charge:" + this.coreService.currencyUnit + this.OpdStickerDetails.OpdTicketCharge + "  ";
    //   newLineReq = true;
    // }
    // if (this.QueueNoSetting.ShowInSticker && this.OpdStickerDetails.QueueNo) {
    //   finalDataToPrint += "Q.No:" + this.OpdStickerDetails.QueueNo + (this.isInsuranceBilling ? "IMIS Code:" + this.IMISCode : "");
    //   newLineReq = true;
    // }
    //finalDataToPrint += (newLineReq ? nline : "");
    finalDataToPrint += this.OpdStickerDetails.AppointmentType.toUpperCase() + "   " + "User:" + this.OpdStickerDetails.User + "  "; 
    finalDataToPrint += (this.EnableShowTicketPrice && this.OpdStickerDetails.OpdTicketCharge > 0 ? "Tkt:" + this.coreService.currencyUnit + this.OpdStickerDetails.OpdTicketCharge : "");
    return finalDataToPrint;
  }


  public SetPrinterFromParam() {
    this.printByDotMatrixPrinter = this.coreService.EnableDotMatrixPrintingInRegistration();
    if (this.printByDotMatrixPrinter) {
      if (!this.coreService.billingDotMatrixPrinters || !this.coreService.billingDotMatrixPrinters.length) {
        this.coreService.billingDotMatrixPrinters = this.coreService.GetBillingDotMatrixPrinterSettings();
      }

      this.billingDotMatrixPrinters = this.coreService.billingDotMatrixPrinters;

      if (!this.billingService.OpdStickerDotMatrixPageDimension) {
        this.billingService.OpdStickerDotMatrixPageDimension = this.coreService.GetDotMatrixPrinterDimensions(); //1 is for ins billing
      }

      this.dotPrinterDimensions = this.billingService.OpdStickerDotMatrixPageDimension;

      let prntrInStorage = localStorage.getItem('BillingStickerPrinter');
      if (prntrInStorage) {
        let val = this.billingDotMatrixPrinters.find(p => p.DisplayName == prntrInStorage);
        this.PrinterDisplayName = val ? val.DisplayName : '';
        this.PrinterNameDotMatix = val ? val.PrinterName : '';
      } else {
        this.showPrinterChange = true;
      }
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

}
