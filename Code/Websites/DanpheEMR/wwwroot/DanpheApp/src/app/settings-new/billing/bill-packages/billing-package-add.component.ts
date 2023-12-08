import { Component, EventEmitter, Input, Output } from "@angular/core";

import { BillingPackageItem } from '../../../billing/shared/billing-package-item.model';
import { BillingPackage } from '../../../billing/shared/billing-package.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ServiceDepartment } from '../../shared/service-department.model';
import { SettingsBLService } from '../../shared/settings.bl.service';

import { BillingInvoiceBlService } from "../../../billing/shared/billing-invoice.bl.service";
import { BillingMasterBlService } from "../../../billing/shared/billing-master.bl.service";
import { BillingService } from "../../../billing/shared/billing.service";
import { BillingPackageServiceItems_DTO } from "../../../billing/shared/dto/bill-package-service-items.dto";
import { BillingPackages_DTO } from "../../../billing/shared/dto/billing-packages.dto";
import { SchemePriceCategory_DTO } from "../../../billing/shared/dto/scheme-pricecategory.dto";
import { ServiceItemDetails_DTO } from "../../../billing/shared/dto/service-item-details.dto";
import { CoreService } from "../../../core/shared/core.service";
import { Employee } from "../../../employee/shared/employee.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from '../../../shared/common.functions';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status, ENUM_ServiceBillingContext } from "../../../shared/shared-enums";
import { Department } from "../../shared/department.model";
import { BillingPackageForGrid_DTO } from "../shared/dto/bill-package-for-grid.dto";
import { BillingPackageServiceItem_DTO } from "../shared/dto/billing-package-service-item.dto";
@Component({
  selector: "billingPackage-add",
  templateUrl: "./billing-package-add.html",
  host: { '(window:keydown)': 'KeysPressed($event)' }
})
export class BillingPackageAddComponent {

  public CurrentBillingPackage = new BillingPackage();
  @Input("showAddPage")
  public showAddPage: boolean = false;
  @Input("selectedItem")
  public selectedItem: BillingPackageForGrid_DTO;
  @Output("callback-add")
  public callbackAdd = new EventEmitter<Object>();
  @Input("isUpdate")
  public isUpdate: boolean = false;
  public selectedServDepts: Array<Department> = []; //added yub 24th sept 2018
  public srvdeptList = new Array<ServiceDepartment>(); //service department list
  public packageItemList: Array<BillingPackageItem>;
  public totalAmount: number = 0;
  public totalDiscount: number = 0;
  public taxPercent: number = 0;
  public loading: boolean = false;
  public doctorList: Array<Employee> = [];
  public selectedDoctors: Array<Employee> = [];
  public LabTypeName: string = 'op-lab'; // Krishna,5thMay'22 , Added this to handle labtypes while adding billing packages..
  public IsItemLevelDiscount: boolean = false;
  public IsEditable: boolean = false;
  public ServiceItems = new Array<ServiceItemDetails_DTO>();
  public loadingScreen: boolean = false;
  public SchemePriCeCategory: SchemePriceCategoryCustomType = { SchemeId: 0, PriceCategoryId: 0 };
  public OldSchemePriCeCategory: SchemePriceCategoryCustomType = { SchemeId: 0, PriceCategoryId: 0 };
  public serviceBillingContext: string = "";
  public EnablePrice: boolean = false;
  public DisableSchemePriceSelection: boolean = false;
  public SelectedServiceItem = new BillingPackageServiceItem_DTO();
  public SelectedServiceItemList = new Array<BillingPackageServiceItem_DTO>();
  public SelectedPerformer = new Employee();
  public DiscountPercent: number = 0;
  public BillingPackage: BillingPackages_DTO = new BillingPackages_DTO();
  public confirmationTitle: string = "Confirm !";
  public confirmationMessageForSave: string = "Are you sure you want to Save Billing Package ?";
  public confirmationMessageForUpdate: string = "Are you sure you want to Update Billing Package ?";
  public IsPackageItemsInitialLoad: boolean = false;
  public DisplaySchemePriceCategorySelection: boolean = false;
  constructor(
    private _settingsBLService: SettingsBLService,
    private _messageBoxService: MessageboxService,
    public coreService: CoreService,
    private _billingService: BillingService,
    private _billingMasterBlService: BillingMasterBlService,
    public billingInvoiceBlService: BillingInvoiceBlService,
  ) {
    this.GetSrvDeptList();
    this.LoadAllDoctorsList();
  }

