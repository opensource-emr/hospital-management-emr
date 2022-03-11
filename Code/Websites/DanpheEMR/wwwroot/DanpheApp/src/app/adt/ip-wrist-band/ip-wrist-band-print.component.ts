import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CommonFunctions } from "../../shared/common.functions";
import { CoreService } from "../../core/shared/core.service";
import { NepaliCalendarService } from '../../shared/calendar/np/nepali-calendar.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { IPWristBandViewModel } from "./ip-wrist-band-info.model";
import { ADT_BLService } from "../shared/adt.bl.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import html2canvas from 'html2canvas';
import { PrinterSettingsModel, ENUM_PrintingType } from "../../settings-new/printers/printer-settings.model";
@Component({
    selector: 'ip-wrist-band',
    templateUrl: "./ip-wrist-band.html",
    host: { '(window:keydown)': 'hotkeys($event)' }
})

export class IPWristBandPrintComponent {

    public wristBandInfo: IPWristBandViewModel = null;
    public showWristBand: boolean = false;
    loading = false;
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    public showLoading: boolean = false;
    //for QR-specific purpose only--sud.
    public showQrCode: boolean = false;
    public defaultFocus: string = null;
    public patientQRCodeInfo: string = "";


    public closePopUpAfterWristBandPrint: boolean = true;

    constructor(
        public http: HttpClient,
        public msgBoxServ: MessageboxService,
        public router: Router,
        public nepaliCalendarServ: NepaliCalendarService,
        public admissionBlService: ADT_BLService,
        public coreService: CoreService,
        public changeDetector: ChangeDetectorRef) {
        this.showHidePrintButton();
    }


    @Input("patientVisitId")
    public patientVisitId: number;

    @Input("showAsPopup")
    public showAsPopup: boolean = true;//this determines whether this comes as popup or inside a div.

    @Output("on-popup-closed")
    closePopup: EventEmitter<Object> = new EventEmitter<Object>();

    @Input("showWristBand")
    public set value(val: boolean) {
        this.showWristBand = val;
        if (this.showWristBand && this.patientVisitId) {
            this.GetWristBandInfo();
        }
    }

    ngOnInit() {

        let val = this.coreService.Parameters.find(p => p.ParameterGroupName == 'ADT' && p.ParameterName == 'AdmissionPrintSettings');
        let param = JSON.parse(val && val.ParameterValue);
        if (param) {
            this.defaultFocus = param.DefaultFocus;
            this.closePopUpAfterWristBandPrint = param.closePopUpAfterWristBandPrint;
        }
    }

    focusOnPrint() {
        let btnObj = document.getElementById('btnPrintWristBand');
        if (btnObj && this.defaultFocus.toLowerCase() == "wristband") {
            btnObj.focus();
        }
    }

    GetWristBandInfo() {
        this.http.get<any>('/api/Admission?reqType=wrist-band-info' + '&patientVisitId=' + this.patientVisitId, this.options)
            .map(res => res)
            .subscribe(res => {
                if (res.Status = "OK" && res.Results) {
                    this.CallBackGetWristbandInfo(res);
                    this.focusOnPrint();
                }
                else {
                    this.showWristBand = false;
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ["Sorry!!! unable to get wristband information..!"]);
                    console.log(err.ErrorMessage);
                    this.showWristBand = false;
                });
    }

    CallBackGetWristbandInfo(res) {
        this.wristBandInfo = res.Results;
        //get Formatted age/sex to give as input to qr-code value.
        let ageSex = CommonFunctions.GetFormattedAgeSex(this.wristBandInfo.DateOfBirth, this.wristBandInfo.Gender);
        this.patientQRCodeInfo = `Name: ` + this.wristBandInfo.PatientName + `
        Hospital No: `+ this.wristBandInfo.PatientCode + `
        Age/Sex: `+ ageSex;
        //set this to true only after all values are set.
        this.showQrCode = true;

        //this.focusOnPrint();

    }


    PrintWristBandSticker_Client() {
        let popupWinindow;
        var printContents = document.getElementById("wristband-print-page").outerHTML;
        popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        let documentContent = '<html><head>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
        /// documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
        documentContent += '</head>';
        documentContent += '<body onload="window.print()" style="margin:8px 0px 0px 280px !important;">' + printContents + '</body></html>'
        popupWinindow.document.write(documentContent);
        popupWinindow.document.close();
        //this.AfterPrintAction();
    }



