import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { Subscription } from "rxjs";
import { CommonFunctions } from "../../shared/common.functions";
import { Observable } from 'rxjs/Observable';
import { VaccinationStickerVM } from "./vaccination-sticker.model";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { Router } from "@angular/router";
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { CoreService } from "../../core/shared/core.service";
import { VisitService } from "../../appointments/shared/visit.service";
import * as moment from "moment";
import { PrinterSettingsModel, ENUM_PrintingType } from "../../settings-new/printers/printer-settings.model";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { VaccinationBLService } from "../shared/vaccination.bl.service";
import { VaccPatientWithVisitInfoVM } from "../shared/vacc-patwithvisit-info-vm";

@Component({
    selector: 'vaccination-sticker',
    templateUrl: './vaccination-sticker.html'
})

export class VaccinationStickerComponent {
    public ageSex: string = '';

    public stickerDetail: VaccPatientWithVisitInfoVM = new VaccPatientWithVisitInfoVM();

    @Input("selPatId")
    public selPatId: any;

    @Input("selPatientVisitId")
    public patientVisitId: any;

    public showVaccSticker: boolean = false;
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
    public openBrowserPrintWindow: boolean = false;
    public browserPrintContentObj: any;

    constructor(
        public http: HttpClient,
        public msgBoxServ: MessageboxService,
        public router: Router,
        public nepaliCalendarServ: NepaliCalendarService,
        public coreService: CoreService,
        public visitService: VisitService,
        public changeDetector: ChangeDetectorRef,
        public vaccBlService: VaccinationBLService
    ) {
        this.showHidePrintButton();
        this.loadMaximumFollowUpDays();

        let paramValue = this.coreService.EnableDepartmentLevelAppointment();
        this.hospitalCode = this.coreService.GetHospitalCode();
        this.dotPrinterDimensions = this.coreService.GetDotMatrixPrinterRegStickerDimensions();
        this.hospitalCode = (this.hospitalCode && this.hospitalCode.trim().length > 0) ? this.hospitalCode : "allhosp";
        if (paramValue) {
            this.doctorOrDepartment = "Department";
        }
        else {
            this.doctorOrDepartment = "Doctor";
        }

        this.EnableShowTicketPrice = this.GetEnableShowTicketPrice();
        this.printerName = localStorage.getItem('Danphe_OPD_Default_PrinterName');
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
        this.printByDotMatrixPrinter = this.coreService.EnableDotMatrixPrintingInVaccinationSticker();
    }

    ngOnInit() {
        this.QueueNoSetting = this.coreService.GetQueueNoSetting();
        //if (this.showVaccSticker && this.SelectedVisitDetails) {
        //  this.GetVisitforStickerPrint(this.SelectedVisitDetails.PatientVisitId);
        //}
    }

    ngAfterViewInit() {

    }

    @Input("showVaccSticker")
    public set value(val: boolean) {
        this.showVaccSticker = val;
        if (this.showVaccSticker && this.patientVisitId) {
            this.GetDetailsForVaccSticker(this.patientVisitId);
        }
    }

    GetDetailsForVaccSticker(patientVisitId) {
        this.vaccBlService.GetPatientAndVisitInfo(patientVisitId)
            .subscribe((res: DanpheHTTPResponse) => {
                console.log(res.Results);
                this.stickerDetail = res.Results;

                this.changeDetector.detectChanges();
                this.coreService.FocusInputById('btnPrintSticker');

            })
    }

