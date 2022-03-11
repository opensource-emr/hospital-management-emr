import { Component, Input, Output, EventEmitter } from '@angular/core'
import { BillStickerViewModel } from './bill-sticker.model'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../shared/common.functions';
import * as moment from 'moment';
import { CoreService } from '../../core/shared/core.service';
import { NepaliCalendarService } from '../../shared/calendar/np/nepali-calendar.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';

@Component({
    selector: 'bill-sticker',
    templateUrl: './bill-sticker.html'
})
export class BillStickerComponent {

    public ageSex: string = '';
    public billStickerDetail: BillStickerViewModel = new BillStickerViewModel();
    public localDateTime = new String();
    public patientQRCodeInfo: string = "";

    //for QR-specific purpose only--sud.
    public showQrCode: boolean = false;
    public loading: boolean = false;
    public showLoading: boolean = false;
    public showServerPrintBtn: boolean = false;

    public showSticker: boolean;


    public maxFollowUpDays: number = null;
    public doctorOrDepartment: string = null;
    public EnableShowTicketPrice: boolean = false;
    public printerNameSelected: any = null;
    public allPrinterName: any = null;
    public showStickerChange: boolean = false;
    public printerName: string = null;

    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    @Input("billingTransactionId")
    public billingTransactionId: number;
    @Input("showSticker")
    public set value(val: boolean) {
        this.showSticker = val;
        if (this.showSticker && this.billingTransactionId) {
            this.GetVisitDetail(this.billingTransactionId);
        }
    }
    @Output("after-print-action")
    afterPrintAction: EventEmitter<Object> = new EventEmitter<Object>();
    constructor(public http: HttpClient,
        public msgBoxServ: MessageboxService,
        public coreService: CoreService,
        public nepaliCalendarServ: NepaliCalendarService) {
        this.showHidePrintButton();
        this.loadMaximumFollowUpDays();

        let paramValue = this.coreService.EnableDepartmentLevelAppointment();
        if (paramValue) {
            this.doctorOrDepartment = "Department";
        }
        else {
            this.doctorOrDepartment = "Doctor";
        }
        this.EnableShowTicketPrice = this.GetEnableShowTicketPrice();

        this.printerName = localStorage.getItem('Danphe_IPD_Default_PrinterName');
        var allStickerFolderDetail = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() == 'common' && a.ParameterName == 'StickerPrinterSettings');

