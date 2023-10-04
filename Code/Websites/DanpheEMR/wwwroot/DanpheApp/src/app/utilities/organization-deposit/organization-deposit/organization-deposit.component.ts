import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BillingDeposit } from '../../../billing/shared/billing-deposit.model';
import { EmployeeCashTransaction } from '../../../billing/shared/billing-transaction.model';
import { DepositHead_DTO } from '../../../billing/shared/dto/deposit-head.dto';
import { CoreService } from "../../../core/shared/core.service";
import { PatientService } from '../../../patients/shared/patient.service';
import { SecurityService } from '../../../security/shared/security.service';
import { CreditOrganization } from '../../../settings-new/shared/creditOrganization.model';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_ACC_PaymentMode, ENUM_BillDepositType, ENUM_BillPaymentMode, ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { OrganizationDeposit_DTO } from '../../shared/DTOs/organization-deposit.dto';
import { UtilitiesBLService } from "../../shared/utilities.bl.service";

@Component({
  selector: 'organization-deposit',
  templateUrl: './organization-deposit.component.html',
  styleUrls: ['./organization-deposit.component.css']
})
export class OrganizationDepositComponent implements OnInit {
  @Input("isAddDepositFrmBillTxn")
  public isAddDepositFrmBillTxn: boolean = false;
  public organizationDeposit: OrganizationDeposit_DTO = new OrganizationDeposit_DTO();
  public ReceiptDetails: OrganizationDeposit_DTO = new OrganizationDeposit_DTO();
  @Input()
  public showReceiptInput: boolean = false;
  public isDepositAdded: boolean = false;
  public IsOrganizationSelected: boolean = false;
  public deposit: BillingDeposit = new BillingDeposit();
  public depositHeadList: Array<DepositHead_DTO> = new Array<DepositHead_DTO>();
  public selectedDepositHead: DepositHead_DTO = new DepositHead_DTO();
  public creditOrganizationsList: Array<CreditOrganization> = [];
  public organizationDepositDetails: OrganizationDeposit_DTO = new OrganizationDeposit_DTO();

  public selectedCreditOrganization: CreditOrganization = new CreditOrganization();
  MstPaymentModes: any[];


  loading: boolean = false;
  public showReceipt: boolean = false;
  PaymentPages: any[];
  public Amount: number = 0;
  public TempEmployeeCashTransaction: Array<EmployeeCashTransaction> = new Array<EmployeeCashTransaction>();
  public OrganizationDepositValidator: FormGroup = null;
  public patBillHistory = {
    IsLoaded: false,
    PatientId: null,
    CreditAmount: null,
    ProvisionalAmt: null,
    TotalDue: null,
    DepositBalance: null,
    BalanceAmount: null
  };
  public RepresentativeName: string = '';
  public Remarks: string = '';
  public organizationId: number = null;
  public depositId: number = null;
  public confirmationTitle: string = "Confirm !";
  public confirmationMessage: string = "Are you sure you want to Save Deposit ?";
  constructor(
    public utilitiesBlService: UtilitiesBLService,
    public patientservice: PatientService,
    public msgBoxServ: MessageboxService,
    public router: Router,
    public coreService: CoreService,
    public formBuilder: FormBuilder,
    public securityService: SecurityService,


  ) {
    this.getCreditOrganizationList('');
    this.GetDepositHead();
    this.Initialize();
    this.LoadPatientPastBillSummary(this.patientservice.getGlobal().PatientId);
    this.GetOrganizationDepositBalance(this.organizationId);

  }

