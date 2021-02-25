import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { CreditOrganization } from "../../../settings-new/shared/creditOrganization.model";
import { BillingService } from "../billing.service";

@Component({
  selector: "payment-mode-info",
  templateUrl: "./payment-mode-info.html"
})

export class PaymentModeInfoComponent {
  @Input("show-deduct-from-deposit")
  showDeductFromDeposit: boolean = false;

  @Input("deposit-balance")
  DepositBalance: number = 0;

  @Input("total-amount")
  TotalAmount: number = 0;

  @Output("on-paymentMode-change")
  onPaymentModeChange: EventEmitter<object> = new EventEmitter<object>();

  @Output("on-creditOrganization-change")
  onCreditOrganizationChange: EventEmitter<object> = new EventEmitter<object>();

  public PaymentMode: string = 'cash';
  public PaymentDetails: string = null;
  public CreditOrganizationMandatory: boolean = false;
  public CreditOrganization = { OrganizationId: 0, OrganizationName: '' };
  public creditOrganizationsList: Array<CreditOrganization> = new Array<CreditOrganization>();

  public deductDeposit: boolean = false;
  public newDepositBalance: number = 0;
  public depositDeductAmount: number = 0;

  constructor(public coreService: CoreService,
    public msgBoxServ: MessageboxService,
    public billingService: BillingService, ) {

    this.CreditOrganizationMandatory = this.coreService.LoadCreditOrganizationMandatory();//pratik: 26feb'20 --Credit Organization compulsory or not while Payment Mode is credit 
    this.creditOrganizationsList = this.billingService.AllCreditOrganizationsList;//sud:2May'20--Code Optimization..

  }

  ngOnInit() {
    console.log(this.showDeductFromDeposit);
    console.log(this.DepositBalance);

    this.onPaymentModeChange.emit({ PaymentMode: this.PaymentMode });
  }


  OnPaymentModeChange() {
    this.onPaymentModeChange.emit({ PaymentMode: this.PaymentMode, PaymentDetails: this.PaymentDetails });

  }

  OnCreditOrganizationChange() {
    this.CreditOrganization = this.creditOrganizationsList.find(a => a.OrganizationId == this.CreditOrganization.OrganizationId)
    this.onCreditOrganizationChange.emit( this.CreditOrganization );
  }

  //Change the Checkbox value and call Calculation logic from here. 
  DepositDeductCheckBoxChanged() {
    //toggle Checked-Unchecked of 'Deduct From Deposit Checkbox'
    this.deductDeposit = !this.deductDeposit;
    //this.CalculateDepositBalance();
  }

  //CalculateDepositBalance() {

  //}
}

