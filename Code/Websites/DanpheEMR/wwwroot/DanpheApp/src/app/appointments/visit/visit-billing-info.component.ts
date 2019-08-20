/*
 Description:
    - It handles visit's billing informations.
    - Takes doctorBillItem and membership discount percent form parent i.e visit.main.component.ts as @Input.
    - Does GET request for previousBillTransaction based on PatientVisitId of last visit (from visitService) in case of transfer visit and emits the previousBillTransaction to visit.main.component.
    - Has calculation logic.
    - opdBillTxnItem and healthCardBillItem are two BillingTransacitonItems.
        
 -------------------------------------------------------------------
 change history:
 -------------------------------------------------------------------
 S.No     UpdatedBy/Date             description           remarks
 -------------------------------------------------------------------
 1.       ashim/ 23rd Aug 2018           created            
                                                     
 -------------------------------------------------------------------
 */


import { Component, Input, Output, OnInit, EventEmitter } from "@angular/core";
import { BillingTransaction } from "../../billing/shared/billing-transaction.model";
import { VisitBillItemVM } from "../shared/quick-visit-view.model";
import { BillingService } from "../../billing/shared/billing.service";
import { CommonFunctions } from "../../shared/common.functions";
import { BillingTransactionItem } from "../../billing/shared/billing-transaction-item.model";
import { SecurityService } from "../../security/shared/security.service";
import { VisitService } from "../shared/visit.service";
import { VisitBLService } from "../shared/visit.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { CoreService } from '../../core/shared/core.service';
import { BillingItem } from "../../settings/shared/billing-item.model";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Visit } from "../shared/visit.model";
import { Console } from "@angular/core/src/console";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { PatientBillingContextVM } from "../../billing/shared/patient-billing-context-vm";
import { CreditOrganization } from "../../settings/shared/creditOrganization.model";
import { BillingBLService } from '../../billing/shared/billing.bl.service';
import { Patient } from "../../patients/shared/patient.model";
import { Subscription } from 'rxjs';

@Component({
  selector: "visit-billing-info",
  templateUrl: "./visit-billing-info.html"
})
export class VisitBillingInfoComponent implements OnInit {

  public billChangedSubscription: Subscription;

  @Input("billing-transaction")
  public billingTransaction: BillingTransaction;

  public visitBillItem: VisitBillItemVM;

  public previousVisitBillingTxn: BillingTransaction = null;
  public previousVisitDetail: Visit;
  public additionalBillItems: Array<BillingTransactionItem> = [];

  public healthCardFound: boolean = false;
  public enableHealthCard: boolean = false;//hom:5Mar'19--to parameterize healthcard from Core_Parameters.
  //sud: 3sept'18: new variable to get card info first and it'll assigned to above healthCardFound variable later on. 
  public healthCardInfo = { BillingDone: true, CardPrinted: false };
  public currBillingContext: PatientBillingContextVM = new PatientBillingContextVM();
  //ramavatar: 20aug'18
  public opdBillTxnItem: BillingTransactionItem = new BillingTransactionItem();
  public healthCardBillItem: BillingTransactionItem = new BillingTransactionItem();
  public issueHealthCard: boolean = false;//bind with healthcard checkbox
  //public disableAddHealthCard: boolean = false;
  public consultationFee: number = 0;
  public totalWithoutConsultationCharge = 0;
  public isInsuranceVisit: boolean = false;
  public totalAmount: number = 0;
  public TobePaidorReturned: number = 0;
  public hasPreviousTxnItem: boolean = false;
  public organizationList: Array<CreditOrganization> = new Array<CreditOrganization>();
  public CountryPriceCategory: any;
  public priceCategory: string = "Normal";
  public selCountryId: number = 0;
  public saarcCountryIds: number = 0;
  public showBillSummaryPanel: boolean = true;//sud:26June'19--incase of followup we may not have to show billSummary panel.



  public SetPatientCountryId(countryId: number) {
    this.selCountryId = countryId;
    this.SetCountryPriceCategory();
    this.AssignVisitBillItemToTxn(this.visitBillItem);
  }

  //Yubraj 1st July 2019
  public enabledPriceCategories = { Normal: false, EHS: false, SAARCCitizen: false, Foreigner: false, GovtInsurance: false };


