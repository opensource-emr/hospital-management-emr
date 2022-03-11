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
import { CoreService } from "../../core/shared/core.service";

@Component({
  selector: 'billing-denomination',
  templateUrl: './bill-denomination-old.html',
  styles: [`.print-only{display: none;}`]
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
  public currentEmpId: number = 0;

  public total: number = 0;
  public ShowAlert: boolean = false;
  public CurrencyType = ['1000', '500', '100', '50', '20', '10', '5', '2', '1'];
  public handoverDetail: HandOverModel;
  //public previousAmount: any;
  public showColInPag: number = 0;
  public userName: string = null;
  public counterDayDate: string = null;
  public counterDayCollection = [];
  public userDayCollection = [];
  public FromDate: string = null;
  public ToDate: string = null;


  constructor(
    public billingBLService: BillingBLService,
    public dLService: DLService,
    public msgBoxServ: MessageboxService,
    public securityService: SecurityService,
    public changeDetectorRef: ChangeDetectorRef,
    public callbackService: CallbackService,
    public coreService: CoreService,
    public router: Router) {
    this.currentCounter = this.securityService.getLoggedInCounter().CounterId;
    this.currentEmpId = this.securityService.GetLoggedInUser().EmployeeId;

    if (this.currentCounter < 1) {
      this.callbackService.CallbackRoute = '/Billing/BillingDenomination'
      this.router.navigate(['/Billing/CounterActivate']);
    }
    else {
      this.GetUsersList();
    }
    this.counterDayDate = moment().format('YYYY-MM-DD');
    this.FromDate = moment().format('YYYY-MM-DD');
    this.ToDate = moment().format('YYYY-MM-DD');

  }

  ngOnInit() {
    //this.GetPreviousAmount();
    //this.GetHandoverAmount();
    this.LoadCounterDayCollection();
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
          this.msgBoxServ.showMessage("failed", ["Unable to get User List."]);
          console.log(res.ErrorMessage);
        }
      });
  }

  //GetPreviousAmount() { //to get previous amount
  //  this.billingBLService.GetPreviousAmount()
  //    .subscribe((res: DanpheHTTPResponse) => {
  //      if (res.Status == "OK") {
  //        this.handoverDetail = res.Results;
  //        if (this.handoverDetail.PreviousAmount == null) {
  //          this.previousAmount = 0;
  //        }
  //        else {
  //          this.changeDetectorRef.detectChanges();
  //          this.previousAmount = this.handoverDetail.TotalAmount;
  //        }
  //        this.LoadCounterDayCollection();
  //      }
  //      else {
  //        this.msgBoxServ.showMessage("failed", ["Unable to get deposit detail"]);
  //        console.log(res.ErrorMessage);
  //      }
  //    });
  //}

  GetHandoverAmount() { //to get handover amount
    this.dLService.Read("/BillingReports/BIL_TXN_GetHandoverCalculationDateWise?FromDate=" + this.FromDate + "&ToDate=" + this.ToDate)
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          let data = JSON.parse(res.Results.JsonData);
          if (data && data.Table1) {
            let currUsrHandoverInfo = data.Table1.find(a => a.EmployeeId == this.currentEmpId);
            let currUsrCollectionObj = this.userDayCollection.find(c => c.EmployeeId == this.currentEmpId);
            let currUsrCollnAmt = currUsrCollectionObj ? currUsrCollectionObj.UserDayCollection : 0;
            let handoverBalance = currUsrHandoverInfo ? currUsrHandoverInfo.ReceivedAmount - currUsrHandoverInfo.GivenAmount : 0;

            this.showColInPag = currUsrCollnAmt + handoverBalance;
          }
          else {
            this.msgBoxServ.showMessage("notice-message", ['Data Not Available for Selected Parameters...']);
          }
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
    //this.handover.PreviousAmount = this.previousAmount;
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
    //let currEmpId = this.currentUser;//From security service 
    if (this.userDayCollection) {
      let currUsrCollectionObj = this.userDayCollection.find(c => c.EmployeeId == this.currentEmpId);
      if ((currUsrCollectionObj && currUsrCollectionObj.EmployeeName != this.selUser) || this.showColInPag > 0 ) {
        let currUsrCollnAmt = this.showColInPag;
        if (this.handover.HandoverType == 'Account') {
          this.Submit();
          this.showColInPag = this.showColInPag - totalHandoverAmount;
        }
        else {
          if (totalHandoverAmount == currUsrCollnAmt) {
            this.Submit();
            this.showColInPag = 0;
          }
          else {
            this.ShowAlert = true;
          }
        }
      }
      else {
        this.msgBoxServ.showMessage("warning", ["Check the Hand over Amount OR Change the User"]);
      }
    }
    else {
      //this.ShowAlert = true;
      this.msgBoxServ.showMessage("failed", ["Unable to get Current User Collection Amount."]);
    }
  }
  Submit() {
    this.loading = true;
    //this.handover.UserId = this.selUser.UserId;
    this.handover.CounterId = this.currentCounter;
    this.handover.PreviousAmount = this.showColInPag;

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

            this.GetHandoverAmount();
          }
        },
          err => {
          });
    }
  }

  public print() {
    let popupWinindow;
    var printContents = document.getElementById("denomPrint").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    var documentContent = '<html><head>';
    documentContent += `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanpheStyle.css" />`
      + `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanphePrintStyle.css" /></head>`;

    /// documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    ///Sud:22Aug'18--added no-print class in below documeentContent

    documentContent += '<body class="bill-denom" onload="window.print()">' + printContents + '</body></html>';
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();    
  }

}
