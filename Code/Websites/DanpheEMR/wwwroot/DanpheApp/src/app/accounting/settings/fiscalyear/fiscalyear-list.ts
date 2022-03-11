
import { Component, ChangeDetectorRef } from "@angular/core";

import { FiscalYearModel } from '../shared/fiscalyear.model';
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CoreService } from '../../../core/shared/core.service'
import { SecurityService } from "../../../security/shared/security.service";
import { AccountingService } from "../../shared/accounting.service";
@Component({
    selector: 'fiscalyear-list',
    templateUrl: './fiscalyear-list.html',
})
export class FiscalYearListComponent {
    public fiscalYearList: Array<FiscalYearModel> = new Array<FiscalYearModel>();
    public showFiscalYearList: boolean = true;
    public fiscalYearGridColumns: Array<any> = null;
    public showAddPage: boolean = false;
    public selectedFiscalYear: FiscalYearModel;
    public index: number;
    public showpopup:boolean=false;
    public showerror:boolean=false;
    public Remark:string= "";
    constructor(
        public accountingSettingsBLService: AccountingSettingsBLService,
        public msgBox: MessageboxService,
        public changeDetector: ChangeDetectorRef, private coreService: CoreService,public securityService:SecurityService,public accountingService:AccountingService) {
        this.getFiscalYearList();
    }
    ngOnInit(){
        this.getFiscalYearList();
    }
    public getFiscalYearList() {
        var gridcolumns = new GridColumnSettings(this.securityService);
        this.fiscalYearGridColumns = gridcolumns.FiscalYearList;
        this.fiscalYearList = this.accountingService.accCacheData.FiscalYearList;
        for (var i = 0; i < this.fiscalYearList.length; i++) {
            this.fiscalYearList[i].StartDate = moment(this.fiscalYearList[i].StartDate).format("YYYY-MM-DD");
            this.fiscalYearList[i].EndDate = moment(this.fiscalYearList[i].EndDate).format("YYYY-MM-DD");
        }
        this.showFiscalYearList = true;
    }