    //     GetDetailsForVaccSticker(PatientId) {
    //         this.http.get<any>('/api/Patient?reqType=getPatientDetailsforVaccination' + '&patientId=' + PatientId, this.options)
    //             .map(res => res)
    //             .subscribe(res => this.CallBackStickerOnly(res),
    //                 res => this.Error(res));
    //     }
    //     CallBackStickerOnly(res) {
    //         if (res.Status = "OK") {
    //             this.VaccStickerDetails.PatientCode = res.Results.PatientCode;
    //             this.VaccStickerDetails.PatientName = res.Results.ShortName;
    //             this.VaccStickerDetails.Mother = res.Results.Mother;
    //             this.VaccStickerDetails.Address = res.Results.Address;
    //             this.VaccStickerDetails.DateOfBrith = moment(res.Results.DOB).format('YYYY-MM-DD');
    //             this.VaccStickerDetails.DepartmentName = "Immunization";
    //             this.VaccStickerDetails.User = res.Results.User;
    //             this.VaccStickerDetails.Age = res.Results.Age;
    //             this.VaccStickerDetails.Gender = res.Results.Gender;
    //             this.VaccStickerDetails.PhoneNumber = res.Results.PhoneNumber;
    //             this.VaccStickerDetails.District = res.Results.District;
    //             this.VaccStickerDetails.MunicipalityName = res.Results.MunicipalityName;
    //             this.VaccStickerDetails.VisitDate = moment(res.Results.Date).format('YYYY-MM-DD')
    //             this.VaccStickerDetails.VisitTime = moment(res.Results.Date).format('hh:mm A');
    //             this.VaccStickerDetails.VaccRegNo = res.Results.VaccRegNo;
    //             this.VaccStickerDetails.Time = moment(res.Results.Date).subtract(1, 'days').format('hh:mm a')
    //             this.localDateTime = this.GetLocalDate() + " BS";
    //             //get Formatted age/sex to give as input to qr-code value.
    //             //this.ageSex = CommonFunctions.GetFormattedAgeSexforSticker(this.VaccStickerDetails.DateOfBrith, this.VaccStickerDetails.Gender, this.VaccStickerDetails.Age);
    //             //Create an specific format for QR-Value. 
    //             //current format:   
    //             //PatientName: XYZ
    //             //Hospital No : XYZ
    //             //Age/Sex: XYZ
    //             //Contact No: XYZ
    //             //Address: XYZ

    //             this.patientQRCodeInfo = `Name: ` + this.VaccStickerDetails.PatientName + `
    // Hospital No: `+ this.VaccStickerDetails.PatientCode + `
    // Age/Sex: `+ this.ageSex + `
    // Contact No: `+ this.VaccStickerDetails.PhoneNumber + `
    // Address: `+ this.VaccStickerDetails.Address;
    //             //set this to true only after all values are set.
    //             //this.showQrCode = true;
    //         }
    //         else {
    //             this.showVaccSticker = false;
    //             this.AfterPrintAction();
    //             this.msgBoxServ.showMessage("error", ["Sorry!!! not able to get date for opd-sticker of this patient"]);
    //         }
    //     }

    printStickerClient() {

        if (this.printByDotMatrixPrinter) {
            this.PrintDotMatrix();
            return;
        }

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
        this.showVaccSticker = false;
    }
    Error(err) {
        this.msgBoxServ.showMessage("error", ["Sorry!!! not able to get for opd- sticker"]);
        console.log(err.ErrorMessage);
    }
    AfterPrintAction() {
        // this is after print action ..and it pass some event to the parent component
        this.router.navigate(['Vaccination/PatientList']);
        this.coreService.loading = false;
        this.afterPrintAction.emit({ action: "sticker-printed", showVaccSticker: false });
    }

