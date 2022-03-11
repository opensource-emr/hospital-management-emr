import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IOAllergyVitalsBLService } from '../clinical/shared/io-allergy-vitals.bl.service';
import { MessageboxService } from "../shared/messagebox/messagebox.service";
import { CommonFunctions } from "../shared/common.functions";
import * as moment from 'moment/moment';

import { selectedbed } from './shared/selectedbed.model';
import { Vitals } from "../clinical/shared/vitals.model";
import { ADT_BLService } from './shared/adt.bl.service';
import { DanpheHTTPResponse } from '../shared/common-models';

@Component({
    templateUrl: "./adt-home.html"
})

// App Component class
export class AdtHomeComponent {
    public bedStats: any = ""; // = new Object();
    public bedFeature: Array<any> = new Array<any>();
    public totaloccupid: any;
    public bedPatientFeature: Array<any> = new Array<any>();
    public occupiedBed: Array<any> = new Array<any>();
    public vacantBed: Array<any> = new Array<any>();

    public vitalsList: Array<Vitals> = new Array<Vitals>();
    public painData: Array<{ BodyPart: "", PainScale: 0 }> = [];
    public painDataList: Array<any> = new Array<any>();

    public requestedBed: any;
    public showBed: boolean = false;
    public showBedDetails: boolean = false;
    public showVitalList: boolean = false;
    public showVitalAddBox: boolean = false;
    public showTransferPage: boolean = false;
    public selectedBedInfo: selectedbed = new selectedbed();