  constructor(public billingService: BillingService,
    public securityService: SecurityService,
    public visitService: VisitService,
    public visitBLService: VisitBLService,
    public coreService: CoreService,
    public msgBoxServ: MessageboxService,
    public BillingBLService: BillingBLService) {
    //Billing component is subscribing to NeedBillRecalculation event of Visit Service,
    //Patient and Doctor selection will trigger that event.
    this.billChangedSubscription = visitService.ObserveBillChanged.subscribe(
      newBill => {

        if (this.visitService.appointmentType.toLowerCase() == "followup") {
          this.HandleBillChangedForFollowUp(newBill);
        }
        else {
          if (newBill.ChangeType == "Country") {
            let pat = newBill.PatientInfo;
            if (pat) {
              this.SetPatientCountryId(newBill.PatientInfo.CountryId);
            }
          }
          else if (newBill.ChangeType == "Membership") {
            this.billingTransaction.DiscountPercent = newBill.DiscountPercent;
          }
          else if (newBill.ChangeType == "Doctor") {

            if (this.billingTransaction && this.billingTransaction.BillingTransactionItems.length) {
              let selDoc = newBill.SelectedDoctor;
              this.visitBillItem = this.docOpdPriceItems.find(d => d.ProviderId == selDoc.ProviderId);

              this.ResetOpdBillTxnItem();
              if (this.visitBillItem) {
                this.AssignVisitBillItemToTxn(this.visitBillItem);
              }
            }
          }
          else if (newBill.ChangeType == "Department") {
            let selDept = newBill.SelectedDepartment;
            this.ResetOpdBillTxnItem();
            this.visitBillItem = this.deptOpdItems.find(d => d.DepartmentId == selDept.DepartmentId);
            this.AssignVisitBillItemToTxn(this.visitBillItem);
          }

          this.Calculation();
        }


      });

    this.GetParameterizedPriceCategory();
  }

