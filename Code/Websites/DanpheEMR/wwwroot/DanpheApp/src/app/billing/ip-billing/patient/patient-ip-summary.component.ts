import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core'
import { DLService } from '../../../shared/dl.service';
import { DanpheHTTPResponse, CancelStatusHoldingModel } from '../../../shared/common-models';
import * as moment from 'moment/moment';
import { BillingTransactionItem } from '../../shared/billing-transaction-item.model';
import { CommonFunctions } from '../../../shared/common.functions';
import { PatientService } from '../../../patients/shared/patient.service';
import { BillingTransaction } from '../../shared/billing-transaction.model';
import { BillingService } from '../../shared/billing.service';
import { BillingBLService } from '../../shared/billing.bl.service';
import { PatientsBLService } from "../../../patients/shared/patients.bl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../../security/shared/security.service';
import { DischargeDetailBillingVM, BedDetailVM, BedDurationTxnDetailsVM } from '../shared/discharge-bill.view.models';
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { CoreService } from "../../../core/shared/core.service"
import { Patient } from '../../../patients/shared/patient.model';
import { CreditOrganization } from '../../../settings-new/shared/creditOrganization.model';
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { ENUM_InvoiceType, ENUM_OrderStatusNumber } from '../../../shared/shared-enums';
import { ENUM_OrderStatus } from '../../../shared/shared-enums';
import { Membership } from '../../../settings-new/shared/membership.model';
import { BillingDeposit } from '../../shared/billing-deposit.model';
import { Router } from '@angular/router';
import { RouteFromService } from '../../../shared/routefrom.service';
import { IpBillingDiscountModel } from '../../shared/ip-bill-discount.model';
@Component({
  selector: 'pat-ip-bill-summary',
  templateUrl: "./patient-ip-summary.html",
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PatientIpSummaryComponent {

  @Output("on-summary-closed")
  public onClose = new EventEmitter<object>();

  @Input("patientId")
  public patientId: number = 0;

  @Input("ipVisitId")
  public ipVisitId: number = 0;

  public patAllPendingItems: Array<BillingTransactionItem> = [];

  public allItemslist: Array<any> = []; //Yubraj 30th July '19 //All Billing Lists

  public admissionInfo: any = null;
  public billingTransaction: BillingTransaction;
  public showIpBillRequest: boolean = false;
  public showDischargeBill: boolean = false;
  public showEstimationBill: boolean = false;

  public showUpdatePricePopup: boolean = false;
  public billType: string;
  public dischargeDetail: DischargeDetailBillingVM = new DischargeDetailBillingVM();
  //Is updated once the billing transaction is post during discharge patient.
  //public billingTxnId: number;
  public billStatus: string;
  public adtItems: BillingTransactionItem;
  public hasPreviousCredit: boolean = false;
  public showCreditBillAlert: boolean = false;
  public showCancelAdmissionAlert: boolean = false;
  public validDischargeDate: boolean = true;
  public checkouttimeparameter: string;
  public exchangeRate: number = 0;

  public IsCheckoutParameter: boolean = false;
  //create a new model to assign global variables and bind to html
  public model = {
    PharmacyProvisionalAmount: 0,
    SubTotal: 0,
    DiscountAmount: 0,
    DiscountPercent: 0,
    TaxAmount: 0,
    NetTotal: 0,
    DepositAdded: 0,
    DepositReturned: 0,
    DepositBalance: 0,
    TotalAmount: 0,
    TotalAmountInUSD: 0,
    ToBePaid: 0,
    ToBeRefund: 0,
    PayType: "cash",
    Tender: 0,
    Change: 0,
    PaymentDetails: null,
    Remarks: null,
    OrganizationId: null,
    IsItemDiscountEnabled:  false
  };
  public patientInfo: Patient;
  public showDischargePopUpBox: boolean = false;
  public showEditItemsPopup: boolean = false;
  public doctorsList: Array<any> = [];
  // public UsersList: Array<any> = [];//to view who has added that particular item.//sud: 30Apr'20-- not needed anymore. Use EmpList if required..
  public selItemForEdit: BillingTransactionItem = new BillingTransactionItem();

  public showDepositPopUp: boolean = false;
  public bedDetails: Array<BedDetailVM> = [];
  public bedDurationDetails: Array<BedDurationTxnDetailsVM>;
  public totalAdmittedDays: number = 0;
  public estimatedDischargeDate: string;

  public estimatedDiscountPercent: number = 0;

  public CreditOrganizationMandatory: boolean = false;

  public loading: boolean = false; //yub 27th Nov '18 :: Avoiding double click whild loading

  public isAllItemsSelected: boolean = true;  //yubraj: 28th Nov '18
  /*    public groupDiscountPercent: number = 0;*/  //yubraj: 28th Nov '18
  public discountGroupItems: Array<BillingTransactionItem> = [];
  public updatedItems: Array<BillingTransactionItem> = [];
  public showGroupDiscountPopUp: boolean = false; //yubraj: 28th Nov '18

  public hasZeroItemPrice: boolean = false;
  public itemsToModify: Array<BillingTransactionItem> = [];
  public creditOrganizationsList: Array<CreditOrganization> = new Array<CreditOrganization>(); //yubraj:22nd April 2019 Credit Organization
  public discountApplicable: boolean = false; //Yubraj 30th July

  public IPBillItemGridCol: Array<any> = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();


  public OrderStatusSettingB4Discharge: any = null;
  public allowDischarge: boolean = true;
  public ShowOrderStatusInfo: boolean = false;
  public billingDischargeRule: CancelStatusHoldingModel = new CancelStatusHoldingModel();
  public OrderStatusRestrictedItems: Array<BillingTransactionItem> = [];


  //Anish: 14 Aug, 2020 added for conditional cancellation based upon the OrdreStatus
  public overallCancellationRule: any;
  public billingCancellationRule: CancelStatusHoldingModel = new CancelStatusHoldingModel();
  public isCancelRuleEnabled: boolean;

  public cancellationNumber: number = 0;

  public MembershipTypeId: number = 0;
  public MembershipTypeName: string = null;
  public membershipSchemeParam = { ShowCommunity: false, IsMandatory: true };
  public deposit: BillingDeposit = new BillingDeposit();
  public showDepositReceipt: boolean = false;
  public ShowMembershipSelect: boolean = false;
  public InvalidDiscount:boolean = false;
  public CreditTotal: number = 0;
  public intervalId:any;
  public currMembershipDiscountPercent : number = 0;
  public isGroupDiscountApplied : boolean = false;
  public ipBillingDiscountModel: IpBillingDiscountModel = new IpBillingDiscountModel();
  public ItemLevelDiscountSettings = {"ItemLevelDiscount" : false};
  public enableItemLevelDiscount : boolean = false;

  constructor(public dlService: DLService,
    public patService: PatientService,
    public changeDetector: ChangeDetectorRef,
    public billingService: BillingService,
    public billingBLService: BillingBLService,
    public msgBoxServ: MessageboxService,
    public npCalendarService: NepaliCalendarService,
    public CoreService: CoreService,
    public patientBLServie: PatientsBLService,
    public router: Router,
    public securityService: SecurityService,
    public routeFromService:RouteFromService) {

    this.SetAutoBedAndAutoBillItemParameters();//sud:07Oct'20--to make common place for this param.

    this.allItemslist = this.billingService.allBillItemsPriceList;//sud:30Apr'20--code optimization
    this.allEmployeeList = this.billingService.AllEmpListForBilling; //sud:30Apr'20--code optimization
    this.creditOrganizationsList = this.billingService.AllCreditOrganizationsList;//sud:30Apr'20--code optimization

    this.SetDoctorsList();//sud:2May'20--code optimization
    //this.setCheckOutParameter();
    this.LoadMembershipSettings();

    this.CreditOrganizationMandatory = this.CoreService.LoadCreditOrganizationMandatory();//pratik: 26feb'20 --Credit Organization compulsoryor not while Payment Mode is credit

    this.IPBillItemGridCol = GridColumnSettings.IPBillItemGridCol;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CreatedOn', true));

    this.overallCancellationRule = this.CoreService.GetIpBillCancellationRule();
    if (this.overallCancellationRule && this.overallCancellationRule.Enable) {
      this.isCancelRuleEnabled = this.overallCancellationRule.Enable;
      this.billingCancellationRule.labStatus = this.overallCancellationRule.LabItemsInBilling;
      this.billingCancellationRule.radiologyStatus = this.overallCancellationRule.ImagingItemsInBilling;
    }
    this.LoadItemLevelSettngs();

  }


  //this is the expected format of the autobed parameter..
  public autoBedBillParam = { DoAutoAddBillingItems: false, DoAutoAddBedItem: false, ItemList: [] };

  SetAutoBedAndAutoBillItemParameters() {
    var param = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "AutoAddBillingItems");
    if (param && param.ParameterValue) {
      this.autoBedBillParam = JSON.parse(param.ParameterValue);
    }
  }


  // setCheckOutParameter() {
  //   var param = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "CheckoutTime");
  //   if (param) {
  //     this.checkouttimeparameter = param.ParameterValue;
  //   }
  // }

  public LoadMembershipSettings() {
    var currParam = this.CoreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "MembershipSchemeSettings");
    if (currParam && currParam.ParameterValue) {
      this.membershipSchemeParam = JSON.parse(currParam.ParameterValue);
    }
  }

  //This is to get the ItemLevelDiscount settings //Krishna,20JAN'22..
  public LoadItemLevelSettngs(){
    let currParam = this.CoreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "IPBillingDiscountSettings");
    if(currParam && currParam.ParameterValue){
      this.ItemLevelDiscountSettings = JSON.parse(currParam.ParameterValue);
    }
  }
 
  public ItemLevelCheckBoxChanged($event:any){
    $event ? this.enableItemLevelDiscount = true : this.enableItemLevelDiscount = false;
    // if(this.enableItemLevelDiscount){
    //   this.CalculationForAll();
    // }
    this.model.DiscountPercent = this.currMembershipDiscountPercent;
  }
  //Krishna, 19thJAN'22, This saves the Discount Scheme and Discount percent When Scheme is changed
  public SaveDiscountState(){
    this.ipBillingDiscountModel.PatientVisitId = this.ipVisitId;
    this.ipBillingDiscountModel.ProvisionalDiscPercent = this.model.DiscountPercent;
    this.billingBLService.UpdateDiscount(this.ipBillingDiscountModel).subscribe(
      res =>{
        if (res.Status == "OK" && res.Results) {
          this.getPatientDetails();
          console.log(res.Results);
        }else{
          console.log(res.ErrorMessage);
          
        }
      }
    );

  }

  OnMembershipChanged($event: Membership) {
    if ($event) {
      this.MembershipTypeId = $event.MembershipTypeId;
      this.isGroupDiscountApplied = false;
      this.currMembershipDiscountPercent = $event.DiscountPercent;
      this.model.DiscountPercent = $event.DiscountPercent;
      this.model.DiscountAmount = (this.model.DiscountPercent * this.model.SubTotal) / 100;
      this.model.TotalAmount = this.model.SubTotal - this.model.DiscountAmount;

      this.MembershipTypeName = $event.MembershipTypeName;
      if (this.MembershipTypeName && this.MembershipTypeName != 'General') {
        this.model.Remarks = $event.MembershipTypeName;
      }
      else {
        this.model.Remarks = null;
      }
      this.ipBillingDiscountModel.DiscountSchemeId = $event.MembershipTypeId;

      this.SaveDiscountState();
      //this.InvoiceDiscountOnChange();
      if(this.patientInfo.Admissions[0].IsItemDiscountEnabled && this.patientInfo.Admissions[0].DiscountSchemeId == $event.MembershipTypeId){
        this.CalculationForAll();
      }else{
        this.InvoiceDiscountOnChange();
      }
    }
    else {
      // this.model.MembershipTypeId = null;
      this.model.DiscountPercent = 0;
      this.model.Remarks = null;
    }
  }

  ngOnInit() {
    if (this.patientId && this.ipVisitId) {
      this.bedDurationDetails = [];
      this.getPatientDetails();

      this.CoreService.loading = true;
      if (this.autoBedBillParam.DoAutoAddBedItem) {
        this.UpdateBedDuration();
      }
      else {
        this.LoadPatientBillingSummary(this.patientId, this.ipVisitId);
      }

      this.CheckCreditBill(this.patientId);
      this.GetPharmacyProvisionalBalance();
      this.intervalId = setInterval(()=>{
        this.dischargeDetail.DischargeDate =  moment().format('YYYY-MM-DDTHH:mm:ss');
      },1000)

      this.OrderStatusSettingB4Discharge = this.CoreService.GetIpBillOrderStatusSettingB4Discharge();
      if (this.OrderStatusSettingB4Discharge) {
        this.billingDischargeRule.labStatus = this.OrderStatusSettingB4Discharge.RestrictOnLabStatusArr;
        this.billingDischargeRule.radiologyStatus = this.OrderStatusSettingB4Discharge.RestrictOnRadiologyStatusArr;
      }
    }
  }

  ngOnDestroy(){
    if(this.intervalId){
      clearInterval(this.intervalId);
    }
  }
  
  getPatientDetails() {
    this.patientBLServie.GetPatientById(this.patientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.patientInfo = res.Results;
          this.patService.globalPatient = res.Results;
          this.MembershipTypeId = res.Results.Admissions[0].DiscountSchemeId;
          
          if(this.patientInfo.Admissions[0].IsItemDiscountEnabled){
            this.enableItemLevelDiscount = true;
            this.ipBillingDiscountModel.IsItemDiscountEnabled = true;
          }else{
            this.enableItemLevelDiscount = false;
            this.ipBillingDiscountModel.IsItemDiscountEnabled = false;
          }
        }
      });
  }

  LoadPatientBillingSummary(patientId: number, patientVisitId: number) {
    this.dlService.Read("/api/IpBilling?reqType=pat-pending-items&patientId=" + this.patientId + "&ipVisitId=" + this.ipVisitId)
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK" && res.Results) {
          this.admissionInfo = res.Results.AdmissionInfo;
          //console.log(this.admissionInfo)
          this.admissionInfo.AdmittedOn = this.admissionInfo.AdmittedOn;
          this.admissionInfo.DischargedOn = moment(this.admissionInfo.DischargedOn).format('YYYY-MM-DDTHH:mm:ss');
          this.patAllPendingItems = res.Results.PendingBillItems;

          // //add CreatedByObj and ModifiedByObj for grid. These property are created right here and will be used only in this page.
          this.UpdateEmployeeObjects_OfBilTxnItems_ForGrid(this.patAllPendingItems);


          this.bedDetails = res.Results.AdmissionInfo.BedDetails;

          //sud: 11May'21--to recalculate deposit amounts
          if (this.admissionInfo) {
            this.model.DepositBalance = ((this.admissionInfo.DepositAdded || 0) - (this.admissionInfo.DepositReturned || 0));
            //this.model.DepositAdded = CommonFunctions.parseAmount(admInfo.DepositAdded);
            //this.model.DepositReturned = CommonFunctions.parseAmount(admInfo.DepositReturned);
            this.MembershipTypeId = this.admissionInfo.MembershipTypeId;
          }
          //this.model.DepositBalance = CommonFunctions.parseAmount((this.model.DepositAdded || 0) - (this.model.DepositReturned || 0));



          //this.calculateAdmittedDays();
          this.CalculationForAll();
          this.HasZeroPriceItems();

          this.CalculateTotalDays();
          this.ShowMembershipSelect = true;
          this.CoreService.loading = false;
        }
        else {
          this.msgBoxServ.showMessage("failed", [" Unable to get bill summary."]);
          console.log(res.ErrorMessage);
          this.CoreService.loading = false;
        }
      });
  }
  //Hom 17 Jan'19
  HasZeroPriceItems(): boolean {
    this.patAllPendingItems.forEach(a => {
      var pendingItems = this.allItemslist.find(b => a.ItemId == b.ItemId && a.ServiceDepartmentId == b.ServiceDepartmentId);
      if (pendingItems) {
        a.IsDoctorMandatory = pendingItems.IsDoctorMandatory;
        a.IsZeroPriceAllowed = pendingItems.IsZeroPriceAllowed;
      }
    });

    var items = this.patAllPendingItems.filter(a => (a.Price == 0 && !a.IsZeroPriceAllowed) || (a.IsDoctorMandatory == true && !a.ProviderId));
    if (items && items.length) {
      this.UpdateItems(items);
      //this.msgBoxServ.showMessage("Warning!", ["Some of the items has price 0. Please update."]);
      let messArr = [];
      if (items.find(a => a.Price == 0 && !a.IsZeroPriceAllowed)) {
        messArr.push("Some of the items has price 0. Please update.");
      }
      if (items.find(a => a.IsDoctorMandatory == true && !a.ProviderId)) {
        messArr.push("Assigned Doctor is mandatory in some of items. Please update.");
      }

      this.msgBoxServ.showMessage("Warning!", messArr);
      return true;
    }
  }

  CheckCreditBill(patientId: number) {
    this.hasPreviousCredit = false;
    this.showCreditBillAlert = false;
    this.dlService.Read("/api/Billing?reqType=check-credit-bill&patientId=" + this.patientId)
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.hasPreviousCredit = res.Results;
          if(this.hasPreviousCredit){
            this.LoadCreditInformationOfPatient(patientId);
          }
        }
      });
  }

  LoadCreditInformationOfPatient(patientId: number){
    this.dlService.Read("/api/Billing/LoadCreditInfo?patientId=" + this.patientId)
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
         this.CreditTotal = res.Results;
        }
      });
  }

  GetPharmacyProvisionalBalance() {
    this.dlService.Read("/api/GetPatCrDetail/" + this.patientId + "/null/null/null")
      .map(res => res)
      .subscribe(res => {
        if (res) {
          this.model.PharmacyProvisionalAmount = res.TotalAmount;
        }
      });
  }


  BackToPatientListGrid() {
    this.onClose.emit();
    this.patService.CreateNewGlobal();
  }

  ClosePatientSummary(showConfirmAlert = true) {
    if (showConfirmAlert) {
      //we need to be sure if the user wants to close the window.
      let sure = window.confirm("are you sure you want to Cancel ?");
      if (sure) {
        this.onClose.emit({ CloseWindow: true });
      }
    }
    else {
      this.onClose.emit({ CloseWindow: true });
    }

  }

  CloseGroupDiscountPopup($event) {
    this.showGroupDiscountPopUp = false;
    //all the items gets return in above event from groupdiscount component.
    //so reassign to pending items, and then do calculation for all..
    if ($event) {
      this.patAllPendingItems = $event;
      this.isGroupDiscountApplied = true;
      //reassign createdby and updated by objects..
      this.UpdateEmployeeObjects_OfBilTxnItems_ForGrid(this.patAllPendingItems);
      this.CalculationForAll();
      this.patAllPendingItems = this.patAllPendingItems.slice();//to refresh the array. needed for grid.
    }

  }

  ConfirmDischarge() {
    if (this.model.Tender < this.model.ToBePaid && this.model.PayType != "credit") {
      this.msgBoxServ.showMessage("failed", ["Tender  must be greater or equal to Total amount"]);
      return;
    }

    var currDate = moment().format('YYYY-MM-DD HH:mm');
    var disDate = moment(this.dischargeDetail.DischargeDate).format('YYYY-MM-DD HH:mm');
    var AdmissionDate = moment(this.admissionInfo.AdmittedOn).format('YYYY-MM-DD HH:mm');
    if ((moment(currDate).isBefore(disDate))) {
      this.validDischargeDate = false;
      this.msgBoxServ.showMessage("notice", ["Invalid can't enter future date"]);
      return;
    }
    if ((moment(disDate).isBefore(AdmissionDate))) {
      this.validDischargeDate = false;
      this.msgBoxServ.showMessage("Notice", ["Invalid can't discharge patient before admission date."]);
      return;
    }

    if (this.patAllPendingItems && this.patAllPendingItems.length) {//&& this.model.Tender >= this.model.ToBePaid
      if (!this.validDischargeDate) {
        return;
      }

      this.allowDischarge = this.CheckDischargeRule();
      if (!this.allowDischarge) {
        this.ShowOrderStatusInfo = true;
      }
      else {
        this.ShowOrderStatusInfo = false;
      }

      if (this.model.PayType == "credit" && this.CreditOrganizationMandatory && !this.model.OrganizationId) {
        this.msgBoxServ.showMessage("failed", ["Credit Organization is mandatory for credit bill"]);
      }
      else if ((this.model.PayType == "credit" || this.model.DiscountPercent > 0) && !this.model.Remarks) {
        this.msgBoxServ.showMessage("failed", [" Remarks is mandatory."]);
      }
      else {
        let sure = true;
        if (this.model.PayType == "credit")
          sure = window.confirm("Are you sure to discharge this patient on CREDIT?");
        if (sure) {
          this.showCreditBillAlert = this.hasPreviousCredit;

          if (this.ShowOrderStatusInfo && !this.allowDischarge) {
            this.showDischargePopUpBox = false;
          }
          else {
            this.showDischargePopUpBox = true;
          }
        }
      }
    }

    else {
      this.showCancelAdmissionAlert = true;
    }

  }
  //to check whether pharmacy charge is cleared or not : 2019/1/25
  PostBillAndDischargePatientPharmacyCharge() {

    if (this.model.PharmacyProvisionalAmount > 0) {
      let discharge: boolean = true;
      let discharge_msg = "NOTE !!! Pharmacy charge of " + this.CoreService.currencyUnit + this.model.PharmacyProvisionalAmount + " Remaining. Are you sure to discharge?";
      discharge = window.confirm(discharge_msg);
      if (discharge) {
        this.PostBillAndDischargePatient();
      }
    }
    else
      this.PostBillAndDischargePatient();
  }

  PostBillAndDischargePatient() {
    if (this.HasZeroPriceItems()) {
      return;
    }
    var currDate = moment().format('YYYY-MM-DD HH:mm');
    var disDate = moment(this.dischargeDetail.DischargeDate).format('YYYY-MM-DD HH:mm');
    var AdmissionDate = moment(this.admissionInfo.AdmittedOn).format('YYYY-MM-DD HH:mm');
    if ((moment(currDate).isBefore(disDate))) {
      this.validDischargeDate = false;
      this.msgBoxServ.showMessage("notice", ["Invalid can't enter future date"]);
      return;
    }
    if ((moment(disDate).isBefore(AdmissionDate))) {
      this.validDischargeDate = false;
      this.msgBoxServ.showMessage("notice", ["Invalid can't discharge patient before admission date."]);
      return;
    }

    this.loading = true;
    this.dischargeDetail.PatientVisitId = this.ipVisitId;
    this.showDischargePopUpBox = false;
    this.billType = "invoice";
    this.billStatus = "";
    this.PostBillingTransaction();

  }


  ProceedDischargeWithZeroItems() {
    let currDate = moment().format('YYYY-MM-DD');
    let disDate = moment(this.dischargeDetail.DischargeDate).format('YYYY-MM-DD');
    if ((moment(currDate) < moment(disDate))) {
      this.msgBoxServ.showMessage("notice", ["Invalid can't enter future date"]);
      return;
    }

    if (this.dischargeDetail && this.dischargeDetail.Remarks) {
      this.loading = true;
      let data = {
        "PatientVisitId": this.ipVisitId,
        "PatientId": this.patientId,
        "DischargeDate": this.dischargeDetail.DischargeDate,
        "CounterId": this.securityService.getLoggedInCounter().CounterId,
        "DepositBalance": this.model.DepositBalance,
        "DischargeRemarks": this.dischargeDetail.Remarks,
        "DiscountSchemeId": this.MembershipTypeId,
        "DischargeFrom": "billing"
      };
      this.billingBLService.DischargePatientWithZeroItem(data)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.showCancelAdmissionAlert = false;
            if ((res.Results.DepositId > 0)) {
              this.deposit = res.Results;
              this.deposit.PatientName = this.patService.getGlobal().ShortName;
              this.deposit.PatientCode = this.patService.getGlobal().PatientCode;
              this.deposit.Address = this.patService.getGlobal().Address;
              this.deposit.PhoneNumber = this.patService.getGlobal().PhoneNumber;
              this.showDepositReceipt = true;
            } else {
              this.BackToPatientListGrid();
            }
            this.loading = false;
            this.msgBoxServ.showMessage("success", ["Patient discharge successfully."]);
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Patient discharge failed."]);
            console.log(res.ErrorMessage);
            this.loading = false;
          }
        });
    } else {
      this.msgBoxServ.showMessage("failed", ["Discharge Remarks is mandatory."]);
      this.loading = false;
    }
  }

  CloseDepositReceipt($event?: any) {
    this.BackToPatientListGrid();
  }

  CloseZeroItemBillingPopUp() {
    this.showCancelAdmissionAlert = false;
    this.loading = false;
    this.dischargeDetail.Remarks = null;
  }

  CloseRecieptView() {
    this.showDischargeBill = false;
    this.showEstimationBill = false;
    if (this.billType == "invoice") {
      this.ClosePatientSummary(false);
    }
  }

  NewItemBtn_Click() {
    this.showIpBillRequest = false;
    this.changeDetector.detectChanges();
    this.showIpBillRequest = true;
  }

  CloseNewItemAdd($event) {
    if ($event && $event.newItems) {

      $event.newItems.forEach(billItem => {
        this.patAllPendingItems.push(billItem);
      });

      //reassign CreatedByObj and ModifiedByObj of pending items. it's needed in grid.
      this.UpdateEmployeeObjects_OfBilTxnItems_ForGrid(this.patAllPendingItems);

      this.patAllPendingItems = this.patAllPendingItems.slice();
    }
    this.patAllPendingItems.forEach(itm => {
      if(itm.DiscountPercent == 0){
        itm.DiscountPercent = this.currMembershipDiscountPercent;
        //itm.DiscountPercentAgg = this.model.DiscountPercent ? this.model.DiscountPercent : 0;
        itm.DiscountAmount = (itm.SubTotal * itm.DiscountPercent) / 100;
        itm.DiscountSchemeId = this.MembershipTypeId;
      }
    });
    this.CalculationForAll();
    // this.InvoiceDiscountOnChange();
    this.showIpBillRequest = false;
  }

  AddDepositBtn_Click() {
    this.patService.globalPatient.PatientId = this.patientId;
    this.showDepositPopUp = true;
  }
  //Hom 17 Jan'19
  UpdateItems(items: Array<BillingTransactionItem> = null) {
    if (items) {
      this.updatedItems = items.map(a => Object.assign({}, a));
    }
    else {
      this.updatedItems = this.patAllPendingItems.map(a => Object.assign({}, a));
    }
    this.updatedItems = this.updatedItems.sort((itemA: BillingTransactionItem, itemB: BillingTransactionItem) => {
      if (itemA.Price > itemB.Price) return 1;
      if (itemA.Price < itemB.Price) return -1;
    });
    this.updatedItems.forEach(item => item.IsSelected = false);
    this.showUpdatePricePopup = true;
  }

  //yubraj: 28th Nov '18
  GroupDiscountBtn_Click() {
    // this.groupDiscountPercent = null;
    // this.discountGroupItems = this.patAllPendingItems.map(a => Object.assign({}, a));
    // this.discountGroupItems.forEach(item => item.IsSelected = true);
    this.showGroupDiscountPopUp = true;
  }

  CalculationForAll() {

    let admInfo = this.admissionInfo;
    let itemsInfo = this.patAllPendingItems;
    let discountPercent = this.patAllPendingItems[0] ? this.patAllPendingItems[0].DiscountPercent : 0;
    let subTotal: number = 0;
    let totAmount: number = 0;
    let discAmt: number = 0;
    if (itemsInfo && itemsInfo.length > 0) {
      itemsInfo.forEach(itm => {
        itm.DiscountAmount = itm.SubTotal * (itm.DiscountPercent / 100);
        itm.TotalAmount = itm.SubTotal - itm.DiscountAmount;
        //let invoiceDiscount = itm.TotalAmount * (this.estimatedDiscountPercent / 100);
        // let invoiceDiscount = itm.SubTotal * (itm.DiscountPercent / 100);
        // itm.TotalAmount = itm.SubTotal - (invoiceDiscount ? invoiceDiscount : 0);
        // itm.DiscountAmount = itemDiscount + (invoiceDiscount ? invoiceDiscount : 0);

        // subTotal += (itm.SubTotal ? itm.SubTotal : 0);
        // totAmount += (itm.TotalAmount ? itm.TotalAmount : 0);

        // discAmt += (itm.DiscountAmount ? itm.DiscountAmount : 0);

        // itm.DiscountPercentAgg = (itm.DiscountAmount / itm.SubTotal) * 100;

        subTotal += (itm.SubTotal ? itm.SubTotal : 0);
        totAmount += (itm.TotalAmount ? itm.TotalAmount : 0);
        discAmt += (itm.DiscountAmount ? itm.DiscountAmount : 0);


        itm.TaxableAmount = itm.IsTaxApplicable ? (itm.SubTotal - itm.DiscountAmount) : 0;
        itm.NonTaxableAmount = itm.IsTaxApplicable ? 0 : (itm.SubTotal - itm.DiscountAmount);
      })
      let overallSubTot = itemsInfo.reduce(function (acc, itm) { return acc + itm.SubTotal; }, 0);
      let overallDiscAmt = itemsInfo.reduce(function (acc, itm) { return acc + itm.DiscountAmount; }, 0);
      discountPercent = CommonFunctions.parseAmount(overallDiscAmt*100/overallSubTot,3);
      this.model.DiscountPercent = discountPercent;
      this.estimatedDiscountPercent = this.model.DiscountPercent;
      this.model.SubTotal = subTotal; //CommonFunctions.parseAmount();
      this.model.TotalAmount = totAmount; //CommonFunctions.parseAmount();
      this.model.DiscountAmount = discAmt; //CommonFunctions.parseAmount();

    }
    else {
      this.model.DiscountPercent = 0;
      this.model.SubTotal = 0;
      this.model.TotalAmount = 0;
      this.model.DiscountAmount = 0;
    }
    //sud:11May'21: To recalcualte Deposit amounts..
    // if (admInfo) {
    //   this.model.DepositAdded = CommonFunctions.parseAmount(admInfo.DepositAdded);
    //   this.model.DepositReturned = CommonFunctions.parseAmount(admInfo.DepositReturned);
    // }
    //this.model.DepositBalance = CommonFunctions.parseAmount((this.model.DepositAdded || 0) - (this.model.DepositReturned || 0));

    if (this.model.DepositBalance >= this.model.TotalAmount) {
      this.model.ToBeRefund = this.model.DepositBalance - this.model.TotalAmount; //CommonFunctions.parseAmount();
      this.model.ToBePaid = 0;
      this.model.PayType = "cash";
      this.model.Tender = this.model.ToBePaid

    }
    else {
      this.model.ToBePaid = this.model.TotalAmount - this.model.DepositBalance;// CommonFunctions.parseAmount();
      this.model.ToBeRefund = 0;
      if (this.model.ToBePaid) {
        this.model.Tender = this.model.ToBePaid;
      }
      this.ChangeTenderAmount();
    }
    if (this.model.PayType == "credit") {
      this.model.ToBePaid = this.model.TotalAmount;
      this.model.DepositReturned = 0;
      this.model.Tender = 0;
      this.model.Change = 0;
      //this is hardcoded countryid, need to  get it from Parameter.
      if (this.patientInfo.CountryId != 1) {
        this.exchangeRate = this.CoreService.GetExchangeRate();
        this.model.TotalAmountInUSD = (this.model.TotalAmount / this.exchangeRate);
      }
    }
    else {
      this.exchangeRate = 0;
      this.model.TotalAmountInUSD = 0;
    }

  }


  CallBackDepositAdd($event = null) {
    if ($event && $event.depositBalance) {
      this.model.DepositBalance = $event.depositBalance;
      //this.admissionInfo.DepositAdded = $event.depositBalance;
      this.CalculationForAll();
    }
  }
  CloseDepositPopUp() {
    this.showIpBillRequest = false;
    this.showDepositPopUp = false;
  }

  ShowDepositPopUp() {
    //this.showIpBillingWarningBox = false;
    this.showDepositPopUp = true;
  }


  //this will be called when Item's edit window is closed.
  CloseItemEditWindow($event) {
    this.showEditItemsPopup = false;
    if ($event && $event.updatedItem && $event.updatedItem.ServiceDepartmentName == "Bed Charges") {
      this.LoadPatientBillingSummary(this.patientId, this.ipVisitId);
    }
    else {
      let index = this.patAllPendingItems.findIndex(a => a.BillingTransactionItemId == this.selItemForEdit.BillingTransactionItemId);
      if ($event.EventName == "update" && $event.updatedItem) {
        //reassign modifiedByObj and CreatedByObj values. wrap in array since the function accepts array of txnitems.
        this.UpdateEmployeeObjects_OfBilTxnItems_ForGrid([$event.updatedItem]);

        //replace the item in array by current one from updated..
        this.patAllPendingItems[index] = $event.updatedItem;
      }
      else if ($event.EventName == "cancelled") {
        this.showEditItemsPopup = false; // for close edit popup window
        this.patAllPendingItems.splice(index, 1);
        this.allowDischarge = this.CheckDischargeRule();//sud:15Oct'20-EMR-2638
      }

      this.patAllPendingItems = this.patAllPendingItems.slice();
      this.CalculationForAll();
    }
  }

  SetDoctorsList() {
    //sud:2May'20: reuse global variables for doctors list..
    this.doctorsList = this.billingService.GetDoctorsListForBilling();
    let Obj = new Object();
    Obj["EmployeeId"] = null;
    Obj["FullName"] = "SELF";
    this.doctorsList.push(Obj);
  }


  //Yubraj : 20th Dec '18
  UpdateProcedure() {
    this.loading = true;

    var admissionPatId = this.admissionInfo.AdmissionPatientId;
    var ProcedureType = this.admissionInfo.ProcedureType;
    if (ProcedureType) {

      this.billingBLService.UpdateProcedure(admissionPatId, ProcedureType)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", ["Procedure Type Updated Successfully."]);
              this.loading = false;
            }
            else {
              this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
              this.loading = false;
            }
          });
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Please enter Procedure Description."]);
      this.loading = false;
    }
  }


  ShowEstimationBill() {

    this.billType = "estimation";
    this.billStatus = "provisional";
    this.showEstimationBill = true;
  }





  //if autoAddBedItems is true then only we should update the bedquantity. else don't call the api (blservice)
  UpdateBedDuration() {

    // let AutoAddBedItemsStr = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "AutoAddBillingItems").ParameterValue;
    // let AutoAddBedItems = JSON.parse(AutoAddBedItemsStr);

    if (this.autoBedBillParam.DoAutoAddBedItem) {
      // this.billingBLService.UpdateBedDurationBillTxn(this.bedDurationDetails)
      this.billingBLService.UpdateBedDurationBillTxn(this.ipVisitId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            console.log("ADT Bill Items Quantity updated.");
            this.LoadPatientBillingSummary(this.patientId, this.ipVisitId);
          }
          else {
            console.log("Failed to update bed transaction detail.");
            console.log(res.ErrorMessage);
            this.CoreService.loading = false;
          }
        });
    }
  }

  PostBillingTransaction() {
    this.MapBillingTransaction();
    this.billingBLService.PostIpBillingTransaction(this.billingTransaction)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          //sud:15Sept'21--using similar variable in all pages..
          this.bil_BilTxnId = this.billingTransaction.BillingTransactionId = res.Results.BillingTransactionId;
          this.DischargePatient(res.Results.InvoiceNo, res.Results.FiscalYearId);
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to complete billing transaction."]);
          console.log(res.ErrorMessage);
          this.loading = false;
        }
      });
  }

  CancelDischarge() {
    this.showDischargePopUpBox = false;
    this.dischargeDetail.Remarks = "";
    this.loading = false;
  }


  //sud:18May'21--To display Invoice from here
  public bil_InvoiceNo: number = 0;
  public bil_FiscalYrId: number = 0;
  public bil_BilTxnId: number = null;

  DischargePatient(invoiceNo: number, fiscYrId: number) {
    this.dischargeDetail.BillStatus = this.billingTransaction.BillStatus;
    this.dischargeDetail.BillingTransactionId = this.bil_BilTxnId;//sud:15Sept'21--replaced old variable with new to keep similarity with other pages
    this.dischargeDetail.DiscountSchemeId = this.MembershipTypeId;
    this.dischargeDetail.PatientId = this.patientId;
    this.dischargeDetail.ProcedureType = this.admissionInfo.ProcedureType;
    this.billingBLService.DischargePatient(this.dischargeDetail)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.bil_InvoiceNo = invoiceNo;
          this.bil_FiscalYrId = fiscYrId;
          this.showDischargeBill = true;
          this.loading = false;
        }
        else {
          this.msgBoxServ.showMessage("failed", ["BILLING TRANSACTION completed but DISCHARGE PATIENT failed."]);
          console.log(res.ErrorMessage);
          this.loading = false;
        }
      });
  }


  MapBillingTransaction() {
    this.patAllPendingItems.forEach(a => {
      // a.DiscountPercent = this.model.DiscountPercent;
      // a.DiscountAmount = (a.SubTotal * a.DiscountPercent) / 100;
      // a.TotalAmount = a.SubTotal - a.DiscountAmount;
      a.DiscountSchemeId = this.MembershipTypeId;
    });
    this.billingTransaction = new BillingTransaction;
    this.billingTransaction.BillingTransactionItems = this.patAllPendingItems;
    this.billingTransaction.PatientId = this.patientId;
    this.billingTransaction.PatientVisitId = this.ipVisitId;
    this.billingTransaction.PaymentMode = this.model.PayType;
    this.billingTransaction.PaymentDetails = this.model.PaymentDetails;
    this.billingTransaction.BillStatus = this.model.PayType.toLocaleLowerCase() != "credit" ? "paid" : "unpaid";
    this.billingTransaction.Remarks = this.model.Remarks;
    this.billingTransaction.SubTotal = this.model.SubTotal;
    //for exchange rate
    if (this.exchangeRate == 0) {
      this.billingTransaction.ExchangeRate = null;
    } else {
      this.billingTransaction.ExchangeRate = this.exchangeRate;
    }

    this.billingTransaction.DiscountAmount = this.model.DiscountAmount;
    this.billingTransaction.TotalAmount = this.model.TotalAmount;
    this.billingTransaction.OrganizationId = this.model.OrganizationId;
    if (this.model.OrganizationId) {
      let org = this.creditOrganizationsList.find(a => a.OrganizationId == this.model.OrganizationId);
      this.billingTransaction.OrganizationName = org.OrganizationName
    }

    if (this.model.DiscountPercent)
      this.billingTransaction.DiscountPercent = this.model.DiscountPercent;
    else
      this.billingTransaction.DiscountPercent = this.billingTransaction.DiscountAmount * 100 / (this.model.SubTotal);// CommonFunctions.parseAmount();

    this.billingTransaction.TaxId = this.billingService.taxId;
    this.billingTransaction.PaidAmount = this.billingTransaction.BillStatus == "paid" ? this.model.ToBePaid : 0;
    this.billingTransaction.Tender = this.model.Tender;
    this.billingTransaction.Change = this.model.Change;

    //sud:11May'21--To Recalculate Deposit amounts..
    this.billingTransaction.DepositAvailable = this.model.DepositBalance;

    if (this.billingTransaction.PaymentMode != "credit") {
      //if tobepaid is more than zero that means all deposit available will be used, else only totalamount will be deducted from deposit.
      this.billingTransaction.DepositUsed = (this.model.ToBePaid > 0) ? this.billingTransaction.DepositAvailable : this.model.TotalAmount;
      //if to be paid is more than zero, than all deposit will already be used, so DepositReturnAmount will be Zero. Else calculate the amount (Avaliable-Used)
      this.billingTransaction.DepositReturnAmount = (this.model.ToBePaid > 0) ? 0 : (this.billingTransaction.DepositAvailable - this.billingTransaction.DepositUsed);
      this.billingTransaction.DepositBalance = 0;//From IpBilling we settle all amounts using ReturnDeposit.
    }
    else {
      this.billingTransaction.DepositUsed = 0;
      this.billingTransaction.DepositReturnAmount = 0;
      this.billingTransaction.DepositBalance = this.model.DepositBalance;
    }

    this.billingTransaction.PaidCounterId = this.billingTransaction.BillStatus == "paid" ? this.securityService.getLoggedInCounter().CounterId : null;
    this.billingTransaction.CounterId = this.securityService.getLoggedInCounter().CounterId;

    this.patAllPendingItems.forEach(item => {
      if (item.IsTaxApplicable) {
        this.billingTransaction.TaxableAmount += item.TaxableAmount;
      }
      else {
        this.billingTransaction.NonTaxableAmount += item.NonTaxableAmount;
      }
      item.DiscountSchemeId = this.MembershipTypeId;
      item.PaidCounterId = this.billingTransaction.PaidCounterId;
      this.billingTransaction.TotalQuantity += item.Quantity;
      this.billingTransaction.BillStatus = this.billingTransaction.BillStatus;
    });

    this.billingTransaction.TransactionType = "inpatient";
    this.billingTransaction.InvoiceType = ENUM_InvoiceType.inpatientDischarge;
    this.model.DiscountPercent = 0;
  }



  //start: Sud-7Oct'20--For AutoAdd bed items cases
  public totalDays: number = 0;//this is used just to show the total days in frontend.

  public CalculateTotalDays() {
    this.totalDays = moment(this.dischargeDetail.DischargeDate).diff(this.admissionInfo.AdmittedOn, "day");
    //this.totalDays = moment(this.dischargeDetail.DischargeDate).date() -   moment(this.admissionInfo.AdmittedOn).date();
    var currDate = moment().format('YYYY-MM-DD HH:mm');
    var disDate = moment(this.dischargeDetail.DischargeDate).format('YYYY-MM-DD  HH:mm');
    var AdmissionDate = moment(this.admissionInfo.AdmittedOn).format('YYYY-MM-DD  HH:mm');
   
    if ((moment(currDate).isBefore(disDate)) || (moment(disDate).isBefore(AdmissionDate))) {
      this.validDischargeDate = false;
    }
    else {
      this.validDischargeDate = true;
    }
  }

  //end: Sud-7Oct'20--For AutoAdd bed items cases



  //Hom 17 Jan '19
  CloseUpdatePricePopup($event) {
    if ($event && $event.modifiedItems) {
      let updatedItems = $event.modifiedItems;


      if (updatedItems && updatedItems.length > 0) {

        //if bed charge is modified then we need to call the server again.. else we can update the items locally..
        //below hardcode of bedcharge should be removed...
        let isBedChargeUpdated = updatedItems.find(itm => itm.ServiceDepartmentName == "Bed Charges" || itm.ServiceDepartmentName == "Bed Charge") != null;

        if (isBedChargeUpdated) {
          this.LoadPatientBillingSummary(this.patientId, this.ipVisitId);
        }
        else {
          //replace the main list i.e: patallpendingitems with updated items at correct index.
          updatedItems.forEach(itm => {
            let index = this.patAllPendingItems.findIndex(a => a.BillingTransactionItemId == itm.BillingTransactionItemId);
            this.patAllPendingItems[index] = itm;

          });
        }
      }

      //reassign createdby and modifiedby emp objects for the items. it's needed for grid
      this.UpdateEmployeeObjects_OfBilTxnItems_ForGrid(this.patAllPendingItems);

      this.patAllPendingItems = this.patAllPendingItems.slice();
    }
    this.showUpdatePricePopup = false;
    this.CalculationForAll();
  }
  //1st August:  Dinesh Adding tender and change field
  ChangeTenderAmount() {

    if (this.model.ToBePaid) {
      this.model.Change = this.model.Tender - this.model.ToBePaid;// CommonFunctions.parseAmount();
    }
    else
      this.model.Tender = 0;
  }



  IPBillItemGridActions($event) {
    switch ($event.Action) {
      case "edit": {
        this.selItemForEdit = $event.Data;
        //Yubraj 30th July -- Disable discount TextBox in case of DiscableApplicable is false
        let itmId = this.selItemForEdit.ItemId;
        let itmName = this.selItemForEdit.ItemName;
        var selItemDetails = this.allItemslist.find(a => a.ItemId == itmId && a.ItemName == itmName)
        this.discountApplicable = selItemDetails.DiscountApplicable;
        this.selItemForEdit.IsDoctorMandatory = selItemDetails.IsDoctorMandatory;

        //Anish: 14 Aug, 2020
        this.selItemForEdit.AllowCancellation = true;

        if (this.isCancelRuleEnabled && this.selItemForEdit.SrvDeptIntegrationName && this.selItemForEdit.RequisitionId > 0) {
          if ((this.selItemForEdit.SrvDeptIntegrationName.toLowerCase() == 'lab' && !this.billingCancellationRule.labStatus.includes(this.selItemForEdit.OrderStatus))
            || (this.selItemForEdit.SrvDeptIntegrationName.toLowerCase() == 'radiology' && !this.billingCancellationRule.radiologyStatus.includes(this.selItemForEdit.OrderStatus))) {
            this.selItemForEdit.AllowCancellation = false;
          }
        }

        //anjana/7-oct-2020: EMR:2708
        let currItmMaster = this.allItemslist.find(itm => itm.ServiceDepartmentId == this.selItemForEdit.ServiceDepartmentId && itm.ItemId == this.selItemForEdit.ItemId);
        if (currItmMaster) {
          this.selItemForEdit.IsTaxApplicable = currItmMaster.TaxApplicable;
        }


        this.showEditItemsPopup = true;
      }
      default:
        break;
    }
  }


  //start: sud:30Apr'20--CodeOptimization
  // LoadAllBillItems() {
  //   this.allItemslist = this.billingService.allBillItemsPriceList;
  // }

  public allEmployeeList = [];
  // LoadAllEmployees() {
  //   this.allEmployeeList = this.billingService.AllEmpListForBilling;
  // }

  //Grid needs object of employee to display in AddedBy and ModifiedBy field.
  //this function can be used from InitialLoading, Edit(Single)-callback, Edit(Bulk)-callback, GroupDiscount-callback
  UpdateEmployeeObjects_OfBilTxnItems_ForGrid(txnItemsToUpdate: Array<BillingTransactionItem>) {
    if (txnItemsToUpdate && txnItemsToUpdate.length > 0) {
      txnItemsToUpdate.forEach(itm => {
        var createdByEmpObj = this.allEmployeeList.find(x => x.EmployeeId == itm.CreatedBy);
        itm.CreatedByObj = createdByEmpObj;

        if (itm.ModifiedBy) {
          var modifiedByEmpObj = this.allEmployeeList.find(x => x.EmployeeId == itm.ModifiedBy);
          itm.ModifiedByObj = modifiedByEmpObj;
        }
      });
    }
  }

  public showPartialPaymentPopup: boolean = false;
  public ItemForPartialPayment: Array<BillingTransactionItem> = [];

  //end: sud:30Apr'20--CodeOptimization

  public SelectItemForPartialPayment() {
    this.ItemForPartialPayment = this.patAllPendingItems.map(a => Object.assign({}, a));
    this.ItemForPartialPayment.forEach(item => item.IsSelected = false);
    this.showPartialPaymentPopup = true;
  }


  public ClosePartialPaymentPopup($event) {
    console.log($event);
    this.showPartialPaymentPopup = false;
  }


  //returns true if discharge rule is valid, else return false.
  CheckDischargeRule(): boolean {
    this.OrderStatusRestrictedItems = [];
    if (this.OrderStatusSettingB4Discharge && this.OrderStatusSettingB4Discharge.Check) {
      this.OrderStatusRestrictedItems = [];
      this.patAllPendingItems.forEach(a => {
        if (a.SrvDeptIntegrationName && this.OrderStatusSettingB4Discharge.Check && a.RequisitionId > 0)
          if ((a.SrvDeptIntegrationName.toLowerCase() == 'lab' && this.billingDischargeRule.labStatus.includes(a.OrderStatus))
            || (a.SrvDeptIntegrationName.toLowerCase() == 'radiology' && this.billingDischargeRule.radiologyStatus.includes(a.OrderStatus))) {
            this.OrderStatusRestrictedItems.push(a);
          }
          else if (a.OrderStatus != ENUM_OrderStatus.Final) {
            this.msgBoxServ.showMessage("Warning", ["Final Report of " + a.ItemName + " is not added for this Patients"]);
          }
      });

      if (this.OrderStatusRestrictedItems && this.OrderStatusRestrictedItems.length) {
        return false;
      }
      else {
        return true;
      }
    }
    else {
      return true;
    }
  }

  CloseOrderStatusInfoPopup() {
    this.ShowOrderStatusInfo = false;
  }

  CloseDischargePopUp($event) {
    this.CloseRecieptView();
  }

  //Pratik:18April'21--This logic was changed for LPH, Please make it parameterized and handle if required for other hospitals after merging.
  InvoiceDiscountOnChange() {
    if(this.model.DiscountPercent <= 100 && this.model.DiscountPercent >= 0){
      this.estimatedDiscountPercent = this.model.DiscountPercent;//sud:11May'21--to be passed into estimated bill

      //Need to re-calculate aggregatediscounts of each item and Invoice amounts when Invoice Discount is changed.
      this.patAllPendingItems.forEach(itm => {
        //if(itm.DiscountApplicable){
          itm.DiscountPercent = this.model.DiscountPercent ? this.model.DiscountPercent : 0;
          //itm.DiscountPercentAgg = this.model.DiscountPercent ? this.model.DiscountPercent : 0;
          itm.DiscountAmount = (itm.SubTotal * itm.DiscountPercent) / 100;
          itm.DiscountSchemeId = this.MembershipTypeId;
        //}
      });
      this.loading = false;
      this.InvalidDiscount = false;
      this.CalculationForAll();
    }else{
      this.InvalidDiscount = true;
      this.loading = true;
    }
    
  }

  //Anjana: 17 June, 2021: Close deposit button on click of escape key
  hotkeys(event) {
    if (event.keyCode == 27) {
      this.CloseDepositPopUp();
    }
  }

  AfterDischargePrint(data) {
    if (data.Close == "close") {
      this.showDischargeBill = false;
    }
  }
}
