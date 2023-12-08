import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { Router } from "@angular/router";
import { CoreService } from "../../../core/shared/core.service";
import { Patient } from "../../../patients/shared/patient.model";
import { PatientService } from "../../../patients/shared/patient.service";
import { CancelStatusHoldingModel, DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_IntegrationNames, ENUM_MessageBox_Status, ENUM_OrderStatus, ENUM_ProvisionalBillingContext, ENUM_ServiceBillingContext } from "../../../shared/shared-enums";
import { BillingMasterBlService } from "../../shared/billing-master.bl.service";
import { BillingTransactionItem } from "../../shared/billing-transaction-item.model";
import { BillingBLService } from "../../shared/billing.bl.service";
import { BillingService } from "../../shared/billing.service";
import { DiscardProvisionalItems_DTO } from "../../shared/dto/bill-discard-provisional-items.dto";
import { ServiceItemDetails_DTO } from "../../shared/dto/service-item-details.dto";

@Component({
  selector: 'provisional-items',
  templateUrl: './bil-provisional-items.component.html'
})
export class ProvisionalItemsViewDetailsComponent {

  @Input('patientVisitId')
  public PatientVisitId: number = null;

  @Input('selected-provisional-context')
  public SelectedProvisionalContext = { PatientId: null, SchemeId: null, PriceCategoryId: null, PatientVisitId: null, ProvisionalBillingContext: null };
  @Input("provisional-discharged-on")
  public ProvisionalDischargedOn: string = "";
  @Input("deposit-balance")
  public DepositBalance: number = 0;

  @Output('provisionalItemsCallBack')
  public ProvisionalItemsCallBack = new EventEmitter<object>();
  // EnableNewItemAddInProvisionalForOp: boolean = false;
  // EnablePartialProvBillForOp: boolean = false;
  public SelectedItem: any = null;
  public UniqueItemNames: Array<any> = [];//for searching.

  public SelectAllItems: boolean = false;
  public ShowActionPanel: boolean = false;
  public SelectedItemsSubTotal: number = 0;
  public SelectedItemsTotalDiscAmount: number = 0;
  public SelectedItemsTotAmount: number = 0;
  loading: boolean = false;
  showPatBillHistory: boolean = false;
  public patBillHistory = {
    IsLoaded: false,
    PatientId: null,
    CreditAmount: null,
    ProvisionalAmt: null,
    TotalDue: null,
    DepositBalance: null,
    BalanceAmount: null
  };
  public model = {
    PharmacyProvisionalAmount: 0,
    SubTotal: 0,
    TotalDiscount: 0,
    TaxAmount: 0,
    NetTotal: 0,
    TotalAmount: 0,
    ToBePaid: 0,
    ToBeRefund: 0,
    PayType: "cash",
    PaymentDetails: null,
    Remarks: null,
  };
  admissionDetail: any;
  showCancelSummaryPanel: boolean = false;
  cancelledItems: any;
  ShowEditItemsPopup: boolean = false;
  discountApplicable: boolean = false;
  SelectedItemForEdit = new BillingTransactionItem();;
  DoctorsList: Array<any> = [];
  patientDetails = new Patient();
  showInpatientMessage: boolean = false;
  public ShowUpdateItemsPopup: boolean = false;
  public ItemsToUpdate = new Array<BillingTransactionItem>();
  ShowNewItemsPopup: boolean = false;
  counterId: number = null;
  public ServiceItems = new Array<ServiceItemDetails_DTO>();
  currBillingContext: any;
  public PatientProvisionalItems = new Array<BillingTransactionItem>();
  public FilteredPendingItems = new Array<BillingTransactionItem>();
  public OverallCancellationRule: any;
  public IsCancelRuleEnabled: boolean;
  public BillingCancellationRule = new CancelStatusHoldingModel();
  public ProvisionalDischargeListConfigs = { EnableEditItems: false, EnablePartialClearance: false, EnableAddNewItem: false, EnableDiscardAllItem: false };
  public OutpatientProvisionalClearanceConfigs = { EnableEditItems: false, EnablePartialClearance: false, EnableAddNewItem: false };
  public SchemePriceCategory = { SchemeId: null, PriceCategoryId: null };
  public IsProvisionalDischarge: boolean = false;
  public DiscardAllConfirmation: boolean = false;
  public ConfirmationTitle: string = "Confirm !";
  public ConfirmationMessage: string = `Are you sure you want to Discard All Items?${'\n'} This will clear all the Provisional Items of a patient. ${'\n'}This action cannot be undone.`;
  public DiscardProvisionalItems = new DiscardProvisionalItems_DTO();
  public OutpatientProvisionalContext: string = ENUM_ProvisionalBillingContext.Outpatient;
  public ShowEstimationBill: boolean = false;
  constructor(
    public billingService: BillingService,
    public patientService: PatientService,
    private _billingBlService: BillingBLService,
    private _msgBoxService: MessageboxService,
    private _coreService: CoreService,
    private _changeDetector: ChangeDetectorRef,
    private _billingMasterBlService: BillingMasterBlService,
    private _router: Router) {

  }


