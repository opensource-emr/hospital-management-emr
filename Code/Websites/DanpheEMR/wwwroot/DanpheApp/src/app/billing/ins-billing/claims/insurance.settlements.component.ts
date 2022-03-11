import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router'
import { BillingTransaction } from "../../shared/billing-transaction.model";
import { BillingBLService } from '../../shared/billing.bl.service';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { SecurityService } from '../../../security/shared/security.service';
import { BillingService } from "../../shared/billing.service";
import { CallbackService } from '../../../shared/callback.service';
import { CoreService } from '../../../core/shared/core.service';

@Component({
  selector: 'insurance-settlement',
  templateUrl: './insurance.settlements.html'
})

export class InsuranceSettlementsComponent {
  public unclaimedInvoices: Array<any> = [];
  public selectAllInvoices: boolean = false;
  public counterId: number = 0;
  //public currencyUnit: string;
  public filterBy: string;
  public allInvoice: Array<any> = [];

  //date filter--Yubraj 14th August '19
  public dateRangeOptions = { week1: true, month1: true, month3: true, month6: true };
  public showSelector: boolean = false;
  public fromDate: string = null;
  public toDate: string = null;
  public rangeType: string = "last1Week";
  public showLabel: boolean = false;
  public isOutOfFiscalYearDate: boolean = false;

  constructor(
    public billingBLService: BillingBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public billingService: BillingService,
    public callbackservice: CallbackService,
    public router: Router,
    public coreService: CoreService) {

    this.counterId = this.securityService.getLoggedInCounter().CounterId;
    //this.currencyUnit = this.billingService.currencyUnit;
    this.RangeTypeOnChange();

    let counterId: number = this.securityService.getLoggedInCounter().CounterId;
    if (!counterId || counterId < 1) {
      this.callbackservice.CallbackRoute = 'Billing/Settlements/InsuranceSettlements';
      this.router.navigate(['Billing/CounterActivate']);
    }
  }

  filterData() {
    this.unclaimedInvoices = this.allInvoice.filter(ins =>
      ins.PatientFName.toLowerCase().includes(this.filterBy.toLowerCase()) ||
      ins.PatientLName.toLowerCase().includes(this.filterBy.toLowerCase()) ||
      ins.InvoiceNo.toString().includes(this.filterBy)
    );
  }
  public GetUnclaimedBills(): void {
    this.unclaimedInvoices = [];
    this.billingBLService.GetUnclaimedInvoices(this.fromDate, this.toDate)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.unclaimedInvoices = res.Results;
          this.unclaimedInvoices = this.unclaimedInvoices.slice();
          this.allInvoice = this.unclaimedInvoices;
        }
      });
  }

  ClaimInsurance() {
    var claimBills = confirm("Are you sure you want to claim selected bills?");
    if (claimBills) {
      let selectedInvoices = this.unclaimedInvoices.filter(inv => inv.IsInsuranceClaimed == true);
      if (selectedInvoices.length) {

        this.billingBLService.UpdateInsuranceClaimed(selectedInvoices, this.counterId)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", ["Insurance Claimed Successfully"]);
              this.GetUnclaimedBills();
            }
            else {
              console.log(res.ErrorMessage);
            }
          });
      }
      else {
        this.msgBoxServ.showMessage("Failed", ["Please Select Invoices. Try Again."]);
      }
    }

  }

  SelectAllChange() {
    if (this.unclaimedInvoices && this.unclaimedInvoices.length > 0) { //checking for null array
      if (this.selectAllInvoices) {
        this.unclaimedInvoices.forEach(invoice => {
          invoice.IsInsuranceClaimed = true;
        });
      }
      else {
        this.unclaimedInvoices.forEach(invoice => {
          invoice.IsInsuranceClaimed = false;
        });
      }
    }
  }

  SelectInvoiceChkOnChange(set: BillingTransaction) {
    if ((this.unclaimedInvoices.every(invoice =>
      invoice.IsInsuranceClaimed == true))) {
      this.selectAllInvoices = true;
    }
    else {
      this.selectAllInvoices = false;
    }
  }

  RangeTypeOnChange() {
    this.showSelector = false;
    this.showLabel = false;
    this.isOutOfFiscalYearDate = false;
    if (this.rangeType == "None") {
      var from = new Date();
      var to = new Date();
      to.setHours(23, 59, 59, 999);
      from.setHours(0, 0, 0, 0);
      from.setMonth(from.getMonth() - 1);
      this.fromDate = moment(from).format('YYYY-MM-DD');
      this.toDate = moment(to).format('YYYY-MM-DD');
      this.showLabel = true;
      //this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
    }
    else if (this.rangeType == "last1Week") {
      var from = new Date();
      from.setHours(0, 0, 0, 0);
      from.setDate(from.getDate() - 7);
      this.fromDate = moment(from).format('YYYY-MM-DD');
      this.toDate = moment(to).format('YYYY-MM-DD');
      this.showLabel = true;
      //this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
    }
    else if (this.rangeType == "last3Months") {
      //from --> 1st of month 00:00 hrs, to --> (today) 23:59 hrs
      var from = new Date();
      from.setHours(0, 0, 0, 0);
      from.setMonth(from.getMonth() - 3);
      this.fromDate = moment(from).format('YYYY-MM-DD');

      this.toDate = moment(to).format('YYYY-MM-DD');
      this.showLabel = true;
      //this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
    }
    else if (this.rangeType == "last6Months") {
      //from --> 1st of month 00:00 hrs, to --> (today) 23:59 hrs
      var from = new Date();
      from.setHours(0, 0, 0, 0);
      from.setMonth(from.getMonth() - 6);
      this.fromDate = moment(from).format('YYYY-MM-DD');
      // }
      this.toDate = moment(to).format('YYYY-MM-DD');
      this.showLabel = true;
      //this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
    }
    else {
      this.fromDate = this.toDate = moment().format('YYYY-MM-DD');
      this.showSelector = true;
      //this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate, type: "custom" });
    }
    this.GetUnclaimedBills();
  }
}