  public GetParameterizedPriceCategory() {
    //below is the format we're storing this paramter.
    //'{"Normal":true,"EHS":true,"SAARCCitizen":true,"Foreigner":true,"GovtInsurance":true}'
    let param = this.coreService.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "EnabledPriceCategories");
    if (param) {
      let paramJson = JSON.parse(param.ParameterValue);
      //this.enabledPriceCategories.EHS = paramJson.EHS;
      this.enabledPriceCategories.EHS = paramJson.EHS;
      this.enabledPriceCategories.SAARCCitizen = paramJson.SAARCCitizen;
      this.enabledPriceCategories.Foreigner = paramJson.Foreigner;
      this.enabledPriceCategories.GovtInsurance = paramJson.GovtInsurance;

      //if any other than Normal is enabled then show normal as well, else hide normal since it'll by default be normal.
      if (paramJson.EHS || paramJson.SAARCCitizen || paramJson.Foreigner || paramJson.GovtInsurance) {
        this.enabledPriceCategories.Normal = true;
      }
      else {
        this.enabledPriceCategories.Normal = false;
      }
    }
  }

  //needed for Bill-Change events..
  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.billChangedSubscription.unsubscribe();
  }

  //sud: 19June'19--for department OPD.
  public deptOpdItems = [];
  public deptFollowupPrices = [];
  public docFollowupPrices = [];
  public docOpdPriceItems = [];

  public isOldPatientOpd: boolean = false;


  ngOnInit() {

    //set values to global variables from visit service
    this.deptOpdItems = this.visitService.DeptOpdPrices;
    this.docOpdPriceItems = this.visitService.DocOpdPrices;
    this.deptFollowupPrices = this.visitService.DeptFollowupPrices;
    this.docFollowupPrices = this.visitService.DocFollowupPrices;
    

    this.InitializeBillingTransaction();
    this.previousVisitDetail = this.visitService.ParentVisitInfo;
    if (this.visitService.appointmentType.toLowerCase() == "transfer") {
      this.billingTransaction.Remarks = "Transfer Visit";
      //assigning to the local variable for ease of access..
      this.previousVisitBillingTxn = this.visitService.ParentVisitInvoiceDetail;
      this.GetPrevVisitBillDetails();
    }
    else if (this.visitService.appointmentType.toLowerCase() == "referral") {
      this.billingTransaction.Remarks = "Referral Visit";
    }

    if (this.visitService.appointmentType.toLowerCase() == "followup") {
      this.deptOpdItems = this.visitService.DeptFollowupPrices;
      this.docOpdPriceItems = this.visitService.DocFollowupPrices;
      this.showBillSummaryPanel = false;
    }
    else {
      //old patient opd is applicable only when appointment type is not followup.
      let patId = this.visitService.globalVisit.PatientId;
      this.isOldPatientOpd = false;
      if (patId) {
      
        let oldPatOpdParam = this.coreService.Parameters.find(p => p.ParameterGroupName == "Appointment" && p.ParameterName == "OldPatientOpdPriceEnabled");
        if (oldPatOpdParam) {
          let enableOldPatOpdPrice = oldPatOpdParam.ParameterValue.toLowerCase() == "true" ? true : false;

          if (enableOldPatOpdPrice) {

            this.visitBLService.GetPatientVisitList(patId)
              .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                  let patVisitList:Array<any> = res.Results;
                  if (patVisitList && patVisitList.length) {
                    this.isOldPatientOpd = true;
                    //below two variable will be set to OldPatient Opd Prices, and other transaction will happen accordingly.
                    this.docOpdPriceItems = this.visitService.DocOpdPrice_OldPatient;
                    this.deptOpdItems = this.visitService.DeptOpdPrice_OldPatient;
                  }
                }

              });
          }
        }
      }

    



    }


    if (this.billingTransaction.PatientId)
      this.LoadPATHealthCardStatus(this.billingTransaction.PatientId);

    this.GetAdditionalItems();
    this.LoadPatientBillingContext();



    //don't check for health card if it's followup appointment. 
    if (this.visitService.appointmentType.toLowerCase() != "followup") {
      this.enableHealthCard = this.coreService.GetEnableHealthCard();
      //this.SetCountryPriceCategory();
      //get healthcard info only if it is enabled.
      if (this.enableHealthCard) {
        this.GetHealthCardBillItem();
      }
    }

    this.GetOrganizationList();

  }
  //Yubraj 16th May '19: Setting CountryId and Price based on home country, SAARC countries and Foreigner
  SetCountryPriceCategory() {
    let priceParams = this.coreService.Parameters.find(p => p.ParameterGroupName == "Visit" && p.ParameterName == "CountryPriceCategory");
    if (priceParams) {
      let priceParamsObj = JSON.parse(priceParams.ParameterValue);

      this.CountryPriceCategory = priceParamsObj;
      let HomeCountryId = this.CountryPriceCategory.HomeCountryId;
      let saarcCountryIds = this.CountryPriceCategory.SAARCCountryIds;

      if (this.selCountryId) {
        this.selCountryId = parseInt(this.selCountryId.toString()); //converting int to string
        if (this.selCountryId == HomeCountryId) {
          this.priceCategory = "Normal";
        }
        else if (saarcCountryIds.indexOf(this.selCountryId) > -1) {
          this.priceCategory = "SAARCCitizen";
        }
        else {
          this.priceCategory = "Foreigner";
        }
      }
      else {
        this.priceCategory = "Normal"
      }
    }
  }

  GetAdditionalItems() {
    this.visitBLService.GetAdditionalBillingItems()
      .subscribe(res => {
        if (res.Status == "OK" && res.Results) {
          this.MapAndAddAdditionalItems(res.Results);
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Not able to load additional item's list."]);
          console.log(res.ErrorMessage);
        }
      });
  }

  //getting credit organization_list yubraj --22nd April '19
  public GetOrganizationList() {
    this.BillingBLService.GetOrganizationList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.organizationList = res.Results;
          }
        }
        else {
          this.msgBoxServ.showMessage("failed", ['Failed to get Organization List.' + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get Organization List.' + err.ErrorMessage]);
        });
  }
  public InitializeBillingTransaction() {
    this.billingTransaction.CounterId = this.securityService.getLoggedInCounter().CounterId;
    this.billingTransaction.TaxId = this.billingService.taxId;
    this.billingTransaction.TransactionType = "outpatient";
    this.billingTransaction.BillStatus = "paid";
    this.InitializeAndPushBillingTransactionItems();
  }

  public MapAndAddAdditionalItems(itemList) {
    if (itemList) {
      this.additionalBillItems = [];
      itemList.forEach(item => {
        var billItem = new BillingTransactionItem();
        billItem.ServiceDepartmentId = item.ServiceDepartmentId;
        billItem.ServiceDepartmentName = item.ServiceDepartmentName;
        billItem.ItemName = item.ItemName;
        billItem.ItemId = item.ItemId;
        billItem.Price = item.ItemPrice;
        billItem.SAARCCitizenPrice = item.SAARCCitizenPrice;
        billItem.ForeignerPrice = item.ForeignerPrice;
        billItem.IsTaxApplicable = item.IsTaxApplicable;
        billItem.PatientId = this.billingTransaction.PatientId;
        billItem.CounterId = this.billingTransaction.CounterId;
        billItem.TaxPercent = this.billingService.taxPercent;
        billItem.BillingType = "outpatient";
        billItem.VisitType = "outpatient";
        billItem.BillStatus = this.billingTransaction.BillStatus;
        this.additionalBillItems.push(billItem);
      });
    }
  }

  public CheckAndAddAdditionalItems() {
    if (this.visitBillItem.HasAdditionalBillingItems) {
      this.additionalBillItems.forEach(item => {
        item.ProviderId = this.visitBillItem.ProviderId;
        item.ProviderName = this.visitBillItem.ProviderName;
        this.billingTransaction.BillingTransactionItems.push(item);
      });
      this.Calculation();
    }
    else {
      this.billingTransaction.BillingTransactionItems = [];
      this.billingTransaction.BillingTransactionItems.push(this.opdBillTxnItem);
      this.IssueHealthCardOnChange();
    }
  }

  public InitializeAndPushBillingTransactionItems() {
    this.opdBillTxnItem.PatientId =
      this.healthCardBillItem.PatientId = this.billingTransaction.PatientId;
    this.opdBillTxnItem.CounterId =
      this.healthCardBillItem.CounterId = this.billingTransaction.CounterId;
    this.opdBillTxnItem.TaxPercent =
      this.healthCardBillItem.TaxPercent = this.billingService.taxPercent;
    //this.opdBillTxnItem.ServiceDepartmentName = "OPD";//this will  come from server side, no need to assign it here.. 
    this.opdBillTxnItem.BillingType =
      this.healthCardBillItem.BillingType = "outpatient";
    this.opdBillTxnItem.VisitType =
      this.healthCardBillItem.VisitType = "outpatient";
    this.opdBillTxnItem.BillStatus =
      this.healthCardBillItem.BillStatus = this.billingTransaction.BillStatus;
    this.billingTransaction.BillingTransactionItems.push(this.opdBillTxnItem);
  }



  AssignVisitBillItemToTxn(billItem) {

    if (!billItem) {
      return;
    }

    this.opdBillTxnItem.ItemName = billItem.ItemName;
    this.opdBillTxnItem.ItemId = billItem.ItemId;
    this.opdBillTxnItem.ProcedureCode = billItem.ItemId.toString();
    this.opdBillTxnItem.ServiceDepartmentId = billItem.ServiceDepartmentId;
    this.opdBillTxnItem.ServiceDepartmentName = billItem.ServiceDepartmentName;
    this.opdBillTxnItem.ProviderId = billItem.ProviderId;
    this.opdBillTxnItem.ProviderName = billItem.ProviderName;
    this.opdBillTxnItem.PriceCategory = this.priceCategory;

    // referral charges for doctor 
    if (this.visitService.appointmentType == "Referral") {
      let refChargeParam = this.coreService.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "ReferralChargeApplicable");
      if (refChargeParam) {
        let isRefChargeApplicable = refChargeParam.ParameterValue;
        if (isRefChargeApplicable == "true") {
          this.opdBillTxnItem.Price = this.GetOpdPriceByCategory(billItem);
        }
        else {
          this.opdBillTxnItem.Price = 0;
          this.opdBillTxnItem.SAARCCitizenPrice = 0;
          this.opdBillTxnItem.ForeignerPrice = 0;
        }
      }
    }
    else {
      this.opdBillTxnItem.Price = this.GetOpdPriceByCategory(billItem);
    }
    this.opdBillTxnItem.IsTaxApplicable = billItem.IsTaxApplicable;
    this.CheckAndAddAdditionalItems();
  }


  GetOpdPriceByCategory(docBillItem): number {
    let price = 0;
    if (this.priceCategory == "Normal") {
      price = docBillItem.NormalPrice;
    }
    else if (this.priceCategory == "SAARCCitizen") {
      price = docBillItem.SAARCCitizenPrice;
    }
    else if (this.priceCategory == "Foreigner") {
      price = docBillItem.ForeignerPrice;
    }
    else {
      price = docBillItem.EHSPrice;
    }

    return price;
  }

  ResetOpdBillTxnItem() {
    this.opdBillTxnItem.Price = 0;
    this.opdBillTxnItem.SAARCCitizenPrice = 0;
    this.opdBillTxnItem.ForeignerPrice = 0;
    this.opdBillTxnItem.ItemId = 0;
  }

  Calculation() {
    this.billingTransaction.DiscountAmount = 0;
    this.billingTransaction.TaxTotal = 0;
    this.billingTransaction.TaxableAmount = 0;
    this.billingTransaction.NonTaxableAmount = 0;
    this.billingTransaction.SubTotal = 0;
    this.billingTransaction.TotalAmount = 0;
    this.billingTransaction.Tender = 0;
    this.billingTransaction.TotalQuantity = 0;
    //let billTxnItem = this.billingTransaction.BillingTransactionItems[0];
    if (this.billingTransaction.DiscountPercent == null) { //to pass discount percent 0 when the input is null --yub 30th Aug '18
      this.billingTransaction.DiscountPercent = 0;
    }
    this.billingTransaction.BillingTransactionItems.forEach(billTxnItem => {
      this.billingTransaction.TotalQuantity +=
        billTxnItem.Quantity = 1;

      //no discount for health card
      if (billTxnItem.ItemId != this.healthCardBillItem.ItemId) {
        this.billingTransaction.DiscountAmount +=
          billTxnItem.DiscountAmount = CommonFunctions.parseAmount(billTxnItem.Price * this.billingTransaction.DiscountPercent / 100);
        billTxnItem.DiscountPercent =
          billTxnItem.DiscountPercentAgg = CommonFunctions.parseAmount(this.billingTransaction.DiscountPercent);
      }

      if (billTxnItem.IsTaxApplicable) {
        this.billingTransaction.TaxTotal +=
          billTxnItem.Tax = CommonFunctions.parseAmount(((billTxnItem.Price - billTxnItem.DiscountAmount) * billTxnItem.TaxPercent) / 100);
        this.billingTransaction.TaxableAmount +=
          billTxnItem.TaxableAmount = CommonFunctions.parseAmount(billTxnItem.Price - billTxnItem.DiscountAmount);
      }
      else {
        this.billingTransaction.NonTaxableAmount +=
          billTxnItem.NonTaxableAmount = CommonFunctions.parseAmount(billTxnItem.Price - billTxnItem.DiscountAmount);
      }

      this.billingTransaction.SubTotal +=
        billTxnItem.SubTotal = CommonFunctions.parseAmount(billTxnItem.Price);
      this.billingTransaction.TotalAmount +=
        billTxnItem.TotalAmount = CommonFunctions.parseAmount(billTxnItem.SubTotal - billTxnItem.DiscountAmount + billTxnItem.Tax);

    });
    this.billingTransaction.Tender = CommonFunctions.parseAmount(this.billingTransaction.TotalAmount);
    //for transfer, we've to re-calculate the amounts.
    if (this.hasPreviousTxnItem) {
      this.CalculateAmountForReturnCase();
    }
  }

  GetPrevVisitBillDetails() {
    let prevVisId = this.visitService.ParentVisitInfo.PatientVisitId;
    let patId = this.visitService.ParentVisitInfo.PatientId;

    if (prevVisId) {
      this.visitBLService.GetBillTxnByRequisitionId(prevVisId, patId)
        .subscribe(res => {
          if (res.Status == "OK" && res.Results) {

            Object.keys(res.Results.bill).forEach(property => {
              if (property in this.previousVisitBillingTxn) {
                this.previousVisitBillingTxn[property] = res.Results.bill[property];
              }
            });
            this.previousVisitBillingTxn.BillingTransactionItems = res.Results.billTxnItems;

            //for (let item of this.previousVisitBillingTxn.BillingTransactionItems) {
            //    if (item.ItemName == "Health Card") {
            //        this.issueHealthCard = false;
            //        this.healthCardFound = true;
            //        this.IssueHealthCardOnChange();
            //        break;
            //    }
            //}

            //this.emitPreviousVisitBillTxn.emit({ "previousVisitBillingTxn": this.previousVisitBillingTxn });

            this.hasPreviousTxnItem = true;
            this.Calculation();

          }
        });
    }
  }
  CalculateAmountForReturnCase() {
    this.totalAmount = 0;
    this.TobePaidorReturned = 0;
    this.consultationFee = 0;
    this.totalWithoutConsultationCharge;
    let itemId = this.visitService.ParentVisitInfo.ProviderId;

    //sud:27June'19--below servicedepartment name are subject to change, so we shouldn't ideally hard-code them.. 
    let prevVisitOpdItem = this.previousVisitBillingTxn.BillingTransactionItems.find(a =>
      a.ServiceDepartmentName.toLowerCase() == "opd"
      || a.ServiceDepartmentName.toLowerCase() == "department opd"

    );

    //var index = this.previousVisitBillingTxn.BillingTransactionItems.findIndex(i => i.ServiceDepartmentName == "OPD" && i.ItemId == itemId);

    if (prevVisitOpdItem) {

      this.consultationFee = CommonFunctions.parseAmount(prevVisitOpdItem.TotalAmount);//this is OPD Charge.

      this.totalWithoutConsultationCharge = CommonFunctions.parseAmount(this.previousVisitBillingTxn.TotalAmount - this.consultationFee);

      this.totalAmount = CommonFunctions.parseAmount(this.totalWithoutConsultationCharge + this.billingTransaction.TotalAmount);

      this.TobePaidorReturned = CommonFunctions.parseAmount(this.totalAmount - this.previousVisitBillingTxn.TotalAmount);
    }
  }
  //ramavtar: 20Aug'18
  IssueHealthCardOnChange() {

    if (this.issueHealthCard) {
      this.billingTransaction.BillingTransactionItems.push(this.healthCardBillItem);
    }
    else if (!this.issueHealthCard) {
      this.billingTransaction.BillingTransactionItems = this.billingTransaction.BillingTransactionItems.filter(billItem => billItem.ItemId != this.healthCardBillItem.ItemId);
    }
    if (this.healthCardFound && this.issueHealthCard) {
      this.msgBoxServ.showMessage("notice-message", ["Health card was already added for this patient."])
    }
    this.Calculation();

  }

  GetHealthCardBillItem() {
    this.visitBLService.GetHealthCardBillItem().subscribe(res => {
      if (res.Status == "OK" && res.Results) {
        this.AssignHealthCardBillItemToTxnItem(res.Results);
      }
      else {
        this.msgBoxServ.showMessage('Failed', ["Unable to get health card item"]);
        console.log(res.ErrorMessage);
      }
    })
  }

  AssignHealthCardBillItemToTxnItem(healthCardBillItem: BillingItem) {
    this.healthCardBillItem.ItemId = healthCardBillItem.ItemId;
    this.healthCardBillItem.ItemName = healthCardBillItem.ItemName;
    this.healthCardBillItem.ServiceDepartmentId = healthCardBillItem.ServiceDepartmentId;
    this.healthCardBillItem.ServiceDepartmentName = healthCardBillItem.ServiceDepartmentName;
    this.healthCardBillItem.Price = healthCardBillItem.Price;
    this.healthCardBillItem.IsTaxApplicable = healthCardBillItem.TaxApplicable;
    if (!this.billingTransaction.PatientId) {
      this.issueHealthCard = true;
      //this.issueHealthCard
      this.IssueHealthCardOnChange();
    }


  }

  PaymentModeChanged() {
    this.billingTransaction.BillStatus =
      this.opdBillTxnItem.BillStatus =
      this.healthCardBillItem.BillStatus = this.billingTransaction.BillStatus =
      this.billingTransaction.PaymentMode == "credit" ? "unpaid" : "paid";
    if (this.billingTransaction.BillStatus == "paid") {
      this.billingTransaction.PaymentDetails = null;
    }
    if (this.billingTransaction.PaymentMode == "credit" && this.billingTransaction.OrganizationId) {
      let OrganizationId = this.billingTransaction.OrganizationId;
      if (OrganizationId) {
        let org = this.organizationList.find(a => a.OrganizationId == OrganizationId);
        this.billingTransaction.OrganizationName = org.OrganizationName;
      }
    }
  }

  //sud:3sept'18: Changed in logic of helthcard info.
  LoadPATHealthCardStatus(patId) {
    this.visitBLService.GetPatHealthCardStatus(patId)
      .subscribe(res => {
        if (res.Status == "OK") {
          //this.healthCardFound = res.Results;
          this.healthCardInfo = res.Results;
          this.healthCardFound = this.healthCardInfo.BillingDone;
        }
      });
  }
  ChangesForInsuranceVisit() {
    this.billingTransaction.IsInsuranceBilling = this.isInsuranceVisit;
    if (this.billingTransaction.IsInsuranceBilling) {
      this.billingTransaction.InsuranceProviderId = this.currBillingContext.Insurance.InsuranceProviderId;
      this.billingService.BillingFlow = "insurance";
      this.billingTransaction.PaymentMode = "credit";
      this.billingTransaction.PaymentDetails = "InsuranceName: " + this.currBillingContext.Insurance.InsuranceProviderName
        + "/" + "InsuranceNumber:" + this.currBillingContext.Insurance.InsuranceNumber;
    }
    else {
      this.billingTransaction.PaymentMode = "cash";
      this.billingTransaction.PaymentDetails = null;
      this.billingTransaction.InsuranceProviderId = null;
      this.billingService.BillingFlow = "normal";
    }
    this.PaymentModeChanged();
  }
  LoadPatientBillingContext() {
    if (this.billingTransaction.IsInsuranceBilling) {
      this.billingService.isInsuranceBilling = true;
    }
    if (this.billingTransaction.PatientId) {
      this.visitBLService.GetPatientBillingContext(this.billingTransaction.PatientId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.currBillingContext = res.Results;
            this.billingService.Insurance = this.currBillingContext.Insurance;
          }
        });
    }

  }

  OnPriceCategoryChange() {
    this.opdBillTxnItem.PriceCategory = this.priceCategory;
    this.visitService.PriceCategory = this.priceCategory;//sud:26June'19

    if (this.visitBillItem) {
      this.opdBillTxnItem.Price = this.GetOpdPriceByCategory(this.visitBillItem);
    }
    if (this.priceCategory) {
      this.visitService.TriggerBillChangedEvent({ ChangeType: "PriceCategory", PriceCategory: this.priceCategory });
    }
  }



  HandleBillChangedForFollowUp(newBill) {


    let oldDeptId = this.visitService.ParentVisitInfo.DepartmentId;
    let oldDoctorId = this.visitService.ParentVisitInfo.ProviderId;

    let newDeptId = this.visitService.globalVisit.DepartmentId;
    let newDoctId = this.visitService.globalVisit.ProviderId;


    if (newDeptId && oldDeptId != newDeptId) {
      this.showBillSummaryPanel = true;

      if (newDoctId && oldDoctorId != newDoctId) {
        this.Followup_DoctorChanged(newDoctId);
      }
      else {
        this.Followup_DepartmentChanged(newDeptId);
      }

    }
    else if (this.priceCategory != "Normal") {
      this.showBillSummaryPanel = true;

      if (newDoctId && oldDoctorId != newDoctId) {
        this.Followup_DoctorChanged(newDoctId);
      }
      else {
        this.Followup_DepartmentChanged(newDeptId);
      }
    }
    else {
      this.showBillSummaryPanel = false;
    }

    this.Calculation();
  }//end of: HandleBillChangedForFollowUp


  Followup_DoctorChanged(newDoctId) {
    if (this.billingTransaction && this.billingTransaction.BillingTransactionItems.length) {
      this.visitBillItem = this.docOpdPriceItems.find(d => d.ProviderId == newDoctId);
      this.ResetOpdBillTxnItem();
      if (this.visitBillItem) {
        this.AssignVisitBillItemToTxn(this.visitBillItem);
      }
    }

  }


  Followup_DepartmentChanged(newDeptId) {
    this.ResetOpdBillTxnItem();
    this.visitBillItem = this.deptOpdItems.find(d => d.DepartmentId == newDeptId);
    this.AssignVisitBillItemToTxn(this.visitBillItem);
  }


  LoadOldPatientOPDPrices() {

  }

}
