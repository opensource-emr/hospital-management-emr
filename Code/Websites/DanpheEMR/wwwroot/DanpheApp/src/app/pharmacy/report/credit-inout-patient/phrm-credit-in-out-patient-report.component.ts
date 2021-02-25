import { Component, Directive, ViewChild } from '@angular/core';


import { PHRMReportsModel } from "../../shared/phrm-reports-model"
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";

import { Patient } from "../../../patients/shared/patient.model"
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
@Component({
    selector: 'my-app',
    templateUrl: "./phrm-credit-in-out-patient-report.html"
})
export class PHRMCreditInOutPatientReportComponent {

    ///Credit In/Out Patient Report Columns 
    PHRMCreditInOutPatReportColumns: Array<any> = null;
    ///Credit In/Out Patient Report Data 
    PHRMCreditInOutPatReportData: Array<any> = new Array<any>();
    ///////Credit In/Out Patient Report Model Object to Bind 
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();
    ////Patient Name to Bind 
    public patientName: string = "";
    ////Patient Type to Bind
    public patientType: string = "";
    ///Flag to Check IS Patient is In Patient or OUT Patient
    public IsInOutPat: boolean = false;
    ///////Credit In/Out Patient Model Object to Bind 
    PHRMPatient: Array<Patient> = new Array<Patient>();
    public selectedPat:Patient=new Patient();
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();


    constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService,
        public msgBoxServ: MessageboxService) {
        this.PHRMCreditInOutPatReportColumns = PHRMReportsGridColumns.PHRMCreditInOutPatReport;
        this.phrmReports.FromDate = moment().format('YYYY-MM-DD');
        this.phrmReports.ToDate = moment().format('YYYY-MM-DD');
        this.patientType = "in-patient"; ///by default patient Type is In 
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
    }
    onChangeGetPatientListByPatientType(selectedPatientType) {
        this.patientName = ""; ////During New Patient Type Selection Patient Name Property Should be Empty
        if (selectedPatientType == "out-patient") {
            this.patientType = selectedPatientType;
            this.IsInOutPat = true;
            this.GetInOutPatientList(this.IsInOutPat);
        }
        else {
            this.patientType = selectedPatientType;
            this.IsInOutPat = false;
            this.GetInOutPatientList(this.IsInOutPat);
        }
    }
    /////Get Patient List By Patent Type Property
    GetInOutPatientList(IsInOutPat) {
        this.pharmacyBLService.GetInOutPatientDetails(IsInOutPat)
            .subscribe(res => {
                if (res.Status == "OK" && res.Results.length > 0) {
                    this.PHRMPatient = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("error", ["No Patient Data is Available for Selected Patient Type"]);
                }
            });
    }
    ////Export data grid options for excel file
    gridExportOptions = {
        fileName: 'CreditIN_OUT_InfoReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    ////Function Call on Button Click of Report
    GetReportData() {
      this.pharmacyBLService.GetCreditInOutPatReportList(this.phrmReports,this.IsInOutPat, this.patientName)
            .subscribe(res => {
                if (res.Status == 'OK' && res.Results.length > 0) {
                    ////Assign report Column from GridConstant to PHRMCreditInOutPatReportColumns
                    this.PHRMCreditInOutPatReportColumns = PHRMReportsGridColumns.PHRMCreditInOutPatReport;
                    ////Assign  Result to PHRMCreditInOutPatReportData
                    this.PHRMCreditInOutPatReportData = res.Results;
                    ///Formating IsOutdoorPat (True/False) with (OUT/IN)
                    for (var i = 0; i < this.PHRMCreditInOutPatReportData.length; i++) {
                        this.PHRMCreditInOutPatReportData[i].IsOutdoorPat = (this.PHRMCreditInOutPatReportData[i].IsOutdoorPat == 1) ? 'OUT' : 'IN';

                    }
                }
                if (res.Status == 'OK' && res.Results.length == 0) {
                    this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
                    this.patientName = "";
                }
                
            });

    }

    /////Formating Patient Name To Serach Dropdown
    myListFormatter(data: any): string {
        let html = data["ShortName"];
        return html;
    }

    /////On Patient Name Selection
    SelectItemFromSearchBox() {
        //if proper Patient is selected then the below code runs ..othewise it goes out side the function
        if (typeof this.selectedPat === "object" && !Array.isArray(this.selectedPat) && this.selectedPat !== null) {
            ////If Patient Is Proper Then Setting Patient Name and Patient Type Property
            this.patientName = this.selectedPat.ShortName;
            if (this.selectedPat.IsOutdoorPat) {
                this.patientType = "out";
                this.IsInOutPat = true;
            }
            else {
                this.patientType = "in";
                this.IsInOutPat = false;
            }
        }
    }


    //on click grid export button we are catching in component an event.. 
    //and in that event we are calling the server excel export....
    OnGridExport($event: GridEmitModel) {
      this.dlService.ReadExcel("/PharmacyReport/ExportToExcelPHRMCreditInOutPatientReport?FromDate="
        + this.phrmReports.FromDate + "&ToDate=" + this.phrmReports.ToDate + "&IsInOutPat=" + this.IsInOutPat + "&patientName=" + this.patientName)
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "CreditIN_OUT_InfoReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
                document.body.appendChild(a);
                a.click();
            },

            res => this.ErrorMsg(res));
    }
    ErrorMsg(err) {
        this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
        console.log(err.ErrorMessage);
    }

    OnFromToDateChange($event) {
        this.phrmReports.FromDate = $event ? $event.fromDate : this.phrmReports.FromDate;
        this.phrmReports.ToDate = $event ? $event.toDate : this.phrmReports.ToDate;
      }


}






