import { Component, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from "@angular/core";
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { EchsStickerViewModel } from '../echs-sticker/echs-sticker.model';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CommonFunctions } from "../../shared/common.functions";
import { CoreService } from "../../core/shared/core.service";
import { NepaliCalendarService } from '../../shared/calendar/np/nepali-calendar.service';
import { BillingService } from "../../billing/shared/billing.service";
import { Subscription } from "rxjs";
import { ENUM_PrintingType, PrinterSettingsModel } from "../../settings-new/printers/printer-settings.model";
import { ENUM_Country, ENUM_DanpheHTTPResponses, ENUM_DanpheHTTPResponseText, ENUM_MembershipTypeName } from "../../shared/shared-enums";
import { VisitService } from "../../appointments/shared/visit.service";

@Component({
  selector: 'echs-sticker',
  templateUrl: './echs-sticker.component.html'
})


export class EchsStickerComponent {
  public ageSex: string = '';
  public EchsStickerDetails: EchsStickerViewModel = new EchsStickerViewModel();

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

  public showEchsSticker: boolean = false;
  @Output("after-print-action")
  afterPrintAction: EventEmitter<Object> = new EventEmitter<Object>();
  loading = false;
  public currentDateTime: string;
  public localDateTime: string;
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };

  public showServerPrintBtn: boolean = false;
  public showLoading: boolean = false;
  public printerNameSelected: any = null;

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
  public showMunicipality : boolean = false;
  public SSFMembershipTypeName : string = ENUM_MembershipTypeName.SSF;
  public ECHSMembershipTypeName : string = ENUM_MembershipTypeName.ECHS;

  public CountryNepal: string;
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

    this.showMunicipality = this.coreService.ShowMunicipality().ShowMunicipality;
    this.CountryNepal = ENUM_Country.Nepal;
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
    var allStickerFolderDetail = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() === 'reg-sticker' && a.ParameterName === 'StickerPrinterSettings');
    if (allStickerFolderDetail) {
      this.allPrinterName = JSON.parse(allStickerFolderDetail.ParameterValue);
    }

    var room = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() === 'appointment' && a.ParameterName === 'RoomNumberInSticker');
    if (room) {
      let roomValue = JSON.parse(room.ParameterValue);
      this.showRoomNumber = roomValue.Show;
      this.roomNo = roomValue.DisplayName;
    }
  }

  ngOnInit() {
    this.QueueNoSetting = this.coreService.GetQueueNoSetting();
    let val = this.coreService.Parameters.find(p => p.ParameterGroupName === 'Appointment' && p.ParameterName === 'VisitPrintSettings');
    let param = JSON.parse(val && val.ParameterValue);
    if (param) {
      this.defaultFocus = param.DefaultFocus;
      this.closePopUpAfterStickerPrint = param.closePopUpAfterStickerPrint;
    }
  }

  ngAfterViewInit() {
    let btnObj = document.getElementById('btnPrintOpdSticker');
    if (btnObj && this.defaultFocus.toLowerCase() === "sticker") {
      btnObj.focus();
    }

  }

  @Input("showEchsSticker")
  public set value(val: boolean) {
    this.showEchsSticker = val;
    if (this.showEchsSticker && this.SelectedVisitDetails) {
      this.GetVisitforStickerPrint(this.SelectedVisitDetails.PatientVisitId);
    }
  }

  @Input("membershipTypeName")
  public membershipTypeName: string;
  GetVisitforStickerPrint(PatientVisitId) {
    this.http.get<any>('/api/Visit/PatientVisitStickerInfo?' + 'visitId=' + PatientVisitId, this.options)
      .map(res => res)
      .subscribe(res => this.CallBackStickerOnly(res),
        res => this.Error(res));
  }
  CallBackStickerOnly(res) {
    if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length !== 0) {

      this.EchsStickerDetails = {...res.Results[0]};
      this.EchsStickerDetails.CountrySubDivisionName = res.Results[0].District;
      this.EchsStickerDetails.DepartmentName = res.Results[0].Department;
      this.EchsStickerDetails.VisitDate = moment(res.Results[0].VisitDate).format('YYYY-MM-DD')
      this.EchsStickerDetails.VisitTime = moment(res.Results[0].VisitTime, "hhmm").format('hh:mm A');
      if (this.EchsStickerDetails.DepartmentName.toLowerCase() === 'immunization') {
        this.showDateOfBirth = true;
      }
      this.localDateTime = this.GetLocalDate() + " BS";
      this.ageSex = CommonFunctions.GetFormattedAgeSexforSticker(this.EchsStickerDetails.DateOfBrith, this.EchsStickerDetails.Gender, this.EchsStickerDetails.Age);

      this.patientQRCodeInfo = `Name: ` + this.EchsStickerDetails.PatientName + `
        Hospital No: `+ this.EchsStickerDetails.PatientCode + `
        Age/Sex: `+ this.ageSex + `
        Contact No: `+ this.EchsStickerDetails.PhoneNumber + `
        Address: `+ this.EchsStickerDetails.Address;
    }
    else {
      this.showEchsSticker = false;
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
    this.showEchsSticker = false;
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! not able to get for opd- sticker"]);
    console.log(err.ErrorMessage);
  }
  AfterPrintAction() {
    if (this.closePopUpAfterStickerPrint) {
      // this is after print action ..and it pass some event to the parent component
      this.router.navigate(['Appointment/PatientSearch']);
      this.afterPrintAction.emit({ showEchsSticker: false });
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
    var PrinterName = this.coreService.AllPrinterSettings.find(a => a.PrintingType === 'server' && a.GroupName === 'reg-sticker').PrinterDisplayName;;
    PrinterName += this.EchsStickerDetails.PatientCode;
    var filePath = this.coreService.AllPrinterSettings.find(a => a.PrintingType === 'server' && a.GroupName === 'reg-sticker').ServerFolderPath;
    var lastCharacter = filePath.substr(filePath.length - 1);
    if (lastCharacter != '\\') {
      filePath += '\\';
    }
    this.loading = true;
    this.showLoading = true;
    this.http.post<any>("/api/Billing/saveHTMLfile?PrinterName=" + PrinterName + "&FilePath=" + filePath, printableHTML, this.options)
      .map(res => res).subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
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
    Parameter = Parameter.filter(parms => parms.ParameterName === "DefaultPrinterName");
    let JSONobject = JSON.parse(Parameter[0].ParameterValue);
    let PrinterName = JSONobject.OPDSticker;
    return PrinterName;
  }
  //set button for preview
  showHidePrintButton() {
    let params = this.coreService.Parameters;
    params = params.filter(p => p.ParameterName === "showServerPrintBtn");
    let jsonObj = JSON.parse(params[0].ParameterValue);
    let value = jsonObj.OPDSticker;
    if (value === "true") {
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
    var currParameter = this.coreService.Parameters.find(a => a.ParameterName === "CalendarTypes")
    if (currParameter) {
      let visitCalendar = JSON.parse(currParameter.ParameterValue).PatientVisit;
      if (visitCalendar === "en,np") {
        return this.nepaliCalendarServ.ConvertEngToNepDateString(this.EchsStickerDetails.VisitDate);
      }
    }
    else {
      this.msgBoxServ.showMessage("error", ["Please set local date view configuration."]);
      return null;
    }
  }
  //loads maximum follow up days limit from parameters
  loadMaximumFollowUpDays() {
    let maxLimit = this.coreService.Parameters.filter(p => p.ParameterGroupName === "Appointment" && p.ParameterName === "MaximumLastVisitDays");
    if (maxLimit[0]) {
      this.maxFollowUpDays = maxLimit[0].ParameterValue;
    }
  }

  GetEnableShowTicketPrice(): boolean {
    let retVal: boolean = false;

    let opdTicketParam = this.coreService.Parameters.find(p => p.ParameterGroupName === "Appointment" && p.ParameterName === "EnableTicketPriceInVisit");
    if (opdTicketParam && opdTicketParam.ParameterValue && opdTicketParam.ParameterValue.toLowerCase() === "true") {
      retVal = true;
    }
    return retVal;
  }



  public print() {
    this.coreService.loading = true;
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType === ENUM_PrintingType.browser) {
      this.browserPrintContentObj = document.getElementById("id_echs_sticker_printpage");
      this.openBrowserPrintWindow = false;
      this.changeDetector.detectChanges();
      this.openBrowserPrintWindow = true;
      if (this.closePopUpAfterStickerPrint) {
        this.router.navigate(['Appointment/PatientSearch']);
      }
      this.coreService.loading = false;
    }
    else {
      this.msgBoxServ.showMessage('error', ["Printer Not Supported."]);
      this.coreService.loading = true;
      return;
    }
  }


  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
  OnPrinterChanged($event) {
    this.selectedPrinter = $event;
  }

}
