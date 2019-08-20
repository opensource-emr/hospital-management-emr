import { Component, ChangeDetectorRef } from "@angular/core";
import { DenominationModel } from "../shared/denomination.model";
import { HandOverModel } from "../shared/hand-over.model";
import { BillingBLService } from "../shared/billing.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { User } from '../../security/shared/user.model';
import { DanpheHTTPResponse } from "../../shared/common-models";
import { SecurityService } from "../../security/shared/security.service";
import { CallbackService } from "../../shared/callback.service";
import { Router } from "@angular/router";
import { Employee } from "../../employee/shared/employee.model";
import { DLService } from "../../shared/dl.service";
import * as moment from 'moment/moment';

@Component({
    selector: 'billing-denomination',
    templateUrl: './bill-denomination.html'
})
export class BillingDenominationComponent {
    public handover: HandOverModel = new HandOverModel();
    //public denomination:Array<DenominationModel>=new Array<DenominationModel>();
    public denomination: DenominationModel = new DenominationModel();
    public userlist: Array<Employee> = [];
    public selUser: any;
    public loading: boolean = false;
    //public handoverdenomination: { handover: HandOverModel, denomination: DenominationModel };
    public currentCounter: number = 0;
    public currentUser: number = 0;

    public total: number = 0;
    public ShowAlert: boolean = false;
    public CurrencyType = ['1000', '500', '100', '50', '25', '20', '10', '5', '2', '1'];
    public handoverDetail: HandOverModel;
    public previousAmount: any;
    public showColInPag: number = 0;
    public userName: string = null;
    public counterDayDate: string = null;
    public counterDayCollection = [];
    public userDayCollection = [];


    constructor(
        public billingBLService: BillingBLService,
        public dLService: DLService,
        public msgBoxServ: MessageboxService,
        public securityService: SecurityService,
        public changeDetectorRef: ChangeDetectorRef,
        public callbackService: CallbackService,
        public router: Router) {
        this.currentCounter = this.securityService.getLoggedInCounter().CounterId;
        this.currentUser = this.securityService.GetLoggedInUser().UserId;

        if (this.currentCounter < 1) {
            this.callbackService.CallbackRoute = '/Billing/BillingDenomination'
            this.router.navigate(['/Billing/CounterActivate']);
        }
        else {
            this.GetUsersList();
        }
        this.counterDayDate = moment().format('YYYY-MM-DD');
    }

    ngOnInit() {
        this.GetPreviousAmount();
        //this.LoadCounterDayCollection();
        this.CurrencyType.forEach(
            val => {
                //console.log(val);
                var singleDenomination = new DenominationModel();
                singleDenomination.CurrencyType = Number(val);
                this.handover.denomination.push(singleDenomination);
            });
        this.total = 0;
        //console.log(this.handover);
    }