        if (allStickerFolderDetail) {
        this.allPrinterName = JSON.parse(allStickerFolderDetail.ParameterValue);
        }

    }
    public GetVisitDetail(txnId: number) {
        this.http.get<any>('/api/Billing?reqType=getVisitInfoforStickerPrint&billingTransactionId=' + txnId, this.options)
            .map(res => res)
            .subscribe(res => this.CallBackStickerOnly(res),
                res => this.Error(res));
    }
    public CallBackStickerOnly(data) {
        if (data.Status = "OK" && data.Results.length != 0) {
            this.billStickerDetail.PatientCode = data.Results[0].PatientCode;
            this.billStickerDetail.PatientName = data.Results[0].PatientName;
            this.billStickerDetail.District = data.Results[0].District;
            this.billStickerDetail.Address = data.Results[0].Address;
            this.billStickerDetail.DateOfBirth = data.Results[0].DateOfBrith;
            this.billStickerDetail.DepartmentName = data.Results[0].Department;
            this.billStickerDetail.DoctorName = data.Results[0].DoctorName;
            this.billStickerDetail.PhoneNumber = data.Results[0].PhoneNumber;
            this.billStickerDetail.User = data.Results[0].User;
            this.billStickerDetail.CountryName = data.Reesults[0].CountryName;
            this.billStickerDetail.Gender = data.Results[0].Gender;
            this.billStickerDetail.Age = data.Results[0].Age;
            this.billStickerDetail.SaleDate = moment(data.Results[0].SaleDate).format('YYYY-MM-DD')
            this.billStickerDetail.SaleTime = moment(data.Results[0].SaleTime, "hhmm").format('hh:mm A');
            this.billStickerDetail.AppointmentType = data.Results[0].AppointmentType;
            this.billStickerDetail.RoomNo = data.Results[0].RoomNo;
            this.billStickerDetail.PackageName = data.Results[0].PackageName;
            //this.billStickerDetail.TicketCharge = data.Results[0].OpdTicketCharge;
            this.localDateTime = this.GetLocalDate() + " BS";
            //get Formatted age/sex to give as input to qr-code value.
          this.ageSex = CommonFunctions.GetFormattedAgeSexforSticker(this.billStickerDetail.DateOfBirth, this.billStickerDetail.Gender, this.billStickerDetail.Age);
            //Create an specific format for QR-Value. 
            //current format:   
            //PatientName: XYZ
            //Hospital No : XYZ
            //Age/Sex: XYZ
            //Contact No: XYZ
            //Address: XYZ

            this.patientQRCodeInfo = `Name: ` + this.billStickerDetail.PatientName + `
Hospital No: `+ this.billStickerDetail.PatientCode + `
Age/Sex: `+ this.ageSex + `
Contact No: `+ this.billStickerDetail.PhoneNumber + `
Address: `+ this.billStickerDetail.Address;
            //set this to true only after all values are set.
            this.showQrCode = true;
        }
        else {
            this.showSticker = false;
            this.AfterPrintAction();
            this.msgBoxServ.showMessage("error", ["Sorry!!! not able to get date for sticker of this patient"]);
        }
    }
    public Error(err) {
        this.msgBoxServ.showMessage("Sorry", ["Sticker Printing Failed"]);
        console.log(err.ErrorMessage);
  }

    GetLocalDate(): string {
        var currParameter = this.coreService.Parameters.find(a => a.ParameterName == "CalendarTypes")
        if (currParameter) {
            let visitCalendar = JSON.parse(currParameter.ParameterValue).PatientVisit;
            if (visitCalendar == "en,np") {
                return this.nepaliCalendarServ.ConvertEngToNepDateString(this.billStickerDetail.SaleDate);
            }
        }
        else {
            this.msgBoxServ.showMessage("error", ["Please set local date view configuration."]);
            return null;
        }
    }

    AfterPrintAction() {
        // this is after print action ..and it pass some event to the parent component
        this.afterPrintAction.emit({ showPackageBillingSticker: false });
    }

    printStickerClient() {

        let popupWinindow;
        var printContents = document.getElementById("sticker").innerHTML;
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
    //06April2018 print from server
    printStickerServer() {
        let printContents = document.getElementById("sticker").innerHTML;
        var printableHTML = '<html><head><link rel="stylesheet" type="text/css" href="DanpheStyle.css" />';
        printableHTML += '<meta http-equiv="X-UA-Compatible" content="IE= edge"/></head>';
        printableHTML += '<body>' + printContents + '</body></html>';
        var PrinterName = this.LoadPrinterSetting();
        PrinterName += this.billStickerDetail.PatientCode;
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
        let filepath;
        this.allPrinterName.forEach(p => {
        if(p.Name == this.printerName){
            filepath = p.FolderPath;
        }
        });
        return filepath;
    }
    //timer function
    timerFunction() {
        var timer = Observable.timer(10000);
        var sub: Subscription;
        sub = timer.subscribe(t => {
            this.showLoading = false;
        });
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

        let TicketParam = this.coreService.Parameters.find(p => p.ParameterGroupName == "Appointment" && p.ParameterName == "EnableTicketPriceInVisit");
        if (TicketParam && TicketParam.ParameterValue && TicketParam.ParameterValue.toLowerCase() == "true") {
            retVal = true;
        }
        return retVal;
    }

    //Multiple sticker printer change 
  public ChangeStickerPrinter(){
    this.showStickerChange = true;
    this.printerNameSelected = this.printerName;
  }

  public CloseChangeStickerPrinter(){
    this.showStickerChange = false;
    this.printerNameSelected = null;
  }

  public UpdateNewPrinter(){
    if (this.printerNameSelected) {
      if (localStorage.getItem('Danphe_IPD_Default_PrinterName')) {
        localStorage.removeItem('Danphe_IPD_Default_PrinterName');
      }      
      localStorage.setItem('Danphe_IPD_Default_PrinterName', this.printerNameSelected);
      this.printerName = this.printerNameSelected;
      this.showStickerChange = false;
    } else {
      this.msgBoxServ.showMessage('error', ["Please select Printer Location"]);
    }
  }
}
