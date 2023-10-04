import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { AccountingBLService } from "../shared/accounting.bl.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { FiscalYearModel } from "../settings/shared/fiscalyear.model";
import { AccountClosureViewModel } from "../settings/shared/accounting-view-models";
import { CommonFunctions } from "../../shared/common.functions";
import { TransactionItem } from "./shared/transaction-item.model";
import { TransactionModel } from "./shared/transaction.model";
import { SecurityService } from "../../security/shared/security.service";
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { CoreService } from '../../core/shared/core.service';
import { DanpheHTTPResponse } from "../../shared/common-models";
import { AccountingService } from "../shared/accounting.service";
@Component({
    templateUrl: './account-closure.html',
})
export class AccountClosureComponent {
    public closureData: Array<any> = new Array<any>();
    public activeFiscalYear: FiscalYearModel = new FiscalYearModel();    
    public closureVM: AccountClosureViewModel = new AccountClosureViewModel();
    public calType: string = "";

    public showAccountClosureUI: boolean = false;
    public showpopup: boolean = false;
    public disablebtn: boolean = false;
    public FiscalYearList: Array<FiscalYearModel> = new Array<FiscalYearModel>();
    public fiscalYearId: number = 0;
    public loadDetail :boolean = false;
    constructor(
        public msgBoxServ: MessageboxService,
        public accBLService: AccountingBLService, public nepaliCalendarServ: NepaliCalendarService,
        public securityService: SecurityService, public changeDetRef: ChangeDetectorRef, public coreService: CoreService,public accountingService:AccountingService) {
        this.getActiveFiscalYear();
        this.showAccountClosureUI = true;        
        this.calType = coreService.DatePreference;
        this.disablebtn=false;
    }

    getActiveFiscalYear() {
        try {
            if (!!this.accountingService.accCacheData.FiscalYearList && this.accountingService.accCacheData.FiscalYearList.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
                if (this.accountingService.accCacheData.FiscalYearList.length) {//mumbai-team-june2021-danphe-accounting-cache-change
                    this.FiscalYearList = this.accountingService.accCacheData.FiscalYearList;//mumbai-team-june2021-danphe-accounting-cache-change
                    this.FiscalYearList = this.FiscalYearList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
                    var today = new Date();
                    var currentData = moment(today).format('YYYY-MM-DD');
                    var currfiscyear = this.FiscalYearList.filter(f => f.FiscalYearId == this.securityService.AccHospitalInfo.CurrFiscalYear.FiscalYearId);
                    //var currfiscyear = this.FiscalYearList.filter(f => f.StartDate <= currentData && f.EndDate >= currentData);
                    if (currfiscyear.length > 0) {
                        this.fiscalYearId = currfiscyear[0].FiscalYearId;
                        this.activeFiscalYear = currfiscyear[0];
                        if (this.fiscalYearId != null) {
                            //this.disablebtn = (this.activeFiscalYear.IsClosed == true) ? true : false;   //old code
                            this.disablebtn = (this.activeFiscalYear.IsClosed == false && this.activeFiscalYear.EndDate > currentData) ? true : false;
                        }
                        else {
                            this.disablebtn = true;
                        }
                    }
                    if (!!this.accountingService.accCacheData.FiscalYearList && this.accountingService.accCacheData.FiscalYearList.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
                        this.coreService.SetFiscalYearList(this.accountingService.accCacheData.FiscalYearList);//mumbai-team-june2021-danphe-accounting-cache-change
                    }
                }
            }
        }
        catch (ex) {
            console.log(ex);
        }
    }
    AssignAccountingTenantAfterClosure(tenantId) {
        
        if (tenantId) {
            this.accBLService.ActivateAccountingTenant(tenantId)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status == "OK") {
                        this.securityService.SetAccHospitalInfo(res.Results);
                          this.coreService.GetFiscalYearList().subscribe(res => {      
                            this.coreService.SetFiscalYearList(res);
                            this.FiscalYearList = res.Results;
                            for (var i = 0; i < this.FiscalYearList.length; i++) {
                                this.FiscalYearList[i].showreopen = (this.FiscalYearList[i].IsClosed == true) ? true : false;
                            }
                            this.accountingService.accCacheData.FiscalYearList.forEach(fy =>{
                            let fiscalyear = this.FiscalYearList.filter(f => f.FiscalYearId == fy.FiscalYearId);
                            fy.IsClosed = (fiscalyear.length > 0) ? fiscalyear[0].IsClosed : true;
                            fy.showreopen = fy.IsClosed;
                            });
                          });         
                    }
                   
                }, err => {
                    console.log(err);                    
                    this.msgBoxServ.showMessage("error", ['refresh once , and work continue . ']);
                });
        }
    }
    onFiscalYearChange() {
        var fs = this.FiscalYearList.filter(f => f.FiscalYearId == this.fiscalYearId);
        if (fs.length > 0) {
            this.activeFiscalYear = fs[0];
            this.fiscalYearId = fs[0].FiscalYearId;
            // this.disablebtn = (this.activeFiscalYear.IsClosed == true) ? true : false;  //old code
            var today = this.securityService.AccHospitalInfo.TodaysDate;
            var currentData = moment(today).format('YYYY-MM-DD');
            if (this.fiscalYearId != null) {
                if (this.activeFiscalYear.IsClosed == true && this.activeFiscalYear.EndDate < currentData)       //btn is desable when selected fs year is closed
                {
                    this.disablebtn = true;
                }
                else if (this.activeFiscalYear.IsClosed == false && this.activeFiscalYear.EndDate < currentData)      //btn is enable when selected fs year is not closed
                {
                    this.disablebtn = false;
                }
                else if (this.activeFiscalYear.IsClosed == false && this.activeFiscalYear.EndDate > currentData)      // btn is desable when selected(current) fs year is not closed  
                {
                    this.disablebtn = true;
                }
            }
            else {
                this.disablebtn = true;                            //btn desable when fs years is null
            }
        }
    }

    close() {
        this.showpopup = false;
    }
    openPopup() {
        this.showpopup = true;
    }
    postAccountClosure() {
        this.disablebtn = true;
        this.loadDetail = false;
        this.accBLService.PostAccountClosure(this.activeFiscalYear).subscribe(res => {
            if (res.Status == "OK") {
                this.activeFiscalYear = res.Results;
                this.msgBoxServ.showMessage('Success', ["data posted."]);
                this.showAccountClosureUI = false;
                this.showpopup = false;
                this.loadDetail =true;
                this.getActiveFiscalYear();
                this.AssignAccountingTenantAfterClosure(this.securityService.AccHospitalInfo.ActiveHospitalId) ;
            }
            else if (res.Status == "Failed") {
                this.showpopup = false;
                this.msgBoxServ.showMessage('Warning', [res.ErrorMessage]);
                this.disablebtn = false;
            }
        });
    }

}
