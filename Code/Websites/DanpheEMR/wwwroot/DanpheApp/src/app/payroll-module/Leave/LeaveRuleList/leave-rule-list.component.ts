import { Component, ChangeDetectorRef } from '@angular/core'
import { PayrollBLService } from '../../Shared/payroll.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service'
import { LeaveRuleList } from '../../Shared/leave-rule-list.model';
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import * as moment from 'moment';
import { CoreService } from '../../../core/shared/core.service';


@Component({

  templateUrl: "./leave-rule-list.component.html",

})
export class LeaveRuleListComponent {

    public ShowAddLeaveRuleList: boolean = false;
    public leaveIndex: number = null;
    public leaveRuleModel: LeaveRuleList = new LeaveRuleList();
    public leaveCategoryList: any =[];
    public years: any = [];
    public yyyy: number = null;
    public leaveRuleList: Array<LeaveRuleList> = new Array<LeaveRuleList>();
    public LeaveRuleListComlumns: Array<any> = null;
    public fiscalYears: any;
    public currentYear: any;
    public update: boolean;
    constructor(public payrollBLService: PayrollBLService, public _coreService: CoreService,
        public messageboxService: MessageboxService,
        public changeDetectorRef: ChangeDetectorRef) {
        this.currentYear = moment().startOf("year").format('YYYY');
        this.yyyy = this.currentYear;
        this.LeaveRuleListComlumns = GridColumnSettings.LeaveRuleList;
        this.getDefaultYears();
      this.getLeaveRulelist(this.currentYear);
      
        }
    ngOnInit() {
        this.update = false;
    }

    LeaveRuleListAction($event: GridEmitModel) {
        switch ($event.Action) {
            case "edit": {
                this.update = true;
                this.leaveRuleModel = new LeaveRuleList();
                this.leaveIndex = $event.RowIndex;
                this.leaveRuleModel.LeaveCategoryName = $event.Data.LeaveCategoryName;
                this.leaveRuleModel.PayPercent = $event.Data.PayPercent;
                this.leaveRuleModel.Days = $event.Data.Days;
                this.leaveRuleModel.IsActive = $event.Data.IsActive;
                this.leaveRuleModel.ApprovedBy = $event.Data.ApprovedBy;
                this.leaveRuleModel.LeaveRuleId = $event.Data.LeaveRuleId;
                this.leaveRuleModel.IsApproved = $event.Data.IsApproved;
                this.leaveRuleModel.LeaveCategoryId = $event.Data.LeaveCategoryId;
                this.leaveRuleModel.Year = $event.Data.Year;
                this.leaveRuleModel.SelectedItem = $event.Data.SelectedItem;
                this.ShowAddLeaveRuleList = true;
            }
                break;
            default:
                break;
        }
    }

    myLeaveCategoryFormatter(data: any): string {
        let html = data["LeaveCategoryName"];
        return html;
    }
    getDefaultYears() {
        let backYearToShow = this._coreService.Parameters.find(p => p.ParameterGroupName == "Payroll"
            && p.ParameterName == "PayrollLoadNoOfYears").ParameterValue;
        for (var i = this.currentYear - backYearToShow; i <= this.currentYear; i++) {
            this.years.push(i);
        }
    }
    getLeaveCategoryList(LeaveCategoryIds) {
        try {
            this.payrollBLService.getLeaveCategoryList(LeaveCategoryIds)
                .subscribe(res => {
                    if (res.Status == "OK") {
                      this.leaveCategoryList = [];

                      this.leaveCategoryList = res.Results;


                    }
                });
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    SelectLeaveCategoryFromSearchBox(leaverule: LeaveRuleList) {

        if (leaverule.LeaveCategoryName && this.update == false) {
            this.changeDetectorRef.detectChanges();
            let count = this.leaveCategoryList.filter(s => s.LedgerName == leaverule.LeaveCategoryName).length;
            if (count > 0) {
                leaverule.LeaveCategoryName = null;
                this.messageboxService.showMessage("notice", ['duplicate leave not allowed']);
            }
        }

        this.leaveRuleModel.LeaveCategoryId = leaverule.LeaveCategoryId;
    }

    getLeaveRulelist(selectedYear) {
        try {
            let currYear = selectedYear
            this.payrollBLService.getLeaveRulelist(currYear)
                .subscribe(res => {
                    if (res.Status == "OK" && res.Results.length > 0) {
                        this.leaveRuleList = [];
                        this.leaveRuleList = res.Results;
                        let LeaveCategoryIds: string = this.leaveRuleList.filter(s => s.LeaveCategoryId)
                            .map(k => k.LeaveCategoryId).join(',');
                        this.getLeaveCategoryList(LeaveCategoryIds);
                    } else {
                        this.leaveRuleList = [];
                        let leaveCatId = 0
                        this.getLeaveCategoryList(leaveCatId);
                        this.messageboxService.showMessage("Notice", ['There is no leave rules on selected Year..'])
                    }
                });
        }
        catch (ex) {
            this.ShowCatchErrMessage(ex);
        }

    }

    LoadLeaveRuleList() {
        let selectedYear = this.yyyy;
        this.getLeaveRulelist(selectedYear)
    }

    PostLeaveRules() {
        try {
            var CheckIsValid = true;
            if (this.leaveRuleModel.IsValidCheck(undefined, undefined) == false) {
                // for loop is used to show PurchaseOrderValidator message ..if required  field is not filled
                for (var b in this.leaveRuleModel.LeaveRuleValidator.controls) {
                    this.leaveRuleModel.LeaveRuleValidator.controls[b].markAsDirty();
                    this.leaveRuleModel.LeaveRuleValidator.controls[b].updateValueAndValidity();
                    CheckIsValid = false;
                }
            }
            if (CheckIsValid == true) {

                this.payrollBLService.postLeaveRules(this.leaveRuleModel)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                            this.leaveRuleModel = new LeaveRuleList();
                            this.ShowAddLeaveRuleList = false;
                            this.getLeaveRulelist(this.yyyy);
                        } else {
                            this.messageboxService.showMessage("Failed", [res.ErrorMessage]);
                        }
                    });
            }
            else {
                this.messageboxService.showMessage("Notice", ['Please fill all the missing coloumns..'])
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    PutLeaveRules() {
        try {
            this.payrollBLService.putLeaveRules(this.leaveRuleModel)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.leaveRuleModel = new LeaveRuleList();
                        this.ShowAddLeaveRuleList = false;
                        this.getLeaveRulelist(this.currentYear);
                    }
                });
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    AddRules() {
        this.ShowAddLeaveRuleList = true;
        this.update = false;
        this.leaveRuleModel = new LeaveRuleList();
        this.leaveRuleModel.Year = this.yyyy;
    }
    Close() {
        this.ShowAddLeaveRuleList = false;
    }

    //This function only for show catch messages
    public ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            this.messageboxService.showMessage("error", ["Check error in Console log !"]);
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }
}