    public GetUsersList() {
        this.billingBLService.GetUserList()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                    if (res.Results.length)
                        this.userlist = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("failed", ["Unable to get deposit detail"]);
                    console.log(res.ErrorMessage);
                }
            });
    }

    GetPreviousAmount() { //to get previous amount
        this.billingBLService.GetPreviousAmount()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                    this.handoverDetail = res.Results;
                    if (this.handoverDetail.PreviousAmount == null) {
                        this.previousAmount = 0;
                    }
                    else {
                        this.changeDetectorRef.detectChanges();
                        this.previousAmount = this.handoverDetail.TotalAmount;
                    }
                    this.LoadCounterDayCollection();
                }
                else {
                    this.msgBoxServ.showMessage("failed", ["Unable to get deposit detail"]);
                    console.log(res.ErrorMessage);
                }
            });
    }

    myListFormatter(data: any): string {
        let html = data["ShortName"] + "&nbsp;&nbsp;" + "(<i>" + data["DepartmentName"] + "</i>)" + "&nbsp;&nbsp;";
        //let html = data["UserName"];
        return html;
    }

    CheckValidations(): boolean {
        let isValid: boolean = true;
        for (var i in this.handover.HandoverValidator.controls) {
            this.handover.HandoverValidator.controls[i].markAsDirty();
            this.handover.HandoverValidator.controls[i].updateValueAndValidity();
        }
        isValid = this.handover.IsValidCheck(undefined, undefined);
        if (!this.handover.IsValidSelAssignedToUser) {
            this.msgBoxServ.showMessage("failed", ["Select Item from the list."]);
            isValid = false;
        }
        return isValid;
    }

    Request() {
        this.handover.PreviousAmount = this.previousAmount;
        if (this.CheckValidations() && !this.loading) {
            this.CheckUserCollection();
            this.loading = false;
        }
        else {
            this.msgBoxServ.showMessage("failed", ["Check the Entered Form detailed."]);
            this.loading = false;
        }

    }

    CheckUserCollection() {
        let totalHandoverAmount = this.total;
        let currEmpId = this.currentUser;//From security service 
        if (this.userDayCollection) {
            let currUsrCollectionObj = this.userDayCollection.find(c => c.EmployeeId == currEmpId);
            if (currUsrCollectionObj) {
                let currUsrCollnAmt = currUsrCollectionObj.UserDayCollection - this.previousAmount;//UsercollectedAmount = Usercollectionamount - Previously handover amount
                if (totalHandoverAmount == currUsrCollnAmt) {
                    this.Submit();
                    console.log("Amount is same, Congratulations!!!");
                }
                else {
                    this.ShowAlert = true;
                }
            } else {
                let handoverAmount = this.handover.PreviousAmount = 0;
                if (totalHandoverAmount == handoverAmount)
                    this.Submit();
                else
                    this.ShowAlert = true;
                //this.msgBoxServ.showMessage("failed", ["Unable to get Previous Amount."]);
            }
        }
        else {
            //this.ShowAlert = true;
            this.msgBoxServ.showMessage("failed", ["Unable to get Current User Collection Amount."]);
        }
    }
    Submit() {
        //this.ShowAlert = false;
        //console.log(this.handover.denomination);

        this.loading = true;
        //this.handover.UserId = this.selUser.UserId;
        this.handover.CounterId = this.currentCounter;
        if (this.previousAmount) {
            this.handover.PreviousAmount = this.previousAmount;
        }
        this.billingBLService.PostHandoverDetails(this.handover)
            .subscribe(
                res => {
                    if (res.Status == "OK") {
                        this.handover = new HandOverModel();
                        this.ngOnInit();
                        this.msgBoxServ.showMessage("success", ["Handover Detailed added successfully."]);
                        this.loading = false;
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ["Something Wrong."]);
                        console.log(res.ErrorMessage);
                        this.loading = false;
                    }
                },
                err => {
                    this.logError(err);
                    this.loading = false;
                });
    }

    SelectedUser() {
        let user = null;
        // check if user has given proper input string for item name
        //or has selected object properly from the dropdown list.
        if (this.selUser) {
            if (this.selUser.UserId) {
                if (typeof (this.selUser) == 'string' && this.userlist.length) {
                    user = this.userlist.find(a => a.FullName.toLowerCase() == this.selUser.ShortName.toLowerCase());
                    //this.handover.IsValidSelAssignedToUser = false;
                } else if (typeof (this.selUser) == 'object')
                    user = this.selUser;
                if (user) {
                    this.handover.UserId = user.UserId;
                    this.selUser = user.ShortName;
                    this.handover.IsValidSelAssignedToUser = true;
                }
            }
            else {
                this.handover.IsValidSelAssignedToUser = false;
            }
        }
        else {
            this.handover.UserId = null;
            this.handover.Username = null;
            this.handover.IsValidSelAssignedToUser = false;
        }
    }

    AmountChange() {
        this.total = 0;
        this.handover.denomination.forEach(val => {
            this.total = this.total + val.CurrencyType * val.Quantity;
        });
        console.log(this.total);
        //this.changeDetectorRef.detectChanges();
    }

    logError(err: any) {
        console.log(err);
    }

    LoadCounterDayCollection() {
        if (this.counterDayDate && this.counterDayDate.length > 9) {
            this.dLService.Read("/Reporting/BILLDsbCntrUsrCollection?fromDate="
                + this.counterDayDate + "&toDate=" + this.counterDayDate)
                .map(res => res)
                .subscribe(res => {

                    if (res.Results) {
                        let dailyCollection = JSON.parse(res.Results.JsonData);

                        this.userDayCollection = dailyCollection.UserCollection;
                        this.counterDayCollection = dailyCollection.CounterCollection;

                        let currEmpId = this.currentUser;//from security service 
                        if (this.userDayCollection) {
                            let currUsrCollectionObj = this.userDayCollection.find(c => c.EmployeeId == currEmpId);
                            if (currUsrCollectionObj) {
                                this.showColInPag = currUsrCollectionObj.UserDayCollection - this.previousAmount;
                                this.userName = currUsrCollectionObj.EmployeeName;
                            }
                        }

                        console.log("User Collection");
                        console.log(this.userDayCollection);
                    }
                },
                    err => {
                    });
        }
    }
}
