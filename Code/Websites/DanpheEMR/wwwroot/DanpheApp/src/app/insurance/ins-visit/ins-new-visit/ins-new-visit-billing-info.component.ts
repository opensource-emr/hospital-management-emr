import { Component, Input, OnInit, ChangeDetectorRef } from "@angular/core";
import { BillingTransaction } from "../../../billing/shared/billing-transaction.model";
import { VisitBillItemVM } from "../../../appointments/shared/quick-visit-view.model";
import { CommonFunctions } from "../../../shared/common.functions";
import { BillingTransactionItem } from "../../../billing/shared/billing-transaction-item.model";
import { SecurityService } from "../../../security/shared/security.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { CoreService } from '../../../core/shared/core.service';
import { Visit } from "../../../appointments/shared/visit.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { PatientBillingContextVM } from "../../../billing/shared/patient-billing-context-vm";
import { CreditOrganization } from "../../../settings-new/shared/creditOrganization.model";
import { Subscription } from 'rxjs';
import { ENUM_VisitType, ENUM_BillingType } from "../../../shared/shared-enums";
import { BillItemPriceVM } from "../../../billing/shared/billing-view-models";
import { RouteFromService } from "../../../shared/routefrom.service";
import { InsuranceService } from "../../shared/ins-service";
import { InsuranceBlService } from "../../shared/insurance.bl.service";
import { BillingService } from "../../../billing/shared/billing.service";

@Component({
  selector: "ins-new-visit-billing-info",
  templateUrl: "./ins-new-visit-billing-info.html"
})
export class InsuranceVisitBillingInfoComponent implements OnInit {

  public billChangedSubscription: Subscription;

  @Input("billing-transaction")
  public billingTransaction: BillingTransaction;

  public visitBillItem: VisitBillItemVM;
  public allBillItms: Array<any> = [];
  public previousVisitBillingTxn: BillingTransaction = null;
  public previousVisitDetail: Visit;
  public healthCardFound: boolean = false;
  public enableHealthCard: boolean = false;
  public healthCardInfo = { BillingDone: true, CardPrinted: false };
  public currBillingContext: PatientBillingContextVM = new PatientBillingContextVM();
  public opdBillTxnItem: BillingTransactionItem = new BillingTransactionItem();
  public healthCardBillItem: BillingTransactionItem = new BillingTransactionItem();
  public isAdditionalBillItem: boolean = false;
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
  public showBillSummaryPanel: boolean = true;
  public IsCountryIdLoaded: boolean = false;
  public isBillItemPriceEditable: boolean = false;
  public PriceEditable:boolean = false;
  public SetPatientCountryId(countryId: number) {
    this.selCountryId = countryId;
    this.SetCountryPriceCategory();
    this.AssignVisitBillItemToTxn(this.visitBillItem);
  }

  public AdditionalBilItems: Array<AdditionalBillItemVMModel> = [{
    ServiceDeptId: 37,
    ServiceDepartmentName: 'Registration',
    ItemId: 33,
    ItemName: "OPD Card Charge",
    Price: 50,
    DiscountAmount: 0,
    TotalAmount: 50,
    DiscountApplicable: true,
    PriceChangeEnabled: false,
    TaxApplicable: false,
    DefaultForNewPatient: true,
    ItmObj: { ItemId: 33, ItemName: "OPD Card Charge" },
    GovtInsurancePrice: 0
  },
  {
    ServiceDeptId: 37,
    ServiceDepartmentName: 'Registration',
    ItemId: 34,
    ItemName: "Health Card",
    Price: 50,
    DiscountAmount: 0,
    TotalAmount: 50,
    DiscountApplicable: false,
    PriceChangeEnabled: true,
    TaxApplicable: false,
    DefaultForNewPatient: false,
    ItmObj: { ItemId: 34, ItemName: "Health Card" },
    GovtInsurancePrice: 0
  }];

  public AdditionBillItemList: Array<AdditionalBillItemVMModel> = [];
  public NotAddtionalBillItem = { ItemId: 0, ItemName: null };

