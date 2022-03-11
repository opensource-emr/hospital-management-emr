import { ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BillingFiscalYear } from '../../../../billing/shared/billing-fiscalyear.model';
import { CoreService } from '../../../../core/shared/core.service';
import { Patient } from '../../../../patients/shared/patient.model';
import { PatientService } from '../../../../patients/shared/patient.service';
import { PharmacyReceiptModel } from '../../../../pharmacy/shared/pharmacy-receipt.model';
import { PharmacyBLService } from '../../../../pharmacy/shared/pharmacy.bl.service';
import { PharmacyService } from '../../../../pharmacy/shared/pharmacy.service';
import { PHRMInvoiceItemsModel } from '../../../../pharmacy/shared/phrm-invoice-items.model';
import { PHRMInvoiceModel } from '../../../../pharmacy/shared/phrm-invoice.model';
import { PHRMItemTypeModel } from '../../../../pharmacy/shared/phrm-item-type.model';
import { PHRMNarcoticRecordModel } from '../../../../pharmacy/shared/phrm-narcotic-record';
import { PHRMPatient } from '../../../../pharmacy/shared/phrm-patient.model';
import { PHRMPrescriptionItem } from '../../../../pharmacy/shared/phrm-prescription-item.model';
import { SecurityService } from '../../../../security/shared/security.service';
import { CreditOrganization } from '../../../../settings-new/shared/creditOrganization.model';
import { CallbackService } from '../../../../shared/callback.service';
import { CommonFunctions } from '../../../../shared/common.functions';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../../shared/routefrom.service';
import { PHRMStoreModel } from '../../../../pharmacy/shared/phrm-store.model';
import { _MatTabHeaderMixinBase } from '@angular/material/tabs/typings/tab-header';
import { SelectReferrerComponent } from '../../../../settings-new/ext-referral/select-referrer/select-referrer.component';
import { Observable } from 'rxjs';
import { DispensaryService } from '../../../shared/dispensary.service';

