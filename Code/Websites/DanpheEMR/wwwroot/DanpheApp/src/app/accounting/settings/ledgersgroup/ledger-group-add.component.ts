import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { ledgerGroupModel } from '../shared/ledgerGroup.model';
import { AccountingLedgerVoucherMapViewModel } from '../shared/ledgergroup-voucherledgergroupmap-view.model';
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';
import { ledgerGroupCategoryModel } from '../shared/ledger-group-category.model'
//import { VoucherModel } from '../shared/voucher.model'
import { VoucherLedgerGroupMapModel } from '../shared/voucher-ledger-group-map.model'
import { SecurityService } from '../../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { AccountingService } from "../../shared/accounting.service";


@Component({
    selector: 'ledger-group-add',
    templateUrl: './ledger-group-add.html'
})
export class LedgerGroupAddComponent {

    public showAddPage: boolean = false;
    @Input("selectedLedgerGroup")
    public selectedLedgerGroup: ledgerGroupModel;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

    public CurrentLedgerGroup: ledgerGroupModel;
    public primaryGroupList: any[];
    public coaList: any[];
    public allcoaList: any[];
    loading: boolean = false;
    update: boolean = false;
    public selLedgerGroup: any;
    public completeledgerGroupList: Array<ledgerGroupModel> = new Array<ledgerGroupModel>();
    public sourceLedGroupList: Array<ledgerGroupModel> = Array<ledgerGroupModel>();
    public ledgerGroupList: Array<ledgerGroupModel> = new Array<ledgerGroupModel>();
    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService,
        public accountingService: AccountingService) {
        this.getCoaList();
        this.getPrimaryGroupList();
        this.GetLedgerGroupsDetails();
    }



    @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;
        if (this.selectedLedgerGroup) {
            this.CurrentLedgerGroup = Object.assign(this.CurrentLedgerGroup, this.selectedLedgerGroup);
            this.CurrentLedgerGroup.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.CurrentLedgerGroup.LedgerGroupId = this.selectedLedgerGroup.LedgerGroupId;
            //let selectedPrimaryGroupList = this.sourceLedGroupList.filter(a => a.PrimaryGroup == this.CurrentLedgerGroup.PrimaryGroup);
            //this.coaList = Array.from([new Set(selectedPrimaryGroupList.map(i => i.COA))][0]);
            
            let primaryGroupId = this.primaryGroupList.filter(p => p.PrimaryGroupName == this.CurrentLedgerGroup.PrimaryGroup)[0].PrimaryGroupId;
            this.coaList = this.allcoaList.filter(c => c.PrimaryGroupId == primaryGroupId);
            this.CurrentLedgerGroup.COAId = (this.selectedLedgerGroup.COA !=null)? this.coaList.filter(c=>c.ChartOfAccountName == this.selectedLedgerGroup.COA)[0].ChartOfAccountId :0;
            this.ledgerGroupList = this.ledgerGroupList.filter(ledger => (ledger.LedgerGroupId != this.selectedLedgerGroup.LedgerGroupId));
            this.update = true;
        }
        else {
            this.update = false;
            this.CurrentLedgerGroup = new ledgerGroupModel();
            this.CurrentLedgerGroup.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        }
    }

    GetLedgerGroupsDetails() {
            if(!!this.accountingService.accCacheData.LedgerGroups && this.accountingService.accCacheData.LedgerGroups.length>0){ //mumbai-team-june2021-danphe-accounting-cache-change
            this.CallBackLedgerGroup(this.accountingService.accCacheData.LedgerGroups);//mumbai-team-june2021-danphe-accounting-cache-change
      }
    }

    CallBackLedgerGroup(res) {
        this.sourceLedGroupList = new Array<ledgerGroupModel>();
        this.sourceLedGroupList = res;//mumbai-team-june2021-danphe-accounting-cache-change
        this.sourceLedGroupList = this.sourceLedGroupList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
        //this.primaryGroupList = [];
        this.coaList = [];
        // this.primaryGroupList = Array.from([new Set(this.sourceLedGroupList.map(i => i.PrimaryGroup))][0]);
    }

    //adding new Ledger
    AddLedgerGroup() {
        this.loading = true;
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentLedgerGroup.LedgerGroupValidator.controls) {
            this.CurrentLedgerGroup.LedgerGroupValidator.controls[i].markAsDirty();
            this.CurrentLedgerGroup.LedgerGroupValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentLedgerGroup.IsValidCheck(undefined, undefined)) {
            this.CurrentLedgerGroup.CreatedOn = moment().format("YYYY-MM-DD");
            this.accountingSettingsBLService.AddLedgersGroup(this.CurrentLedgerGroup)
                .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ["Ledger Group Added"]);
                            //this.CurrentLedgerGroup
                            this.CallBackAddLedgerGroup(res);
                            this.CurrentLedgerGroup = new ledgerGroupModel();
                            this.loading = false;
                            this.selLedgerGroup = null;
                        }
                        else {
                            this.msgBoxServ.showMessage("error", ["Duplicate ledger not allowed"]);
                            this.loading = false;
                        }
                    },
                    err => {
                        this.logError(err);
                        this.loading = false;
                    });
        }


    }
    //update ledgergroup
    UpdateLedgerGroup() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentLedgerGroup.LedgerGroupValidator.controls) {
            this.CurrentLedgerGroup.LedgerGroupValidator.controls[i].markAsDirty();
            this.CurrentLedgerGroup.LedgerGroupValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentLedgerGroup.IsValidCheck(undefined, undefined)) {
            this.CurrentLedgerGroup.ModifiedBy = this.securityService.GetLoggedInUser().UserId;
            this.accountingSettingsBLService.UpdateLedgersGroup(this.CurrentLedgerGroup)
                .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ["Ledger Group Updated"]);
                            //this.CurrentLedgerGroup
                             // remove the element which was edited
                          let index = this.accountingService.accCacheData.Ledgers.findIndex(x => x.LedgerGroupId == this.CurrentLedgerGroup.LedgerGroupId)//mumbai-team-june2021-danphe-accounting-cache-change
                          this.accountingService.accCacheData.LedgerGroups.splice(index, 1); //mumbai-team-june2021-danphe-accounting-cache-change
                            this.CallBackAddLedgerGroup(res);
                            this.CurrentLedgerGroup = new ledgerGroupModel();
                            this.loading = false;
                            this.selLedgerGroup = null;
                        }
                        else {
                            this.msgBoxServ.showMessage("error", ["Duplicate ledger not allowed"]);
                            this.loading = false;
                        }
                    },
                    err => {
                        this.logError(err);
                        this.loading = false;
                    });
        }
    }
    Close() {
        this.selectedLedgerGroup = null;
        this.ledgerGroupList = this.completeledgerGroupList;
        this.CurrentLedgerGroup = new ledgerGroupModel();
        this.selLedgerGroup = null;
        this.coaList = [];
        this.showAddPage = false;
    }

    //after adding Ledger is succesfully added  then this function is called.
    CallBackAddLedgerGroup(res) {
        if (res.Status == "OK" && res.Results != null) {
            let currentLedger = new ledgerGroupModel();
            let tempLedgerGroupObj = res.Results;//mumbai-team-june2021-danphe-accounting-cache-change
            currentLedger = Object.assign(currentLedger, res.Results);//mumbai-team-june2021-danphe-accounting-cache-change
            tempLedgerGroupObj.PrimaryGroup = currentLedger.PrimaryGroup = this.CurrentLedgerGroup.PrimaryGroup;//mumbai-team-june2021-danphe-accounting-cache-change
            tempLedgerGroupObj.COA =  currentLedger.COA = this.CurrentLedgerGroup.COA;//mumbai-team-june2021-danphe-accounting-cache-change
            this.accountingService.accCacheData.LedgerGroups.push(tempLedgerGroupObj);//mumbai-team-june2021-danphe-accounting-cache-change
            this.callbackAdd.emit({ currentLedger});
        }
        else {
            this.msgBoxServ.showMessage("error", ['Check log for details']);
            console.log(res.ErrorMessage);
        }


    }

    public PrimaryGroupChanged() {
        if (this.CurrentLedgerGroup.PrimaryGroup) {
            this.coaList = [];
            this.selLedgerGroup = null;
            let primaryGroupId = this.primaryGroupList.filter(p => p.PrimaryGroupName == this.CurrentLedgerGroup.PrimaryGroup)[0].PrimaryGroupId;
            this.coaList = this.allcoaList.filter(c => c.PrimaryGroupId == primaryGroupId);
            //let selectedPrimaryGroupList = this.sourceLedGroupList.filter(a => a.PrimaryGroup == this.CurrentLedgerGroup.PrimaryGroup);
            //this.coaList = this.allcoaList.filter(p=>p.PrimaryGroupId ==selectedPrimaryGroupList )// Array.from([new Set(selectedPrimaryGroupList.map(i => i.COA))][0]);
        }
    }
    public COAChanged() {
        // if (this.CurrentLedgerGroup.COA) {
        //     this.selLedgerGroup = null;
        //     this.ledgerGroupList = this.sourceLedGroupList.filter(a => a.COA == this.CurrentLedgerGroup.COA);
        // }
        if (this.CurrentLedgerGroup.COAId) {
            this.CurrentLedgerGroup.COAId = +this.CurrentLedgerGroup.COAId;
            this.CurrentLedgerGroup.COA = this.coaList.filter(c => c.ChartOfAccountId == this.CurrentLedgerGroup.COAId)[0].ChartOfAccountName;
        }
    }
    logError(err: any) {
        console.log(err);
    }


    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
            this.loading = false;
        }
    }
    public getCoaList() {
        if(!!this.accountingService.accCacheData.COA && this.accountingService.accCacheData.COA.length>0){//mumbai-team-june2021-danphe-accounting-cache-change
          this.allcoaList = this.accountingService.accCacheData.COA;//mumbai-team-june2021-danphe-accounting-cache-change
          this.allcoaList = this.allcoaList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
        }
      }
    public getPrimaryGroupList() {
        if(!!this.accountingService.accCacheData.PrimaryGroup && this.accountingService.accCacheData.PrimaryGroup.length>0){//mumbai-team-june2021-danphe-accounting-cache-change
          this.primaryGroupList = this.accountingService.accCacheData.PrimaryGroup;//mumbai-team-june2021-danphe-accounting-cache-change
          this.primaryGroupList = this.primaryGroupList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
        }
    }
}