    CloseWindow() {
        this.closePopup.emit(true);
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
        let wristBandFileLocationParam = this.coreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "WristBand_FolderPath");
        if (wristBandFileLocationParam) {
            return wristBandFileLocationParam.ParameterValue;
        }
        else {
            return null;
        }
    }

    //set button for preview
    showHidePrintButton() {
        let wristBandServerPrintParam = this.coreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "WristBand_PrintServerSide");
        if (wristBandServerPrintParam) {
            let paramValue = wristBandServerPrintParam.ParameterValue;
            if (paramValue && paramValue == "true") {
                this.showServerPrintBtn = true;
            }
            else {
                this.showServerPrintBtn = false;
            }
        }
    }

    PrintWristBand_Server() {

        //step1: Create a image using Canvas with the html contents of the Wrist-Band
        //needed to Embedd the hospital logo in that html file..

        //Create New image (dataURL) from existing logo and replace the old one..
        //scale:4 -> default is 1.5
        html2canvas(document.querySelector("#imgHospitalLogo"),
            { scale: 8 }).then(canvas => {
                //document.getElementById("wristband-print-page").style.display = 'block';
                var image = canvas.toDataURL("image/png");
                var newImg = document.createElement("img");
                newImg.setAttribute("src", image);
                newImg.setAttribute("alt", "IdPrint of  Patient");
                newImg.setAttribute('style', 'height: auto;max-width: 100%;');
                //remove existing logo
                document.getElementById("imgHospitalLogo").remove();
                //add new logo to the same container.
                document.getElementById("dvLogoContainer").appendChild(newImg);

                //Once the logo is replaced, send the wrist-band html to server.
                this.SendHtmlContentToServer();
            });
    }

    //timer function
    timerFunction() {
        var timer = Observable.timer(10000); //this is total 10 seconds.
        var sub: Subscription;
        sub = timer.subscribe(t => {
            this.showLoading = false;
            this.msgBoxServ.showMessage("success", ["wristband printed successfully.."]);
            this.CloseWindow();//close this window after wristband is printed successfully..
        });
    }


    //sud:7Jan'19 -- to send image of the html content to server for server side printing
    public SendHtmlContentToServer() {
        let printContents = document.getElementById("wristband-print-page").outerHTML;
        var printableHTML = '<html><head><link rel="stylesheet" type="text/css" href="DanpheStyle.css" />';
        printableHTML += '<meta http-equiv="X-UA-Compatible" content="IE= edge"/></head>';
        printableHTML += '<body style="margin:8px 0px 0px 280px !important;">' + printContents + '</body></html>';
        let printerName = this.LoadPrinterSetting();
        printerName += this.wristBandInfo.PatientCode;
        var folderPath = this.coreService.AllPrinterSettings.find(a => a.PrintingType == 'server' && a.GroupName == 'reg-sticker').ServerFolderPath;

        if (!folderPath) {
            alert("Couldn't find storage location for WristBand. Please check Parameter values.");
            return;

        }

        this.loading = true;
        this.showLoading = true;

        this.admissionBlService.SaveWristBandHtmlFile(printerName, folderPath, printableHTML)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                    this.timerFunction();
                    console.log("wristband printed successfully..");

                }
                else {
                    this.loading = false;
                    this.showLoading = false;
                }

            });

    }

    public hotkeys(event) {
        if (event.keyCode == 27) {
            this.CloseWindow();
        }
    }

    public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
    public openBrowserPrintWindow: boolean = false;
    public browserPrintContentObj: any;
    OnPrinterChanged($event) {
        this.selectedPrinter = $event;
    }

    public print() {
        if (!this.selectedPrinter || this.selectedPrinter.PrintingType == ENUM_PrintingType.browser) {
            this.browserPrintContentObj = document.getElementById("wristband-print-page");
            this.openBrowserPrintWindow = false;
            this.changeDetector.detectChanges();
            this.openBrowserPrintWindow = true;
            if (this.closePopUpAfterWristBandPrint) {
                this.router.navigate(['ADTMain/AdmittedList']);
            }

        } else if (this.selectedPrinter.PrintingType == ENUM_PrintingType.server) {
            this.PrintWristBand_Server();
        }
        else {
            this.msgBoxServ.showMessage('error', ["Printer Not Supported."]);
            return;
        }
    }

}