    constructor(public http: HttpClient,
         public msgBoxServ: MessageboxService,
        public ioAllergyVitalsBLService: IOAllergyVitalsBLService,
        public admissionBLService: ADT_BLService,) {

        this.painData.push({ BodyPart: "", PainScale: null });

        this.LoadBedInfo();
        this.LoadBedFeature();
        this.LoadBedPatientFeature();
    }
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };

    LoadBedInfo(): void {
        this.http.get<any>("/api/Helpdesk?&reqType=getBedinfo"
            + "&status=" + status, this.options).map(res => res)
            .subscribe(res => {
                if (res.Status == "OK") {
                    let data = JSON.parse(res.Results.JsonData);
                    this.bedStats = data.LabelData[0];
                }
                else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                }
            });
    }
    // get bed feature summary
    LoadBedFeature(): void {
        this.http.get<any>("/api/Helpdesk?&reqType=get-bedoccupancy-of-wards").map(res => res).subscribe(res => {
            if (res.Status == "OK") {

                this.bedFeature = res.Results;
                this.totaloccupid = CommonFunctions.getGrandTotalData(this.bedFeature);
            }
            else {
                this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            }
        });
    }
    LoadBedPatientFeature(): void {

        this.http.get<any>("/api/Helpdesk?&reqType=getBedPatientInfo").map(res => res).subscribe(res => {
            if (res.Status == "OK") {

                this.bedPatientFeature = res.Results;
            }
            else {
                this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            }
        })
    }

    //Print  table data.
    Print() {
        let popupWinindow;
        var printContents = '<b>Bed Feature Summary Report: </b>';
        printContents += document.getElementById("printpage").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        let documentContent = "<html><head>";
        documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
        documentContent += '</head>';
        documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
        popupWinindow.document.write(documentContent);
        popupWinindow.document.close();
    }
    // bed feature summary report export to execel
    ExportToExcel(tableId) {
        if (tableId) {
            let workSheetName = 'Bed Feature Summary';
            let Heading = 'Bed Feature Summary';
            let filename = 'Bed Feature Summary';
            let date = moment().format('YYYY-MM-DD');
            CommonFunctions.ConvertHTMLTableToExcel(tableId, '', date, workSheetName, Heading, filename);
        }
    }
    ShowBed(wardName: string): void {
        this.occupiedBed = [];
        this.vacantBed = [];
        for (let i = 0; i < this.bedPatientFeature.length; i++) {
            if (this.bedPatientFeature[i].WardName === wardName) {
                if (this.bedPatientFeature[i].IsOccupied === true)
                    this.occupiedBed.push(this.bedPatientFeature[i]);
                if (this.bedPatientFeature[i].IsOccupied === false)
                    this.vacantBed.push(this.bedPatientFeature[i]);
            }
        }
        this.showBed = true; this.showBedDetails = false;
        //window.location.hash = "scrollhere";
    }
    showBedDetail(reqCode: string): void {
        for (let i = 0; i < this.bedPatientFeature.length; i++) {
            if (this.bedPatientFeature[i].BedCode === reqCode) {
                this.requestedBed = this.bedPatientFeature[i];
            }
        }
        this.GetPatientVitalsList();
        this.showBedDetails = true;
        //window.location.hash = "bed-detail";
    }
    closeBedDetail(): void {
        this.showBedDetails = false;
    }
    addVitals(): void {
        this.showVitalAddBox = true;
    }
    hideVitals(val: boolean) {
        this.GetPatientVitalsList();
        this.showVitalAddBox = val;
    }
    GetPatientVitalsList(): void {
        this.painData = [];
        this.painDataList = [];
        this.ioAllergyVitalsBLService.GetPatientVitalsList(this.requestedBed.PatientVisitId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.CallBackGetPatientVitalList(res.Results);
                }
                else {
                    this.msgBoxServ.showMessage("failed", ['Failed. please check log for details.'], res.ErrorMessage);

                }
            },
                err => { this.msgBoxServ.showMessage("error", [err.ErrorMessage]); });
    }
    //call back funtion for get patient vitals
    CallBackGetPatientVitalList(_vitalsList) {
        //looping through the vitalsList to check if any object contains height unit as inch so that it can be converted to foot inch.
        for (var i = 0; i < _vitalsList.length; i++) {
            if (_vitalsList[i].HeightUnit && _vitalsList[i].HeightUnit == "inch") {
                //incase of footinch we're converting and storing as inch.
                //converting back for displaying in the format foot'inch''
                _vitalsList[i].Height = this.ioAllergyVitalsBLService.ConvertInchToFootInch(_vitalsList[i].Height);
            }
            var jsonData = JSON.parse(_vitalsList[i].BodyPart);
            this.painDataList.push(jsonData);
        }
        this.vitalsList = _vitalsList;
    }

    showVitals(): void {
        this.showVitalList = true;
    }

    closeVitalList() {
        this.showVitalList = false;
    }

    hideTransfer(val: boolean) {
        this.showBed = false;
        this.LoadBedPatientFeature();
        this.ShowBed(this.requestedBed.WardName);
        this.showTransferPage = val;
    }

    Transfer() {
        this.selectedBedInfo.PatientAdmissionId = this.requestedBed['PatientAdmissionId'];
        this.selectedBedInfo.PatientId = this.requestedBed['PatientId'];
        this.selectedBedInfo.PatientVisitId = this.requestedBed['PatientVisitId'];
        this.selectedBedInfo.MSIPAddressInfo = this.requestedBed['Address'];
        this.selectedBedInfo.PatientCode = this.requestedBed['PatientCode'];
        this.selectedBedInfo.DischargedDate = this.requestedBed['DischargedDate'];
        this.selectedBedInfo.Name = this.requestedBed['PatientName'];
        this.selectedBedInfo.BedInformation.BedId = this.requestedBed['BedId'];
        this.selectedBedInfo.BedInformation.PatientBedInfoId = this.requestedBed['PatientBedInfoId'];
        this.selectedBedInfo.BedInformation.Ward = this.requestedBed['WardName'];
        this.selectedBedInfo.BedInformation.BedFeature = this.requestedBed['WardName'];
        this.selectedBedInfo.BedInformation.BedCode = this.requestedBed['BedCode'];
        this.selectedBedInfo.BedInformation.BedNumber = this.requestedBed['BedNumber'];
        this.selectedBedInfo.BedInformation.BedFeatureId = this.requestedBed['BedFeatureId'];
        this.selectedBedInfo.BedInformation.AdmittedDate = this.requestedBed['AdmittedDate'];
        this.selectedBedInfo.BedInformation.StartedOn = this.requestedBed['StartedOn'];

        this.showTransferPage = true;
    }

    public allDepartments: Array<any> = [];
    public LoadDepartments() {
        this.admissionBLService.GetDepartments()
            .subscribe((res: DanpheHTTPResponse) => {
                this.allDepartments = res.Results;
            });
    }
}