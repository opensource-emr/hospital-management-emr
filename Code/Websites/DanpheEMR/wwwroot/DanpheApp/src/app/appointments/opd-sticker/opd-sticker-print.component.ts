import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
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
@Component({
  selector: 'opd-sticker',
  templateUrl: "./opd-sticker-print.html"
})

export class PrintStickerComponent {
  public ageSex : string = '';
  public OpdStickerDetails: OPDStickerViewModel = new OPDStickerViewModel();

  @Input("isInsuranceBilling")
  public isInsuranceBilling: boolean = false;
  @Input("IMISCode")
  public IMISCode: string = "";

  @Input("SelectedVisitDetails")
  public SelectedVisitDetails: any;
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

  //for QR-specific purpose only--sud.
  public showQrCode: boolean = false;
  public patientQRCodeInfo: string = "";
  public maxFollowUpDays: number = null;
  public doctorOrDepartment: string = null;
  public EnableShowTicketPrice: boolean = false;
  public hospitalCode: string = '';
  public QueueNoSetting = { "ShowInInvoice": false, "ShowInSticker": false };

  constructor(
    public http: HttpClient,
    public msgBoxServ: MessageboxService,
    public router: Router,
    public nepaliCalendarServ: NepaliCalendarService,
    public coreService: CoreService,
    public visitService: VisitService
  ) {
    this.showHidePrintButton();
    this.loadMaximumFollowUpDays();
    
    let paramValue = this.coreService.EnableDepartmentLevelAppointment();
    this.hospitalCode = this.coreService.GetHospitalCode();
    this.hospitalCode = (this.hospitalCode && this.hospitalCode.trim().length > 0) ? this.hospitalCode : "allhosp";
    console.log(this.hospitalCode);
    if (paramValue) {
      this.doctorOrDepartment = "Department";
    }
    else {
      this.doctorOrDepartment = "Doctor";
    }
    this.EnableShowTicketPrice = this.GetEnableShowTicketPrice();
  }

  ngOnInit() {
    this.QueueNoSetting = this.coreService.GetQueueNoSetting();

    //if (this.showOpdSticker && this.SelectedVisitDetails) {
    //  this.GetVisitforStickerPrint(this.SelectedVisitDetails.PatientVisitId);
    //}
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
      this.showQrCode = true;
    }
    else {
      this.showOpdSticker = false;
      this.AfterPrintAction();
      this.msgBoxServ.showMessage("error", ["Sorry!!! not able to get date for opd-sticker of this patient"]);
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
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanphePrintStyle.css"/>';
    /// documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
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
    // this is after print action ..and it pass some event to the parent component
    this.afterPrintAction.emit({ showOpdSticker: false });
  }

  //06April2018 print from server
  printStickerServer() {
    let printContents = document.getElementById("OPDsticker").innerHTML;
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
    var PrinterName = this.LoadPrinterSetting();
    PrinterName += this.OpdStickerDetails.PatientCode;
    var filePath = this.LoadFileStoragePath();
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
  //load file storage path
  LoadFileStoragePath() {
    let params = this.coreService.Parameters;
    params = params.filter(p => p.ParameterName == "PrintFileLocationPath");
    let path = params[0].ParameterValue;
    return path;
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
}