  ngOnInit() {
    this.IsItemLevelDiscount = false;
    this.SelectedServiceItemList = new Array<BillingPackageServiceItem_DTO>();
    this.CurrentBillingPackage = new BillingPackage();
    this.CurrentBillingPackage.PackageServiceItems = new Array<BillingPackageItem>();
    this.SelectedPerformer = null;
    if (this.isUpdate) {
      this.IsPackageItemsInitialLoad = true;
      this.SchemePriCeCategory.SchemeId = this.selectedItem.SchemeId;
      this.SchemePriCeCategory.PriceCategoryId = this.selectedItem.PriceCategoryId;
      this.DisableSchemePriceSelection = true;
      this.GetBillingPackageServiceItemList(this.selectedItem.BillingPackageId, this.selectedItem.PriceCategoryId);
    } else {
      this.DisplaySchemePriceCategorySelection = true;
    }
    this.taxPercent = this._billingService.taxPercent;
    this.SelectedServiceItem = new BillingPackageServiceItem_DTO();
  }

  public GetBillingPackageServiceItemList(BillingPackageId: number, PriceCategoryId: number): void {
    this._settingsBLService.GetBillingPackageServiceItemList(BillingPackageId, PriceCategoryId)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results.length) {
            this.SelectedServiceItemList = res.Results;
            this.SchemePriCeCategory.SchemeId = this.selectedItem.SchemeId;
            this.SchemePriCeCategory.PriceCategoryId = this.selectedItem.PriceCategoryId;
            this.CurrentBillingPackage = new BillingPackage();
            this.SetValuesInCurrentBillingPackageFormControl();
            this.CurrentBillingPackage.BillingPackageId = this.selectedItem.BillingPackageId;
            this.CurrentBillingPackage.SchemeId = this.selectedItem.SchemeId;
            this.CurrentBillingPackage.PriceCategoryId = this.selectedItem.PriceCategoryId;
            this.CurrentBillingPackage.TotalPrice = this.selectedItem.TotalPrice;
            this.CurrentBillingPackage.IsEditable = this.selectedItem.IsEditable;
            this.IsEditable = this.selectedItem.IsEditable;
            this.CurrentBillingPackage.DiscountPercent = CommonFunctions.parseAmount(this.selectedItem.DiscountPercent, 4);
            this.DiscountPercent = this.selectedItem.DiscountPercent;
            this.CurrentBillingPackage.IsActive = this.selectedItem.IsActive;
            this.CurrentBillingPackage.LabTypeName = this.selectedItem.LabTypeName;
            this.AssignPackageServiceItemtoDTO();
          }
        }
        else {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Unable to get BillingPackageServiceItemList"]);
          this.logError(res.ErrorMessage);
        }
      },
        err => {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Unable to get BillingPackageServiceItemList. Check log for error message."]);
          this.logError(err.ErrorMessage);
        });
  }

  public SetValuesInCurrentBillingPackageFormControl(): void {
    this.CurrentBillingPackage.BillingPackageValidator.get('BillingPackageName').setValue(this.selectedItem.BillingPackageName);
    this.CurrentBillingPackage.BillingPackageValidator.get('PackageCode').setValue(this.selectedItem.PackageCode);
    this.CurrentBillingPackage.BillingPackageValidator.get('Description').setValue(this.selectedItem.Description);
  }

  public AssignValuesInCurrentBillingPackage(): void {
    this.CurrentBillingPackage.BillingPackageName = this.CurrentBillingPackage.BillingPackageValidator.value.BillingPackageName;
    this.CurrentBillingPackage.PackageCode = this.CurrentBillingPackage.BillingPackageValidator.value.PackageCode;
    this.CurrentBillingPackage.Description = this.CurrentBillingPackage.BillingPackageValidator.value.Description;
  }

  public ItemLevelDiscountCheckBoxOnChange(): void {
    this.CalculationForSelectedServiceItem();
  }

  public EditableCheckBoxOnChange(): void {
    if (this.IsEditable) {
      this.IsEditable = false;
    }
    else {
      this.IsEditable = true;
    }
  }

  public OnItemQuantityChanged(): void {
    this.SelectedServiceItem.Quantity = this.SelectedServiceItem.Quantity ? this.SelectedServiceItem.Quantity : 1;
    this.CalculationForSelectedServiceItem();
  }

  public OnItemDiscountPercentChanged(): void {
    this.CalculationForSelectedServiceItem();
  }

  public OnItemDiscountAmountChanged(): void {
    this.CalculationForSelectedServiceItem();
  }

  public CalculationForSelectedServiceItem(): void {
    if (this.IsItemLevelDiscount) {
      this.SelectedServiceItem.DiscountAmount = (this.SelectedServiceItem.DiscountPercent / 100) * this.SelectedServiceItem.Price;
    }
    else {
      this.SelectedServiceItem.DiscountAmount = 0;
    }
    this.SelectedServiceItem.TotalAmount = (this.SelectedServiceItem.Price * this.SelectedServiceItem.Quantity) - this.SelectedServiceItem.DiscountAmount;
  }

  public CalculationForCurrentBillingPackage(): void {
    if (this.SelectedServiceItemList.length === 0) {
      this.CurrentBillingPackage.TotalPrice = 0;
      this.CurrentBillingPackage.DiscountPercent = 0;
      this.totalDiscount = 0;
      this.totalAmount = 0;
      return;
    }
    this.totalAmount = this.CurrentBillingPackage.TotalPrice;
    if (this.totalDiscount) {
      this.CurrentBillingPackage.DiscountPercent = CommonFunctions.parseAmount(((this.totalDiscount / this.CurrentBillingPackage.TotalPrice) * 100), 4);
    } else {
      this.totalDiscount = Math.round((this.CurrentBillingPackage.DiscountPercent * this.CurrentBillingPackage.TotalPrice) / 100);
    }
    if (this.IsItemLevelDiscount) {
      this.CurrentBillingPackage.PackageServiceItems.map(itm => itm.IsItemLevelDiscount = true);
      const overAllSubTotal = this.CurrentBillingPackage.PackageServiceItems.reduce((acc, curr) => acc + (curr.Price * curr.Quantity), 0);
      const overAllDiscountAmount = this.CurrentBillingPackage.PackageServiceItems.reduce((acc, curr) => acc + curr.DiscountAmount, 0);

      this.CurrentBillingPackage.TotalPrice = overAllSubTotal;
      this.totalAmount = this.CurrentBillingPackage.TotalPrice - overAllDiscountAmount;
      this.totalDiscount = Math.round(overAllDiscountAmount);
      this.CurrentBillingPackage.DiscountPercent = CommonFunctions.parseAmount(((this.totalDiscount * 100) / this.CurrentBillingPackage.TotalPrice), 4);
      // this.CurrentBillingPackage.DiscountPercent = Math.round(this.CurrentBillingPackage.DiscountPercent * 10000) / 10000;
      this.CurrentBillingPackage.DiscountPercent = CommonFunctions.parseAmount(((this.CurrentBillingPackage.DiscountPercent * 10000) / 10000), 4);

      this.CurrentBillingPackage.TotalPrice = CommonFunctions.parseAmount(this.CurrentBillingPackage.TotalPrice, 3);
      this.totalAmount = CommonFunctions.parseAmount(this.totalAmount, 3);
      this.totalDiscount = Math.round(this.totalDiscount);

    } else {
      this.CurrentBillingPackage.PackageServiceItems.map(itm => itm.IsItemLevelDiscount = false);
      //this.CurrentBillingPackage.TotalPrice = 0;

      this.totalAmount = 0;
      //this.totalDiscount = (this.CurrentBillingPackage.DiscountPercent * this.CurrentBillingPackage.TotalPrice) / 100;
      this.CurrentBillingPackage.PackageServiceItems.forEach((item, index) => {
        const itemSubTotal = item.Price * item.Quantity;
        let itemDiscount;
        if (!this.IsPackageItemsInitialLoad) {
          itemDiscount = CommonFunctions.parseAmount(((itemSubTotal * this.CurrentBillingPackage.DiscountPercent) / 100), 2);
          item.DiscountPercent = this.CurrentBillingPackage.DiscountPercent;
        }
        else {
          itemDiscount = CommonFunctions.parseAmount(((itemSubTotal * item.DiscountPercent) / 100), 2);
        }
        item.DiscountAmount = itemDiscount;
        item.Total = itemSubTotal - itemDiscount;
        this.SelectedServiceItemList[index].DiscountAmount = item.DiscountAmount;
        this.SelectedServiceItemList[index].TotalAmount = item.Total;
        item.Tax = (this.taxPercent * item.Total) / 100;
        item.Total = CommonFunctions.parseAmount(item.Total + item.Tax);
      });
      this.IsPackageItemsInitialLoad = false;
      this.totalAmount = CommonFunctions.parseAmount(this.CurrentBillingPackage.TotalPrice - this.totalDiscount);
    }
  }

  public AssignSelectedInvoiceItem(): void {
    if (this.SelectedServiceItem && this.SelectedServiceItem.ServiceItemId && typeof (this.SelectedServiceItem) === 'object') {
      this.SelectedServiceItem.Quantity = 1;
      this.CalculationForSelectedServiceItem();
    }
  }

  public AssignSelectedPerformer(): void {
    if (this.SelectedPerformer) {
      this.SelectedServiceItem.PerformerId = this.SelectedPerformer.EmployeeId;
      this.SelectedServiceItem.PerformerName = this.SelectedPerformer.FullName;
    }
  }

  public AddInvoiceItems(): void {
    this.totalDiscount = 0;
    if (this.SelectedServiceItem.ItemName === "" || this.SelectedServiceItem.ItemName && this.SelectedServiceItem.ItemName.trim() === "") {
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Select ServiceItem.",]);
      return;
    }
    if (typeof (this.SelectedServiceItem) !== 'object') {
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Select ServiceItem.",]);
      return;
    }
    const isDuplicate = this.SelectedServiceItemList.some(serviceItem => serviceItem.ServiceItemId === this.SelectedServiceItem.ServiceItemId);
    if (isDuplicate) {
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Duplicate ServiceItem.",]);
      return;
    }
    this.SelectedServiceItemList.push(this.SelectedServiceItem);
    let packageServiceItem = new BillingPackageItem();
    packageServiceItem.ServiceDeptId = this.SelectedServiceItem.ServiceDepartmentId;
    packageServiceItem.SchemeId = this.SelectedServiceItem.SchemeId;
    packageServiceItem.PriceCategoryId = this.SelectedServiceItem.PriceCategoryId;
    packageServiceItem.Price = this.SelectedServiceItem.Price;
    packageServiceItem.DiscountPercent = this.SelectedServiceItem.DiscountPercent;
    packageServiceItem.Quantity = this.SelectedServiceItem.Quantity;
    packageServiceItem.Total = this.SelectedServiceItem.TotalAmount;
    packageServiceItem.DiscountAmount = this.SelectedServiceItem.DiscountAmount;
    packageServiceItem.IsActive = true;
    packageServiceItem.PerformerId = this.SelectedServiceItem.PerformerId;
    packageServiceItem.ServiceItemId = this.SelectedServiceItem.ServiceItemId;
    this.CurrentBillingPackage.PackageServiceItems.push(packageServiceItem);
    this.CalculationForCurrentBillingPackage();
    this.SelectedServiceItem = new BillingPackageServiceItem_DTO();
    this.SelectedPerformer = null;
  }

  public AssignPackageServiceItemtoDTO(): void {
    this.SelectedServiceItemList.forEach(element => {
      let packageServiceItem = new BillingPackageItem();
      packageServiceItem.ServiceDeptId = element.ServiceDepartmentId;
      packageServiceItem.PackageServiceItemId = element.PackageServiceItemId;
      packageServiceItem.ServiceDeptId = element.ServiceDepartmentId;
      packageServiceItem.SchemeId = element.SchemeId;
      packageServiceItem.PriceCategoryId = element.PriceCategoryId;
      packageServiceItem.Price = element.Price;
      packageServiceItem.DiscountPercent = element.DiscountPercent;
      packageServiceItem.Quantity = element.Quantity;
      packageServiceItem.Total = element.Price * element.Quantity;
      packageServiceItem.DiscountAmount = (element.DiscountPercent / 100) * packageServiceItem.Total;
      packageServiceItem.IsActive = true;
      packageServiceItem.PerformerId = element.PerformerId;
      packageServiceItem.ServiceItemId = element.ServiceItemId;
      this.CurrentBillingPackage.PackageServiceItems.push(packageServiceItem);
    });
    this.CalculationForCurrentBillingPackage();
  }

  public RemoveInvoiceItem(index: number): void {
    this.SelectedServiceItemList.splice(index, 1);
    this.CurrentBillingPackage.PackageServiceItems.splice(index, 1);
    this.CalculationForCurrentBillingPackage();
  }

  public OnDiscountAmountChange(): void {
    if (this.totalDiscount === null || this.totalDiscount === 0) {
      this.CurrentBillingPackage.DiscountPercent = 0;
    }
    this.CalculationForCurrentBillingPackage();
  }

  public OnSchemePriceCategoryChanged(schemePriceObj: SchemePriceCategory_DTO): void {
    if (schemePriceObj.PriceCategoryId === this.OldSchemePriCeCategory.PriceCategoryId) {
      return;
    }
    if (!this.isUpdate) {
      this.CurrentBillingPackage = new BillingPackage();
      this.SelectedServiceItem = new BillingPackageServiceItem_DTO();
      this.SelectedServiceItemList = new Array<BillingPackageServiceItem_DTO>();
      this.CurrentBillingPackage.PackageServiceItems = new Array<BillingPackageItem>();
      this.totalDiscount = 0;
      this.totalAmount = 0;
    }
    this.SelectedPerformer = null;
    if (schemePriceObj) {
      this.serviceBillingContext = ENUM_ServiceBillingContext.OpBilling;
      this.GetServiceItems(this.serviceBillingContext, schemePriceObj.SchemeId, schemePriceObj.PriceCategoryId);
      this.CurrentBillingPackage.SchemeId = schemePriceObj.SchemeId;
      this.CurrentBillingPackage.PriceCategoryId = schemePriceObj.PriceCategoryId;
    }
    this.OldSchemePriCeCategory.SchemeId = schemePriceObj.SchemeId;
    this.OldSchemePriCeCategory.PriceCategoryId = schemePriceObj.PriceCategoryId;
  }

  public GetServiceItems(serviceBillingContext: string, schemeId: number, priceCategoryId: number): void {
    this.ServiceItems = new Array<ServiceItemDetails_DTO>();
    this.loadingScreen = true; //not implement as in view as of now
    this._billingMasterBlService.GetServiceItems(serviceBillingContext, schemeId, priceCategoryId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length > 0) {
          this.ServiceItems = res.Results;
          if (this.ServiceItems && this.ServiceItems.length > 0) {
            this.loadingScreen = false;
          }
        } else {
          this.loadingScreen = false;
          this.ServiceItems = new Array<ServiceItemDetails_DTO>();
          console.log("This priceCategory does not have Service Items mapped.");
        }
      },
        err => {
          this.loadingScreen = false;
          console.log(err);
        }
      );
  }

  public GetSrvDeptList(): void {
    this._settingsBLService.GetBillingServDepartments()
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results.length) {
            this.srvdeptList = res.Results;
          }
          else {
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Check log for error message."]);
            this.logError(res.ErrorMessage);
          }
        }
      },
        err => {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Failed to get service departments. Check log for error message."]);
          this.logError(err.ErrorMessage);
        });
  }

  public LoadAllDoctorsList(): void {
    this._settingsBLService.GetDoctorsList()
      .subscribe((res) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          console.log("doctors list are loaded successfully (billing-main).");
          this.doctorList = res.Results;
        }
        else {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Couldn't get doctor's list."]);
        }
      });
  }

  public SetSelectedDoctor(index: number): void {
    var doc = this.doctorList.find(a => Number(a.EmployeeId) === Number(this.packageItemList[index].EmployeeId));
    if (doc) {
      this.selectedDoctors[index] = doc;
    }
  }

  Submit(value: string): void {
    this.loading = true;
    this.AssignValuesInCurrentBillingPackage();
    for (let i in this.CurrentBillingPackage.BillingPackageValidator.controls) {
      this.CurrentBillingPackage.BillingPackageValidator.controls[i].markAsDirty();
      this.CurrentBillingPackage.BillingPackageValidator.controls[i].updateValueAndValidity();
    }
    for (let packageItem of this.CurrentBillingPackage.PackageServiceItems) {
      for (let i in packageItem.BillingPackageItemValidator.controls) {
        packageItem.BillingPackageItemValidator.controls[i].markAsDirty();
        packageItem.BillingPackageItemValidator.controls[i].updateValueAndValidity();
      }
    }
    if (this.CurrentBillingPackage.TotalPrice < this.totalDiscount) {
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Discount amount should be less than total price."]);
    }
    if (this.CheckValidation()) {
      if (value === "add")
        this.Add();
      else
        this.Update();
    }
    this.loading = false;
  }

  public AssignBillingPackageIntoDTO(): void {
    this.BillingPackage.BillingPackageId = this.CurrentBillingPackage.BillingPackageId;
    this.BillingPackage.BillingPackageName = this.CurrentBillingPackage.BillingPackageName;
    this.BillingPackage.Description = this.CurrentBillingPackage.Description;
    this.BillingPackage.TotalPrice = this.CurrentBillingPackage.TotalPrice;
    this.BillingPackage.DiscountPercent = this.CurrentBillingPackage.DiscountPercent;
    this.BillingPackage.PackageCode = this.CurrentBillingPackage.PackageCode;
    this.BillingPackage.IsActive = this.isUpdate ? this.CurrentBillingPackage.IsActive : true;
    this.BillingPackage.LabTypeName = this.CurrentBillingPackage.LabTypeName;
    this.BillingPackage.SchemeId = this.CurrentBillingPackage.SchemeId;
    this.BillingPackage.PriceCategoryId = this.CurrentBillingPackage.PriceCategoryId;
    this.BillingPackage.IsEditable = this.IsEditable;
    this.BillingPackage.BillingPackageServiceItemList = new Array<BillingPackageServiceItems_DTO>();
    this.CurrentBillingPackage.PackageServiceItems.forEach(element => {
      let packageItem = new BillingPackageServiceItems_DTO();
      packageItem.PackageServiceItemId = element.PackageServiceItemId;
      packageItem.BillingPackageId = element.BillingPackageId;
      packageItem.ServiceItemId = element.ServiceItemId;
      packageItem.DiscountPercent = element.DiscountPercent;
      packageItem.Quantity = element.Quantity;
      packageItem.PerformerId = element.PerformerId;
      packageItem.IsActive = this.isUpdate ? element.IsActive : true;
      this.BillingPackage.BillingPackageServiceItemList.push(packageItem);
    });
  }

  public checkNegative(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = parseFloat(inputElement.value);

    if (inputValue < 0) {
      inputElement.value = '0';
      this.totalDiscount = 0;
    } else {
      this.totalDiscount = inputValue;
    }
  }

  public Add(): void {
    if (this.totalDiscount === 0) {
      this.CurrentBillingPackage.DiscountPercent = 0;
    }
    this.CurrentBillingPackage.LabTypeName = this.LabTypeName;
    this.AssignBillingPackageIntoDTO();
    this._settingsBLService.AddBillingPackage(this.BillingPackage)
      .subscribe(
        res => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.callbackAdd.emit({ packageItem: res.Results });
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Billing Package Added"]);
            this.CurrentBillingPackage = new BillingPackage();
            this.SelectedServiceItem = new BillingPackageServiceItem_DTO();
            this.SelectedServiceItemList = new Array<BillingPackageServiceItem_DTO>();
            this.CurrentBillingPackage = new BillingPackage();
            this.CurrentBillingPackage.PackageServiceItems = new Array<BillingPackageItem>();
            this.IsItemLevelDiscount = false;
            this.SelectedPerformer = null;
            this.Close();
          }
          else {
            this._messageBoxService.showMessage(ENUM_DanpheHTTPResponses.OK, ["Check log for details"]);
            this.CurrentBillingPackage.PackageServiceItems = new Array<BillingPackageItem>();
            console.log(res.ErrorMessage);
          }
        },
        err => {
          this.logError(err);
        });
  }

  public Update(): void {
    this.CurrentBillingPackage.LabTypeName = this.LabTypeName;
    this.AssignBillingPackageIntoDTO();
    this._settingsBLService.UpdateBillingPackage(this.BillingPackage)
      .subscribe(
        res => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Billing Package Updated"]);
            this.callbackAdd.emit({ packageItem: res.Results });
            this.Close();
          }
          else {
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Check log for details"]);
            console.log(res.ErrorMessage);
          }
        },
        err => {
          this.logError(err);
        });
  }

  public CheckValidation(): boolean {
    let isValid = true;
    if (!this.CurrentBillingPackage.IsValidCheck(undefined, undefined)) {
      this._messageBoxService.showMessage(ENUM_DanpheHTTPResponses.Failed, ["Please fill madatory fields."]);
      isValid = false;
    }
    if (this.CurrentBillingPackage.PackageServiceItems.length === 0) {
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Atleast One Service Item is Required."]);
      isValid = false;
    }
    if (this.totalDiscount < 0) {
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Discount Amount can't be negative."]);
      isValid = false;
    }
    return isValid;
  }

  public logError(err: any): void {
    console.log(err);
  }

  public Close(): void {
    this.SelectedServiceItem = new BillingPackageServiceItem_DTO();
    this.SelectedServiceItemList = new Array<BillingPackageServiceItem_DTO>();
    this.CurrentBillingPackage = new BillingPackage();
    this.CurrentBillingPackage.PackageServiceItems = new Array<BillingPackageItem>();
    this.IsItemLevelDiscount = false;
    this.SelectedPerformer = null;
    this.selectedServDepts = [];
    // this.selectedBillItems = [];
    this.selectedDoctors = [];
    this.selectedItem = null;
    this.isUpdate = false;
    this.showAddPage = false;
  }

  public ServiceDeptListFormatter(data: any): string {
    return data["ServiceDepartmentName"];
  }

  public DoctorListFormatter(data: any): string {
    return data["FullName"];
  }

  public ItemsListFormatter(data: any): string {
    let html: string = "";
    if (data.ServiceDepartmentName !== "OPD") {
      html = "<font color='blue'; size=03 >" + data["ItemCode"] + "&nbsp;&nbsp;" + ":" + "&nbsp;" + data["ItemName"].toUpperCase() + "</font>" + "&nbsp;&nbsp;";
      html += "(<i>" + data["ServiceDepartmentName"] + "</i>)" + "&nbsp;&nbsp;" + 'Rs.' + "<b>" + data["Price"] + "</b>";
      return html;
    }
    else {
      let docName = data.Doctor ? data.Doctor.DoctorName : "";
      html = "<font color='blue'; size=03 >" + data["ItemCode"] + "&nbsp;&nbsp;" + ":" + "&nbsp;" + data["ItemName"].toUpperCase() + "&nbsp;&nbsp;" +
        data["ServiceDepartmentName"] + "</i>)" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + "<b>" + data["Price"] + "</b>";
    }
    return html;
  }

  public GoToNextElement(id: string): void {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 50);
  }

  public KeysPressed(event): void {
    if (event.keyCode == 27) { // For ESCAPE_KEY =>close pop up
      this.Close();
    }
  }

  public HandleConfirmForSave(): void {
    this.loading = true;
    this.Submit('add');
  }

  public HandleConfirmForUpdate(): void {
    this.loading = true;
    this.Submit('update');
  }

  public HandleCancel(): void {
    this.loading = false;
  }

}
