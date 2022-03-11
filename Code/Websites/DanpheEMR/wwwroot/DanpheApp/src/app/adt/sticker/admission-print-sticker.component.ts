import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AdmissionStickerViewModel } from './admission-sticker.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CommonFunctions } from "../../shared/common.functions";
import { CoreService } from "../../core/shared/core.service";
import { NepaliCalendarService } from '../../shared/calendar/np/nepali-calendar.service';
import { BillingDeposit } from '../../billing/shared/billing-deposit.model';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment/moment';
import { BillingTransaction } from "../../billing/shared/billing-transaction.model";
import { PrinterSettingsModel, ENUM_PrintingType } from "../../settings-new/printers/printer-settings.model";
@Component({
    selector: 'admission-sticker',
    templateUrl: "./admission-sticker.html",
    host: { '(window:keydown)': 'hotkeys($event)' }
})

export class AdmissionPrintStickerComponent {
    public stickerDetail: AdmissionStickerViewModel;
    @Input("patientVisitId")
    public patientVisitId: number;

    public showSticker: boolean = false;
    loading = false;

    @Output("after-print-action")
    afterPrintAction: EventEmitter<Object> = new EventEmitter<Object>();
    //public Patient: Patient = new Patient();
    public currentDateTime: string;
    public localDateTime: string;
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    public showLoading: boolean = false;

    //for QR-specific purpose only--sud.
    public showQrCode: boolean = false;
    public patientQRCodeInfo: string = "";
    public showRoomNumber: boolean = false;
    public roomNo: string = null;


    public printerNameSelected: any = null;
    public showStickerChange: boolean = false;
    public printerName: string = null;
    public allPrinterName: any = null;

