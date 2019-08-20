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
@Component({
    selector: 'admission-sticker',
    templateUrl: "./admission-sticker.html"
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
    public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
    public showLoading: boolean = false;

    //for QR-specific purpose only--sud.
    public showQrCode: boolean = false;
    public patientQRCodeInfo: string = "";

    //for deposit receipt
    @Input("deposit")
    public deposit: BillingDeposit;
    @Input("showDepositReceipt")
    public showDepositReceipt: boolean = false;


    //for inpatient-wristband
    @Input("showWristBand")
    public showWristBand: boolean = false;

    constructor(
        public http: HttpClient,
        public msgBoxServ: MessageboxService,
        public router: Router,
        public nepaliCalendarServ: NepaliCalendarService,
        public coreService: CoreService) {
        this.showHidePrintButton();
    }

    @Input("showSticker")
    public set value(val: boolean) {
        this.showSticker = val;
        if (this.showSticker && this.patientVisitId) {
            if (this.showWristBand) {
                //if showWristBand is set to true from parent component, check if this feature has is enabled or not for this Hospital.
                //no need to change if showwristband
                this.showWristBand = this.ShowHideWristBand();//get the value from server parameter.
            }

            this.GetADTStickerDetail();
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
                if (res.Status="OK") {
                    this.CallBackGetStickerDetail(res);
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
        this.showQrCode = true;

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
        //this.AfterPrintAction();
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
        this.afterPrintAction.emit();
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
        let params = this.coreService.Parameters;
        params = params.filter(p => p.ParameterName == "PrintFileLocationPath");
        let path = params[0].ParameterValue;
        return path;
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
        var filePath = this.LoadFileStoragePath();
        this.loading = true;
        this.showLoading = true;
        this.http.post<any>("/api/Billing?reqType=saveHTMLfile&PrinterName=" + PrinterName + "&FilePath=" + filePath, printableHTML, this.options)
            .map(res => res).subscribe(res => {
                if (res.Status="OK") {
                    this.timerFunction();
                }
                else {
                    this.loading = false;
                    this.showLoading = false;
                }
            });

        //this.AfterPrintAction();
    }

    //timer function
    timerFunction() {
        var timer = Observable.timer(10000); //this is total 10 seconds.
        var sub: Subscription;
        sub = timer.subscribe(t => {
            this.showLoading = false;
        });
    }


}