  constructor(
    //public insuranceService: BillingService,
    public securityService: SecurityService,
    public insuranceService: InsuranceService,
    public insuranceBLService: InsuranceBlService,
    public coreService: CoreService,
    public msgBoxServ: MessageboxService,
    public routeFromService: RouteFromService,
    public changeDetectorRef: ChangeDetectorRef) {

    this.InitializeSubscriptions();
    this.GetBillingItems();
    this.Loadparameters();
    this.isBillItemPriceEditable = this.coreService.GetInsBillRequestDisplaySettings().InsuranceBilling.BillItemPriceEditable;
  }
  //needed for Bill-Change events..
  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.billChangedSubscription.unsubscribe();
  }
  //Billing Info
  public ShowPriceCategory: boolean = false;
  public ShowAdditionalBillItem: boolean = false;
  public ShowDiscountPercent: boolean = false;
  public ShowTender: boolean = false;
  public ShowChange: boolean = false;
  public ShowPaymentDetails: boolean = false;
  public ShowCreditOrg: boolean = false;
  public RemarksMandatory: boolean = false;

  Loadparameters() {
    let Parameter = this.coreService.Parameters;
    Parameter = Parameter.filter(parms => parms.ParameterGroupName == 'Insurance' && parms.ParameterName == "InsNewVisitDisplaySettings");
    let parmObj = JSON.parse(Parameter[0].ParameterValue);

    this.ShowPriceCategory = parmObj.ShowPriceCategory;
    this.ShowAdditionalBillItem = parmObj.ShowAdditionalBillItem;
    this.ShowDiscountPercent = parmObj.ShowDiscountPercent;
    this.ShowTender = parmObj.ShowTender;
    this.ShowChange = parmObj.ShowChange;
    this.ShowPaymentDetails = parmObj.ShowPaymentDetails;
    this.ShowCreditOrg = parmObj.ShowCreditOrg;
    this.RemarksMandatory = parmObj.RemarksMandatory;
  }

  public deptOpdItems = [];
  public deptFollowupPrices = [];
  public docFollowupPrices = [];
  public docOpdPriceItems = [];

  public isOldPatientOpd: boolean = false;
  public DisableDiscountPercent: boolean = false;
  public MembershipTypeName: string = null;

  public InitializeSubscriptions() {
    //Billing component is subscribing to NeedBillRecalculation event of Visit Service,
    //Patient and Doctor selection will trigger that event.
    this.billChangedSubscription = this.insuranceService.ObserveBillChanged.subscribe(
      newBill => {

        if (this.insuranceService.appointmentType.toLowerCase() == "followup") {
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

            if (newBill) {
              if (newBill.DiscountPercent && newBill.DiscountPercent > 0) {
                this.billingTransaction.Remarks = newBill.MembershipTypeName;
              }
              else {
                this.billingTransaction.Remarks = null;
              }

              this.MembershipTypeName = newBill.MembershipTypeName;
              this.billingTransaction.BillingTransactionItems.forEach(a => {
                a.DiscountSchemeId = newBill.MembershipTypeId;
              });
              this.billingTransaction.DiscountPercent = newBill.DiscountPercent ? newBill.DiscountPercent : 0;
              if (!this.MembershipTypeName || this.MembershipTypeName == 'General') {
                this.DisableDiscountPercent = true;
              }
              else {
                this.DisableDiscountPercent = false;
              }

            }
            this.changeDetectorRef.detectChanges();
          }
          else if (newBill.ChangeType == "Doctor") {

            if (this.billingTransaction && this.billingTransaction.BillingTransactionItems.length) {
              let selDoc = newBill.SelectedDoctor;
              this.visitBillItem = this.docOpdPriceItems.find(d => d.ProviderId == selDoc.ProviderId);

              this.ResetOpdBillTxnItem();
              if (this.visitBillItem) {
                this.AssignVisitBillItemToTxn(this.visitBillItem);

                this.NotAddtionalBillItem = { ItemId: this.visitBillItem.ItemId, ItemName: this.visitBillItem.ItemName };
              }
            }
          }
          else if (newBill.ChangeType == "Department") {
            let selDept = newBill.SelectedDepartment;
            this.ResetOpdBillTxnItem();
            this.visitBillItem = this.deptOpdItems.find(d => d.DepartmentId == selDept.DepartmentId);
            if(this.visitBillItem != undefined || this.visitBillItem != null){
              this.AssignVisitBillItemToTxn(this.visitBillItem);
            }
          }
          else if (newBill.ChangeType == "Referral") {
            if (this.opdBillTxnItem)
              this.opdBillTxnItem.RequestedBy = newBill.ReferredBy;
          }

          this.Calculation();
        }
        this.isInsuranceVisit = true;
        this.billingTransaction.PaymentMode = 'credit';
        this.ChangesForInsuranceVisit(this.isInsuranceVisit);
      });
  }


  ngOnInit() {
    //set values to global variables from visit service
    this.deptOpdItems = this.insuranceService.DeptOpdPrices;
    this.docOpdPriceItems = this.insuranceService.DocOpdPrices;
    this.deptFollowupPrices = this.insuranceService.DeptFollowupPrices;
    this.docFollowupPrices = this.insuranceService.DocFollowupPrices;


    this.InitializeBillingTransaction();
    this.previousVisitDetail = this.insuranceService.ParentVisitInfo;
    if (this.insuranceService.appointmentType.toLowerCase() == "transfer") {
      this.billingTransaction.Remarks = "Transfer Visit";
      //assigning to the local variable for ease of access..
      this.previousVisitBillingTxn = this.insuranceService.ParentVisitInvoiceDetail;
      this.GetPrevVisitBillDetails();
    }
    else if (this.insuranceService.appointmentType.toLowerCase() == "referral") {
      this.billingTransaction.Remarks = "Referral Visit";
    }

    if (this.insuranceService.appointmentType.toLowerCase() == "followup") {
      this.deptOpdItems = this.insuranceService.DeptFollowupPrices;
      this.docOpdPriceItems = this.insuranceService.DocFollowupPrices;
      this.showBillSummaryPanel = false;
    }
    else {
      //old patient opd is applicable only when appointment type is not followup.
      let patId = this.insuranceService.globalVisit.PatientId;
      this.isOldPatientOpd = false;
      if (patId) {

        let oldPatOpdParam = this.coreService.Parameters.find(p => p.ParameterGroupName == "Appointment" && p.ParameterName == "OldPatientOpdPriceEnabled");
        if (oldPatOpdParam) {
          let enableOldPatOpdPrice = oldPatOpdParam.ParameterValue.toLowerCase() == "true" ? true : false;

          if (enableOldPatOpdPrice) {

            this.insuranceBLService.GetPatientVisitList(patId)
              .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                  let patVisitList: Array<any> = res.Results;
                  if (patVisitList && patVisitList.length) {
                    this.isOldPatientOpd = true;
                    //below two variable will be set to OldPatient Opd Prices, and other transaction will happen accordingly.
                    this.docOpdPriceItems = this.insuranceService.DocOpdPrice_OldPatient;
                    this.deptOpdItems = this.insuranceService.DeptOpdPrice_OldPatient;
                  }
                }

              });
          }
        }
      }
    }


    if (this.billingTransaction.PatientId) {
      this.LoadPATHealthCardStatus(this.billingTransaction.PatientId);
    }

    this.LoadPatientBillingContext();
    //don't check for health card if it's followup appointment. 
    if (this.insuranceService.appointmentType.toLowerCase() != "followup") {
      this.AdditionalBilItems = [];
      let additionaBillItem = this.coreService.Parameters.find(p => p.ParameterGroupName == "Appointment" && p.ParameterName == "AdditionalBillItem");

      if (additionaBillItem && additionaBillItem.ParameterValue) {

        var addbillitm = JSON.parse(additionaBillItem.ParameterValue);
        addbillitm.forEach(a => {
          var billitm = this.allBillItms.find(b => b.ItemName == a.ItemName);
          if (billitm) {
            var itmobj = new AdditionalBillItemVMModel();
            itmobj.ItemName = billitm.ItemName;
            itmobj.ItemId = billitm.ItemId;
            itmobj.ServiceDepartmentName = billitm.ServiceDepartmentName;
            itmobj.ServiceDeptId = billitm.ServiceDepartmentId;
            itmobj.Price = billitm.Price;
            itmobj.GovtInsurancePrice = billitm.GovtInsurancePrice;
            itmobj.DiscountApplicable = a.DiscountApplicable;
            itmobj.DefaultForNewPatient = a.DefaultForNewPatient;
            itmobj.PriceChangeEnabled = a.PriceChangeEnabled;
            itmobj.TaxApplicable = a.TaxApplicable;
            itmobj.DefaultForNewPatient = a.DefaultForNewPatient;
            itmobj.ItmObj = { ItemId: billitm.ItemId, ItemName: billitm.ItemName }
            this.AdditionalBilItems.push(itmobj);
          }
        });
        let patId = this.insuranceService.globalVisit.PatientId;
        if (!patId) {
          this.enableHealthCard = this.coreService.GetEnableHealthCard()
          if (this.enableHealthCard == true) {
            this.isAdditionalBillItem = this.AdditionalBilItems.find(a => a.DefaultForNewPatient == true) ? true : false;
          } else {
            this.isAdditionalBillItem = false;
          }
          this.IsAdditionalBillItemChange();
        }
      }
    }

    this.GetOrganizationList();

    //by the time it reaches here, insuranceService would already be disabled.
    if (this.routeFromService && this.routeFromService.RouteFrom && this.routeFromService.RouteFrom == "appointment") {
      this.routeFromService.RouteFrom = "";
      let apptDocId: number = this.insuranceService.insGlobalAppointment.ProviderId;
      if (apptDocId) {
        this.insuranceService.TriggerBillChangedEvent({ ChangeType: "Doctor", SelectedDoctor: { ProviderId: apptDocId } });
      }
    }
  }

  SetCountryPriceCategory() {
    this.IsCountryIdLoaded = false;
    this.changeDetectorRef.detectChanges();

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
    this.IsCountryIdLoaded = true;
  }

  public GetOrganizationList() {
    this.insuranceBLService.GetOrganizationList()
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
    this.billingTransaction.TaxId = this.insuranceService.taxId;
    this.billingTransaction.TransactionType = "outpatient";
    this.billingTransaction.BillStatus = "unpaid";
    this.InitializeAndPushBillingTransactionItems();
  }

  public InitializeAndPushBillingTransactionItems() {
    this.opdBillTxnItem.PatientId =
      this.healthCardBillItem.PatientId = this.billingTransaction.PatientId;
    this.opdBillTxnItem.CounterId =
      this.healthCardBillItem.CounterId = this.billingTransaction.CounterId;
    this.opdBillTxnItem.TaxPercent =
      this.healthCardBillItem.TaxPercent = this.insuranceService.taxPercent;
    this.opdBillTxnItem.BillingType =
      this.healthCardBillItem.BillingType = ENUM_BillingType.outpatient;// "outpatient";
    this.opdBillTxnItem.VisitType =
      this.healthCardBillItem.VisitType = ENUM_VisitType.outpatient;// "outpatient";
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
    this.opdBillTxnItem.IsZeroPriceAllowed = billItem.IsZeroPriceAllowed;

    // referral charges for doctor 
    if (this.insuranceService.appointmentType == "Referral") {
      let refChargeParam = this.coreService.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "ReferralChargeApplicable");
      if (refChargeParam) {
        let isRefChargeApplicable = refChargeParam.ParameterValue;
        if (isRefChargeApplicable == "true") {
          //this.opdBillTxnItem.Price = this.GetOpdPriceByCategory(billItem);
          this.opdBillTxnItem.GovtInsurancePrice = this.GetOpdPriceByCategory(billItem);
          this.PriceEditable = (this.opdBillTxnItem.GovtInsurancePrice == 0 || this.opdBillTxnItem.GovtInsurancePrice == null) ? true : (this.isBillItemPriceEditable && this.opdBillTxnItem.GovtInsurancePrice > 0) ? true : false;
        }
        else {
          //   this.opdBillTxnItem.Price = 0;
          this.opdBillTxnItem.GovtInsurancePrice = 0;
          this.PriceEditable = (this.opdBillTxnItem.GovtInsurancePrice == 0 || this.opdBillTxnItem.GovtInsurancePrice == null) ? true : (this.isBillItemPriceEditable && this.opdBillTxnItem.GovtInsurancePrice > 0) ? true : false;
          this.opdBillTxnItem.SAARCCitizenPrice = 0;
          this.opdBillTxnItem.ForeignerPrice = 0;
          this.opdBillTxnItem.InsForeignerPrice = 0;
        }
      }
    }
    else {
      //this.opdBillTxnItem.Price = this.GetOpdPriceByCategory(billItem);
      this.opdBillTxnItem.GovtInsurancePrice = this.GetOpdPriceByCategory(billItem);
      this.PriceEditable = (this.opdBillTxnItem.GovtInsurancePrice == 0 || this.opdBillTxnItem.GovtInsurancePrice == null) ? true : (this.isBillItemPriceEditable && this.opdBillTxnItem.GovtInsurancePrice > 0) ? true : false;
    }
    this.opdBillTxnItem.IsTaxApplicable = billItem.IsTaxApplicable;
    //this.CheckAndAddAdditionalItems();
  }

  GetOpdPriceByCategory(docBillItem): number {
    let price = 0;
    if (this.priceCategory == "Normal") {
      price = docBillItem.GovtInsurancePrice
    }
    return price;
  }

  ResetOpdBillTxnItem() { 
    this.opdBillTxnItem.GovtInsurancePrice = 0
    this.PriceEditable = (this.opdBillTxnItem.GovtInsurancePrice == 0 || this.opdBillTxnItem.GovtInsurancePrice == null) ? true : (this.isBillItemPriceEditable && this.opdBillTxnItem.GovtInsurancePrice > 0) ? true : false;
    this.opdBillTxnItem.SAARCCitizenPrice = 0;
    this.opdBillTxnItem.ForeignerPrice = 0;
    this.opdBillTxnItem.ItemId = 0;
    this.opdBillTxnItem.InsForeignerPrice = 0;
    this.opdBillTxnItem.ItemName = '';
  }

  Calculation() {
    if (!this.billingTransaction) {
      return;
    }

    this.billingTransaction.DiscountAmount = 0;
    this.billingTransaction.TaxTotal = 0;
    this.billingTransaction.TaxableAmount = 0;
    this.billingTransaction.NonTaxableAmount = 0;
    this.billingTransaction.SubTotal = 0;
    this.billingTransaction.TotalAmount = 0;
    this.billingTransaction.Tender = 0;
    this.billingTransaction.TotalQuantity = 0;

    if (this.AdditionBillItemList && this.AdditionBillItemList.length) {

      this.AdditionBillItemList.forEach(a => {
        if (a.DiscountApplicable) {
          a.DiscountAmount = (this.billingTransaction.DiscountPercent / 100) * a.GovtInsurancePrice;
        }
        else {
          a.DiscountAmount = 0;
        }
        a.TotalAmount = a.GovtInsurancePrice - a.DiscountAmount;
        this.AssignAdditionalBillItemToBillTxn(a);

      });
    }

    if (this.billingTransaction.DiscountPercent == null) { //to pass discount percent 0 when the input is null  
      this.billingTransaction.DiscountPercent = 0;
    }
    this.billingTransaction.BillingTransactionItems.forEach(billTxnItem => {
      this.billingTransaction.TotalQuantity +=
        billTxnItem.Quantity = 1;

      //no discount for health card and DiscountApplicable is false
      if (billTxnItem.ItemId != this.healthCardBillItem.ItemId && billTxnItem.DiscountApplicable != false) {
        this.billingTransaction.DiscountAmount +=
          billTxnItem.DiscountAmount = CommonFunctions.parseAmount(billTxnItem.GovtInsurancePrice * this.billingTransaction.DiscountPercent / 100);
        billTxnItem.DiscountPercent =
          billTxnItem.DiscountPercentAgg = CommonFunctions.parseAmount(this.billingTransaction.DiscountPercent);
      }

      if (billTxnItem.IsTaxApplicable) {
        this.billingTransaction.TaxTotal +=
          billTxnItem.Tax = CommonFunctions.parseAmount(((billTxnItem.GovtInsurancePrice - billTxnItem.DiscountAmount) * billTxnItem.TaxPercent) / 100);
        this.billingTransaction.TaxableAmount +=
          billTxnItem.TaxableAmount = CommonFunctions.parseAmount(billTxnItem.GovtInsurancePrice - billTxnItem.DiscountAmount);
      }
      else {
        this.billingTransaction.NonTaxableAmount +=
          billTxnItem.NonTaxableAmount = CommonFunctions.parseAmount(billTxnItem.GovtInsurancePrice - billTxnItem.DiscountAmount);
      }

      this.billingTransaction.SubTotal +=
        billTxnItem.SubTotal = CommonFunctions.parseAmount(billTxnItem.GovtInsurancePrice);
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
    let prevVisId = this.insuranceService.ParentVisitInfo.PatientVisitId;
    let patId = this.insuranceService.ParentVisitInfo.PatientId;
    debugger;
    if (prevVisId) {
      this.insuranceBLService.GetBillTxnByRequisitionId(prevVisId, patId)
        .subscribe(res => {
          if (res.Status == "OK" && res.Results) {

            Object.keys(res.Results.bill).forEach(property => {
              if (property in this.previousVisitBillingTxn) {
                this.previousVisitBillingTxn[property] = res.Results.bill[property];
              }
            });
            this.previousVisitBillingTxn.BillingTransactionItems = res.Results.billTxnItems;
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
    let itemId = this.insuranceService.ParentVisitInfo.ProviderId;
    let prevVisitOpdItem = this.previousVisitBillingTxn.BillingTransactionItems.find(a =>
      a.ServiceDepartmentName.toLowerCase() == "opd"
      || a.ServiceDepartmentName.toLowerCase() == "department opd"

    );
    if (prevVisitOpdItem) {
      this.consultationFee = CommonFunctions.parseAmount(prevVisitOpdItem.TotalAmount);//this is OPD Charge.
      this.totalWithoutConsultationCharge = CommonFunctions.parseAmount(this.previousVisitBillingTxn.TotalAmount - this.consultationFee);
      this.totalAmount = CommonFunctions.parseAmount(this.totalWithoutConsultationCharge + this.billingTransaction.TotalAmount);
      this.TobePaidorReturned = CommonFunctions.parseAmount(this.totalAmount - this.previousVisitBillingTxn.TotalAmount);

    }
  }
  GetHealthCardBillItem() {
    this.insuranceBLService.GetHealthCardBillItem().subscribe(res => {
      if (res.Status == "OK" && res.Results) {
        this.AssignHealthCardBillItemToTxnItem(res.Results);
      }
      else {
        this.msgBoxServ.showMessage('Failed', ["Unable to get health card item"]);
        console.log(res.ErrorMessage);
      }
    })
  }

  AssignHealthCardBillItemToTxnItem(healthCardBillItem: BillItemPriceVM) {
    this.healthCardBillItem.ItemId = healthCardBillItem.ItemId;
    this.healthCardBillItem.ItemName = healthCardBillItem.ItemName;
    this.healthCardBillItem.ServiceDepartmentId = healthCardBillItem.ServiceDepartmentId;
    this.healthCardBillItem.ServiceDepartmentName = healthCardBillItem.ServiceDepartmentName;//sud: this should be servicedepartmentename
    this.healthCardBillItem.Price = healthCardBillItem.Price;
    this.healthCardBillItem.GovtInsurancePrice = healthCardBillItem.Price;
    this.healthCardBillItem.IsTaxApplicable = healthCardBillItem.TaxApplicable; 
  }

  PaymentModeChanged() { 
    this.ChangesForInsuranceVisit(true);
  }

  //sud:3sept'18: Changed in logic of helthcard info.
  LoadPATHealthCardStatus(patId) {
    this.insuranceBLService.GetPatHealthCardStatus(patId)
      .subscribe(res => {
        if (res.Status == "OK") {
          //this.healthCardFound = res.Results;
          this.healthCardInfo = res.Results;
          this.healthCardFound = this.healthCardInfo.BillingDone;
        }
      });
  }
  ChangesForInsuranceVisit(IsIns) {
    this.billingTransaction.IsInsuranceBilling = IsIns;
    if (this.billingTransaction.IsInsuranceBilling) {
      this.billingTransaction.InsuranceProviderId = this.currBillingContext.Insurance.InsuranceProviderId;
      this.insuranceService.BillingFlow = "insurance"; 
      this.billingTransaction.PaymentDetails = "InsuranceName: " + this.currBillingContext.Insurance.InsuranceProviderName
        + "/" + "InsuranceNumber:" + this.currBillingContext.Insurance.InsuranceNumber;
    }
    else {
      this.billingTransaction.PaymentMode = "cash";
      this.billingTransaction.PaymentDetails = null;
      this.billingTransaction.InsuranceProviderId = null;
      this.insuranceService.BillingFlow = "normal";
    } 
  }
  LoadPatientBillingContext() {
    if (this.billingTransaction.IsInsuranceBilling) {
      this.insuranceService.isInsuranceBilling = true;
    }
    if (this.billingTransaction.PatientId) {
      this.insuranceBLService.GetPatientBillingContext(this.billingTransaction.PatientId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.currBillingContext = res.Results;
            this.insuranceService.Insurance = this.currBillingContext.Insurance;
          }
        });
    }
  }

  OnPriceCategoryChange($event) {

    this.priceCategory = $event.categoryName;
    this.opdBillTxnItem.PriceCategory = $event.categoryName;
    this.insuranceService.PriceCategory = $event.categoryName;

    if (this.visitBillItem) { 
      this.opdBillTxnItem.GovtInsurancePrice = this.GetOpdPriceByCategory(this.visitBillItem);
    }
    if (this.priceCategory) {
      this.insuranceService.TriggerBillChangedEvent({ ChangeType: "PriceCategory", PriceCategory: this.priceCategory });
    }
  }



  HandleBillChangedForFollowUp(newBill) {

    let oldDeptId = this.insuranceService.ParentVisitInfo.DepartmentId;
    let oldDoctorId = this.insuranceService.ParentVisitInfo.ProviderId;
    let newDeptId = this.insuranceService.globalVisit.DepartmentId;
    let newDoctId = this.insuranceService.globalVisit.ProviderId;
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

  ChangeTenderAmount() {
    this.billingTransaction.Change = this.billingTransaction.Tender - (this.billingTransaction.TotalAmount ? this.billingTransaction.TotalAmount : this.totalAmount);
  }

  public PaymentModeChanges($event) {
    this.billingTransaction.PaymentMode = $event.PaymentMode;
    this.billingTransaction.PaymentDetails = $event.PaymentDetails; 
    this.PaymentModeChanged();
  }

  public CreditOrganizationChanges($event) {
    this.billingTransaction.OrganizationName = $event.OrganizationName;
    this.billingTransaction.OrganizationId = $event.OrganizationId;
  }
  public IsAdditionalBillItemChange() {
    if (!this.isAdditionalBillItem) {
      this.AdditionBillItemList = [];
      this.billingTransaction.BillingTransactionItems = [];

      var billItem = this.allBillItms.find(a => a.ItemId == this.NotAddtionalBillItem.ItemId && a.ItemName == this.NotAddtionalBillItem.ItemName);
      if (billItem) {
        var itmObj = new BillingTransactionItem();
        itmObj.ItemName = billItem.ItemName;
        itmObj.ItemId = billItem.ItemId;
        itmObj.ProcedureCode = billItem.ItemId.toString();
        itmObj.ServiceDepartmentId = billItem.ServiceDepartmentId;
        itmObj.ServiceDepartmentName = billItem.ServiceDepartmentName;
        itmObj.PriceCategory = this.priceCategory; 
        itmObj.GovtInsurancePrice = billItem.GovtInsurance;
        itmObj.Price =  billItem.GovtInsurance;
        itmObj.SAARCCitizenPrice = billItem.SAARCCitizenPrice;
        itmObj.ForeignerPrice = billItem.ForeignerPrice;
        itmObj.IsTaxApplicable = billItem.TaxApplicable;
        itmObj.DiscountApplicable = billItem.DiscountApplicable;
        itmObj.PatientId = billItem.PatientId;
        itmObj.CounterId = billItem.CounterId;
        itmObj.TaxPercent = billItem.taxPercent;
        itmObj.BillingType = ENUM_BillingType.outpatient;// "outpatient";
        itmObj.VisitType = ENUM_VisitType.outpatient;// "outpatient";
        itmObj.BillStatus = this.billingTransaction.BillStatus;
        this.billingTransaction.BillingTransactionItems.push(itmObj);
      }

      //sud:15Jul'20--if doctor is not yet selected, then item list gets empty. so here we've to add default item to the list otherwise the price will not show..
      if (this.billingTransaction.BillingTransactionItems.length == 0) {
        this.billingTransaction.BillingTransactionItems.push(this.opdBillTxnItem);
      }

      this.Calculation();
      return;
    }
    if (this.AdditionalBilItems && this.AdditionalBilItems.length > 0) {      
      this.AdditionalBilItems.forEach(item => {
        if (item.DefaultForNewPatient) {
           var defaultRow = new AdditionalBillItemVMModel();
           defaultRow.ServiceDeptId = item.ServiceDeptId;
           defaultRow.ServiceDepartmentName = item.ServiceDepartmentName;
           defaultRow.ItemName = item.ItemName;
           defaultRow.ItemId = item.ItemId; 
           defaultRow.GovtInsurancePrice = item.Price;
           defaultRow.Price = item.Price;
           defaultRow.DefaultForNewPatient = item.DefaultForNewPatient;
           defaultRow.DiscountApplicable = item.DiscountApplicable;
           defaultRow.PriceChangeEnabled = item.PriceChangeEnabled;
           defaultRow.TaxApplicable = item.TaxApplicable;
           defaultRow.ItmObj = item.ItmObj;
           this.AdditionBillItemList.push(defaultRow);

          this.Calculation();
        }
        else {
          this.AddNewBillTxnItemRow();
        }

      });
      //this.Calculation();
    }
  }

  //used to format the display of item in ng-autocomplete.
  ItemNameListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }

  public deleteRow(row, index) {

    this.AdditionBillItemList.splice(index, 1);

    let indx = this.billingTransaction.BillingTransactionItems.findIndex(a => a.ItemId == row.ItemId && a.ItemName == row.ItemName);
    if (indx > -1) {
      this.billingTransaction.BillingTransactionItems.splice(indx, 1);
    }
    this.Calculation();

    if (this.AdditionBillItemList.length < 1) {
      this.isAdditionalBillItem = false;
    }
  }

  public AddNewBillTxnItemRow() {
    if (this.AdditionalBilItems.length > this.AdditionBillItemList.length) {
      let newRow: AdditionalBillItemVMModel = new AdditionalBillItemVMModel();
      newRow.DefaultForNewPatient = false;
      newRow.DiscountApplicable = false;
      newRow.ItemId = 0;
      newRow.ItemName = '';
      newRow.PriceChangeEnabled = false;
      newRow.ServiceDeptId = 0;
      newRow.TaxApplicable = false;
      newRow.ItmObj = null;
      this.AdditionBillItemList.push(newRow);
    }
    else {
      this.msgBoxServ.showMessage('Warning', ["Unable Add more rows"]);
    }
  }

  public OnPriceChange(row) {
    if (row.DiscountApplicable)
      row.DiscountAmount = (this.billingTransaction.DiscountPercent / 100) * row.GovtInsurancePrice;
    else
      row.DiscountAmount = 0;

    row.TotalAmount = row.GovtInsurancePrice - row.DiscountAmount;
    this.Calculation();

  }
  public ItemChange(row, indx) {
    var additionalItemObj = this.AdditionalBilItems.find(a => a.ItemId == row.ItmObj.ItemId && a.ItemName == row.ItmObj.ItemName);
    if (additionalItemObj) {
      if (this.AdditionBillItemList.some(a => a.ItemId == additionalItemObj.ItemId && a.ItemName == additionalItemObj.ItemName) ? true : false) {
        this.msgBoxServ.showMessage('Warning', ["Duplicate Additional bill Item"]);
      }
      else {
        row.ServiceDeptId = additionalItemObj.ServiceDeptId;
        row.ServiceDepartmentName = additionalItemObj.ServiceDepartmentName;
        row.ItemId = additionalItemObj.ItemId;
        row.ItemName = additionalItemObj.ItemName; 
        row.GovtInsurancePrice = additionalItemObj.GovtInsurancePrice;
        row.DiscountApplicable = additionalItemObj.DiscountApplicable;
        row.DefaultForNewPatient = additionalItemObj.DefaultForNewPatient;
        row.PriceChangeEnabled = additionalItemObj.PriceChangeEnabled;
        row.TaxApplicable = additionalItemObj.TaxApplicable;
      }
    }
    else {
      row.ItemId = null;
      row.ItemName = null;
      row.ServiceDeptId = null;
      row.ItmObj = null;
      row.Price = 0;
      row.GovtInsurancePrice = 0;
      row.TotalAmount = 0;
      row.DiscountAmount = 0;


    }
    this.Calculation();
  }


  public AssignAdditionalBillItemToBillTxn(row: AdditionalBillItemVMModel) {
    if (row.ItemId && row.ItemName && (this.billingTransaction.BillingTransactionItems.some(a => a.ItemId == row.ItemId && a.ItemName == row.ItemName) ? false : true)) {
      let billItem = new BillingTransactionItem();
      billItem.ServiceDepartmentId = row.ServiceDeptId;
      billItem.ServiceDepartmentName = row.ServiceDepartmentName;
      billItem.ItemName = row.ItemName;
      billItem.ItemId = row.ItemId;
      billItem.Price = row.GovtInsurancePrice;
      billItem.GovtInsurancePrice = row.GovtInsurancePrice;
      billItem.SAARCCitizenPrice = 0;
      billItem.ForeignerPrice = 0;
      billItem.IsTaxApplicable = row.TaxApplicable;
      billItem.DiscountApplicable = row.DiscountApplicable;
      billItem.PatientId = this.billingTransaction.PatientId;
      billItem.CounterId = this.billingTransaction.CounterId;
      billItem.TaxPercent = this.insuranceService.taxPercent;
      billItem.BillingType = ENUM_BillingType.outpatient;// "outpatient";
      billItem.VisitType = ENUM_VisitType.outpatient;// "outpatient";
      billItem.BillStatus = this.billingTransaction.BillStatus;
      billItem.ProviderId = this.opdBillTxnItem.ProviderId;
      billItem.ProviderName = this.opdBillTxnItem.ProviderName;
      billItem.RequestedBy = this.opdBillTxnItem.RequestedBy;
      billItem.RequestedByName = this.opdBillTxnItem.RequestedByName;
      this.billingTransaction.BillingTransactionItems.push(billItem);
    }
  }

  public GetBillingItems() {
    this.allBillItms = this.insuranceService.allBillItemsPriceList;
  }
}
class AdditionalBillItemVMModel {
  public ServiceDeptId: number = 0;
  public ServiceDepartmentName: string = '';
  public ItemId: number = 0;
  public ItemName: string = '';
  public Price: number = 0;
  public DiscountAmount: number = 0;
  public TotalAmount: number = 0;
  //public SubTotal: number = 0;
  public DiscountApplicable: boolean = false;
  public PriceChangeEnabled: boolean = true;
  public TaxApplicable: boolean = false;
  public DefaultForNewPatient: boolean = false;
  public GovtInsurancePrice: number = 0;
  public ItmObj = { ItemId: 0, ItemName: null };
}
