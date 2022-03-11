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


import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from "@angular/core";
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
import { BillItemPriceModel } from "../../settings-new/shared/bill-item-price.model";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Visit } from "../shared/visit.model";
import { Console } from "@angular/core/src/console";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { PatientBillingContextVM } from "../../billing/shared/patient-billing-context-vm";
import { CreditOrganization } from "../../settings-new/shared/creditOrganization.model";
import { BillingBLService } from '../../billing/shared/billing.bl.service';
import { Subscription } from 'rxjs';
import { ENUM_VisitType, ENUM_BillingType, ENUM_BillingStatus } from "../../shared/shared-enums";
import { BillItemPriceVM } from "../../billing/shared/billing-view-models";
import { RouteFromService } from "../../shared/routefrom.service";
import { AppointmentService } from "../shared/appointment.service";
import { Membership } from "../../settings-new/shared/membership.model";

@Component({
  selector: "visit-billing-info",
  templateUrl: "./visit-billing-info.html"
})
export class VisitBillingInfoComponent implements OnInit {

  public billChangedSubscription: Subscription;

  @Input("billing-transaction")
  public billingTransaction: BillingTransaction;

  public visitBillItem: VisitBillItemVM;
  public allBillItms: Array<any> = [];//pratik: 13july2020

  public previousVisitBillingTxn: BillingTransaction = null;
  public previousVisitDetail: Visit;
  //public additionalBillItems: Array<BillingTransactionItem> = [];

  public healthCardFound: boolean = false;
  public enableHealthCard: boolean = false;//hom:5Mar'19--to parameterize healthcard from Core_Parameters.
  //sud: 3sept'18: new variable to get card info first and it'll assigned to above healthCardFound variable later on. 
  public healthCardInfo = { BillingDone: true, CardPrinted: false };
  public currBillingContext: PatientBillingContextVM = new PatientBillingContextVM();
  //ramavatar: 20aug'18
  public opdBillTxnItem: BillingTransactionItem = new BillingTransactionItem();
  public healthCardBillItem: BillingTransactionItem = new BillingTransactionItem();
  public isAdditionalBillItem: boolean = false;//pratik: 24June2020: bind with Additional BillItem checkbox
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