    public dotMatrixPrinting: boolean = false;
    public dotPrinterDimensions: any;

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
        public changeDetector: ChangeDetectorRef) {
        this.showHidePrintButton();

        this.printerName = localStorage.getItem('Danphe_ADT_Default_PrinterName');
        var allStickerFolderDetail = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() == 'common' && a.ParameterName == 'StickerPrinterSettings');

        if (allStickerFolderDetail) {
            this.allPrinterName = JSON.parse(allStickerFolderDetail.ParameterValue);
        }

        var room = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() == 'appointment' && a.ParameterName == 'RoomNumberInSticker');
        if (room) {
            let roomValue = JSON.parse(room.ParameterValue);
            //this.showRoomNumber = roomValue.Show;
            this.roomNo = roomValue.DisplayName;
        }
        this.dotMatrixPrinting = this.coreService.EnableDotMatrixPrintingInADT();
        if (this.dotMatrixPrinting) {
            this.dotPrinterDimensions = this.coreService.GetDotMatrixPrinterDimensions(3);
        }
    }

    ngOnInit() {
        if (this.patientVisitId) {
            this.GetADTStickerDetail();
        }
        let val = this.coreService.Parameters.find(p => p.ParameterGroupName == 'ADT' && p.ParameterName == 'AdmissionPrintSettings');
        let param = JSON.parse(val && val.ParameterValue);
        if (param) {
            this.defaultFocus = param.DefaultFocus;
            this.closePopUpAfterStickerPrint = param.closePopUpAfterStickerPrint;
        }
    }


    focusOnPrint() {
        this.changeDetector.detectChanges();
        if (this.stickerDetail) {
            let btnObj = document.getElementById('btnAdtSticker');
            if (btnObj && this.defaultFocus.toLowerCase() == 'sticker') {
                btnObj.focus();
            }
        }
    }

    //sud:8thJan'19--get value from Parameters on whether or not to show wristband in ADT.
    public ShowHideWristBand(): boolean {
        let retValue = false;
        let adtCustomFeaturesParam = this.coreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "ADTCustomFeatures");
        if (adtCustomFeaturesParam) {
            let wristBandParamValue = JSON.parse(adtCustomFeaturesParam.ParameterValue).wristband;
            if (wristBandParamValue && wristBandParamValue == true) {
                retValue = true;
            }
        }

        return retValue;
    }

    GetADTStickerDetail() {
        this.http.get<any>('/api/Admission?reqType=admission-sticker' + '&patientVisitId=' + this.patientVisitId, this.options)
            .map(res => res)
            .subscribe(res => {
                if (res.Status = "OK") {
                    this.showSticker = true;
                    this.CallBackGetStickerDetail(res);
                    this.focusOnPrint();
                }
                else {
                    this.showSticker = false;
                    this.AfterPrintAction();
                    this.msgBoxServ.showMessage("error", ["Sorry!!! not able to get date for opd-sticker of this patient"]);
                }
            },
                err => this.Error(err));
    }
    CallBackGetStickerDetail(res) {
        this.stickerDetail = res.Results;
        this.localDateTime = this.GetLocalDate() + " BS";
        //get Formatted age/sex to give as input to qr-code value.
        let ageSex = CommonFunctions.GetFormattedAgeSex(this.stickerDetail.DateOfBirth, this.stickerDetail.Gender);
        this.patientQRCodeInfo = `Name: ` + this.stickerDetail.PatientName + `
Hospital No: `+ this.stickerDetail.PatientCode + `
Age/Sex: `+ ageSex + `
Contact No: `+ this.stickerDetail.PhoneNumber + `
Address: `+ this.stickerDetail.Address;
        //set this to true only after all values are set.
        //this.showQrCode = true;

    }

    printStickerClient() {
        if (this.dotMatrixPrinting) {
            this.PrintByDotMatrix();
            this.AfterPrintAction();
        } else {
            let popupWinindow;
            var printContents = document.getElementById("sticker").innerHTML;
            popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
            popupWinindow.document.open();
            let documentContent = '<html><head>';
            documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
            /// documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
            documentContent += '</head>';
            documentContent += '<body>' + printContents + '</body></html>'
            popupWinindow.document.write(documentContent);
            let tmr = setTimeout(function () {
                popupWinindow.print();
                popupWinindow.close();
            }, 300);
            this.AfterPrintAction();
        }
    }

    PrintByDotMatrix() {
        // get this from parameter: Name='DotMatrixPrinterDimensionSetting_RegStickers'
        let nline = '\n';
        let finalDataToPrint = "";
        let ageSex = CommonFunctions.GetFormattedAgeSex(this.stickerDetail.DateOfBirth, this.stickerDetail.Gender);
        let ipNo = "IP No:" + this.stickerDetail.InPatientNo;
        finalDataToPrint = finalDataToPrint + "DOA:" + moment(this.stickerDetail.AdmissionDate).format('YYYY-MM-DD HH:mm') + '(' + this.localDateTime + ')' + nline;
        finalDataToPrint += "Name:" + this.stickerDetail.PatientName + " " + ageSex + nline;
        finalDataToPrint += "Hosp. No:" + this.stickerDetail.PatientCode + " " + (this.stickerDetail.PhoneNumber ? "Ph:" + this.stickerDetail.PhoneNumber : "") + nline;
        finalDataToPrint += "Address:" + (this.stickerDetail.Address ? (this.stickerDetail.Address + ",") : "") + this.stickerDetail.District + nline;

        let insDetail = "";
        if (this.stickerDetail.Ins_HasInsurance) {
            insDetail += 'NSHI No:' + this.stickerDetail.Ins_NshiNumber + " ";
            insDetail += 'Claim Code:' + this.stickerDetail.ClaimCode;
        }
        finalDataToPrint += insDetail + nline;
        if (this.stickerDetail.AdmittingDoctor) {
            finalDataToPrint += "Admit. Doc:" + this.stickerDetail.AdmittingDoctor + " " + nline;
        }
        finalDataToPrint += "Req. Dept:" + this.stickerDetail.RequestingDepartmentName + " " + (ipNo ? ipNo : "") + nline;
        finalDataToPrint += "Ward/Bed:" + this.stickerDetail.Ward + "/" + this.stickerDetail.BedCode + " User:" + this.stickerDetail.User;
        finalDataToPrint;
        //passing "reg-sticker" as printOutType parameter since we're implementing charcter margin and different font size in registration stickers.
        //need to make it dynamic such that we can remove that variable..
        return finalDataToPrint
        //return null;
    }

    Close() {
        this.stickerDetail = null;
        this.patientVisitId = null;
        this.showSticker = false;
        this.AfterPrintAction();
    }
    Error(err) {
        this.msgBoxServ.showMessage("error", ["Sorry!!! not able to get for admission- sticker"]);
        console.log(err.ErrorMessage);
    }

    AfterPrintAction() {
        if (this.closePopUpAfterStickerPrint) {
            this.afterPrintAction.emit({ closed: true });
            this.router.navigate(['ADTMain/AdmittedList']);
        }

    }


    GetLocalDate(): string {
        var currParameter = this.coreService.Parameters.find(a => a.ParameterName == "CalendarTypes")
        if (currParameter) {
            let visitCalendar = JSON.parse(currParameter.ParameterValue).PatientVisit;
            if (visitCalendar == "en,np") {
                return this.nepaliCalendarServ.ConvertEngToNepDateString(this.stickerDetail.AdmissionDate);
            }
        }
        else {
            this.msgBoxServ.showMessage("error", ["Please set local date view configuration."]);
            return null;
        }

    }




    ////For server side printing: sud--20Sept'18


    public showServerPrintBtn: boolean = false;

    //loads Printer Setting from Paramter Table (database) -- ramavtar
    LoadPrinterSetting() {
        let Parameter = this.coreService.Parameters;
        Parameter = Parameter.filter(parms => parms.ParameterName == "DefaultPrinterName");
        let JSONobject = JSON.parse(Parameter[0].ParameterValue);
        let PrinterName = JSONobject.OPDSticker;
        return PrinterName;
    }

    //load file storage path
    LoadFileStoragePath() {
        // let params = this.coreService.Parameters;
        // params = params.filter(p => p.ParameterName == "PrintFileLocationPath");
        // let path = params[0].ParameterValue;
        // return path;

        let filepath;
        this.allPrinterName.forEach(p => {
            if (p.Name == this.printerName) {
                filepath = p.FolderPath;
            }
        });
        return filepath;
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

    printStickerServer() {
        let printContents = document.getElementById("sticker").innerHTML;
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
        if (this.closePopUpAfterStickerPrint) {
            this.router.navigate(['ADTMain/AdmittedList']);
        }
        this.AfterPrintAction();
    }

    //timer function
    timerFunction() {
        var timer = Observable.timer(10000); //this is total 10 seconds.
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
            if (localStorage.getItem('Danphe_ADT_Default_PrinterName')) {
                localStorage.removeItem('Danphe_ADT_Default_PrinterName');
            }
            localStorage.setItem('Danphe_ADT_Default_PrinterName', this.printerNameSelected);
            this.printerName = this.printerNameSelected;
            this.showStickerChange = false;
        } else {
            this.msgBoxServ.showMessage('error', ["Please select Printer Location"]);
        }
    }

    public hotkeys(event) {
        if (event.keyCode == 27) {
            this.Close();
        }
    }

    public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
    OnPrinterChanged($event) {
        this.selectedPrinter = $event;
    }

    public print() {
        this.coreService.loading = true;
        if (!this.selectedPrinter || this.selectedPrinter.PrintingType == ENUM_PrintingType.browser) {
            this.browserPrintContentObj = document.getElementById("adtPrintPage");
            this.openBrowserPrintWindow = false;
            this.changeDetector.detectChanges();
            this.openBrowserPrintWindow = true;
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
                    let dataToPrint = this.PrintByDotMatrix();
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
            this.coreService.loading = true;
        }
        else {
            this.msgBoxServ.showMessage('error', ["Printer Not Supported."]);
            this.coreService.loading = true;
            return;
        }
    }


}