  ngOnInit() {
    this.MstPaymentModes = this.coreService.masterPaymentModes;
    this.PaymentPages = this.coreService.paymentPages;
    this.OrganizationDepositValidator = this.formBuilder.group({
      'Amount': ['', Validators.required],
      'OrganizationName': ['', Validators.required],
      'RepresentativeName': ['', Validators.required]
    });
  }
  Initialize() {
    this.organizationDeposit = new OrganizationDeposit_DTO();
    this.organizationDeposit.CounterId = this.securityService.getLoggedInCounter().CounterId;
    this.organizationDeposit.TransactionType = ENUM_BillDepositType.Deposit;
    this.organizationDeposit.PaymentMode = ENUM_ACC_PaymentMode.Cash;
    const defaultDepositHead = this.depositHeadList.find(f => f.IsDefault === true);
    if (defaultDepositHead) {
      this.organizationDeposit.DepositHeadId = defaultDepositHead.DepositHeadId;
    }
  }
  public getCreditOrganizationList(searchText: string) {
    if (searchText.trim().length < 3) {
      this.utilitiesBlService.GetCreditOrganizationList(searchText).subscribe((res) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results && res.Results.length > 0) {
          const creditOrganizations = res.Results;
          this.creditOrganizationsList = creditOrganizations.filter(a => a.IsActive === true);

        } else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
            "No Credit Organization  Found",
          ]);
        }
      });
    }
  }
  creditOrganizationFormatter(data: any): string {
    let html = data["OrganizationName"];
    return html;
  }

  AssignSelectedOrganization(event: any) {
    const selectedCreditOrg = this.creditOrganizationsList.find(
      (creditOrg) => creditOrg.OrganizationId === parseInt(event.target.value, 10)
    );
    if (selectedCreditOrg && selectedCreditOrg.OrganizationId > 0) {
      this.selectedCreditOrganization = selectedCreditOrg;
      this.organizationDeposit.CreditOrganizationId = selectedCreditOrg.OrganizationId;
      this.organizationDeposit.CreditOrganizationCode = selectedCreditOrg.CreditOrganizationCode;
      this.GetOrganizationDepositBalance(this.organizationDeposit.CreditOrganizationId);
      this.IsOrganizationSelected = true;
    } else {
      this.selectedCreditOrganization = null;
      this.organizationDeposit.CreditOrganizationId = null;
      this.organizationDeposit.CreditOrganizationCode = null;
      this.organizationDeposit.DepositBalance = null;
      this.IsOrganizationSelected = false;
    }
  }
  GetOrganizationDepositBalance(OrganizationId: number) {
    this.organizationDeposit.DepositBalance = 0;
    this.utilitiesBlService.GetOrganizationDepositBalance(OrganizationId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.organizationDeposit.DepositBalance = res.Results;

        } else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
            "No Default Balance  Found",
          ]);
        }
      });
  }


  GetDepositHead() {
    this.utilitiesBlService
      .GetDepositHead()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.depositHeadList = res.Results;
          const defaultDepositHead = this.depositHeadList.find(f => f.IsDefault === true);
          if (defaultDepositHead) {
            this.organizationDeposit.DepositHeadId = defaultDepositHead.DepositHeadId;
          } else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
              "Please check log for error",
            ]);
          }
        } else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
            "No Default Deposit Head Found",
          ]);
        }
      });
  }

  OnDepositHeadChange(organizationDeposit) {
    if (this.selectedDepositHead && this.selectedDepositHead.DepositHeadId > 0) {
      this.organizationDeposit.DepositHeadId = this.selectedDepositHead.DepositHeadId;

    } else {
      this.organizationDeposit.DepositHeadId = null;
    }
  }
  PaymentModeChanges($event) {
    this.organizationDeposit.PaymentMode = $event.PaymentMode.toLowerCase();
    this.organizationDeposit.PaymentDetails = $event.PaymentDetails;
    if (this.TempEmployeeCashTransaction && !this.TempEmployeeCashTransaction.length) {
      let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() == this.organizationDeposit.PaymentMode.toLocaleLowerCase());
      let empCashTxnObj = new EmployeeCashTransaction();
      empCashTxnObj.InAmount = this.organizationDeposit.DepositBalance + this.organizationDeposit.InAmount;
      empCashTxnObj.OutAmount = this.organizationDeposit.DepositBalance + this.organizationDeposit.OutAmount;;
      empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
      empCashTxnObj.ModuleName = "Billing";
      this.TempEmployeeCashTransaction.push(empCashTxnObj);
    }
  }
  MultiplePaymentCallBack($event) {
    if ($event && $event.MultiPaymentDetail) {
      this.TempEmployeeCashTransaction = new Array<EmployeeCashTransaction>();
      this.TempEmployeeCashTransaction = $event.MultiPaymentDetail;
    }
    this.organizationDeposit.PaymentDetails = $event.PaymentDetail;
  }
  LoadPatientPastBillSummary(patientId: number) {
    this.utilitiesBlService.GetPatientPastBillSummary(patientId)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {

          this.patBillHistory = res.Results;
          this.organizationDeposit.DepositBalance = res.Results.DepositBalance;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          this.loading = false;
        }
      });
  }
  updateRepresentativeName() {
    this.organizationDeposit.CareOf = this.RepresentativeName;
  }
  updateRemarks() {
    this.organizationDeposit.Remarks = this.Remarks;
  }
  DiscardChanges() {
    this.selectedCreditOrganization = new CreditOrganization();
    this.IsOrganizationSelected = false;
    this.organizationDeposit.Remarks = '';
    this.Remarks = '';
    this.RepresentativeName = '';
    this.organizationDeposit.CareOf = '';
    this.organizationDeposit.InAmount = 0;
    this.organizationDeposit.OutAmount = 0;
    this.Amount = 0;

    this.Initialize();
  }
  formSubmitted: boolean = false;

  SaveOrganizationDeposit(_showReceipt: boolean) {
    this.formSubmitted = true;
    this.organizationDeposit.PaymentMode = ENUM_BillPaymentMode.cash;
    if (this.OrganizationDepositValidator.valid) {
      if (this.organizationDeposit.TransactionType === ENUM_BillDepositType.Deposit) {
        this.organizationDeposit.InAmount = this.Amount;
        this.organizationDeposit.OutAmount = 0;
        //this.organizationDeposit.DepositBalance = this.Amount;
      }
      if (this.organizationDeposit.TransactionType == ENUM_BillDepositType.ReturnDeposit) {
        this.organizationDeposit.OutAmount = this.Amount;
        this.organizationDeposit.InAmount = 0;
      }
      this.loading = true;
      if (this.organizationDeposit.TransactionType) {
        if (this.organizationDeposit.InAmount > 0 || this.organizationDeposit.OutAmount > 0) {
          if (this.organizationDeposit.TransactionType == ENUM_BillDepositType.ReturnDeposit && this.organizationDeposit.OutAmount > this.organizationDeposit.DepositBalance) {
            this.msgBoxServ.showMessage("failed", ["Return Amount should not be greater than Deposit Amount"]);
            this.loading = false;
            return;
          }
          if (this.organizationDeposit.TransactionType == ENUM_BillDepositType.Deposit) {
            if (this.organizationDeposit.InAmount > 10000000000) {
              this.msgBoxServ.showMessage("failed", ["Deposit Amount should not be greater than 10000000000"]);
              this.loading = false;
              return;
            }
            this.organizationDeposit.DepositBalance = this.organizationDeposit.DepositBalance + this.organizationDeposit.InAmount;
          }
          else
            this.organizationDeposit.DepositBalance = this.organizationDeposit.DepositBalance - this.organizationDeposit.OutAmount;;
          this.organizationDeposit.empCashTransactionModel = this.TempEmployeeCashTransaction;
          this.updateRepresentativeName();
          this.updateRemarks();
          this.utilitiesBlService.PostOrganizationDeposit(this.organizationDeposit)
            .subscribe(
              (res) => {

                // if (this.showReceiptInput) {
                //   _showReceipt = true;
                // }
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                  this.depositId = res.Results;
                  this.formSubmitted = false;
                  this.isDepositAdded = true;
                  console.log("Saving deposit:", this.organizationDeposit);
                  if (this.organizationDeposit.TransactionType == ENUM_BillDepositType.Deposit) {
                    this.msgBoxServ.showMessage("success", ["Deposit of " + this.coreService.currencyUnit + this.organizationDeposit.InAmount + " added successfully."]);
                    const defaultDepositHead = this.depositHeadList.find(organizationDeposit => organizationDeposit.IsDefault);
                    this.selectedDepositHead = defaultDepositHead;
                    this.DiscardChanges();
                  }
                  else {
                    this.msgBoxServ.showMessage("success", [this.coreService.currencyUnit + this.organizationDeposit.OutAmount + " returned successfully."]);
                    const defaultDepositHead = this.depositHeadList.find(organizationDeposit => organizationDeposit.IsDefault);
                    this.selectedDepositHead = defaultDepositHead;
                    this.DiscardChanges();
                  }

                  if (_showReceipt) {
                    this.organizationDeposit = res.Results;
                    this.organizationDeposit.PatientName = this.patientservice.getGlobal().ShortName;
                    this.organizationDeposit.PatientCode = this.patientservice.getGlobal().PatientCode;
                    this.organizationDeposit.Address = this.patientservice.getGlobal().Address;
                    this.organizationDeposit.PhoneNumber = this.patientservice.getGlobal().PhoneNumber;
                  }
                  else {
                    this.Initialize();
                    this.organizationDeposit.DepositBalance = res.Results.DepositBalance;
                  }
                  //this.deposit.DepositType = "Deposit Settlement ";//needs revision: sud:13May'18
                  if (this.isAddDepositFrmBillTxn)
                    this.showReceipt = _showReceipt;
                  this.loading = false;
                  this.LoadPatientPastBillSummary(res.Results.PatientId);
                }
                else {
                  if (res.ErrorMessage.match(/Return Deposit Amount is Invalid/g)) {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                    this.router.navigate(['/Billing/SearchPatient']);
                    this.loading = false;
                  }
                  else {
                    this.msgBoxServ.showMessage("failed", ["Cannot complete the transaction."]);
                    this.loading = false;
                  }
                }
              });
        } else {
          this.msgBoxServ.showMessage("failed", [this.organizationDeposit.TransactionType + " Amount must be greater than 0"]);
          this.loading = false;
        }
      }
      else {
        this.msgBoxServ.showMessage("failed", ["Please Select Deposit Type"])
        this.loading = false;
      }
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Please fill all mandatory fields"])
      this.loading = false;
    }
  }

  IsDirty(fieldName): boolean {
    if (fieldName == undefined) {
      return this.OrganizationDepositValidator.dirty;
    } else {
      return this.OrganizationDepositValidator.controls[fieldName].dirty;
    }
  }

  IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.OrganizationDepositValidator.valid;
    } else {
      return !this.OrganizationDepositValidator.hasError(validator, fieldName);
    }
  }
  logError(err: any) {
    console.log(err);
  }
  public onDepositSaved(depositId: number) {
    this.depositId = depositId;
    this.utilitiesBlService.GetDepositDetails(depositId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.organizationDepositDetails = res.Results;
      } else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
          "No Deposit Details Found",
        ]);
      }
    });
  }

  OrganizationDepositPrintCallBack($event) {
    if ($event) {
      if ($event.action === "GoBackToOrganizationDepositPage") {
        this.isDepositAdded = false;
      }
    }
  }
  CloseDepositReceiptPopUp(): void {
    this.isDepositAdded = false;
  }

  handleConfirm() {
    this.loading = true;
    this.SaveOrganizationDeposit(this.showReceipt);
  }

  handleCancel() {
    this.loading = false;
  }
}
