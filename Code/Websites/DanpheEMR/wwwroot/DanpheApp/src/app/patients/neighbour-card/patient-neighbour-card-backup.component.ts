import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { PatientsBLService } from '../shared/patients.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CommonFunctions } from '../../shared/common.functions';
import { CoreService } from "../../core/shared/core.service";
import { Patient } from "../../patients/shared/patient.model";
import { DanpheHTTPResponse } from '../../shared/common-models';
import { HttpClient } from '@angular/common/http';
import * as html2canvas from 'html2canvas';
import { DomSanitizer } from '@angular/platform-browser';
import { HealthCard } from '../shared/health-card.model';
import { SecurityService } from '../../security/shared/security.service';
import { NeighbourhoodCardModel } from '../shared/neighbourhood-card.model';

@Component({
    selector: "patient-neighbour-card-backup",
    templateUrl: "./patient-neighbour-card-backup.html"
})

export class PatientNeighbourCard_Backup_Component implements OnInit {

    @Input() showCard: boolean = false;

    @Input("selectedPat")
    public selectedPat: any;

    public patientQRCodeInfo: string = "";
    public showQrCode: boolean = false;
    public profilePic: any = null;
    public patHealthCardStatus: any = null;
    public curHealthCard: HealthCard = new HealthCard();

    public currNeighbourCard: NeighbourhoodCardModel = new NeighbourhoodCardModel();

    public showAdditionalInfo: boolean = false;
    public postHealthCard: boolean = false;

    constructor(
        public msgBoxServ: MessageboxService,
        public coreService: CoreService,
        public securityService: SecurityService,
        public http: HttpClient,
        public _sanitizer: DomSanitizer) {

    }

    ngOnInit() {
        let patInfo = this.selectedPat;
        //Create an specific format for QR-Value. 
        //current format:   
        //PatientName: XYZ
        //Hospital No : XYZ
        //Age/Sex: XYZ
        //Contact No: XYZ
        //Address: XYZ
        this.patientQRCodeInfo = `Name: ` + this.selectedPat.ShortName + `
            Hospital No: `+ '[' + this.selectedPat.PatientCode + ']';
        //this.patientQRCodeInfo = "Hospital No.: MNK154255, Allergy: Cfskushdfaj, Address: samakhusi 11, kathmandu";
        this.showQrCode = true;

        if (this.selectedPat.PatientId) {
            this.LoadProfilePic();           
        }
    }

    Close() {
        this.showCard = false;
    }

    LoadProfilePic() {
        this.http.get<any>("/api/patient?reqType=profile-pic&patientId=" + this.selectedPat.PatientId)
            .map(res => res)
            .subscribe((res: DanpheHTTPResponse) => {
                console.log(res);
                let fileInfo = res.Results;
                if (fileInfo) {
                    this.profilePic = fileInfo.FileBase64String;
                }
            });
    }



    public printWholeFrontSide() {
        this.currNeighbourCard.PatientId = this.selectedPat.PatientId;
        this.currNeighbourCard.PatientCode = this.selectedPat.PatientCode;
        if(this.currNeighbourCard.PatientId ){
            let data = JSON.stringify(this.currNeighbourCard);

            this.http.post<any>("/api/Patient?reqType=postNeighbourhoodCard", data)
                    .map(res => res)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                           this.printCard();
                           this.currNeighbourCard = new NeighbourhoodCardModel();
                        }
                        else {
                            this.msgBoxServ.showMessage('Failed', ["Cannot Update neighbourcard detail and cannot print."])
                            console.log(res.ErrorMessage);
                        }
                    });
        }       
    }

    printCard(){
        let popupWinindow;            
        var printContents = document.getElementById("cardFrontside").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanpheStyle.css" /><style>@media print { @page { size: 258mm 162.29mm; padding: 0; margin: 0; color: #fff; } } .sngl-row{padding: 14px 0px;font-family: "Open Sans",sans-serif;} .parm-val{font-family: "Open Sans",sans-serif;} .allwith-bg {font-size: 24px; line-height: 16px;color: #000;white-space: nowrap;} .parm-nam{color: #000;} .card-background{position: relative !important; overflow:hidden;}</style></head><body style="margin: 0 !important;"  onload="window.print()">' + printContents + '</body></html>');
        popupWinindow.document.close();
        this.showCard = false;
        document.getElementById("frontSide").style.display = "none";
    }
   


}