  public IsCountryIdLoaded: boolean = false;//pratik:13Nov'19
  //public TenderChange: number = 0;

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
    ShowProviderName: false,
    ItmObj: { ItemId: 33, ItemName: "OPD Card Charge" }
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
    ShowProviderName: false,
    ItmObj: { ItemId: 34, ItemName: "Health Card" }
  }];

  //Yubraj 1st July 2019
  //public enabledPriceCategories = { Normal: false, EHS: false, SAARCCitizen: false, Foreigner: false, GovtInsurance: false };


  public AdditionBillItemList: Array<AdditionalBillItemVMModel> = [];
  public NotAddtionalBillItem = { ItemId: 0, ItemName: null };
  public ShowAdditionalBillItem: boolean = false;

  constructor(public billingService: BillingService,
    public securityService: SecurityService,
    public visitService: VisitService,
    public visitBLService: VisitBLService,
    public coreService: CoreService,
    public msgBoxServ: MessageboxService,
    public BillingBLService: BillingBLService,
    public routeFromService: RouteFromService,
    public appointmentService: AppointmentService,
    public changeDetectorRef: ChangeDetectorRef) {

    this.InitializeSubscriptions();
    this.GetShowAdditionalBillItemParameter();

    this.GetBillingItems();
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
  public DisableDiscountPercent: boolean = false;
  public MembershipTypeName: string = null;

  public InitializeSubscriptions() {
    //Billing component is subscribing to NeedBillRecalculation event of Visit Service,
    //Patient and Doctor selection will trigger that event.
    this.billChangedSubscription = this.visitService.ObserveBillChanged.subscribe(
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

            if (newBill) {
              //show membershipname as remarks when discountpercent>0
              if (newBill.DiscountPercent && newBill.DiscountPercent > 0) {
                this.billingTransaction.Remarks = newBill.MembershipTypeName;
                //this.MembershipTypeName = newBill.MembershipTypeName;
                //this.billingTransaction.BillingTransactionItems.forEach(a => {
                //  a.DiscountSchemeId = newBill.MembershipTypeId;
                //});
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
            this.visitBillItem = this.deptOpdItems.find(d => d.DepartmentId == selDept.DepartmentId);
            this.ResetOpdBillTxnItem();
            this.AssignVisitBillItemToTxn(this.visitBillItem);
            if (this.visitBillItem) {
              this.AssignVisitBillItemToTxn(this.visitBillItem);

              this.NotAddtionalBillItem = { ItemId: this.visitBillItem.ItemId, ItemName: this.visitBillItem.ItemName };
            }
          }
          else if (newBill.ChangeType == "Referral") {
            if (this.opdBillTxnItem)
              this.opdBillTxnItem.RequestedBy = newBill.ReferredBy;
          }

          this.Calculation();
        }

      });
  }


  ngOnInit() {

    //this.InitializeSubscriptions();

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
                  let patVisitList: Array<any> = res.Results;
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


    if (this.billingTransaction.PatientId) {
      this.LoadPATHealthCardStatus(this.billingTransaction.PatientId);
    }


    //this.GetAdditionalItems();
    this.LoadPatientBillingContext();



    //don't check for health card if it's followup appointment. 
    if (this.visitService.appointmentType.toLowerCase() != "followup") {
      //this.enableHealthCard = this.coreService.GetEnableHealthCard();
      //this.SetCountryPriceCategory();
      //get healthcard info only if it is enabled.
      //if (this.enableHealthCard) {
      //  this.GetHealthCardBillItem();
      //}
      this.AdditionalBilItems = [];
      let additionaBillItem = this.coreService.Parameters.find(p => p.ParameterGroupName == "Appointment" && p.ParameterName == "AdditionalBillItem");

      if (additionaBillItem && additionaBillItem.ParameterValue) {

        var addbillitm = JSON.parse(additionaBillItem.ParameterValue);
        addbillitm.forEach(a => {
          // var billitm = this.allBillItms.find(b => b.ItemName.trim().toLowerCase() == a.ItemName.trim().toLowerCase());
          var billitm = this.allBillItms.find(b => b.ServiceDepartmentId == a.ServiceDeptId && b.ItemId == a.ItemId);
          if (billitm) {
            var itmobj = new AdditionalBillItemVMModel();
            itmobj.ItemName = billitm.ItemName;
            itmobj.ItemId = billitm.ItemId;
            itmobj.ServiceDepartmentName = billitm.ServiceDepartmentName;
            itmobj.ServiceDeptId = billitm.ServiceDepartmentId;
            itmobj.Price = billitm.Price;
            //itmobj.TotalAmount = billitm.;
            //itmobj.DiscountAmount = billitm.DiscountAmount;
            itmobj.DiscountApplicable = a.DiscountApplicable;
            itmobj.DefaultForNewPatient = a.DefaultForNewPatient;
            itmobj.PriceChangeEnabled = a.PriceChangeEnabled;
            itmobj.TaxApplicable = a.TaxApplicable;
            itmobj.DefaultForNewPatient = a.DefaultForNewPatient;
            itmobj.ShowProviderName = a.ShowProviderName;
            itmobj.ItmObj = { ItemId: billitm.ItemId, ItemName: billitm.ItemName }
            this.AdditionalBilItems.push(itmobj);
          }
        });
        let patId = this.visitService.globalVisit.PatientId;
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

    //by the time it reaches here, appointmentservice would already be disabled.
    if (this.routeFromService && this.routeFromService.RouteFrom && this.routeFromService.RouteFrom == "appointment") {
      this.routeFromService.RouteFrom = "";
      let apptDocId: number = this.appointmentService.globalAppointment.ProviderId;
      if (apptDocId) {
        this.visitService.TriggerBillChangedEvent({ ChangeType: "Doctor", SelectedDoctor: { ProviderId: apptDocId } });
      }
    }

    //this.visitService.TriggerBillChangedEvent({ ChangeType: "Doctor", SelectedDoctor: this.selectedDoctor });

  }
  //Yubraj 16th May '19: Setting CountryId and Price based on home country, SAARC countries and Foreigner
  SetCountryPriceCategory() {
    //pratik:14Nov'19--we need to run changedetector in order to change price category based on country. 
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

  //GetAdditionalItems() {
  //  this.visitBLService.GetAdditionalBillingItems()
  //    .subscribe(res => {
  //      if (res.Status == "OK" && res.Results) {
  //        this.MapAndAddAdditionalItems(res.Results);
  //      }
  //      else {
  //        this.msgBoxServ.showMessage("failed", ["Not able to load additional item's list."]);
  //        console.log(res.ErrorMessage);
  //      }
  //    });
  //}

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

  //public MapAndAddAdditionalItems(itemList) {
  //  if (itemList) {
  //    this.additionalBillItems = [];
  //    itemList.forEach(item => {
  //      var billItem = new BillingTransactionItem();
  //      billItem.ServiceDepartmentId = item.ServiceDepartmentId;
  //      billItem.ServiceDepartmentName = item.ServiceDepartmentName;
  //      billItem.ItemName = item.ItemName;
  //      billItem.ItemId = item.ItemId;
  //      billItem.Price = item.ItemPrice;
  //      billItem.SAARCCitizenPrice = item.SAARCCitizenPrice;
  //      billItem.ForeignerPrice = item.ForeignerPrice;
  //      billItem.IsTaxApplicable = item.IsTaxApplicable;
  //      billItem.PatientId = this.billingTransaction.PatientId;
  //      billItem.CounterId = this.billingTransaction.CounterId;
  //      billItem.TaxPercent = this.billingService.taxPercent;
  //      billItem.BillingType = ENUM_BillingType.outpatient;// "outpatient";
  //      billItem.VisitType = ENUM_VisitType.outpatient;// "outpatient";
  //      billItem.BillStatus = this.billingTransaction.BillStatus;
  //      this.additionalBillItems.push(billItem);
  //    });
  //  }
  //}

  //public CheckAndAddAdditionalItems() {
  //  if (this.visitBillItem.HasAdditionalBillingItems) {
  //    this.additionalBillItems.forEach(item => {
  //      item.ProviderId = this.visitBillItem.ProviderId;
  //      item.ProviderName = this.visitBillItem.ProviderName;
  //      this.billingTransaction.BillingTransactionItems.push(item);
  //    });
  //    this.Calculation();
  //  }
  //  else {
  //    this.billingTransaction.BillingTransactionItems = [];
  //    this.billingTransaction.BillingTransactionItems.push(this.opdBillTxnItem);
  //    //this.IssueHealthCardOnChange();
  //  }
  //}

  public InitializeAndPushBillingTransactionItems() {
    this.opdBillTxnItem.PatientId =
      this.healthCardBillItem.PatientId = this.billingTransaction.PatientId;
    this.opdBillTxnItem.CounterId =
      this.healthCardBillItem.CounterId = this.billingTransaction.CounterId;
    this.opdBillTxnItem.TaxPercent =
      this.healthCardBillItem.TaxPercent = this.billingService.taxPercent;
    //this.opdBillTxnItem.ServiceDepartmentName = "OPD";//this will  come from server side, no need to assign it here.. 
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
    this.opdBillTxnItem.IsZeroPriceAllowed = billItem.IsZeroPriceAllowed;//sud:7Apr'21--needed for immunization and other depts where price could be zero.
    //this.Calculation();
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
          this.opdBillTxnItem.InsForeignerPrice = 0;
        }
      }
    }
    else {
      this.opdBillTxnItem.Price = this.GetOpdPriceByCategory(billItem);
    }
    this.opdBillTxnItem.IsTaxApplicable = billItem.IsTaxApplicable;
    //this.CheckAndAddAdditionalItems();
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
    else if (this.priceCategory == "InsForeigner") {
      price = docBillItem.InsForeignerPrice;
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
    this.opdBillTxnItem.InsForeignerPrice = 0;
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
          a.DiscountAmount = (this.billingTransaction.DiscountPercent / 100) * a.Price;
        }
        else {
          a.DiscountAmount = 0;
        }
        a.TotalAmount = a.Price - a.DiscountAmount;

        this.AssignAdditionalBillItemToBillTxn(a);


        //let indx = this.billingTransaction.BillingTransactionItems.findIndex(b => (a.ItemId != b.ItemId && a.ItemName != b.ItemName)
        //  && (b.ItemId != this.NotAddtionalBillItem.ItemId && b.ItemName != this.NotAddtionalBillItem.ItemName));
        //if (indx > -1) {
        //  this.billingTransaction.BillingTransactionItems.splice(indx, 1);
        //}
      });
    }

    if (this.billingTransaction.DiscountPercent == null) { //to pass discount percent 0 when the input is null --yub 30th Aug '18
      this.billingTransaction.DiscountPercent = 0;
    }
    this.billingTransaction.BillingTransactionItems.forEach(billTxnItem => {
      this.billingTransaction.TotalQuantity +=
        billTxnItem.Quantity = 1;

      //no discount for health card and DiscountApplicable is false
      if (billTxnItem.ItemId != this.healthCardBillItem.ItemId && billTxnItem.DiscountApplicable != false) {
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
    debugger;
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
  //IssueHealthCardOnChange() {

  //  if (this.issueHealthCard) {
  //    this.billingTransaction.BillingTransactionItems.push(this.healthCardBillItem);
  //  }
  //  else if (!this.issueHealthCard) {
  //    this.billingTransaction.BillingTransactionItems = this.billingTransaction.BillingTransactionItems.filter(billItem => billItem.ItemId != this.healthCardBillItem.ItemId);
  //  }
  //  if (this.healthCardFound && this.issueHealthCard) {
  //    this.msgBoxServ.showMessage("notice-message", ["Health card was already added for this patient."])
  //  }
  //  this.Calculation();

  //}

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

  AssignHealthCardBillItemToTxnItem(healthCardBillItem: BillItemPriceVM) {
    this.healthCardBillItem.ItemId = healthCardBillItem.ItemId;
    this.healthCardBillItem.ItemName = healthCardBillItem.ItemName;
    this.healthCardBillItem.ServiceDepartmentId = healthCardBillItem.ServiceDepartmentId;
    this.healthCardBillItem.ServiceDepartmentName = healthCardBillItem.ServiceDepartmentName;//sud: this should be servicedepartmentename
    this.healthCardBillItem.Price = healthCardBillItem.Price;
    this.healthCardBillItem.IsTaxApplicable = healthCardBillItem.TaxApplicable;
    if (!this.billingTransaction.PatientId) {
      //this.issueHealthCard = true;
      //this.issueHealthCard
      // this.IssueHealthCardOnChange();
    }

  }

  PaymentModeChanged() {
    this.billingTransaction.BillStatus =
      this.opdBillTxnItem.BillStatus =
      this.healthCardBillItem.BillStatus = this.billingTransaction.BillStatus =
      this.billingTransaction.PaymentMode == "credit" ? ENUM_BillingStatus.unpaid : ENUM_BillingStatus.paid; //  "unpaid" : "paid";
    this.billingTransaction.Tender = 0;//tender is zero and is disabled in when credit
    this.billingTransaction.Change = 0;

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

  OnPriceCategoryChange($event) {
    //this.opdBillTxnItem.PriceCategory = this.priceCategory;
    //this.visitService.PriceCategory = this.priceCategory;
    this.priceCategory = $event.categoryName;
    this.opdBillTxnItem.PriceCategory = $event.categoryName;
    this.visitService.PriceCategory = $event.categoryName;

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
      //this.AssignVisitBillItemToTxn(this.visitBillItem)
      //let indx = this.billingTransaction.BillingTransactionItems.findIndex(a => a.ItemId != this.NotAddtionalBillItem.ItemId && a.ItemName != this.NotAddtionalBillItem.ItemName);
      //if (indx > -1) {
      //  this.billingTransaction.BillingTransactionItems.splice(indx, 1);
      //}

      var billItem = this.allBillItms.find(a => a.ItemId == this.NotAddtionalBillItem.ItemId && a.ItemName == this.NotAddtionalBillItem.ItemName);
      if (billItem) {
        var itmObj = new BillingTransactionItem();
        itmObj.ItemName = billItem.ItemName;
        itmObj.ItemId = billItem.ItemId;
        itmObj.ProcedureCode = billItem.ItemId.toString();
        itmObj.ServiceDepartmentId = billItem.ServiceDepartmentId;
        itmObj.ServiceDepartmentName = billItem.ServiceDepartmentName;
        itmObj.PriceCategory = this.priceCategory;
        itmObj.Price = billItem.Price;
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
        itmObj.IsZeroPriceAllowed = billItem.IsZeroPriceAllowed;
        itmObj.ProviderId = this.opdBillTxnItem ? this.opdBillTxnItem.ProviderId : null;
        itmObj.ProviderName = this.opdBillTxnItem ? this.opdBillTxnItem.ProviderName : null;
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
          defaultRow.Price = item.Price;
          defaultRow.DefaultForNewPatient = item.DefaultForNewPatient;
          defaultRow.DiscountApplicable = item.DiscountApplicable;
          defaultRow.PriceChangeEnabled = item.PriceChangeEnabled;
          defaultRow.TaxApplicable = item.TaxApplicable;
          defaultRow.ItmObj = item.ItmObj;
          defaultRow.ShowProviderName = item.ShowProviderName;
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
      row.DiscountAmount = (this.billingTransaction.DiscountPercent / 100) * row.Price;
    else
      row.DiscountAmount = 0;

    row.TotalAmount = row.Price - row.DiscountAmount;

    var itm = this.billingTransaction.BillingTransactionItems.find(a => a.ItemId == row.ItemId && a.ItemName == row.ItemName);
    itm.DiscountAmount = row.DiscountAmount;
    itm.DiscountPercent = this.billingTransaction.DiscountPercent
    itm.Price = row.Price;
    itm.SubTotal = itm.Quantity * row.Price;
    itm.TotalAmount = row.TotalAmount;


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
        row.Price = additionalItemObj.Price;
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
      billItem.Price = row.Price;
      billItem.SAARCCitizenPrice = 0;
      billItem.ForeignerPrice = 0;
      billItem.IsTaxApplicable = row.TaxApplicable;
      billItem.DiscountApplicable = row.DiscountApplicable;
      billItem.PatientId = this.billingTransaction.PatientId;
      billItem.CounterId = this.billingTransaction.CounterId;
      billItem.TaxPercent = this.billingService.taxPercent;
      billItem.BillingType = ENUM_BillingType.outpatient;// "outpatient";
      billItem.VisitType = ENUM_VisitType.outpatient;// "outpatient";
      billItem.BillStatus = this.billingTransaction.BillStatus;

      billItem.ShowProviderName = row.ShowProviderName;
      if (billItem.ShowProviderName) {
        billItem.ProviderId = this.opdBillTxnItem ? this.opdBillTxnItem.ProviderId : null;
        billItem.ProviderName = this.opdBillTxnItem ? this.opdBillTxnItem.ProviderName : null;
      }

      billItem.RequestedBy = this.opdBillTxnItem.RequestedBy;
      billItem.RequestedByName = this.opdBillTxnItem.RequestedByName;
      this.billingTransaction.BillingTransactionItems.push(billItem);
    } else {

      this.billingTransaction.BillingTransactionItems.forEach(a => {
        if (a.ShowProviderName) {
          a.ProviderId = this.opdBillTxnItem.ProviderId;
          a.ProviderName = this.opdBillTxnItem.ProviderName;
        }
      });
    }
  }

  public GetBillingItems() {
    this.allBillItms = this.visitService.allBillItemsPriceList;
  }

  SetFocusById(IdToBeFocused: string) {
    window.setTimeout(function () {
      let elemToFocus = document.getElementById(IdToBeFocused)
      if (elemToFocus != null && elemToFocus != undefined) {
        elemToFocus.focus();
      }
    }, 100);
  }

  public GetShowAdditionalBillItemParameter() {
    var show = this.coreService.Parameters.find((val) =>
      val.ParameterName == "ShowAdditionalBillItemCheckBox" &&
      val.ParameterGroupName == "Visit"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        this.ShowAdditionalBillItem = true;
      } else {
        this.ShowAdditionalBillItem = false;
      }
    } else {
      return false;
    }
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
  public ShowProviderName: boolean = false;

  public ItmObj = { ItemId: 0, ItemName: null };
}