    AddNewFiscalYear() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        let curtFiscalLen = $event.currentFiscal[0];
        curtFiscalLen.StartDate = moment(curtFiscalLen.StartDate).format("YYYY-MM-DD");
        curtFiscalLen.EndDate = moment(curtFiscalLen.EndDate).format("YYYY-MM-DD");
        this.fiscalYearList.push(curtFiscalLen);
        if (this.index)
            this.fiscalYearList.splice(this.index, 1);
        this.fiscalYearList = this.fiscalYearList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.index = null;
    }
    FiscalYearGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "endFiscalYear": {
                this.selectedFiscalYear = null;
                this.index = $event.RowIndex;
                this.selectedFiscalYear = $event.Data;
                this.DeactivateFiscalYearStatus(this.selectedFiscalYear)
                this.showFiscalYearList = true;
            }
            case "edit": {
                this.selectedFiscalYear = $event.Data;
                this.showpopup =true;
            }
            default:
                break;
        }
    }

    DeactivateFiscalYearStatus(selecttedFiscalYr: FiscalYearModel) {
        if (selecttedFiscalYr != null) {
            let status = selecttedFiscalYr.IsActive == true ? false : true;
            let msg = status == true ? 'Start' : 'End';
            if (confirm("Are you Sure want to " + msg + ' ' + selecttedFiscalYr.FiscalYearName + ' ?')) {

                selecttedFiscalYr.IsActive = status;
                //we want to update the ISActive property in table there for this call is necessry
                this.accountingSettingsBLService.UpdateFiscalYearStatus(selecttedFiscalYr)
                    .subscribe(
                        res => {
                            if (res.Status == "OK") {
                                let responseMessage = res.Results.IsActive ? "is now activated." : "is now Deactivated.";
                                this.msgBox.showMessage("success", [res.Results.FiscalYearName + ' ' + responseMessage]);
                                //This for send to callbackadd function to update data in list
                                this.getFiscalYearList();
                            }
                            else {
                                this.msgBox.showMessage("error", ['Something wrong' + res.ErrorMessage]);
                            }
                        },
                        err => {
                            this.logError(err);
                        });
            }
        }
    }
    ActivateFiscalYearStatus(selecttedFiscalYr: FiscalYearModel) {
        if (selecttedFiscalYr != null) {
            if (confirm("Are you Sure want to start " + selecttedFiscalYr.FiscalYearName + ' ?')) {
                selecttedFiscalYr.IsActive = true;
                //we want to update the ISActive property in table there for this call is necessry
                this.accountingSettingsBLService.UpdateFiscalYearStatus(selecttedFiscalYr)
                    .subscribe(
                        res => {
                            if (res.Status == "OK") {
                                let responseMessage = res.Results.IsActive ? "is now activated." : "is now Deactivated.";
                                this.msgBox.showMessage("Success", [res.Results.FiscalYearName + ' ' + responseMessage]);
                                //This for send to callbackadd function to update data in list
                                this.getFiscalYearList();
                            }
                            else {
                                this.msgBox.showMessage("error", ['Something wrong' + res.ErrorMessage]);
                            }
                        },
                        err => {
                            this.logError(err);
                        });
            }
        }
    }
    logError(err: any) {
        console.log(err);
    }

    ReopenFiscalYear(){
        if (this.selectedFiscalYear != null) {
            if(this.Remark !=""){
                this.showerror = false;
                this.selectedFiscalYear.Remark = this.Remark;
                this.accountingSettingsBLService.PutReopenFiscalYear(this.selectedFiscalYear)
                .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            // get updated Fiscal Year list
                            this.coreService.GetFiscalYearList().subscribe(res => {
                                this.coreService.SetFiscalYearList(res);
                                this.fiscalYearList = res.Results;
                                for (var i = 0; i < this.fiscalYearList.length; i++) {
                                    this.fiscalYearList[i].StartDate = moment(this.fiscalYearList[i].StartDate).format("YYYY-MM-DD");
                                    this.fiscalYearList[i].EndDate = moment(this.fiscalYearList[i].EndDate).format("YYYY-MM-DD");
                                  
                                }
                                for (var i = 0; i < this.fiscalYearList.length; i++) {
                                    this.fiscalYearList[i].showreopen = (this.fiscalYearList[i].IsClosed == true) ? true : false;
                                }
                                this.accountingService.accCacheData.FiscalYearList.forEach(fy =>{
                                let fiscalyear = this.fiscalYearList.filter(f => f.FiscalYearId == fy.FiscalYearId);
                                fy.IsClosed = (fiscalyear.length > 0) ? fiscalyear[0].IsClosed : true;
                                fy.showreopen = fy.IsClosed;
                                });
                            });
                            this.securityService.AccHospitalInfo.FiscalYearList.forEach(fy=>{
                                if(fy.FiscalYearId==this.selectedFiscalYear.FiscalYearId){
                                    fy.IsClosed=false;
                                    fy.showreopen=false;
                                }
                            });
                            if(this.securityService.AccHospitalInfo.CurrFiscalYear.FiscalYearId==this.selectedFiscalYear.FiscalYearId){
                                this.securityService.AccHospitalInfo.CurrFiscalYear.IsClosed=false;
                                this.securityService.AccHospitalInfo.CurrFiscalYear.showreopen = false;
                            }
                            this.msgBox.showMessage("Success", [this.selectedFiscalYear.FiscalYearName + ' open now.']);
                            this.closepopup();
                           
                        }
                        else {
                            this.msgBox.showMessage("Error", ['Something wrong' + res.ErrorMessage]);
                        }
                    },
                    err => {
                        this.logError(err);
                    });
            }
            else{
                this.showerror = true;
            }
        }
    }
    closepopup(){
        this.showpopup =false;
    }
}