  ngOnInit(): void {
    if (this.SelectedProvisionalContext.PatientId && this.SelectedProvisionalContext.SchemeId) {
      const patientId = this.SelectedProvisionalContext.PatientId;
      const schemeId = this.SelectedProvisionalContext.SchemeId;
      const priceCategoryId = this.SelectedProvisionalContext.PriceCategoryId;
      const patientVisitId = this.SelectedProvisionalContext.PatientVisitId;
      this.GetServiceItemsBySchemeIdAndPriceCategoryId(ENUM_ServiceBillingContext.OpBilling, schemeId, priceCategoryId);
      this.SetBillingParameters();
      if (this.SelectedProvisionalContext.ProvisionalBillingContext === ENUM_ProvisionalBillingContext.Outpatient) {
        this.IsProvisionalDischarge = false;
        this.GetOutpatientPatientProvisionalItems(patientId, schemeId);
      } else {
        this.IsProvisionalDischarge = true;
        this.GetProvisionalDischargeItems(patientId, schemeId, patientVisitId);
      }
      this.SelectAllItems = true;
      this.SetDoctorsList();
    }
  }

  SetBillingParameters() {
    if (this.SelectedProvisionalContext.ProvisionalBillingContext === ENUM_ProvisionalBillingContext.Outpatient) {
      let param = this._coreService.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "OutpatientProvisionalClearanceConfigs");
      if (param) {
        const paramValue = JSON.parse(param.ParameterValue);
        this.OutpatientProvisionalClearanceConfigs = paramValue;
      }

      this.OverallCancellationRule = this._coreService.GetOpBillCancellationRule();
      if (this.OverallCancellationRule && this.OverallCancellationRule.Enable) {
        this.IsCancelRuleEnabled = this.OverallCancellationRule.Enable;
        this.BillingCancellationRule.labStatus = this.OverallCancellationRule.LabItemsInBilling;
        this.BillingCancellationRule.radiologyStatus = this.OverallCancellationRule.ImagingItemsInBilling;
      }
    } else {
      let param = this._coreService.Parameters.find(p => p.ParameterGroupName === "Billing" && p.ParameterName === "ProvisionalDischargeListConfigs");
      if (param) {
        const paramValue = JSON.parse(param.ParameterValue);
        this.ProvisionalDischargeListConfigs = paramValue;
      }
    }
  }

  GetServiceItemsBySchemeIdAndPriceCategoryId(serviceBillingContext: string, schemeId: number, priceCategoryId: number): void {
    this._billingMasterBlService.GetServiceItems(serviceBillingContext, schemeId, priceCategoryId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length > 0) {
          this.ServiceItems = res.Results;
          this._billingMasterBlService.ServiceItemsForProvisionalClearance = res.Results;
          if (this.SelectedProvisionalContext.ProvisionalBillingContext !== ENUM_ProvisionalBillingContext.Outpatient) {
            const nonLabOpdAndRadServiceItems = this.ServiceItems.filter(itm => itm.IntegrationName !== null ? (itm.IntegrationName.toLowerCase() !== ENUM_IntegrationNames.LAB.toLowerCase() && itm.IntegrationName.toLowerCase() !== ENUM_IntegrationNames.Radiology.toLowerCase() && itm.IntegrationName.toLowerCase() && itm.IntegrationName.toLowerCase() !== ENUM_IntegrationNames.OPD.toLowerCase()) : itm.IntegrationName === itm.IntegrationName);
            this.ServiceItems = nonLabOpdAndRadServiceItems;
            this.ServiceItems = this.ServiceItems.slice();
          }
        } else {
          this.ServiceItems = new Array<ServiceItemDetails_DTO>();
          console.log("This priceCategory does not have Service Items mapped.");
        }
      },
        err => {
          console.log(err);
        }
      );
  }
  GetProvisionalDischargeItems(patientId: number, schemeId: number, patientVisitId: number): void {
    this._billingBlService.GetProvisionalDischargeItems(patientId, schemeId, patientVisitId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results) {
            if (res.Results.Patient) {
              res.Results.Patient.CountrySubDivisionName = res.Results.Patient.CountrySubDivision.CountrySubDivisionName
            }
            this.patientService.globalPatient = res.Results.Patient;
            this.PatientProvisionalItems = res.Results.ProvisionalItems;
            this.FilteredPendingItems = this.PatientProvisionalItems;
            this.patientDetails = this.patientService.globalPatient;
            this.SelectAllChkOnChange();
            this.GetItemsForSearchDDL(this.PatientProvisionalItems);
          } else {
            this._msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Couldn't load Provisional Details of this Patient. Please try again."]);
          }
        }
        else {
          this._msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Couldn't load Provisional Details of this Patient. Please try again."]);
          this.BackToGrid();
        }
      });
  }

  GetOutpatientPatientProvisionalItems(patientId: number, schemeId: number, printProvisional: boolean = false): void {
    this._billingBlService.GetProvisionalItemsByPatientId(patientId, schemeId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results) {
            this.patientService.globalPatient = res.Results.Patient;
            this.PatientProvisionalItems = res.Results.ProvisionalItems;
            this.FilteredPendingItems = this.PatientProvisionalItems;
            this.patientDetails = this.patientService.globalPatient;
            this.SelectAllChkOnChange();
            this.GetItemsForSearchDDL(this.PatientProvisionalItems);
          } else {
            this._msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Couldn't load Provisional Details of this Patient. Please try again."]);
          }
        }
        else {
          this._msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Couldn't load Provisional Details of this Patient. Please try again."]);
          this.BackToGrid();
        }
      });
  }
  BackToGrid(): void {
    this.ProvisionalItemsCallBack.emit({ "Close": true });
    this.patientDetails = new Patient();
    this.patientService.globalPatient = this.patientDetails;

  }

  SelectAllChkOnChange() {
    if (this.PatientProvisionalItems && this.PatientProvisionalItems.length) {
      if (this.SelectAllItems) {
        this.PatientProvisionalItems.forEach(itm => {
          itm.IsSelected = true;
        });
        this.ShowActionPanel = true;
      }
      else {
        this.PatientProvisionalItems.forEach(itm => {
          itm.IsSelected = false;
        });
        this.ShowActionPanel = false;
      }
    }
    this.CalculationForAll();
  }

  CalculationForAll() {
    //reset global variables to zero before starting the calculation.
    this.SelectedItemsTotAmount = 0;
    this.SelectedItemsSubTotal = 0;
    this.SelectedItemsTotalDiscAmount = 0;
    let itemsInfo = this.FilteredPendingItems;
    let subTotal: number = 0;
    let totAmount: number = 0;
    let discAmt: number = 0;
    this.FilteredPendingItems.forEach(itm => {
      if (itm.IsSelected) {
        if (!this.ShowActionPanel) {
          this.ShowActionPanel = true;
        }
        this.SelectedItemsSubTotal += itm.SubTotal ? itm.SubTotal : 0;
        this.SelectedItemsTotalDiscAmount += itm.DiscountAmount ? itm.DiscountAmount : 0;
        this.SelectedItemsTotAmount += itm.TotalAmount ? itm.TotalAmount : 0;
      }
    });
    this.SelectedItemsTotAmount = CommonFunctions.parseAmount(this.SelectedItemsTotAmount);
    this.SelectedItemsSubTotal = CommonFunctions.parseAmount(this.SelectedItemsSubTotal);
    this.SelectedItemsTotalDiscAmount = CommonFunctions.parseAmount(this.SelectedItemsTotalDiscAmount);
    if (itemsInfo && itemsInfo.length > 0) {
      itemsInfo.forEach(itm => {
        let itemDiscount = itm.DiscountAmount;
        itm.TotalAmount = itm.SubTotal - itemDiscount;

        subTotal += (itm.SubTotal ? itm.SubTotal : 0);
        totAmount += (itm.TotalAmount ? itm.TotalAmount : 0);

        discAmt += (itm.DiscountAmount ? itm.DiscountAmount : 0);

        itm.DiscountPercentAgg = (itm.DiscountAmount / itm.SubTotal) * 100;

        itm.TaxableAmount = itm.IsTaxApplicable ? (itm.SubTotal - itm.DiscountAmount) : 0;
        itm.NonTaxableAmount = itm.IsTaxApplicable ? 0 : (itm.SubTotal - itm.DiscountAmount);
      });

      this.model.SubTotal = CommonFunctions.parseAmount(subTotal);
      this.model.TotalAmount = CommonFunctions.parseAmount(totAmount);
      this.model.TotalDiscount = CommonFunctions.parseAmount(discAmt);
    }
    else {
      this.model.SubTotal = 0;
      this.model.TotalAmount = 0;
      this.model.TotalDiscount = 0;
    }
  }

  SelectUnselectItem() {
    if (this.PatientProvisionalItems.every(a => a.IsSelected == true)) {
      this.SelectAllItems = true;
    } else {
      this.SelectAllItems = false;
      this.ShowActionPanel = false;
    }
    this.CalculationForAll();
  }

  GetItemsForSearchDDL(itemsInfo: Array<BillingTransactionItem>) {
    let allItems = itemsInfo.map(itm => {
      return itm.ItemName;
    });

    let uniqueItems = CommonFunctions.GetUniqueItemsFromArray(allItems);

    this.UniqueItemNames = uniqueItems.map(itm => {
      return { ItemName: itm }
    });
  }
  UpdateItems(items: Array<BillingTransactionItem> = null) {
    if (items) {
      this.ItemsToUpdate = items.map(a => Object.assign({}, a));
    }
    else {
      this.ItemsToUpdate = this.PatientProvisionalItems.map(a => Object.assign({}, a));
    }
    this.ItemsToUpdate = this.ItemsToUpdate.sort((itemA: BillingTransactionItem, itemB: BillingTransactionItem) => {
      if (itemA.Price > itemB.Price) return 1;
      if (itemA.Price < itemB.Price) return -1;
    });
    this.ItemsToUpdate.map(item => item.IsSelected = false);
    this.ShowUpdateItemsPopup = true;
  }
  NewItemBtn_Click() {
    this.ShowNewItemsPopup = false;
    this.SchemePriceCategory.SchemeId = this.SelectedProvisionalContext.SchemeId;
    this.SchemePriceCategory.PriceCategoryId = this.SelectedProvisionalContext.PriceCategoryId;
    this._changeDetector.detectChanges();
    this.ShowNewItemsPopup = true;
  }

  ItemValueChanged() {
    if (this.SelectedItem && this.SelectedItem.ItemName) {
      this.FilteredPendingItems = this.PatientProvisionalItems.filter(itm => itm.ItemName == this.SelectedItem.ItemName);
    }
    else {
      this.FilteredPendingItems = this.PatientProvisionalItems;
    }
    this.CalculationForAll();
  }

  SearchItemsListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }




  EditItemBtnOnClick(txnItem: BillingTransactionItem) {
    if (!this.OutpatientProvisionalClearanceConfigs.EnableEditItems && !this.ProvisionalDischargeListConfigs.EnableEditItems) {
      return;
    }
    this.SelectedItemForEdit = txnItem;

    this.SelectedItemForEdit.SrvDeptIntegrationName = this.SelectedItemForEdit.ServiceDepartment.IntegrationName;
    this.SelectedItemForEdit.AllowCancellation = true;
    if (this.SelectedItemForEdit.OrderStatus == null) {
      this.SelectedItemForEdit.OrderStatus = ENUM_OrderStatus.Active;
    }
    if (this.IsCancelRuleEnabled && this.SelectedItemForEdit.SrvDeptIntegrationName) {
      if ((this.SelectedItemForEdit.SrvDeptIntegrationName.toLowerCase() === ENUM_IntegrationNames.LAB.toLowerCase() && !this.BillingCancellationRule.labStatus.includes(this.SelectedItemForEdit.OrderStatus))
        || (this.SelectedItemForEdit.SrvDeptIntegrationName.toLowerCase() === ENUM_IntegrationNames.Radiology.toLowerCase() && !this.BillingCancellationRule.radiologyStatus.includes(this.SelectedItemForEdit.OrderStatus))) {
        this.SelectedItemForEdit.AllowCancellation = false;
      }
    }
    this.ShowEditItemsPopup = true;
  }

  SetDoctorsList() {
    //doctorslist is available in billingservice.. reuse it..
    this.DoctorsList = this.billingService.GetDoctorsListForBilling();
    let Obj = new Object();
    Obj["EmployeeId"] = null;
    Obj["FullName"] = "SELF";
    this.DoctorsList.push(Obj);

  }

  PayAll() {
    //changed: 4May-anish
    // if (this.currBillingContext.BillingType.toLowerCase() == ENUM_BillingType.inpatient) {
    //   this.showInpatientMessage = true;
    //   return;
    // }
    // if (this.HasZeroPriceItems()) {
    //   return;
    // }
    let billingTransaction = this.billingService.CreateNewGlobalBillingTransaction();
    this.PatientProvisionalItems[0].PatientId = this.SelectedProvisionalContext.PatientId;
    billingTransaction.PatientId = this.SelectedProvisionalContext.PatientId;
    billingTransaction.IsProvisionalDischargeCleared = this.SelectAllItems;

    //added: ashim: 20Aug2018
    billingTransaction.PatientVisitId = this.SelectedProvisionalContext.PatientVisitId;
    this.PatientProvisionalItems.forEach(bil => {
      //push only selected items for pay-all
      if (bil.IsSelected) {
        let curBilTxnItm = BillingTransactionItem.GetClone(bil);
        //let item = this.ServiceItems.find(a => a.ServiceItemId == curBilTxnItm.ServiceItemId && a.ServiceDepartmentId == curBilTxnItm.ServiceDepartmentId);
        billingTransaction.BillingTransactionItems.push(curBilTxnItm);
        //if (item)
        //curBilTxnItm.IsTaxApplicable = item.TaxApplicable;

        //if (bil.DiscountSchemeId not in distinct)
        //distinct.push(array[i].age)

      }

    });
    const arr = billingTransaction.BillingTransactionItems.map(p => p.DiscountSchemeId);
    const s = new Set(arr); //  a set removes duplications, but it's still a set
    const unique2 = Array.from(s); // use Array.from to transform a set into an array

    if (unique2 && unique2.length > 1) {
      this._msgBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Provisional billing was done using Multiple Schemes. Please change to the correct one during Final Invoice."]);
    }

    //if (this.currBillingContext.BillingType.toLowerCase() == ENUM_BillingType.inpatient)
    //   this.routeFromService.RouteFrom = "inpatient";
    // this.router.navigate(['/Billing/BillingTransactionItem']);
    if (this.SelectedProvisionalContext.ProvisionalBillingContext === ENUM_ProvisionalBillingContext.ProvisionalDischarge) {
      this.billingService.IsProvisionalDischargeClearance = true;
    } else {
      this.billingService.IsProvisionalDischargeClearance = false;
    }
    this._router.navigate(['/Billing/PayProvisional']);
  }

  CloseItemEditWindow($event) {
    this.ShowEditItemsPopup = false;
    if ($event && ($event.EventName === "update" || $event.EventName === "cancelled")) {
      if (this.SelectedProvisionalContext.ProvisionalBillingContext === ENUM_ProvisionalBillingContext.Outpatient) {
        this.GetOutpatientPatientProvisionalItems(this.SelectedProvisionalContext.PatientId, this.SelectedProvisionalContext.SchemeId);
      } else {
        this.GetProvisionalDischargeItems(this.SelectedProvisionalContext.PatientId, this.SelectedProvisionalContext.SchemeId, this.SelectedProvisionalContext.PatientVisitId);
      }
    }
  }
  CloseUpdatePricePopup($event) {
    if ($event && $event.modifiedItems) {
      if (this.SelectedProvisionalContext.ProvisionalBillingContext === ENUM_ProvisionalBillingContext.Outpatient) {
        this.GetOutpatientPatientProvisionalItems(this.SelectedProvisionalContext.PatientId, this.SelectedProvisionalContext.SchemeId);
      } else {
        this.GetProvisionalDischargeItems(this.SelectedProvisionalContext.PatientId, this.SelectedProvisionalContext.SchemeId, this.SelectedProvisionalContext.PatientVisitId);
      }
    }
    this.ShowUpdateItemsPopup = false;
  }
  CloseNewItemAdd($event): void {
    //action are either: save or close. we don't have to load provisional item when it's only close.
    if ($event && $event.action === "save") {
      if (this.SelectedProvisionalContext.ProvisionalBillingContext === ENUM_ProvisionalBillingContext.Outpatient) {
        this.GetOutpatientPatientProvisionalItems(this.SelectedProvisionalContext.PatientId, this.SelectedProvisionalContext.SchemeId);
      } else {
        this.GetProvisionalDischargeItems(this.SelectedProvisionalContext.PatientId, this.SelectedProvisionalContext.SchemeId, this.SelectedProvisionalContext.PatientVisitId);
      }
    }

    this.ShowNewItemsPopup = false;
  }

  ShowDiscardAllConfirmation(): void {
    this.DiscardAllConfirmation = true;
  }
  DiscardAll(): void {
    if (this.DiscardProvisionalItems) {
      if (this.DiscardProvisionalItems.DiscardRemarks && this.DiscardProvisionalItems.DiscardRemarks.trim().length > 0) {
        this._billingBlService.DiscardProvisionalItems(this.DiscardProvisionalItems).subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
            this._msgBoxService.showMessage(ENUM_MessageBox_Status.Success, [res.Results]);
            this.DiscardAllConfirmation = false;
            this.BackToGrid();
          } else {
            this._msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, [`Something went wrong, Cannot Discard Items!`]);
          }
        }, err => {
          console.error(err);
        });
      } else {
        this._msgBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Discard Remarks is mandatory!`]);
      }
    } else {
      this._msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, [`Something went wrong, Cannot Discard Items!`]);
    }
  }

  GetEstimationBill(): void {
    this.ShowEstimationBill = true;
  }

  CloseEstimationPopup(): void {
    this.ShowEstimationBill = false;
  }
  HandleConfirm() {
    this.loading = true;
    this.DiscardProvisionalItems.PatientVisitId = this.SelectedProvisionalContext.PatientVisitId;
    this.DiscardProvisionalItems.PatientId = this.SelectedProvisionalContext.PatientId;
    this.DiscardAll();
  }

  HandleCancel() {
    console.info("Discard All Items Cancelled");
  }
}