@Component({
  selector: 'app-new-sales',
  templateUrl: './new-sales.component.html',
  styleUrls: ['./new-sales.component.css'],
  encapsulation: ViewEncapsulation.None,
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class NewSalesComponent implements OnInit, OnDestroy {
  @ViewChild('selectReferrer') selectReferrerComponent: SelectReferrerComponent;
  public currentCounterId: number = null;
  public currentCounterName: string = null;
  public currentActiveDispensary: PHRMStoreModel;
  public IsCurrentDispensaryInsurace: boolean;
  public searchPatient: any;
  public creditOrganizationsList: Array<CreditOrganization> = new Array<CreditOrganization>();
  public visitType: any;
  public deductDeposit: boolean = false;
  public checkDeductfromDeposit: boolean = false;
  public allFiscalYrs: Array<BillingFiscalYear> = new Array<BillingFiscalYear>();
  //for show and hide item level discount features
  IsitemlevlDis: boolean = false;
  public showAddNewOpPopUp: boolean = false;
  public selectedRefId: number = null;
  public isReferrerLoaded: boolean = false;
  public ExtRefSettings = { EnableExternal: true, DefaultExternal: false };
  public patSummary = { IsLoaded: false, PatientId: null, CreditAmount: null, ProvisionalAmt: null, TotalDue: null, DepositBalance: null, BalanceAmount: null };
  public isNarcoticSale: boolean;
  public showSaleInvoice: boolean = false;//All variable declaration for Patient Registration
  public currentPatient: PHRMPatient = new PHRMPatient();
  public newOutPatient: PHRMPatient = new PHRMPatient();
  public matchingPatientList: Array<PHRMPatient> = new Array<PHRMPatient>();
  public narcoticsRecord: PHRMNarcoticRecordModel = new PHRMNarcoticRecordModel();
  public showExstingPatientList: boolean = false;
  public divDisable: boolean = false;

  //Variable declaration is here for sale
  public loading: boolean = false;
  public isReturn: boolean = false;
  public currSale: PHRMInvoiceModel = new PHRMInvoiceModel();
  public currSaleItems: Array<PHRMInvoiceItemsModel> = new Array<PHRMInvoiceItemsModel>();
  public ItemTypeListWithItems: Array<any> = new Array<any>();
  public ItemListFiltered: Array<any> = new Array<any>();
  public ItemList: Array<any>;
  public patientList: Array<PHRMPatient> = new Array<PHRMPatient>();
  //public itemIdGRItemsMapData = new Array<{ ItemId: number, GRItems: Array<PHRMGoodsReceiptItemsModel> }>();
  public showSupplierAddPage: boolean = false;
  public showInfo: boolean = true;
  public showStockDetails: boolean = false;
  public showNewPatRegistration: boolean = false;
  public genericList: Array<any>;
  invalid: boolean = false;
  public isMainDiscountAvailable: boolean;
  isItemLevelVATApplicable: boolean;
  isMainVATApplicable: boolean;
  lastBarcodeTimeStamp: number = 0;
  barcodeString: string;
  isRemarksMandatory: boolean = false;
  //constructor of class
  constructor(private _dispensaryService: DispensaryService,
    public pharmacyBLService: PharmacyBLService,
    public pharmacyService: PharmacyService,
    public changeDetectorRef: ChangeDetectorRef,
    public router: Router,
    public patientService: PatientService,
    public securityService: SecurityService,
    public routeFromService: RouteFromService,
    public messageboxService: MessageboxService,
    public callBackService: CallbackService,
    public coreService: CoreService,
    public renderer2: Renderer2

  ) {
    try {
      this.visitType = "outpatient";
      this.currentCounterId = this.securityService.getPHRMLoggedInCounter().CounterId;
      this.currentCounterName = this.securityService.getPHRMLoggedInCounter().CounterName;

      this.currentActiveDispensary = this._dispensaryService.activeDispensary;
      this.IsCurrentDispensaryInsurace = this._dispensaryService.isInsuranceDispensarySelected;
      this.currSale.PaymentMode = this.currentActiveDispensary.DefaultPaymentMode;
      this.isRemarksMandatory = this.currentActiveDispensary.AvailablePaymentModes.find(a => a.PaymentModeName == this.currSale.PaymentMode).IsRemarksMandatory;

      if (this.currentCounterId < 1) {
        this.callBackService.CallbackRoute = '/Dispensary/Sale/New'
        this.router.navigate(['/Dispensary/ActivateCounter']);
      }
      else {
        this.LoadGlobalPatient(this.patientService.getGlobal());
        this.LoadItemTypeList();
        //this.getPharmaPatientList();
        this.GetAllFiscalYrs();
        this.GetCreditOrganizations();
        this.LoadReferrerSettings();
        this.getGenericList();
        this.checkSalesCustomization();
      }

    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  ngOnDestroy() {
    this.patientService.CreateNewGlobal();
    this.loading = false;//this enables the button again..
  }

  ngOnInit() {
    this.isReferrerLoaded = true;
  }
  public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {

    return this.pharmacyBLService.GetPatients(keyword, this.IsCurrentDispensaryInsurace);

  }
  getPharmaPatientList() {
    this.pharmacyBLService.GetPatientsListForSaleItems(this.IsCurrentDispensaryInsurace)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.patientList = res.Results.filter(a => !(a.IsOutdoorPatient == true));
        }
      });
  }
  OnPressedEnterKeyInReferrerField() {
    let index = this.currSaleItems.length - 1;
    this.setFocusById(`generic${index}`);
  }
  OnPressedEnterKeyInQuantityField(index) {
    // Check if the all the rows are valid or not.
    var isAllInputValid = this.currSaleItems.every(item => item.Quantity > 0 && item.Quantity <= item.TotalQty);
    //If not, take no action.
    if (isAllInputValid == false) {

    }
    //If yes, check if item level discount is enabled
    else {
      //If item level discount is enabled, set focus discount percentage field
      if (this.IsitemlevlDis == true && this.IsCurrentDispensaryInsurace == false)
        this.setFocusById(`dis-per${index}`);
      //if item level vat is enabled, set focus to vat percentage field
      else if (this.isItemLevelVATApplicable == true) {
        this.setFocusById(`vat-per${index}`);
      }
      //If disabled, add new row and set focus to new item field which is done automatically in new row function
      else {
        //If index is last element of array, then create new row
        if (index == (this.currSaleItems.length - 1)) {
          this.NewRow(index);
        }
        if (this.isBarcodeMode == true) {
          this.isBarcodeMode = false;
          this.setFocusById('barcode-input-field');
        }
        else {
          //focus on to next row's generic name.
          this.setFocusById(`generic${index + 1}`);
        }
      }
    }
  }

  OnPressedEnterKeyInItemField(index) {
    // Check if item is selected or not.
    if (this.currSaleItems[index].selectedItem != null && this.currSaleItems[index].ItemName != null) {
      const isItemNarcotic = this.currSaleItems[index].selectedItem.IsNarcotic == true;
      if (this.currSaleItems[index].selectedItem.ExpiryDate <= moment().format("YYYY-MM-DD")) { // if slected Item is Expired then focus to Item box itself;
        this.setFocusById(`item-box${index}`);
      }
      //if drug is narcotic, then send to patient or doctor
      else if (isItemNarcotic && this.currSale.selectedPatient.PatientId == -1) { this.setFocusById("patient-search"); return; }
      else if (isItemNarcotic && this.currSale.ProviderId == -1) { this.selectReferrerComponent.setFocusOnReferrerForNarcoticDrug(); return; }
      else {
        // If yes, set focus to quantity field of that same row.
        this.setFocusById(`qty${index}`);
      }
    }
    // else if (this.currSaleItems[index].selectedItem.length > 0 && index == (this.currSaleItems.length - 1) && this.isMainDiscountAvailable == true) {
    //   this.setFocusById('discountpercent');
    // }
    else {
      this.setFocusById(`item-box${index}`);
      // sanjit: This logic will be required for other hospitals, we must parameterized it later.
      // if (this.currSaleItems.length == 1) {
      //   this.setFocusById(`item-box${index}`);
      // }
      // else {
      //   this.currSaleItems.splice(index, 1);
      //   // If not, check if item level discount is available
      //   if (this.IsitemlevlDis == false)
      //   // If item level discount is not available, set focus to Discount Amount Field.
      //   {
      //     if (this.IsCurrentDispensaryInsurace == true) {
      //       this.setFocusById('remarks')
      //     }
      //     else {
      //       if (this.isMainDiscountAvailable == true)
      //         this.setFocusById('discountamount');
      //       else {
      //         this.setFocusById('Tender')
      //       }
      //     }
      //   }
      //   else
      //     // If item level discount is available, set focus to Tender Field.
      //     this.setFocusById('Tender');
      // }
    }
  }
  OnPressedEnterInItemLevelDiscountAmount(index) {
    // Check if the all the rows are valid or not.
    var isAllInputValid = this.currSaleItems.every(item => item.Quantity > 0 && item.Quantity <= item.TotalQty);
    //If item level VAt is enabled set focus to vat percentage field
    if (this.isItemLevelVATApplicable == true) this.setFocusById(`vat-per${index}`);
    else {
      //If index is last element of array, then create new row
      if (index == (this.currSaleItems.length - 1)) {
        this.NewRow(index);
      }
      if (this.isBarcodeMode == true) {
        this.isBarcodeMode = false;
        this.setFocusById('barcode-input-field');
      }
      //If index is not last, set focus to item field of next element in the array
      else {
        this.setFocusById(`generic${index + 1}`);
      }
    }
  }
  OnPressedEnterInItemLevelVAT(index) {
    //If index is last element of array, then create new row
    if (index == (this.currSaleItems.length - 1)) {
      this.NewRow(index);
    }
    if (this.isBarcodeMode == true) {
      this.isBarcodeMode = false;
      this.setFocusById('barcode-input-field');
    }
    else {
      //If index is not last, set focus to item field of next element in the array
      this.setFocusById(`generic${index + 1}`);
    }
  }
  setFocusById(id: string, waitingTimeInms = 0) {
    var Timer = setTimeout(() => {
      if (document.getElementById(id)) {
        let nextEl = <HTMLInputElement>document.getElementById(id);
        nextEl.focus();
        nextEl.select();
        clearTimeout(Timer);
      }
    }, waitingTimeInms)
  }
  ///Get prescription Items list by => PatientId and ProviderId
  //when request from prescription to sale
  GetPrescriptionItems() {
    try {
      if (this.pharmacyService.PatientId > 0 && this.pharmacyService.ProviderId > 0) {//check for patientId and providerId
        this.pharmacyBLService.GetPrescriptionItems(this.pharmacyService.PatientId, this.pharmacyService.ProviderId)
          .subscribe(res => this.CallBackGetPrescriptionItems(res));
      } else {
        this.router.navigate(['/Dispensary/Prescription/List']);
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //when GEt prescription method response data from server to local call this method
  CallBackGetPrescriptionItems(res) {
    try {
      if (res.Status == 'OK') {
        if (res.Results) {
          let PresItems = new Array<PHRMPrescriptionItem>();
          PresItems = res.Results;


          PresItems.forEach(itm => {
            if (itm.IsAvailable) {

              let tempSaleItem: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
              tempSaleItem.PrescriptionItemId = itm.PrescriptionItemId;
              tempSaleItem.ItemId = itm.ItemId;
              tempSaleItem.Quantity = itm.Quantity;
              tempSaleItem.Dosage = itm.Dosage;
              tempSaleItem.Duration = itm.HowManyDays;
              tempSaleItem.Frequency = itm.Frequency;
              tempSaleItem.GenericId = itm.GenericId;
              tempSaleItem.enableItmSearch = true;
              let currItmA;
              if (itm.ItemId != 0) {
                currItmA = this.ItemTypeListWithItems.find(itm => itm.ItemId == tempSaleItem.ItemId); // this.allPhrmItems.find(p => p.ItemId == itm.ItemId);
              }
              else {
                //get default value of item from generic Id in this case first one

                currItmA = this.ItemTypeListWithItems.find(itm => itm.GenericId == tempSaleItem.GenericId);
              }
              let currItm = currItmA;
              tempSaleItem.ItemTypeId = currItm != null ? currItm.ItemTypeId : 0;
              tempSaleItem.ItemName = currItm.ItemName;
              tempSaleItem.Items = this.ItemTypeListWithItems.find(typ => typ.ItemTypeId == tempSaleItem.ItemTypeId).Items;
              tempSaleItem.selectedItem = currItm;
              tempSaleItem.PrescriptionItemId = currItm.PrescriptionItemId;
              tempSaleItem.GenericName = currItm.GenericName;
              tempSaleItem.CounterId = this.currentCounterId;

              this.currSaleItems.push(tempSaleItem);
              this.OnPresciptionItemChange(currItm, this.currSaleItems.length - 1, tempSaleItem.Quantity);
              this.changeDetectorRef.detectChanges();
            }
            else {
              this.messageboxService.showMessage("Notice", [itm.ItemName, " is unavailable."]);
              this.currSale.Remark += itm.ItemName + "is unavailable. \n";
            }
          });
        }
      }
      else {
        this.messageboxService.showMessage("failed", ['failed to get prescription items.!']);
      }

    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }



  private LoadGlobalPatient(Patient: Patient) {
    if (Patient.PatientId > 0) {
      this.currentPatient.PatientCode = Patient.PatientCode;
      this.currentPatient.ShortName = Patient.ShortName;
      this.searchPatient = Patient.ShortName;
      this.currentPatient.Address = Patient.Address;
      this.currentPatient.Age = Patient.Age;
      this.currentPatient.Gender = Patient.Gender;
      this.currentPatient.PhoneNumber = Patient.PhoneNumber;
      this.currentPatient.PatientId = Patient.PatientId;
      this.currentPatient.LatestClaimCode = Patient.ClaimCode;
      this.currentPatient.NSHINumber = Patient.Ins_NshiNumber;
      this.currentPatient.RemainingBalance = Patient.Ins_InsuranceBalance;
      this.LoadPatientInvoiceSummary(Patient.PatientId);
      this.onClickPatient(this.patientService.getGlobal());

    }
  }
  //to show popup in-case of narcotic drug sales
  AddNarcotics(index) {
    this.narcoticsRecord.NarcoticRecordId = index;
  }
  // to save narcotics record in currentitems array
  SaveNarcotics() {
    let index = this.narcoticsRecord.NarcoticRecordId;
    if (this.narcoticsRecord.BuyerName == null || this.narcoticsRecord.DoctorName == null || this.narcoticsRecord.NMCNumber == null) {
      this.messageboxService.showMessage("error", ["Please Fill the required information."]);
    }
    else {
      this.currSaleItems[index].NarcoticsRecord.BuyerName = this.narcoticsRecord.BuyerName;
      this.currSaleItems[index].NarcoticsRecord.DoctorName = this.narcoticsRecord.DoctorName;
      this.currSaleItems[index].NarcoticsRecord.EmployeId = this.narcoticsRecord.EmployeId;
      this.currSaleItems[index].NarcoticsRecord.Refill = this.narcoticsRecord.Refill;
      this.currSaleItems[index].NarcoticsRecord.NMCNumber = this.narcoticsRecord.NMCNumber;
      this.showSupplierAddPage = false;
      this.narcoticsRecord.BuyerName = null;
      this.narcoticsRecord.DoctorName = null;
      this.narcoticsRecord.EmployeId = null;
      this.narcoticsRecord.Refill = null;
      this.narcoticsRecord.NMCNumber = null;
    }

  }
  //GET: to load the itemType in the start
  LoadItemTypeList(): void {
    try {
      this.pharmacyBLService.GetItemTypeListWithItems(this.currentActiveDispensary.StoreId)
        .subscribe(res => this.CallBackGetItemTypeList(res));
    }

    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  public getGenericList() {
    this.pharmacyBLService.GetGenericList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.genericList = res.Results;
        }
      });
  }

  CallBackGetItemTypeList(res) {
    try {
      if (res.Status == 'OK') {
        if (res.Results) {
          this.ItemListFiltered = [];
          this.ItemListFiltered = res.Results;
          this.ItemList = this.ItemListFiltered;

          this.ItemTypeListWithItems = new Array<PHRMItemTypeModel>();
          this.ItemTypeListWithItems = res.Results;
          ///displaying only those ItemTypeList in Dropdown whose Status is Active Now.
          this.ItemTypeListWithItems = this.ItemTypeListWithItems.filter(itmtype => itmtype.IsActive == true);

          if (this.routeFromService.RouteFrom == "prescription") {
            this.routeFromService.RouteFrom = null;
            this.GetPrescriptionItems();
          }
          else if (this.routeFromService.RouteFrom == "returnedBill") {
            this.routeFromService.RouteFrom = null;
            this.isReturn = true;
            this.MapReturnedBillForSale();
          }
          else {
            this.AddRowRequestOnClick(-1);
          }

          //focus on 1st row of generic after item loaded. ref: sanjit/sud
          if (this.IsCurrentDispensaryInsurace == false) {
            this.SetAnonymous();
            this.setFocusById(`patient-search`);
          }
          else {
            this.currSale.PaymentMode = 'credit';
            this.setFocusById(`patient-search`);
            this.visitType = 'inpatient';
            this.currSale.InvoiceValidator.get("VisitType").setValue("inpatient");
          }

        }
      }
      else {
        () => {
          this.messageboxService.showMessage("failed", ['failed to get ItemTypeList..']);
        }
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  MapReturnedBillForSale() {
    try {

      let returnItems = this.pharmacyService.getGlobalReturnSaleTransaction();
      if (returnItems.length > 0) {
        let record = null;
        for (let i = 0; i < returnItems.length; i++) {

          let itmData = this.ItemListFiltered.find(s => s.ItemId == returnItems[i].ItemId &&
            s.BatchNo == returnItems[i].BatchNo && s.ExpiryDate == returnItems[i].ExpiryDate);
          record = itmData;
          if (itmData) {
            let invItm: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
            this.currSaleItems.push(invItm);
            this.currSaleItems[this.currSaleItems.length - 1].selectedItem = itmData;
            this.currSaleItems[this.currSaleItems.length - 1].Quantity = returnItems[i].Quantity;
            this.currSaleItems[this.currSaleItems.length - 1].TotalQty = this.ItemListFiltered.find(x => x.ItemId == returnItems[i].ItemId).AvailableQuantity;
            this.currSaleItems[this.currSaleItems.length - 1].BatchNo = returnItems[i].BatchNo;
            this.currSaleItems[this.currSaleItems.length - 1].ExpiryDate = returnItems[i].ExpiryDate;
            this.currSaleItems[this.currSaleItems.length - 1].ItemId = returnItems[i].ItemId;
            this.currSaleItems[this.currSaleItems.length - 1].ItemName = returnItems[i].ItemName;
            this.currSaleItems[this.currSaleItems.length - 1].SubTotal = returnItems[i].SubTotal;
            this.currSaleItems[this.currSaleItems.length - 1].TotalAmount = returnItems[i].TotalAmount;
            // this.currSaleItems[this.currSaleItems.length - 1].selectedItem.Quantity = invItm.Quantity;
            this.onChangeItem(itmData, this.currSaleItems.length - 1);
          } else {

          }
        }
        if (record == undefined) {
          this.messageboxService.showMessage("notice", ['Selected Items are not available in stock']);
          this.AddRowRequest(0);
        }
      } else {
        this.AddRowRequest(0);
      }

    } catch (ex) { this.ShowCatchErrMessage(ex) }
  }

  OnPresciptionItemChange($event, index, qty) {
    try {
      this.currSaleItems.forEach((itm: any) => {
        itm.ItemNameFormatted = itm.ItemName + "-" + itm.MRP;
      });

      if ($event.ItemId > 0) {
        let itemId = $event.ItemId;
        //below line is just to avoid error check later
        this.currSaleItems[index].selectedItem = Object.assign(this.currSaleItems[index].selectedItem, $event);
        this.currSaleItems[index].selectedItem.SellingPrice = $event.MRP;
        this.currSaleItems[index].ItemTypeId = $event.ItemTypeId;
        this.currSaleItems[index].TotalQty = $event.AvailableQuantity;
        this.currSaleItems[index].BatchNo = $event.BatchNo;
        this.currSaleItems[index].MRP = $event.MRP;
        this.currSaleItems[index].Price = $event.Price;
        this.currSaleItems[index].ExpiryDate = $event.ExpiryDate;
        this.currSaleItems[index].Quantity = qty;
        this.currSaleItems[index].GoodReceiptItemId = $event.GoodReceiptItemId;
        this.currSaleItems[index].DiscountPercentage = $event.DiscountPercentage;
        this.currSaleItems[index].CounterId = this.currentCounterId;


      }
      else {
        this.currSaleItems[index].GRItems = [];
      }

    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  public AssignSelectedGenName(row) {
    try {
      if ((row.selectedGeneneric != 0) && (row.selectedGeneneric != null)) {
        this.ItemListFiltered = this.ItemList.filter(a => a.GenericId == row.selectedGeneneric.GenericId);
        row.ItemFieldMinChars = 0;
      }
      else {
        this.ItemListFiltered = this.ItemList;
        row.ItemFieldMinChars = 1;
        row.selectedItem = null;
        row.Quantity = 0;
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  //This method calls when Item selection changed
  onChangeItem($event, index) {
    try {
      this.currSaleItems.forEach((itm: any) => {
        itm.ItemNameFormatted = itm.ItemName + "-" + itm.MRP;
      });
      let currentDate = moment().format('YYYY-MM-DD');
      if ($event.ExpiryDate <= currentDate) {
        this.messageboxService.showMessage("error", [`The selected Item ${$event.ItemName} is Expired. Cann't perform Sale Operation`]);
        return;
      }
      if ($event.IsNarcotic == true) {
        this.AddNarcotics(index);
        if (this.currSale.ProviderId < 1 || this.currSale.selectedPatient.PatientId < 1)
          this.messageboxService.showMessage("Notice-Message", ["Narcotic Drug is selected.", "Doctor is Mandatory.", "Anonymous doctor is not allowed."])
      }

      if ($event.GenericId > 0) {
        this.currSaleItems[index].GenericId = $event.GenericId;
        this.currSaleItems[index].GenericName = $event.GenericName;

      }
      if ($event.ItemId > 0) {
        let itemId = $event.ItemId;
        //below line is just to avoid error check later
        this.currSaleItems[index].selectedItem = Object.assign(this.currSaleItems[index].selectedItem, $event);
        this.currSaleItems[index].selectedItem.SellingPrice = $event.MRP;
        this.currSaleItems[index].ItemTypeId = $event.ItemTypeId;
        this.currSaleItems[index].StockId = $event.StockId;
        this.currSaleItems[index].TotalQty = $event.AvailableQuantity;
        this.currSaleItems[index].Quantity = 0;
        this.currSaleItems[index].StockId = $event.StockId;
        this.currSaleItems[index].BatchNo = $event.BatchNo;
        this.currSaleItems[index].GenericName = $event.GenericName;
        this.currSaleItems[index].GenericId = $event.GenericId;
        this.currSaleItems[index].MRP = this.IsCurrentDispensaryInsurace ? $event.InsuranceMRP : $event.MRP;
        this.currSaleItems[index].StockMRP = $event.MRP;
        this.currSaleItems[index].Price = $event.Price;
        this.currSaleItems[index].ExpiryDate = $event.ExpiryDate;
        this.currSaleItems[index].VATPercentage = $event.IsVATApplicable == true ? $event.SalesVATPercentage : 0;
        this.pharmacyBLService.GetRackByItem($event.ItemId)
          .subscribe(
            res => {
              if (res.Status == 'OK') {
                this.currSaleItems[index].RackNo = res.Results;
              }
            });

        this.currSaleItems[index].Quantity = ($event.Quantity == null || $event.Quantity == undefined) ? this.currSaleItems[index].Quantity : 0;
        this.currSaleItems[index].GoodReceiptItemId = $event.GoodReceiptItemId;
        this.currSaleItems[index].PrescriptionItemId = $event.PrescriptionItemId;
        this.currSaleItems[index].CounterId = this.currentCounterId;
        this.currSaleItems[index].IsDuplicate = false;
        this.currSaleItems[index].ItemId = $event.ItemId;


        this.checkDuplicateItem();

        // //first check selected Item and related all grItems locally
        // //If doesn't find local then get data from server
        // //TODO: Remove this once found not necessary
        // let ItemWiseGRItems = this.itemIdGRItemsMapData.find(a => a.ItemId == itemId);

        // if (ItemWiseGRItems && itemId) {
        //   this.currSaleItems[index].GRItems = ItemWiseGRItems.GRItems;
        //   this.checkDuplicateItem();
        // }
        // else {
        //   //Get GrItems details by ItemId only available stock details
        //   this.pharmacyBLService.GetGRItemsByItemId(itemId)
        //     .subscribe(res => {
        //       if (res.Status == "OK") {
        //         this.currSaleItems[index].GRItems = res.Results;
        //         let itemWiseGRItems = { ItemId: itemId, GRItems: res.Results };
        //         this.itemIdGRItemsMapData.push(itemWiseGRItems);
        //         this.checkDuplicateItem();
        //       }
        //       else {
        //         //this.messageboxService.showMessage("error", ["stock not available."]);
        //       }
        //     });
        // }


      }

      else {
        this.currSaleItems[index].GRItems = [];
      }

    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  ValueChanged(index, discPer, discAmt, row?) {
    try {
      if (discPer == null || discAmt == null) {
        discAmt = 0;
        discPer = 0;
      }
      if (this.currSaleItems[index].Quantity == undefined) {
        this.currSaleItems[index].Quantity = 0;
      }
      if (this.currSaleItems[index].Quantity > this.currSaleItems[index].TotalQty) {
        this.currSaleItems[index].IsDirty('Quantity');
      }
      let subtotal = this.currSaleItems[index].Quantity * this.currSaleItems[index].MRP;
      this.currSaleItems[index].SubTotal = subtotal;
      //CommonFunctions.parseAmount(subtotal);
      this.currSaleItems[index].TotalAmount = subtotal;
      //CommonFunctions.parsePhrmAmount(subtotal);
      this.CalculateItemlevelDis(index, discPer, discAmt); //calculation of item level discount
      this.OnVATChanged(index, this.currSaleItems[index].VATPercentage, 0);
      this.AllCalculation();
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //Method for calculate item level discount
  CalculateItemlevelDis(index, discPer, discAmt) {
    if (discPer == 0 && discAmt > 0) {
      this.currSaleItems[index].TotalAmount =CommonFunctions.parsePhrmAmount(this.currSaleItems[index].SubTotal - discAmt);
      this.currSaleItems[index].TotalDisAmt = discAmt;
      discPer = (discAmt / this.currSaleItems[index].SubTotal) * 100;
      this.currSaleItems[index].DiscountPercentage = CommonFunctions.parsePhrmAmount(discPer) ;
      //CommonFunctions.parsePhrmAmount(discPer);
    }
    if (discPer > 0 && discAmt == 0) {
      discAmt = (this.currSaleItems[index].SubTotal * (discPer) / 100);
      this.currSaleItems[index].TotalAmount = this.currSaleItems[index].SubTotal - discAmt;
      this.currSaleItems[index].TotalDisAmt = CommonFunctions.parsePhrmAmount (discAmt);
      this.currSaleItems[index].DiscountPercentage = discPer;
    }
    if (discPer == 0 && discAmt == 0) {
      this.currSaleItems[index].SubTotal = this.currSaleItems[index].SubTotal;
      this.currSaleItems[index].TotalAmount = this.currSaleItems[index].TotalAmount;
      this.currSaleItems[index].TotalDisAmt =CommonFunctions.parsePhrmAmount(discAmt) ;
      this.currSaleItems[index].DiscountPercentage = CommonFunctions.parsePhrmAmount(discPer);
    }
  }
  //Calcn part for Item Level VAT
  OnVATChanged(index: any, vatPer: any, vatAmt: any) {

    if (vatPer == null || vatAmt == null) {
      vatAmt = 0;
      vatPer = 0;
    }

    if (vatPer > 0 && vatAmt == 0) {
      vatAmt = CommonFunctions.parsePhrmAmount((this.currSaleItems[index].SubTotal - this.currSaleItems[index].TotalDisAmt) * (vatPer) / 100)
      this.currSaleItems[index].TotalAmount = (this.currSaleItems[index].SubTotal - this.currSaleItems[index].TotalDisAmt) + vatAmt;
      this.currSaleItems[index].VATAmount = vatAmt;
      this.currSaleItems[index].VATPercentage = vatPer;
    }
    if (vatPer == 0 && vatAmt > 0) {
      this.currSaleItems[index].TotalAmount = (this.currSaleItems[index].SubTotal - this.currSaleItems[index].TotalDisAmt) + vatAmt;
      this.currSaleItems[index].VATAmount = vatAmt;
      vatPer = (vatAmt / this.currSaleItems[index].TotalAmount) * 100;
      this.currSaleItems[index].VATPercentage = CommonFunctions.parsePhrmAmount(vatPer);
    }
    if (vatPer == 0 && vatAmt == 0) {
      this.currSaleItems[index].SubTotal = this.currSaleItems[index].SubTotal;
      this.currSaleItems[index].TotalAmount = this.currSaleItems[index].TotalAmount;
      this.currSaleItems[index].VATAmount = vatAmt;
      this.currSaleItems[index].VATPercentage = vatPer;
    }
    this.AllCalculation();
  }
  //Method for all calculation
  AllCalculation(discPer?, discAmt?) {
    try {
      if (this.currSaleItems.length > 0) {
        this.currSale.SubTotal = 0;
        this.currSale.TotalAmount = 0;
        this.currSale.VATAmount = 0;
        this.currSale.DiscountAmount = 0;

        let TotalitemlevDisAmt: number = 0;
        let Subtotalofitm: number = 0;
        let vatAmount: number = 0;
        for (var i = 0; i < this.currSaleItems.length; i++) {
          this.currSale.SubTotal = CommonFunctions.parsePhrmAmount(this.currSale.SubTotal + this.currSaleItems[i].SubTotal);//why subtotal is sum of totalAmount
          this.currSale.TotalAmount = CommonFunctions.parsePhrmAmount(this.currSale.TotalAmount + this.currSaleItems[i].TotalAmount);
          this.currSale.DiscountAmount = CommonFunctions.parsePhrmAmount(this.currSale.DiscountAmount + this.currSaleItems[i].TotalDisAmt);
          this.currSale.VATAmount = CommonFunctions.parsePhrmAmount(this.currSale.VATAmount + this.currSaleItems[i].VATAmount);

          let temp = (this.currSaleItems[i].Quantity - this.currSaleItems[i].FreeQuantity) * this.currSaleItems[i].MRP;//equals subtotal
          this.currSale.DiscountAmount = CommonFunctions.parsePhrmAmount(this.currSale.DiscountAmount + (temp - this.currSaleItems[i].SubTotal));//alwys return 0

          TotalitemlevDisAmt = TotalitemlevDisAmt + this.currSaleItems[i].TotalDisAmt;           // cal total item level disamt
          Subtotalofitm = Subtotalofitm + this.currSaleItems[i].SubTotal;           // cal subtotal.
          vatAmount = vatAmount + this.currSaleItems[i].VATAmount;

        }

        //for bulk discount calculation and conversion of percentage into amount and vice versa
        if (this.isMainDiscountAvailable == true) {
          if (discPer == 0 && discAmt > 0) {
            this.currSale.TotalAmount = this.currSale.TotalAmount - discAmt;
            this.currSale.DiscountAmount = discAmt;
            discPer = (discAmt / this.currSale.SubTotal) * 100;
            this.currSale.DiscountPer = CommonFunctions.parsePhrmAmount(discPer);
          }
          if (discPer > 0 && discAmt == 0) {
            discAmt = CommonFunctions.parsePhrmAmount(this.currSale.TotalAmount * (discPer) / 100)
            this.currSale.TotalAmount = this.currSale.SubTotal - discAmt;
            this.currSale.DiscountAmount = discAmt;
            this.currSale.DiscountPer = discPer;
          }
          if (discPer == 0 && discAmt == 0) {
            this.currSale.SubTotal = this.currSale.SubTotal;
            this.currSale.TotalAmount = this.currSale.TotalAmount;
            this.currSale.DiscountAmount = discAmt;
            this.currSale.DiscountPer = discPer;
          }
          //this.currSale.DiscountAmount = CommonFunctions.parsePhrmAmount(this.currSale.SubTotal * (this.currSale.DiscountPer) / 100);
          this.currSale.TotalAmount = CommonFunctions.parsePhrmAmount(this.currSale.SubTotal - this.currSale.DiscountAmount + this.currSale.VATAmount);

        }
        else {
          //this cal for total item level discount
          this.currSale.SubTotal = CommonFunctions.parsePhrmAmount(Subtotalofitm);
          this.currSale.DiscountAmount = CommonFunctions.parsePhrmAmount(TotalitemlevDisAmt);
          let totaldisper = (this.currSale.DiscountAmount / this.currSale.SubTotal) * 100;
          this.currSale.DiscountPer = CommonFunctions.parsePhrmAmount(totaldisper);
        }
        //this.currSale.VATAmount = CommonFunctions.parsePhrmAmount(this.currSale.TotalAmount - this.currSale.SubTotal);
        this.currSale.PaidAmount = CommonFunctions.parsePhrmAmount(this.currSale.SubTotal - this.currSale.DiscountAmount + this.currSale.VATAmount);
        this.currSale.Tender = CommonFunctions.parsePhrmAmount(this.currSale.PaidAmount);
        this.currSale.Change = CommonFunctions.parsePhrmAmount(this.currSale.Tender - this.currSale.TotalAmount);
        //No Adjustent required in LPH.
        // this.currSale.Adjustment = CommonFunctions.parsePhrmAmount(this.currSale.PaidAmount - this.currSale.TotalAmount);
        this.currSale.TotalAmount = CommonFunctions.parsePhrmAmount(this.currSale.TotalAmount);
        this.ChangeTenderAmount();
        if (this.checkDeductfromDeposit) {
          this.CalculateDepositBalance();
        }
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  ChangeTenderAmount() {
    if (this.deductDeposit) {
      this.currSale.Change = CommonFunctions.parseAmount(this.currSale.Tender + this.patSummary.DepositBalance - this.currSale.PaidAmount);
    }
    else {
      this.currSale.Change = CommonFunctions.parseAmount(this.currSale.Tender - this.currSale.PaidAmount);
    }
  }

  //validation is remaining
  Save(): void {

    this.loading = true;//this disables the print button and double click issues, don't change this pls..
    try {
      var errorMessages: Array<string> = [];
      let check: boolean = true;
      this.currSaleItems = this.currSaleItems.filter(a => a.ItemId != null || a.ItemId > 0);
      if (this.currSaleItems.length == 0) {
        this.AddRowRequest(0);
        errorMessages.push("No item selected. Please select some item.");
        check = false;
      }
      for (var j = 0; j < this.currSaleItems.length; j++) {
        let date = new Date();
        let datenow = date.setMonth(date.getMonth() + 0);
        let expiryDate = this.currSaleItems[j].ExpiryDate;
        let expiryDate1 = new Date(expiryDate);
        let expDate = expiryDate1.setMonth(expiryDate1.getMonth() + 0);
        if (expDate < datenow) {
          errorMessages.push('Expired item-' + (j + 1) + ' cannot be sale ');
          check = false;
        }
        if (this.currSaleItems[j].ExpiryDate)
          if (!this.currSaleItems[j].Quantity) {
            errorMessages.push('Qty is required for item ' + (j + 1));
            check = false;
          }
          else {
            //to check total quantity with available quantity
            if (this.currSaleItems[j].Quantity > this.currSaleItems[j].TotalQty) {
              errorMessages.push('Qty is greater than Stock for item ' + (j + 1));
              check = false;
            }
          }
      }
      if (this.isRemarksMandatory == true && this.currSale.Remark.trim().length == 0) {
        errorMessages.push(`Remark is mandatory with selected Payment Mode (${this.currSale.PaymentMode}).`);
        check = false;
      }
      if (this.currSale.PaymentMode == "credit" && this.currSale.selectedPatient.FirstName == "Anonymous") {
        errorMessages.push(`Patient is mandatory for selected Payment Mode i.e. ${this.currSale.PaymentMode}`);
        check = false;
      }
      if (this.IsCurrentDispensaryInsurace == true && this.currSale.selectedPatient.LatestClaimCode == null) {
        errorMessages.push("No claim code found. Please check.")
        check = false;
      }
      if (this.IsCurrentDispensaryInsurace == true && this.currSale.selectedPatient.RemainingBalance < this.currSale.TotalAmount) {
        errorMessages.push("Not enough balance. Total Amount is greater than Balance.");
        check = false;
      }
      //check if narcotic item is sold
      this.isNarcoticSale = this.currSaleItems.some(i => i.selectedItem && i.selectedItem.IsNarcotic == true);
      //if narcotic drug is selected and doctor is not selected or is anonymous, then stop the sale.
      if (this.isNarcoticSale == true) {
        if (this.currSale.ProviderId < 1) {
          errorMessages.push('Doctor is mandatory for Narcotic sales');
          check = false;
        }
        if (this.currSale.selectedPatient.PatientId < 0) {
          errorMessages.push('Patient is mandatory for Narcotic sales');
          check = false;
        }
      }
      //sanjit: 21May'20: this validation has issue, because of return quantity set as a validator. need to fix it.
      for (var j = 0; j < this.currSaleItems.length; j++) {
        this.currSaleItems[j].CounterId = this.currentCounterId;
        this.currSaleItems[j].StoreId = this._dispensaryService.activeDispensary.StoreId;
        for (var i in this.currSaleItems[j].InvoiceItemsValidator.controls) {
          this.currSaleItems[j].InvoiceItemsValidator.controls['ReturnQty'].disable();
          this.currSaleItems[j].InvoiceItemsValidator.controls['Price'].disable();
          this.currSaleItems[j].InvoiceItemsValidator.controls[i].markAsDirty();
          this.currSaleItems[j].InvoiceItemsValidator.controls[i].updateValueAndValidity();
        }

        if (!this.currSaleItems[j].IsValidCheck(undefined, undefined)) {
          check = false;
          errorMessages.push('Check values for item ' + (j + 1));
        }
      }
      for (var i in this.currSale.InvoiceValidator.controls) {
        this.currSale.InvoiceValidator.controls[i].markAsDirty();
        this.currSale.InvoiceValidator.controls[i].updateValueAndValidity();
      }

      if (!this.currSale.IsValidCheck(undefined, undefined)) {
        check = false;
        errorMessages.push('All * fields are mandatory');
      }
      if (!this.checkDuplicateItem()) {
        check = false;
        errorMessages.push('Duplicate Items are not allowed');

      }
      if (this.currSale.Tender < this.currSale.PaidAmount && this.checkDeductfromDeposit == false) {
        errorMessages.push('Tender Amount can not be less than total amount.');
        check = false;
      }

      //Check False means we will not post this data to server. so we can make loading=false in that case.
      //when check is true, then buttons should still be disbled (i.e: Loading=True)
      this.loading = check;

      if (check) {
        if (this.CheckValidaiton()) {
          this.AssignAllValues();
          this.currSale.InvoiceItems = this.currSaleItems;
          this.currSale.CounterId = this.currentCounterId;
          this.currSale.StoreId = this._dispensaryService.activeDispensary.StoreId;
          this.currSale.ProviderId = this.selectedRefId;//sud:28Jan'20
          this.currSale.ClaimCode = this.IsCurrentDispensaryInsurace ? this.currSale.selectedPatient.LatestClaimCode : null;
          this.currSale.IsInsurancePatient = this.IsCurrentDispensaryInsurace;
          this.currSale.VisitType = this.visitType;
          this.currentPatient = new PHRMPatient();
          if ((this.currSale.PaymentMode == "cash" && this.currSale.selectedPatient.FirstName == "Anonymous") || (this.currSale.PaymentMode == 'credit' && this.currSale.selectedPatient.FirstName != "Anonymous") || (this.currSale.PaymentMode == 'cash' && this.currSale.selectedPatient.FirstName != "Anonymous")) {

            this.pharmacyBLService.postInvoiceData(this.currSale)
              .subscribe(res => {
                if (res.Status == "OK" && res.Results != null) {
                  this.CallBackSaveSale(res);
                }
                else if (res.Status == "Failed") {
                  this.loading = false;
                  this.messageboxService.showMessage("error", ['There is problem, please try again', res.ErrorMessage.split('exception')[0]]);

                }
              },
                err => {
                  this.loading = false;
                  this.messageboxService.showMessage("error", [err.ErrorMessage]);
                });
          }
          else {
            this.messageboxService.showMessage("error", ['Please Change PAYMENT MODE !! CREDIT payment mode not is allowed to Anonymous Patient']);
            this.currSale.PaymentMode = 'cash';
            this.loading = false;
          }
        }
      }
      else {
        this.messageboxService.showMessage("Failed", errorMessages);
      }
    } catch (exception) {
      this.loading = false;
      this.ShowCatchErrMessage(exception);
    }

  }
  //credit billing
  SaveCredit(): void {
    try {
      let check: boolean = true;
      this.loading = true;
      this.currSaleItems = this.currSaleItems.filter(a => a.ItemId != null || a.ItemId > 0);
      if (this.currSaleItems.length == 0) {
        this.AddRowRequest(0);
        this.messageboxService.showMessage("error", ['Please select some item. '])
      }
      for (var j = 0; j < this.currSaleItems.length; j++) {
        //to check total quantity with available quantity
        if (this.currSaleItems[j].Quantity > this.currSaleItems[j].TotalQty) {
          this.loading = false;
          this.messageboxService.showMessage("error", ['There is problem, Qty is greater than Stock!']);
          check = false;

          break;
        }
      }
      if (this.currSale.PaymentMode == "credit" && this.currSale.Remark.length == 0) {
        this.messageboxService.showMessage("error", ['Remark is mandatory when payment mode is credit!']);
        check = false;
      }
      if (this.IsCurrentDispensaryInsurace == true && this.currSale.selectedPatient.RemainingBalance < this.currSale.TotalAmount) {
        this.messageboxService.showMessage("Error", ["Not enough balance."]);
        check = false;
      }
      for (var j = 0; j < this.currSaleItems.length; j++) {
        this.currSaleItems[j].StoreId = this._dispensaryService.activeDispensary.StoreId;
        this.currSaleItems[j].CounterId = this.currentCounterId;
        for (var i in this.currSaleItems[j].InvoiceItemsValidator.controls) {
          this.currSaleItems[j].InvoiceItemsValidator.controls['ReturnQty'].disable();
          this.currSaleItems[j].InvoiceItemsValidator.controls['Price'].disable();
          this.currSaleItems[j].InvoiceItemsValidator.controls[i].markAsDirty();
          this.currSaleItems[j].InvoiceItemsValidator.controls[i].updateValueAndValidity();
        }
        if (!this.currSaleItems[j].IsValidCheck(undefined, undefined)) {
          check = false;
          break;
        }
      }
      for (var i in this.currSale.InvoiceValidator.controls) {
        this.currSale.InvoiceValidator.controls[i].markAsDirty();
        this.currSale.InvoiceValidator.controls[i].updateValueAndValidity();
      }
      if (!this.currSale.IsValidCheck(undefined, undefined)) {
        check = false;
        this.loading = false;
        this.messageboxService.showMessage("error", ['All * fields are mandatory']);
      }
      if (!this.checkDuplicateItem()) {
        check = false;
        this.messageboxService.showMessage("error", ['Duplicate Items are not allowd']);
      }
      if (check) {
        if (this.CheckValidaiton()) {
          this.AssignAllValues();
          this.loading = true;
          this.currSale.InvoiceItems = this.currSaleItems;
          this.currSale.StoreId = this._dispensaryService.activeDispensary.StoreId;
          this.currSale.ProviderId = this.selectedRefId;//sud:28Jan'20
          this.currSale.CreateOn = moment().format("YYYY-MM-DD HH:mm:ss");
          this.currSale.VisitType = this.visitType;
          this.currentPatient = new PHRMPatient();
          //Revision: Send only items not the invoice. <sud:4Sept'18>
          this.pharmacyBLService.PostCreditItemsDetails(this.currSale)
            .subscribe(res => {
              if (res.Status == "OK" && res.Results != null) {
                this.CallBackCreditSale(res),
                  this.loading = false;
              }
              else if (res.Status == "Failed") {
                this.loading = false;
                this.messageboxService.showMessage("error", ['There is problem, please try again']);

              }
            },
              err => {
                this.loading = false;
                this.messageboxService.showMessage("error", [err.ErrorMessage]);
              });
        }
        else {
          this.loading = false;
        }
      }
      else {
        this.loading = false;
      }
    } catch (exception) {
      this.loading = false;
      this.ShowCatchErrMessage(exception);
    }

  }
  GetAllFiscalYrs() {
    this.pharmacyBLService.GetAllFiscalYears()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allFiscalYrs = res.Results;
        }
      });
  }
  GetCreditOrganizations() {
    this.pharmacyBLService.GetCreditOrganization()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.creditOrganizationsList = res.Results;

        }
      });
  }
  //after invoice is succesfully added this function is called.
  CallBackSaveSale(res) {
    try {
      if (res.Status == "OK") {
        this.currSale.InvoiceId = res.Results.InvoiceId;
        this.messageboxService.showMessage("success", ["Invoice saved Succesfully. "]);
        this.DeductStockQuantityLocally();
        this.DeductPatientBalanceLocally();
        this.showSaleInvoice = true;
        this.searchPatient = '';
      }
      else {
        this.messageboxService.showMessage("failed", [res.ErrorMessage]);
        this.loading = false;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  private DeductStockQuantityLocally() {
    this.currSale.InvoiceItems.forEach(soldStock => {
      let item = this.ItemList.find(i => i.ItemId == soldStock.ItemId && i.BatchNo == soldStock.BatchNo && i.ExpiryDate == soldStock.ExpiryDate && i.MRP == soldStock.MRP && i.Price == soldStock.Price);
      if (item != null) item.AvailableQuantity -= soldStock.Quantity;
    });
    this.ItemListFiltered = this.ItemList.filter(x => x.AvailableQuantity > 0);
  }

  private DeductPatientBalanceLocally() {
    if (this.IsCurrentDispensaryInsurace == true) {
      let selectedPatient = this.searchPatient;
      selectedPatient.RemainingBalance -= this.currSale.TotalAmount;
    }
  }

  //after Credit bill is succesfully added this function is called.
  CallBackCreditSale(res) {
    try {
      if (res.Status == "OK") {
        let txnReceipt = PharmacyReceiptModel.GetReceiptForTransaction(res.Results);
        txnReceipt.IsValid = true;
        txnReceipt.ReceiptType = "Credit Receipt";
        txnReceipt.BillingUser = this.securityService.GetLoggedInUser().UserName;
        txnReceipt.Patient = this.currSale.selectedPatient;
        txnReceipt.CurrentFinYear = this.allFiscalYrs.find(f => f.FiscalYearId == res.Results.FiscalYearId).FiscalYearName;
        txnReceipt.StoreId = this._dispensaryService.activeDispensary.StoreId;
        txnReceipt.ReceiptDate = res.Results.CreateOn;

        this.pharmacyService.globalPharmacyReceipt = txnReceipt;
        this.router.navigate(['/Dispensary/Sale/ReceiptPrint']);
        this.currSale = new PHRMInvoiceModel();
        this.currSaleItems = new Array<PHRMInvoiceItemsModel>();
        this.messageboxService.showMessage("success", ["Succesfully. "]);
        this.loading = false;
      }
      else {
        this.messageboxService.showMessage("failed", [res.ErrorMessage]);
        this.loading = false;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  //Add New row into list
  AddRowRequest(index) {
    try {

      var tempSale: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
      //  tempSale.Quantity = 1;                          //comment code=> invoice gererated whene qty =0
      this.currSaleItems.push(tempSale);
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }

  AddRowRequestOnClick(index) {
    try {
      if (index != -1) {
        if (this.currSaleItems[index].selectedItem) {
          if (this.currSaleItems[index].selectedItem.StockId == 0) {
            window.setTimeout(function () {
              document.getElementById('discountamount').focus();
            }, 600);
            //this.NewRow(index);
          } else {
            this.NewRow(index);
          }
        } else {
          this.NewRow(index);
        }
      } else {
        this.NewRow(index);
      }

    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  OnPressedEnterKeyInGenericField(index) {
    // Check if item is selected or not.
    if (this.currSaleItems[index].selectedGeneneric != null || this.currSaleItems[index].selectedGeneneric == null) {
      // If yes, set focus to quantity field of that same row.
      this.setFocusById(`item-box${index}`);
    }
    else {
      if (this.currSaleItems.length == 1) {
        this.setFocusById(`generic${index}`);
      }
      else {
        this.currSaleItems.splice(index, 1);
        // If not, check if item level discount is available
        if (this.IsitemlevlDis == false)
        // If item level discount is not available, set focus to Discount Amount Field.
        {
          if (this.IsCurrentDispensaryInsurace == true) {
            this.setFocusById('remarks')
          }
          else {
            this.setFocusById('discountamount');
          }
        }

        else
          // If item level discount is available, set focus to Tender Field.
          this.setFocusById('Tender');
      }
    }
  }
  NewRow(index) {
    this.invalid = false;
    if (index > -1) {
      if (this.currSaleItems[index].Quantity <= this.currSaleItems[index].TotalQty) {
        this.invalid = true
      }
      if (this.currSaleItems[index].ItemName != null && this.currSaleItems[index].Quantity > 0 && this.invalid) {
        var tempSale: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
        var new_index = index + 1;
        this.currSaleItems.push(tempSale);
        this.ItemListFiltered = this.ItemList;
        this.currSaleItems[new_index].selectedItem = null;
        this.invalid = false;
      }
      else {
        this.invalid = true;
      }
    }
    else if (index == -1) {
      var tempSale: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
      var new_index = index + 1;
      this.currSaleItems.push(tempSale);
      this.ItemListFiltered = this.ItemList;
      this.currSaleItems[new_index].selectedItem = null;
    }
  }
  //to delete the row
  DeleteRow(index) {
    try {
      this.currSaleItems.splice(index, 1);
      if (index == 0 && this.currSaleItems.length == 0) {
        this.AddRowRequest(0);
        this.currSale.DiscountPer = 0; //discount percentage must be 0 once all the item is deleted.
        // this.itemTypeId = 0;
      }
      else {
        this.changeDetectorRef.detectChanges();
      }
      this.AllCalculation();
      this.checkDuplicateItem();
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  //sanjit: this function is suppose to pass all the values or non of them
  checkDuplicateItem() {
    try {
      let totalqty = 0;
      let flag: boolean = true;
      this.currSaleItems.forEach(item => { item.IsDuplicate = false; })

      for (let i = 0; i < this.currSaleItems.length; i++) {
        for (let j = i; j < this.currSaleItems.length; j++) {
          if (i != j) {
            if (this.currSaleItems[i].BatchNo == this.currSaleItems[j].BatchNo &&
              this.currSaleItems[i].ItemId == this.currSaleItems[j].ItemId &&
              this.currSaleItems[i].ExpiryDate == this.currSaleItems[j].ExpiryDate &&
              this.currSaleItems[i].MRP == this.currSaleItems[j].MRP) {
              this.messageboxService.showMessage("warning", [`Item: ${this.currSaleItems[j].selectedItem.ItemName} with Batch: ${this.currSaleItems[j].selectedItem.BatchNo} is already selected..Please Check!!!`]);
              // this.changeDetectorRef.detectChanges();
              //this.currSaleItems.splice(i, 1);
              this.setFocusById(`item-box${j}`);
              this.currSaleItems[i].IsDuplicate = this.currSaleItems[j].IsDuplicate = true;
              flag = false;
              totalqty += this.currSaleItems[j].Quantity;
              if (this.currSaleItems[i].TotalQty < totalqty + this.currSaleItems[i].Quantity) {
                flag = false;
              }
            }
          }
        }
      }
      return flag;
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //This method make all invoice property value initialization
  AssignAllValues() {
    try {
      //Initialize  invoice details for Post to db
      this.currSale.BilStatus = (this.currSale.TotalAmount == this.currSale.PaidAmount) ? "paid" : (this.currSale.PaidAmount > 0) ? "partial" : "unpaid";
      this.currSale.BilStatus = (this.currSale.PaymentMode == "credit") ? "unpaid" : "paid";
      this.currSale.CreditAmount = CommonFunctions.parseAmount(this.currSale.TotalAmount - this.currSale.PaidAmount);
      this.currSale.IsOutdoorPat = this.currSale.selectedPatient.IsOutdoorPat;
      this.currSale.PatientId = this.currSale.selectedPatient.PatientId;
      this.currSale.DepositDeductAmount = this.depositDeductAmount;
      this.currSale.DepositAmount = this.depositDeductAmount;
      this.currSale.DepositBalance = this.newdepositBalance;
      this.currSale.CounterId = this.currentCounterId;

      //Initialize Invoice Items  details for post to database
      //Initialize Invoice IteCheckValidaitonms  details for post to database
      for (var i = 0; i < this.currSaleItems.length; i++) {
        //lots of workaround here--need to revise and update properly--sud:8Feb18
        //assign value from searchTbx selected item only if searchTbx is enabled, else we already have other values assigned to the model.

        if (this.currSaleItems[i].enableItmSearch) {
          this.currSaleItems[i].CompanyId = this.currSaleItems[i].selectedItem.CompanyId;
          this.currSaleItems[i].ItemId = this.currSaleItems[i].selectedItem.ItemId;
          this.currSaleItems[i].ItemName = this.currSaleItems[i].selectedItem.ItemName;
        }
        else {

          let curItmId = this.currSaleItems[i].ItemId;
          let curItm = this.ItemTypeListWithItems.find(itm => itm.ItemId == curItmId);
          //let curItm = this.allPhrmItems.find(itm => itm.ItemId == curItmId);
          this.currSaleItems[i].CompanyId = curItm.CompanyId;
        }


        //NBB-GRItem Price and MRP for InvoiceItems doubtful
        //Now we are taking MRP and GRItemPrice to invoice from first Selected BatchNo
        //But when we sale one invoice item from two BatchNo that time In GRItems there are two different record as per batchno
        //and may be MRP, GRItemPrice vary batchNo wise
        //but now we assigning first record details to both of record
        //this.currSaleItems[i].MRP = this.currSaleItems[i].SelectedGRItems[0].MRP;
        //BatchNo assing from server
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //For selling medicine to anonymous people
  public SetAnonymous() {
    try {

      this.currSale.selectedPatient.PatientId = -1;
      this.currSale.selectedPatient.Gender = 'N/A';
      this.currSale.selectedPatient.IsOutdoorPat = null;
      this.currSale.selectedPatient.PhoneNumber = 'N/A';
      this.currSale.selectedPatient.FirstName = 'Anonymous';
      this.currSale.selectedPatient.MiddleName = null;
      this.currSale.selectedPatient.LastName = 'Anonymous';
      this.currSale.selectedPatient.Age = 'N/A';
      this.currSale.selectedPatient.Address = 'Anonymous';
      this.currSale.selectedPatient.ShortName = 'Anonymous';
      this.currSale.selectedPatient.NSHINumber = '';
      this.currSale.selectedPatient.LatestClaimCode = null;
      this.currSale.selectedPatient.RemainingBalance = null;
      this.currentPatient = this.currSale.selectedPatient;
      this.searchPatient = '';
      this.currSale.selectedPatient.PatientCode = '';
      //to change registered patient to anonymous on the top of the sale page
      var patient = this.patientService.getGlobal();
      patient.ShortName = 'Anonymous';
      patient.PatientCode = '';
      patient.DateOfBirth = '';
      patient.PANNumber = 'N/A';
      patient.Gender = '';
      patient.PhoneNumber = 'N/A';
      //to erase registered patient invoice history
      this.patSummary.CreditAmount = '';
      this.patSummary.ProvisionalAmt = '';
      this.patSummary.BalanceAmount = '';
      this.patSummary.DepositBalance = '';
      this.patSummary.TotalDue = '';

      this.divDisable = true;
      this.showInfo = true;

      this.isReferrerLoaded = false;
      this.selectedRefId = -1;//-1 is value for Anonymous Doctor.
      this.visitType = "outpatient";
      this.currSale.InvoiceValidator.get("VisitType").setValue("outpatient");
      this.changeDetectorRef.detectChanges();
      this.isReferrerLoaded = true;
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  //Start Patient Registraiton related code
  //Method for assign value to patient service
  public SetSelectedPatientData(patInfo, afterRegistration: boolean, invoiceMode = 'sale') {
    try {
      if (this.patientService.globalPatient.PatientId) {
        if (this.patientService.globalPatient.Age) {
          var localage = this.patientService.globalPatient.Age;
          patInfo.Age = localage.slice(0, -1);
          patInfo.AgeUnit = localage.slice(localage.length - 1);
        }
      }
      if (patInfo.PatientId) {
        this.currSale.selectedPatient.PatientId = patInfo.PatientId;
        this.currSale.selectedPatient.PatientCode = patInfo.PatientCode;
        this.currSale.selectedPatient.ShortName = patInfo.ShortName;
        this.currSale.selectedPatient.DateOfBirth = patInfo.DateOfBirth;
        this.currSale.selectedPatient.Gender = patInfo.Gender;
        this.currSale.selectedPatient.IsOutdoorPat = patInfo.IsOutdoorPat;
        this.currSale.selectedPatient.PhoneNumber = patInfo.PhoneNumber;
        this.currSale.selectedPatient.FirstName = patInfo.FirstName;
        this.currSale.selectedPatient.MiddleName = patInfo.MiddleName;
        this.currSale.selectedPatient.LastName = patInfo.LastName;
        this.currSale.selectedPatient.Age = patInfo.Age;
        this.currSale.selectedPatient.AgeUnit = patInfo.AgeUnit;
        this.currSale.selectedPatient.Address = patInfo.Address;
        let midName = (patInfo.MiddleName != null) ? patInfo.MiddleName : '';
        this.currSale.selectedPatient.ShortName = patInfo.FirstName + " " + midName + " " + patInfo.LastName;
        //this.currentPatient = this.currSale.selectedPatient;
        this.currentPatient = Object.assign(this.currentPatient, this.currSale.selectedPatient);
        this.divDisable = true;
        this.showInfo = true;
      }
      //check and go for save
      if (afterRegistration) {
        if (invoiceMode == 'provisional-sale')
          this.SaveCredit();
        else
          this.Save();
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //Add Patient this method check patient is already registered or not
  RegisterPatient(invoiceMode = 'sale') {
    try {
      for (var i in this.currentPatient.PHRMPatientValidator.controls) {
        this.currentPatient.PHRMPatientValidator.controls[i].markAsDirty();
        this.currentPatient.PHRMPatientValidator.controls[i].updateValueAndValidity();
      }
      if (this.currentPatient.IsValidCheck(undefined, undefined)) {
        this.loading = true;
        this.currentPatient.IsOutdoorPat = (this.visitType == "outpatient") ? true : false;
        this.pharmacyBLService.GetExistedMatchingPatientList(this.currentPatient.FirstName, this.currentPatient.LastName,
          this.currentPatient.PhoneNumber)
          .subscribe(res => {
            if (res.Status == "OK" && res.Results.length > 0) {
              this.matchingPatientList = res.Results;
              this.matchingPatientList.forEach(pat => { pat.DateOfBirth = moment(pat.DateOfBirth).format('DD-MMM-YYYY'); });
              this.showExstingPatientList = true;
            } else if (res.Status == "Failed") {
              this.loading = false;
              this.messageboxService.showMessage("error", ['There is problem, please try again']);
            } else {
              this.PostPatientRegistration(invoiceMode);
            }
          },
            err => {
              this.loading = false;
              this.messageboxService.showMessage("Please, Try again . Error in Getting Existed Match patient list", [err.ErrorMessage]);
            });
      } else {
        this.loading = false;
        this.messageboxService.showMessage("notice", ['Please register/select patient first']);
      }
    }

    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //Register Patient-Register as Outdoor new patient
  PostPatientRegistration(invoiceMode = 'sale') {
    try {
      if (this.currentPatient.IsValidCheck(undefined, undefined)) {
        this.loading = true;
        this.currentPatient.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.currentPatient.Age = this.currentPatient.Age + this.currentPatient.AgeUnit;
        this.pharmacyBLService.PostPatientRegister(this.currentPatient)
          .subscribe(
            res => {
              if (res.Status == "OK") {
                this.messageboxService.showMessage("success", ["Patient Register Successfully"]);
                this.divDisable = true;
                this.loading = false;
                this.showExstingPatientList = false;
                this.SetSelectedPatientData(res.Results, true, invoiceMode);
              }
              else {
                this.messageboxService.showMessage("error", ["Patient Registration failed check error.." + res.ErrorMessage]);
                this.loading = false;
              }
            },
            err => {
              this.messageboxService.showMessage("error", ["Patient Registration failed check error.." + err.ErrorMessage]);
              this.loading = false;
            });
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  //calculate DOB from age and ageUnit
  CalculateDob() {
    try {
      if (this.currentPatient.Age && this.currentPatient.AgeUnit) {
        var age: number = Number(this.currentPatient.Age);
        var ageUnit: string = this.currentPatient.AgeUnit;
        this.currentPatient.DateOfBirth = this.patientService.CalculateDOB(age, ageUnit);
      }

    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  // show pop up on stock details click
  StockDetails() {
    this.showStockDetails = true;
  }
  Close() {
    this.showStockDetails = false;
  }

  SaveSaleWithPatient() {
    if (this.currSale.Change < 0 && this.currSale.PaymentMode != "credit") {

      this.messageboxService.showMessage("error", ["Tender amount isn't Sufficient"]);
      return;
    }
    //check Patient is registered or not
    // if (this.currSale.selectedPatient.PatientId) {
    //   var len = this.currSaleItems.length;
    //   if (this.currSaleItems[len - 1].ItemId == null && this.currSaleItems[len - 1].InvoiceItemsValidator.get("ItemName").value == "") {
    //     this.currSaleItems.pop();
    //   }
    //   this.Save();
    // } else {
    //   //If patient not registered then first need to register patient then go to sale
    //   this.RegisterPatient();
    // }

    this.Save();
  }

  SaveSaleWithCreditPatient() {
    // if (this.IsitemlevlDis == false) {              //if item level discount is disable then general discount General Total Discount Not carry to Provisional Bill
    //   if (confirm("General Total Discount Not carry to Provisional Bill")) {
    //     this.saveCrediContinue();
    //   }
    // }
    // else {
    //   this.saveCrediContinue();
    // }
    this.saveCrediContinue();
  }

  saveCrediContinue() {
    //check Patient is registered or not
    if (this.currSale.selectedPatient.PatientId) {
      this.loading = true;
      this.SaveCredit();
    } else {
      //If patient not registered then first need to register patient then go to sale
      this.RegisterPatient('provisional-sale');
    }

  }
  //cancel method redirect to sale list page
  Cancel() {
    this.router.navigate(['/Dispensary/Patient/List'])
  }

  public ShowOpPatAddPopUp() {
    if (this.currentPatient.PatientId == 0) {
      this.showAddNewOpPopUp = true;
    }
    else if (this.currentPatient.PatientId == -1) {
      // this.currentPatient = new PHRMPatient();
      this.showAddNewOpPopUp = true;
    }
    else {
      this.messageboxService.showMessage("Notice-Message", ["Cannot edit this patient."])
    }
  }
  // Temporary solution ->
  //check ItemType, Item and batchNo validation manually
  //this manual
  CheckValidaiton(): boolean {
    try {
      let flag: boolean = true;
      for (var i = 0; i < this.currSaleItems.length; i++) {
        //when item search is disabled, selectedItem comes as null, that case just check if ItemName is assigned or not.
        //needs revision: sud-8feb18
        if (!this.currSaleItems[i].selectedItem && !this.currSaleItems[i].ItemName) {
          this.messageboxService.showMessage("notice", ["Please select Medicine of " + (i + 1).toString() + " rows"]);
          flag = false;
          break;
        }
      }
      return flag;
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }

  //used to format display of item in ng-autocomplete
  phrmItemListFormatter(data: any): string {
    //if (data[])
    let html = "";
    let date = new Date();
    let datenow = date.setMonth(date.getMonth() + 0);
    let datethreemonth = date.setMonth(date.getMonth() + 3);
    if (data["ItemId"]) {
      let expiryDate = new Date(data["ExpiryDate"]);
      let expDate = expiryDate.setMonth(expiryDate.getMonth() + 0);
      if (expDate < datenow) {
        html = `<font color='crimson'; size=03 >${data["ItemName"]}</font> |E:${moment(data["ExpiryDate"]).format('YYYY-MM-DD')} |B.No.|${data["BatchNo"]} |Qty|${data["AvailableQuantity"]} |S.Price|${data["MRP"]}`;
      }
      if (expDate < datethreemonth && expDate > datenow) {

        html = `<font  color='#FFBF00'; size=03 >${data["ItemName"]}</font> |E:${moment(data["ExpiryDate"]).format('YYYY-MM-DD')} |B.No.|${data["BatchNo"]} |Qty|${data["AvailableQuantity"]} |S.Price|${data["MRP"]}`;
      }
      if (expDate > datethreemonth) {
        html = `<font color='blue'; size=03 >${data["ItemName"]}</font> |E:${moment(data["ExpiryDate"]).format('YYYY-MM-DD')} |B.No.|${data["BatchNo"]} |Qty|${data["AvailableQuantity"]} |S.Price|${data["MRP"]}`;
      }
    }
    else {
      html = data["ItemName"];
    }
    return html;
  }
  //for insurance Item format as Insurance Item MRP is different then normal Item MRP ie Ins Item MRP is Govt.Insurance Price;
  insuranceItemListFormatter(data: any): string {
    //if (data[])
    let html = "";
    let date = new Date();
    date.setMonth(date.getMonth() + 3);
    if (data["ItemId"]) {
      let expiryDate = new Date(data["ExpiryDate"]);
      if (expiryDate < date) {
        html = `<font color='crimson'; size=03 >${data["ItemName"]}</font> |E:${moment(data["ExpiryDate"]).format('YYYY-MM-DD')} |B.No.|${data["BatchNo"]} |Qty|${data["AvailableQuantity"]} |M.R.P|${data["InsuranceMRP"]}`;
      }
      else {
        html = `<font color='blue'; size=03 >${data["ItemName"]}</font> |E:${moment(data["ExpiryDate"]).format('YYYY-MM-DD')} |B.No.|${data["BatchNo"]} |Qty|${data["AvailableQuantity"]} |M.R.P|${data["InsuranceMRP"]}`;
      }
    }
    else {
      html = data["ItemName"];
    }
    return html;
  }

  //used to format display of item in ng-autocomplete
  patientListFormatter(data: any): string {
    let html = `${data["ShortName"]} [ ${data['PatientCode']} ]`;
    return html;
  }
  insurancePatientListFormatter(data: any): string {
    let html = `[${data['PatientCode']}] | ${data["ShortName"]} | NSHI [ ${data['Ins_NshiNumber']}]`;
    return html;
  }
  //used to format display of GenericName in ng-autocomplete
  phrmGenericListFormatter(data: any): string {
    let html = "";
    if (data["GenericId"]) {
      html = `<font color='blue'; size=03 >${data["GenericName"]}</font>`;
    }
    return html;
  }
  onClickProvider($event) {
    this.selectedRefId = $event.ReferrerId;
    //default providerid is -1.
    if ($event.ReferrerId > 0 || $event.ReferrerId == -1) {
      this.currSale.ProviderId = $event.ReferrerId;
      this.currSale.EnableControl('Provider', false);
    }
    else {
      this.currSale.EnableControl('Provider', true);
    }
  }
  onClickPatient($event) {
    if ($event.PatientId > 0 || $event.PatientId == -1) {
      this.pharmacyBLService.GetPatientByPatId($event.PatientId)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.currSale.selectedPatient.PatientId = res.Results.PatientId;
            this.currSale.selectedPatient.PatientCode = res.Results.PatientCode;
            this.currSale.selectedPatient.Gender = res.Results.Gender;
            this.currSale.selectedPatient.IsOutdoorPat = null;
            this.currSale.selectedPatient.PhoneNumber = res.Results.PhoneNumber;
            this.currSale.selectedPatient.PANNumber = res.Results.PANNumber;
            this.currSale.selectedPatient.FirstName = res.Results.FirstNam
            this.currSale.selectedPatient.MiddleName = res.Results.MiddleName;
            this.currSale.selectedPatient.LastName = res.Results.LastName;
            this.currSale.selectedPatient.Age = res.Results.Age;
            this.currSale.selectedPatient.Address = res.Results.Address;
            this.currSale.selectedPatient.ShortName = res.Results.FirstName + ((res.Results.MiddleName != null) ? (' ' + res.Results.MiddleName + ' ') : (' ')) + res.Results.LastName;
            this.currSale.selectedPatient.CountrySubDivisionName = res.Results.CountrySubDivisionName;
            this.currSale.selectedPatient.DateOfBirth = res.Results.DateOfBirth;
            this.currSale.selectedPatient.IsAdmitted = res.Results.IsAdmitted;
            this.currSale.selectedPatient.NSHINumber = this.searchPatient.Ins_NshiNumber;
            this.currSale.selectedPatient.LatestClaimCode = this.searchPatient.ClaimCode;
            this.currSale.selectedPatient.RemainingBalance = this.searchPatient.Ins_InsuranceBalance;
            this.currentPatient = this.currSale.selectedPatient;
            //set patient to global
            let pat = this.patientService.CreateNewGlobal();
            pat.ShortName = res.Results.FirstName + ((res.Results.MiddleName != null) ? (' ' + res.Results.MiddleName + ' ') : (' ')) + res.Results.LastName;
            pat.PatientCode = res.Results.PatientCode;
            pat.DateOfBirth = res.Results.DateOfBirth;
            pat.PANNumber = res.Results.PANNumber;
            pat.Gender = res.Results.Gender;
            pat.PatientId = res.Results.PatientId;
            pat.PhoneNumber = res.Results.PhoneNumber;
            pat.Age = res.Results.Age;

            this.LoadPatientInvoiceSummary(this.currSale.selectedPatient.PatientId);
            this.deductDeposit = false;
            this.checkDeductfromDeposit = false;
            //this.searchPatient = '';
            //this.divDisable = true;
            this.showInfo = true;

            //Prefill VisitType. (default is outpatient)
            if (res.Results.IsAdmitted) {
              this.visitType = "inpatient";
            } else {
              this.visitType = "outpatient";
            }
            //Fill the Provider Details if available.
            if (res.Results.ProviderId) {
              this.selectedRefId = res.Results.ProviderId;
            }
            else {
              this.selectedRefId = -1;//if providerid not found for this patient, then use Anonymous.
            }

            this.currSale.ProviderId = this.selectedRefId;
            //needed to re-initiate the referrer dropdown.
            this.isReferrerLoaded = false;
            this.changeDetectorRef.detectChanges();
            this.isReferrerLoaded = true;
          }
          else {
            this.messageboxService.showMessage("Select Patient", [res.ErrorMessage]);
            this.loading = false;
          }
        });
    }
  }
  onPressedEnterKeyInPatientField() {
    // Check if item is selected or not.
    if (this.currSaleItems.length > 0 && this.currSaleItems.some(a => a.ItemId > 0)) {
      const isItemNarcotic = this.currSaleItems.some(a => a.selectedItem.IsNarcotic == true);
      if (isItemNarcotic == true && this.currSale.ProviderId == -1) {

        this.selectReferrerComponent.setFocusOnReferrerForNarcoticDrug();
      }
    }
    else {
      let index = this.currSaleItems.length - 1;
      this.setFocusById(`generic${index}`);
    }
  }
  //This function only for show catch messages
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.routeFromService.RouteFrom = null;
      this.messageboxService.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      //console.log("Stack Details =>   " + ex.stack);
    }
  }


  //used to format display of doctors name in ng-autocomplete.
  providerListFormatter(data: any): string {
    let html = data["Value"];
    return html;
  }

  LoadPatientInvoiceSummary(patientId: number) {
    if (patientId > 0) {
      this.pharmacyBLService.GetPatientSummary(patientId)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.patSummary = res.Results;
            this.patSummary.CreditAmount = CommonFunctions.parseAmount(this.patSummary.CreditAmount);
            this.patSummary.ProvisionalAmt = CommonFunctions.parseAmount(this.patSummary.ProvisionalAmt);
            this.patSummary.BalanceAmount = CommonFunctions.parseAmount(this.patSummary.BalanceAmount);
            this.patSummary.DepositBalance = CommonFunctions.parseAmount(this.patSummary.DepositBalance);
            this.patSummary.TotalDue = CommonFunctions.parseAmount(this.patSummary.TotalDue);
            this.patSummary.IsLoaded = true;
          }
          else {
            this.messageboxService.showMessage("Select Patient", [res.ErrorMessage]);
            this.loading = false;
          }
        });
    }
  }


  //Change the Checkbox value and call Calculation logic from here.
  DepositDeductCheckBoxChanged() {
    this.checkDeductfromDeposit = true;
    this.CalculateDepositBalance();
  }
  public newdepositBalance: number = 0;
  public depositDeductAmount: number = 0;

  CalculateDepositBalance() {
    if (this.deductDeposit) {
      if (this.patSummary.DepositBalance > 0) {
        this.newdepositBalance = this.patSummary.DepositBalance - this.currSale.PaidAmount;
        this.newdepositBalance = CommonFunctions.parseAmount(this.newdepositBalance);
        if (this.newdepositBalance >= 0) {
          this.depositDeductAmount = this.currSale.PaidAmount;
          this.currSale.Tender = this.currSale.PaidAmount;
          this.currSale.Change = 0;
        }
        else {
          this.currSale.Tender = -(this.newdepositBalance);//Tender is set to positive value of newDepositBalance.
          this.depositDeductAmount = this.patSummary.DepositBalance;//all deposit has been returned.
          this.newdepositBalance = 0;//reset newDepositBalance since it's all Used NOW.
          this.currSale.Change = 0;//Reset Change since we've reset Tender above.
        }
      }
      else {
        this.messageboxService.showMessage("failed", ["Deposit balance is zero, Please add deposit to use this feature."]);
        this.deductDeposit = !this.deductDeposit;
      }
    }
    else {
      //reset all required properties..
      this.currSale.Tender = this.currSale.TotalAmount;
      this.newdepositBalance = this.patSummary.DepositBalance;
      this.depositDeductAmount = 0;
      this.currSale.Change = 0;
    }
  }

  public LoadReferrerSettings() {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Pharmacy" && a.ParameterName == "ExternalReferralSettings");
    if (currParam && currParam.ParameterValue) {
      this.ExtRefSettings = JSON.parse(currParam.ParameterValue);
    }
  }
  RegisterNewOutDoorPatient() {
    for (var i in this.currentPatient.PHRMPatientValidator.controls) {
      this.currentPatient.PHRMPatientValidator.controls[i].markAsDirty();
      this.currentPatient.PHRMPatientValidator.controls[i].updateValueAndValidity();
    }
    if (this.currentPatient.IsValidCheck(undefined, undefined)) {
      this.showNewPatRegistration = false;
      this.newOutPatient = Object.assign(this.newOutPatient, this.currentPatient);
      this.newOutPatient.ShortName = this.newOutPatient.FirstName.concat(this.newOutPatient.MiddleName ? " " + this.newOutPatient.MiddleName + " " : " ").concat(this.newOutPatient.LastName);
      this.currSale.selectedPatient = this.newOutPatient;
    }
  }

  GoToNext(nextField: HTMLInputElement) {
    nextField.focus();
    nextField.select();
  }
  GotoGeneric() {
    var index = this.currSaleItems.length - 1;
    this.setFocusById(`generic${index}`)
  }

  GoToNextButton(nextField: HTMLButtonElement) {
    nextField.focus();
  }

  GoToNextSelect(paymentMode) {
    paymentMode.focus();
    var index = paymentMode.selectedIndex;
    if (index == 0) {
      document.getElementById('Tender').focus();
    }
  }

  onPaymentModechange() {
    // check for Remarks Mandatory option
    this.isRemarksMandatory = this.currentActiveDispensary.AvailablePaymentModes.find(a => a.PaymentModeName == this.currSale.PaymentMode).IsRemarksMandatory;
    if (this.currSale.PaymentMode == 'credit') {
      let onFieldChange = this.renderer2.selectRootElement('#remarks');
      onFieldChange.focus();
    } else {
      let onFieldChange = document.getElementById('Tender');
      onFieldChange.focus();
    }

  }

  //this function is hotkeys when pressed by user
  public hotkeys(event) {
    //if loading is true (i.e: when buttons are disabled), don't allow to use shortcut keys.
    if (this.loading) {
      return;
    }
    if (event.altKey) {
      switch (event.keyCode) {
        case 65: {//65='A'  => ALT+A comes here
          this.SetAnonymous();
          let itmCount = this.currSaleItems.length;
          if (itmCount > 0) {
            let lastIndex = itmCount - 1;
            window.setTimeout(function () {
              document.getElementById('generic' + lastIndex).focus();
            }, 600);
          }
          break;
        }
        case 190: { //=> ALT+. (dot) comes here -> For Chrome browser--KEEP THIS--It's WORKING
          document.getElementById('patient-search').click();
          break;
        }
        case 46: { //=> ALT+. (dot) comes here -> ASCII table shows  46=(dot), so kept this case as well, remove later if not used
          document.getElementById('patient-search').click();
          break;
        }
        case 76: {//=> ALT+L comes here
          this.StockDetails();
          break;
        }
        case 78: {// => ALT+N comes here
          this.ShowOpPatAddPopUp();
          break;
        }
        case 80: {// => ALT+P comes here -->Shortcut for Print Invoice Button
          this.SaveSaleWithPatient();
          break;
        }
        default:
          break;
      }
    }

  }

  OnAddPatientPopUpClose() {
    this.showAddNewOpPopUp = false;
  }

  OnNewPatientAdded($event) {
    this.showAddNewOpPopUp = false;
    this.currentPatient = $event.currentPatient;
    this.currSale.selectedPatient = this.currentPatient;
    var patient = this.patientService.getGlobal();
    patient.ShortName = this.currSale.selectedPatient.ShortName;
    patient.PatientCode = '';
    patient.DateOfBirth = this.currSale.selectedPatient.DateOfBirth;
    patient.Age = this.currSale.selectedPatient.Age;
    patient.Gender = this.currSale.selectedPatient.Gender;
    patient.PhoneNumber = this.currSale.selectedPatient.PhoneNumber;
    patient.PANNumber = this.currSale.selectedPatient.PANNumber;
    let index = this.currSaleItems.length - 1;
    this.setFocusById(`generic${index}`);
  }

  OnInvoicePopUpClose() {
    this.loading = false;
    this.selectedRefId = -1;
    this.isReferrerLoaded = true;
    this.currSale = new PHRMInvoiceModel();
    this.currSaleItems = new Array<PHRMInvoiceItemsModel>();
    // this.visitType = "outpatient";
    // this.currSale.InvoiceValidator.get("Provider").setValue("ANONYMOUS DOCTOR");
    // this.currSale.InvoiceValidator.get("VisitType").setValue("outpatient");
    this.AddRowRequest(0);

    //focus on 1st row of generic after item loaded. ref: sanjit/sud
    if (this.IsCurrentDispensaryInsurace == false) {
      this.SetAnonymous();
      this.setFocusById(`generic0`);
    }
    else {
      this.currSale.PaymentMode = 'credit';
      this.setFocusById(`patient-search`);
      this.visitType = 'inpatient';
      this.currSale.InvoiceValidator.get("VisitType").setValue("inpatient");
    }
    this.patientService.CreateNewGlobal();
    this.showSaleInvoice = false;
  }

  //check the Sales Page Customization ie enable or disable Vat and Discount;
  checkSalesCustomization() {
    let salesParameterString = this.coreService.Parameters.find(p => p.ParameterName == "SalesFormCustomization" && p.ParameterGroupName == "Pharmacy");
    if (salesParameterString != null) {
      let SalesParameter = JSON.parse(salesParameterString.ParameterValue);
      this.isItemLevelVATApplicable = (SalesParameter.EnableItemLevelVAT == true);
      this.isMainVATApplicable = (SalesParameter.EnableMainVAT == true);
      this.IsitemlevlDis = (SalesParameter.EnableItemLevelDiscount == true);
      this.isMainDiscountAvailable = (SalesParameter.EnableMainDiscount == true);

    }
  }

  // Barcode Event Handlers
  barcode: string = "";
  reading: boolean = false;
  typedBarcode: number = null;
  isBarcodeMode: boolean = false;
  barcodeKeyPressListener($event) {
    //usually scanners throw an 'Enter' key at the end of read
    if ($event.keyCode === 13) {
      /// code ready to use
      this.onBarcodeReadingCompleted(parseInt(this.barcode));
      this.barcode = "";
    } else {
      this.barcode += $event.key;//while this is not an 'enter' it stores the every key
    }
    //run a timeout of 200ms at the first read and clear everything
    if (!this.reading) {
      this.reading = true;
      setTimeout(() => {
        if (this.barcode.length < 7) return;
        // code ready to use
        this.onBarcodeReadingCompleted(parseInt(this.barcode));
        this.barcode = "";
        this.reading = false;
      }, 300);
    } //300 works fine
  }
  onBarcodeReadingCompleted(barcodeNumber: number) {
    var lastSaleItemIndex = this.currSaleItems.length - 1;

    let item = this.ItemList.find(a => a.BarcodeNumber == barcodeNumber);
    if (item == undefined) return;

    let newSaleItem = new PHRMInvoiceItemsModel();
    // if last row is blank, then add to that last blank row
    if (this.currSaleItems[lastSaleItemIndex].ItemId == null) {
      this.currSaleItems[lastSaleItemIndex] = newSaleItem;
    }
    // else add new item at the last
    else {
      this.currSaleItems.push(newSaleItem);
      lastSaleItemIndex++;
    }
    this.currSaleItems[lastSaleItemIndex].selectedItem = item;
    this.currSaleItems[lastSaleItemIndex].selectedGeneneric = this.genericList.find(g => g.GenericId == item.GenericId);

    this.isBarcodeMode = true;
    this.OnPressedEnterKeyInItemField(lastSaleItemIndex);
    // barcode field should be refreshed
    this.typedBarcode = null;
  }
}

export class ProviderModel {
  public Key: number = 0;
  public Value: string = null;
}