    //06April2018 print from server
    printStickerServer() {
        let printContents = document.getElementById("vaccinationSticker").innerHTML;
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
        var PrinterName = this.LoadPrinterSetting();
        PrinterName += this.stickerDetail.PatientCode;
        var filePath = this.coreService.AllPrinterSettings.find(a => a.PrintingType == 'server' && a.GroupName == 'reg-sticker').ServerFolderPath;
        var lastCharacter = filePath.substr(filePath.length - 1);
        if (lastCharacter != '\\') {
            filePath += '\\';
        }
        this.loading = true;
        this.showLoading = true;
        console.log(printableHTML);
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
                return this.nepaliCalendarServ.ConvertEngToNepDateString(this.stickerDetail.VisitDateTime);
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


    public printDetaiils: any;


    public PrintDotMatrix() {


        // get this from parameter: Name='DotMatrixPrinterDimensionSetting_RegStickers'
        // let dotPrinterDimensions = this.dotPrinterDimensions;

        // this.coreService.QzTrayObject.websocket.connect()
        //     .then(() => {
        //         return this.coreService.QzTrayObject.printers.find();
        //     })
        //     .then(() => {
        //         var config = this.coreService.QzTrayObject.configs.create("EPSON");

        let nline = '\n';
        let finalDataToPrint = "";
        finalDataToPrint = finalDataToPrint + "Date:" + moment(this.stickerDetail.VisitDateTime).format('YYYY-MM-DD') + '(' + this.nepaliCalendarServ.ConvertEngToNepDateString(this.stickerDetail.VisitDateTime) + ')' + '-' + moment(this.stickerDetail.VisitDateTime).format('HH:mm') + nline;
        finalDataToPrint += "Name:" + this.stickerDetail.PatientName + " " + "(" + this.stickerDetail.Gender + ")" + nline;
        finalDataToPrint += "Hosp. No:" + this.stickerDetail.PatientCode + " " + "Vacc.Reg.No:" + this.stickerDetail.VaccinationRegNo + nline;
        finalDataToPrint += "Baby's DOB:" + this.nepaliCalendarServ.ConvertEngToNepDateString(this.stickerDetail.DateOfBirth) + nline;
        let address = "Address: " + (this.stickerDetail.Address ? this.stickerDetail.Address + ", " : "") + this.stickerDetail.DistrictName + nline;


        finalDataToPrint += address;

        finalDataToPrint += "Dept:" + "IMMUNIZATION" + nline;
        let newLineReq = false;

        finalDataToPrint += (newLineReq ? nline : "");
        finalDataToPrint += "User:" + this.stickerDetail.UserName;

        return finalDataToPrint;
        //passing "reg-sticker" as printOutType parameter since we're implementing charcter margin and different font size in registration stickers.
        //need to make it dynamic such that we can remove that variable..
        //     return this.coreService.QzTrayObject.print(config, CommonFunctions.GetEpsonPrintDataForPage(finalDataToPrint, dotPrinterDimensions.mh, dotPrinterDimensions.ml, "reg-sticker"));
        //     //return null;




        // })
        // .catch(function (e) {
        //     console.error(e);
        //     this.afterPrintAction.emit({ showVaccSticker: false, close: true });
        // })
        // .finally(() => {
        //     this.afterPrintAction.emit({ showVaccSticker: false, close: true });
        //     return this.coreService.QzTrayObject.websocket.disconnect();
        // });
    }



    public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
    OnPrinterChanged($event) {
        this.selectedPrinter = $event;
    }


    public print() {
        console.log("print function called--vaccination sticker..");
        this.coreService.loading = true;
        if (!this.selectedPrinter || this.selectedPrinter.PrintingType == ENUM_PrintingType.browser) {
            this.browserPrintContentObj = document.getElementById("vaccinationSticker");
            this.openBrowserPrintWindow = true;
            this.changeDetector.detectChanges();
            this.AfterPrintAction();
        } else if (this.selectedPrinter.PrintingType == ENUM_PrintingType.dotmatrix) {
            // -----qz-tray start----->
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
                   
                    return this.coreService.QzTrayObject.websocket.disconnect();
                });
            //-----qz-tray end----->
        } else if (this.selectedPrinter.PrintingType == ENUM_PrintingType.server) {
            this.printStickerServer();
            this.AfterPrintAction();
        }
        else {
            this.msgBoxServ.showMessage('error', ["Printer Not Supported."]);
            return;
        }
    }
}