import { Component, ChangeDetectorRef, Output, EventEmitter, Input, OnDestroy, Renderer2 } from "@angular/core";

import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { PHRMItemMasterModel } from "../../shared/phrm-item-master.model";
import { PHRMItemTypeModel } from "../../shared/phrm-item-type.model";
import { PHRMCompanyModel } from "../../shared/phrm-company.model";
import { PHRMSupplierModel } from "../../shared/phrm-supplier.model";
import { PHRMUnitOfMeasurementModel } from "../../shared/phrm-unit-of-measurement.model";
import { PHRMGenericModel } from '../../shared/phrm-generic.model';
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { PhrmRackModel } from "../../shared/rack/phrm-rack.model"
import { PHRMSalesCategoryModel } from "../../shared/phrm-sales-category.model";
import { CoreService } from "../../../core/shared/core.service";
import { CFGParameterModel } from "../../../settings-new/shared/cfg-parameter.model";
import { ENUM_StockLocations } from "../../../shared/shared-enums";
import { PHRMPackingTypeModel } from "../../shared/phrm-packing-type.model";

@Component({
  selector: "phrm-item-add",
  templateUrl: "./phrm-item-manage.html"
})

export class PHRMItemMasterManageComponent implements OnDestroy {
  abcCategory = [
    { value: 'A', text: 'Category A' },
    { value: 'B', text: 'Category B' },
    { value: 'C', text: 'Category C' },
  ];
  vedCategory = [
    { value: 'V', text: 'Category V' },
    { value: 'E', text: 'Category E' },
    { value: 'D', text: 'Category D' },
  ];
  ///set parameter value for cc charge
  public paramerter: CFGParameterModel = new CFGParameterModel();
  public CurrentItem: PHRMItemMasterModel = new PHRMItemMasterModel();
  public selectedItem: PHRMItemMasterModel = new PHRMItemMasterModel();
  public itemList: Array<PHRMItemMasterModel> = new Array<PHRMItemMasterModel>();
  public companyList: Array<PHRMCompanyModel> = new Array<PHRMCompanyModel>();
  public salesCategoryList: Array<PHRMSalesCategoryModel> = new Array<PHRMSalesCategoryModel>();
  public supplierList: Array<PHRMSupplierModel> = new Array<PHRMSupplierModel>();
  public itemtypeList: Array<PHRMItemTypeModel> = new Array<PHRMItemTypeModel>();
  public uomList: Array<PHRMUnitOfMeasurementModel> = new Array<PHRMUnitOfMeasurementModel>();
  public genericList: Array<PHRMGenericModel> = new Array<PHRMGenericModel>();
  public itemGridColumns: Array<any> = null;
  public showItemAddPage: boolean = false;
  public showPackingTypeAddPopUp: boolean = false;
  public showGenericTypeAddPopUp: boolean = false;
  public showUOMTypeAddPopUp: boolean = false;
  public showItemTypeAddPopUp: boolean = false;
  public showSelectcompanyTypeAddPopUp: boolean = false;
  public showSelectcategorymanageTypeAddPopUp: boolean = false;
  //for cccharge list 
  public ccChargelist: any;
  public ccchargeData: any;
  // for cccharges popup
  public showAddCCcharge: boolean = false;
  public update: boolean = false;
  public index: number;
  public selCompany: PHRMCompanyModel = new PHRMCompanyModel();
  public selCategory: PHRMSalesCategoryModel = new PHRMSalesCategoryModel();
  public selItemType: PHRMItemTypeModel = new PHRMItemTypeModel();
  public selGenName: PHRMGenericModel = new PHRMGenericModel();
  public selUOM: PHRMUnitOfMeasurementModel = new PHRMUnitOfMeasurementModel();

  //for show and hide packing features
  IsPkgitem: boolean = false;
  public selectedItemId: number = null;
  public showAddToRackPage: boolean = false;
  public DispensaryRackList: Array<PhrmRackModel> = new Array<PhrmRackModel>();
  public StoreRackList: Array<PhrmRackModel> = new Array<PhrmRackModel>();
  public packingtypeList: Array<PHRMPackingTypeModel> = new Array<PHRMPackingTypeModel>();
  public packingList: Array<PHRMPackingTypeModel> = [];
  public selectedPacking: PHRMPackingTypeModel = new PHRMPackingTypeModel();
  public selectedGeneric: PHRMGenericModel = new PHRMGenericModel();
  public rackId: number = null;
  public globalListenFunc: Function;
  public ESCAPE_KEYCODE = 27;   //to close the window on click of ESCape.

  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  showCompanyAddPopUp: boolean;
  @Input("showAddPage")
  public set value(val: boolean) {
    this.showItemAddPage = val;
  }

  constructor(
    public coreService: CoreService,
    public pharmacyBLService: PharmacyBLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService, public renderer2: Renderer2) {
    this.itemGridColumns = PHRMGridColumns.PHRMItemList;
    this.getItemList();
    this.getSuppliers();
    this.getCompanies();
    this.getItemTypes();
    this.getUOMs();
    this.getGenericList();
    this.getSalesCategoryList();
    this.setCcchargelist();
    this.GetRack();
    this.GetPackingTypeList();
    this.showpacking();
  }
  ngOnInit() {
    this.globalListenFunc = this.renderer2.listen('document', 'keydown', e => {
      if (e.keyCode == this.ESCAPE_KEYCODE) {
        this.Close()
      }
    });
  }

  ngOnDestroy() {

  }
  public GetPackingTypeList() {
    this.pharmacyBLService.GetPackingTypeList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.packingtypeList = res.Results;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
          console.log(res.ErrorMessage)
        }
      });
  }
  public getGenericList() {
    this.pharmacyBLService.GetGenericList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.genericList = res.Results;
        }
      });
  }
  showpacking() {
    this.IsPkgitem = true;
    let pkg = this.coreService.Parameters.find((p) => p.ParameterName == "PharmacyGRpacking" && p.ParameterGroupName == "Pharmacy").ParameterValue;
    if (pkg == "true") {
      this.IsPkgitem = true;
    } else {
      this.IsPkgitem = false;
      //this.goodReceiptItems.GoodReceiptItemValidator.controls["PackingQuantity"].disable();
    }
  }
  public getItemList() {
    this.pharmacyBLService.GetItemList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.itemList = res.Results;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
          console.log(res.ErrorMessage)
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
        });
  }



  public getSuppliers() {
    this.pharmacyBLService.GetSupplierList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.supplierList = res.Results;
          }
        }
        else {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
        });
  }
  public getCompanies() {
    this.pharmacyBLService.GetCompanyList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.companyList = res.Results;
          }
        }
        else {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
        });
  }
  public getSalesCategoryList() {
    this.pharmacyBLService.GetSalesCategoryList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.salesCategoryList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
        });
  }
  public getItemTypes() {
    this.pharmacyBLService.GetItemTypeListManage()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.itemtypeList = res.Results;
          }
        }
        else {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
        });
  }
  public getUOMs() {
    this.pharmacyBLService.GetUnitOfMeasurementList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.uomList = res.Results;
          }
        }
        else {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
        });
  }
  ItemGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "edit": {
        this.selectedItem = null;
        this.update = true;
        this.index = this.itemList.findIndex(a => a.ItemId == $event.Data.ItemId);
        this.showItemAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedItem = $event.Data;
        this.CurrentItem.ItemId = this.selectedItem.ItemId;
        this.CurrentItem.ItemName = this.selectedItem.ItemName;
        this.CurrentItem.GenericName = this.selectedItem.GenericName;
        this.CurrentItem.ItemCode = this.selectedItem.ItemCode;
        this.CurrentItem.CompanyId = this.selectedItem.CompanyId;
        this.selCompany.CompanyName = $event.Data.CompanyName;

        //this.CurrentItem.SupplierId = this.selectedItem.SupplierId;
        this.CurrentItem.ItemTypeId = this.selectedItem.ItemTypeId;
        this.selItemType.ItemTypeName = $event.Data.ItemTypeName;
        this.CurrentItem.UOMId = this.selectedItem.UOMId;
        this.selUOM = this.uomList.find(a => a.UOMId == this.CurrentItem.UOMId);
        this.CurrentItem.ReOrderQuantity = this.selectedItem.ReOrderQuantity;
        this.CurrentItem.MinStockQuantity = this.selectedItem.MinStockQuantity;
        this.CurrentItem.BudgetedQuantity = this.selectedItem.BudgetedQuantity;
        this.CurrentItem.PurchaseVATPercentage = this.selectedItem.PurchaseVATPercentage;
        this.CurrentItem.SalesVATPercentage = this.selectedItem.SalesVATPercentage;
        this.CurrentItem.IsVATApplicable = this.selectedItem.IsVATApplicable;
        this.CurrentItem.IsActive = this.selectedItem.IsActive;
        this.CurrentItem.GenericId = this.selectedItem.GenericId;
        this.selGenName.GenericName = this.genericList.find(a => a.GenericId == this.CurrentItem.GenericId).GenericName;
        this.CurrentItem.IsInsuranceApplicable = this.selectedItem.IsInsuranceApplicable;
        this.CurrentItem.GovtInsurancePrice = this.selectedItem.GovtInsurancePrice;

        this.CurrentItem.IsInternationalBrand = this.selectedItem.IsInternationalBrand;
        this.CurrentItem.CCCharge = this.selectedItem.CCCharge;
        if (this.CurrentItem.CCCharge == null) {
          this.CurrentItem.CCCharge = 0;
        }
        this.ccchargeData = this.ccChargelist.find(c => c.CCChargevalue == this.CurrentItem.CCCharge);            // on valueChanged of cccharge there check id and geting error 
        this.CurrentItem.IsNarcotic = this.selectedItem.IsNarcotic;
        this.CurrentItem.ABCCategory = this.selectedItem.ABCCategory;
        this.CurrentItem.PackingTypeId = this.selectedItem.PackingTypeId;
        this.CurrentItem.VED = this.selectedItem.VED;
        this.CurrentItem.SalesCategoryId = this.selectedItem.SalesCategoryId;
        this.selCategory = this.salesCategoryList.find(a => a.SalesCategoryId == this.CurrentItem.SalesCategoryId);
        this.CurrentItem.Dosage = this.selectedItem.Dosage;
        this.CurrentItem.CCCharge = $event.Data.CCCharge;
        this.showItemAddPage = true;
        this.setFocusById('category');
        break;
      }
      case "activateDeactivateIsActive": {
        if ($event.Data != null) {
          this.selectedItem = null;
          this.selectedItem = $event.Data;
          this.ActivateDeactivateStatus(this.selectedItem);
          this.selectedItem = null;
        }
        break;
      }
      case "add-rack": {
        this.showAddToRackPage = false;
        this.selectedItemId = null;
        var storeRackId = $event.Data.StoreRackId;
        this.CurrentItem.StoreRackId = storeRackId;
        this.selectedItemId = $event.Data.ItemId;
        var rackName = $event.Data.RackName;
        var selectedRack = this.DispensaryRackList.find(rack => rack.Name == rackName);
        if (selectedRack != null) {
          this.rackId = selectedRack.RackId;
        }
        this.showAddToRackPage = true;
        break;
      }

      default:
        break;
    }
  }
  AddItem() {
    this.showItemAddPage = false;
    this.changeDetector.detectChanges();
    this.showItemAddPage = true;
    this.setFocusById("category");
  }
  Add() {
    for (var i in this.CurrentItem.ItemValidator.controls) {
      this.CurrentItem.ItemValidator.controls[i].markAsDirty();
      this.CurrentItem.ItemValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentItem.CCCharge == null) {
      this.CurrentItem.CCCharge = 0;
    }
    if (this.CurrentItem.PackingTypeId != null) {
      this.CurrentItem.ItemValidator.controls['PackingTypeId'].disable();
    }
    if (this.IsPkgitem == false) {
      this.CurrentItem.ItemValidator.controls['PackingTypeId'].disable();
    }
    else {
      if (this.CurrentItem.PackingTypeId == null) {
        this.msgBoxServ.showMessage("error", ["Packaging Type is required"])
      }
      else {
        this.CurrentItem.ItemValidator.controls['PackingTypeId'].disable();
      }

    }

    if (this.CurrentItem.GenericId == 0 || this.CurrentItem.ItemTypeId == 0 || this.CurrentItem.CompanyId == 0) {
      this.msgBoxServ.showMessage("error", ["Generic name or type or company is missing "]);

    }
    else {
      if (this.CurrentItem.IsValidCheck(undefined, undefined)) {
        if (this.checkGovtInsurancePrice()) {
          this.CurrentItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
          this.pharmacyBLService.AddItem(this.CurrentItem)
            .finally(() => { this.ClearItemData() })
            .subscribe(
              res => {
                if (res.Status == "OK") {
                  this.msgBoxServ.showMessage("success", ["Item Added."]);
                  this.CallBackAddUpdate(res)
                  this.CurrentItem = new PHRMItemMasterModel();
                }
                else {
                  this.msgBoxServ.showMessage("error", ["Something Wrong " + res.ErrorMessage]);
                }
              },
              err => {
                this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
              });
        }
        else {
          this.msgBoxServ.showMessage("error", ["Please Add Valid Insurance Price."])
        }
      }

    }
  }
  Update() {
    for (var i in this.CurrentItem.ItemValidator.controls) {
      this.CurrentItem.ItemValidator.controls[i].markAsDirty();
      this.CurrentItem.ItemValidator.controls[i].updateValueAndValidity();
    }
    // if (this.CurrentItem.PackingTypeId != null) {
    //   this.CurrentItem.ItemValidator.controls['PackingTypeId'].disable();
    // }
    if (this.IsPkgitem == false) {
      this.CurrentItem.ItemValidator.controls['PackingTypeId'].disable();
    }
    else {
      if (this.CurrentItem.PackingTypeId == null)
        this.msgBoxServ.showMessage("error", ["Packaging Type is required"])
      else {
        this.CurrentItem.ItemValidator.controls['PackingTypeId'].disable();
      }
    }
    if (this.CurrentItem.IsValidCheck(undefined, undefined)) {
      if (this.checkGovtInsurancePrice()) {
        this.CurrentItem.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
        this.CurrentItem.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.pharmacyBLService.UpdateItem(this.CurrentItem)
          .finally(() => { this.ClearItemData() })
          .subscribe(
            res => {
              if (res.Status == "OK") {
                this.msgBoxServ.showMessage("success", ['Item  Details Updated.']);
                this.CallBackAddUpdate(res);
                this.CurrentItem = new PHRMItemMasterModel();
              }
              else {
                this.msgBoxServ.showMessage("failed", ["Something Wrong " + res.ErrorMessage]);
              }
            },
            err => {
              this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
            });
      }
      else {
        this.msgBoxServ.showMessage("error", ["Please Add Valid Insurance Price."])
      }
    }
  }
  checkGovtInsurancePrice() {
    if (this.CurrentItem.IsInsuranceApplicable == true && this.CurrentItem.GovtInsurancePrice <= 0) return false;
    if (this.CurrentItem.IsInsuranceApplicable == true && this.CurrentItem.GovtInsurancePrice == null) return false;
    return true;
  }
  CallBackAddUpdate(res) {
    if (res.Status == "OK") {
      var item: any = {};
      item.ItemId = res.Results.ItemId;
      item.ItemName = res.Results.ItemName;
      item.ItemCode = res.Results.ItemCode;
      item.CompanyId = res.Results.CompanyId;
      item.SupplierId = res.Results.SupplierId;
      item.ItemTypeId = res.Results.ItemTypeId;
      item.UOMId = res.Results.UOMId;
      item.StandardPrice = res.Results.StandardPrice;
      item.SellingPrice = res.Results.SellingPrice;
      item.ReOrderQuantity = res.Results.ReOrderQuantity;
      item.MinStockQuantity = res.Results.MinStockQuantity;
      item.BudgetedQuantity = res.Results.BudgetedQuantity;
      item.PurchaseVATPercentage = res.Results.PurchaseVATPercentage;
      item.SalesVATPercentage = res.Results.SalesVATPercentage;
      item.IsVATApplicable = res.Results.IsVATApplicable;
      item.PackingTypeId = res.Results.PackingTypeId;
      item.IsActive = res.Results.IsActive;
      item.IsInternationalBrand = res.Results.IsInternationalBrand;
      item.CCCharge = res.Results.CCCharge;
      item.Duration = res.Results.Duration;
      item.Frequency = res.Results.Frequency;
      item.Dosage = res.Results.Dosage;
      item.IsNarcotic = res.Results.IsNarcotic;
      item.SalesCategoryId = res.Results.SalesCategoryId;
      item.ABCCategory = res.Results.ABCCategory;
      item.VED = res.Results.VED;
      item.Rack = res.Results.Rack;
      item.GenericId = res.Results.GenericId;
      item.GenericName = this.selGenName.GenericName;
      item.IsInsuranceApplicable = res.Results.IsInsuranceApplicable;
      item.GovtInsurancePrice = res.Results.GovtInsurancePrice;

      let newCompany = this.companyList.find(c => c.CompanyId == res.Results.CompanyId);
      item.CompanyName = (newCompany != null) ? newCompany.CompanyName : null;

      let newSupplier = this.supplierList.find(c => c.SupplierId == res.Results.SupplierId)
      item.SupplierName = (newSupplier != null) ? newSupplier.SupplierName : null;


      let newUom = this.uomList.find(c => c.UOMId == res.Results.UOMId);
      item.UOMName = (newUom != null) ? newUom.UOMName : null;

      let newItemType = this.itemtypeList.find(c => c.ItemTypeId == res.Results.ItemTypeId);
      item.ItemTypeName = (newItemType != null) ? newItemType.ItemTypeName : null;
      //this.getItemList();
      this.CallBackAdd(item);
    }
    else {
      this.msgBoxServ.showMessage("error", ['some error ' + res.ErrorMessage]);
    }
  }
  CallBackAdd(itm: PHRMItemMasterModel) {
    if (this.index != null)
      this.itemList.splice(this.index, 1, itm);
    else
      this.itemList.unshift(itm);
    this.itemList = this.itemList.slice();
    this.changeDetector.detectChanges();
    this.showItemAddPage = false;
    this.selectedItem = null;
    this.index = null;
    this.callbackAdd.emit({ item: itm });
  }
  AddOrUpdate() {
    if (this.update == false) {
      this.setFocusById('save')
    }
    else {
      this.setFocusById('update')
    }
  }
  ActivateDeactivateStatus(currItem: PHRMItemMasterModel) {
    if (currItem != null) {
      let status = currItem.IsActive == true ? false : true;
      let msg = status == true ? 'Activate' : 'Deactivate';
      if (confirm("Are you Sure want to " + msg + ' ' + currItem.ItemName + ' ?')) {
        currItem.IsActive = status;
        this.pharmacyBLService.UpdateItem(currItem)
          .subscribe(
            res => {
              if (res.Status == "OK") {
                let responseMessage = res.Results.IsActive ? "Item is now activated." : "Item is now Deactivated.";
                this.msgBoxServ.showMessage("success", [responseMessage]);
                this.getItemList();
              }
              else {
                this.msgBoxServ.showMessage("error", ['Something wrong' + res.ErrorMessage]);
              }
            },
            err => {
              this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
            });
      }
      //to refresh the checkbox if we cancel the prompt
      //this.getItemList();
    }
  }
  Close() {
    this.ClearItemData();
    this.callbackAdd.emit();
  }

  public ClearItemData() {
    this.CurrentItem = new PHRMItemMasterModel();
    this.selectedItem = null;
    this.selCategory = new PHRMSalesCategoryModel();
    this.selUOM = new PHRMUnitOfMeasurementModel();
    this.selItemType = new PHRMItemTypeModel();
    this.selGenName = new PHRMGenericModel();
    this.selCompany = new PHRMCompanyModel();
    this.rackId = null;
    this.update = false;
    this.showItemAddPage = false;
    this.showAddToRackPage = false;
    this.ccchargeData = 0;
    this.CurrentItem.CCCharge = 0;
  }

  public AssignSelectedCompany() {
    try {
      if (this.selCompany.CompanyId) {
        if ((this.selCompany.CompanyId != 0) && (this.selCompany.CompanyId != null)) {
          this.CurrentItem.CompanyId = this.selCompany.CompanyId;

        }
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  public AssignSelectedCategory() {
    try {
      if (this.selCategory.SalesCategoryId) {
        if ((this.selCategory.SalesCategoryId != 0) && (this.selCategory.SalesCategoryId != null)) {
          this.CurrentItem.SalesCategoryId = this.selCategory.SalesCategoryId;
        }
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  public AssignSelectedUOM() {
    try {
      if (this.selUOM.UOMId) {
        if ((this.selUOM.UOMId != 0) && (this.selUOM.UOMId != null)) {
          this.CurrentItem.UOMId = this.selUOM.UOMId;
        }
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  public ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }

  CompaniesListFormatter(data: any): string {
    if (data.IsActive) {
      return data["CompanyName"];
    }
    else {
      return data["CompanyName"] + " |(<strong class='text-danger'>Deactivated)</strong>";
    }
  }
  UOMListFormatter(data: any): string {
    if (data.IsActive) {
      return data["UOMName"];
    }
    else {
      return data["UOMName"] + " |(<strong class='text-danger'>Deactivated)</strong>";
    }
  }

  SalesCategoryListFormatter(data: any): string {
    return data["Name"];
  }

  public AssignSelectedItemType() {
    try {
      if (this.selItemType.ItemTypeId) {
        if ((this.selItemType.ItemTypeId != 0) && (this.selItemType.ItemTypeId != null)) {
          this.CurrentItem.ItemTypeId = this.selItemType.ItemTypeId;

        }
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  ItemTypesListFormatter(data: any): string {
    if (data.IsActive) {
      return data["ItemTypeName"];
    }
    else {
      return data["ItemTypeName"] + " |(<strong class='text-danger'>Deactivated)</strong>";
    }
  }
  public AssignSelectedGenName() {
    try {
      if (this.selGenName.GenericId) {
        if ((this.selGenName.GenericId != 0) && (this.selGenName.GenericId != null)) {
          this.CurrentItem.GenericId = this.selGenName.GenericId;

        }
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  public AssignSelectedccCharge() {
    try {
      var x = this.ccChargelist.find(c => c.CCChargeID == this.ccchargeData.CCChargeID).CCChargevalue;
      this.CurrentItem.CCCharge = +x;
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  setCcchargelist() {
    let list = this.coreService.Parameters.filter(p => p.ParameterName == "PharmacyCCChargeList" && p.ParameterGroupName == "Pharmacy");
    try {
      if (list.length > 0) {
        let data = list.find(a => a.ParameterName == 'PharmacyCCChargeList').ParameterValue;
        this.ccChargelist = JSON.parse(data);
      }
      else {
        this.msgBoxServ.showMessage("error", ['Ledgers type not found.']);
      }
    }
    catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  GenNamesListFormatter(data: any): string {
    if (data.IsActive) {
      return data["GenericName"];
    }
    else {
      return data["GenericName"] + " |(<strong class='text-danger'>Deactivated)</strong>";
    }
  }
  CCchargeListFormatter(data: any) {
    return data["CCChargevalue"];
  }
  GetRack() {
    this.pharmacyBLService.GetRackList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            var rackList = res.Results;
            this.DispensaryRackList = rackList.filter(a => a.ParentId != null && a.LocationId == ENUM_StockLocations.Dispensary);
            this.StoreRackList = rackList.filter(a => a.ParentId != null && a.LocationId == ENUM_StockLocations.Store);
          }
        }
        else {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
        });
  }

  AddtoRack() {
    let itemId = this.selectedItemId;
    this.pharmacyBLService.addtoRack(itemId, this.rackId, this.CurrentItem.StoreRackId)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            this.msgBoxServ.showMessage("success", ['Item added to Rack.']);
            const selectedItem = this.itemList.find(item => item.ItemId == itemId);
            selectedItem.RackName = (this.rackId) ? this.DispensaryRackList.find(rack => rack.RackId == this.rackId).Name : '';
            selectedItem.StoreRackId = this.CurrentItem.StoreRackId;
            this.itemList = this.itemList.slice();
            this.selectedItemId = null;
            this.showAddToRackPage = false;
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Something Wrong " + res.ErrorMessage]);
          }
        },
        err => {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
        },
        () => {
          this.rackId = null;
        });
  }

  getCCchargevalue(event) {

    if (event.currentTarget.checked) {
      this.ccchargeData = this.coreService.Parameters.find(p => p.ParameterName == "PharmacyCCCharge" && p.ParameterGroupName == "Pharmacy").ParameterValue;
      this.CurrentItem.CCCharge = this.ccchargeData;
      //this.CurrentItem.CCcharge =  7.5;     
    }
    else {
      this.ccchargeData = 0;
      this.CurrentItem.CCCharge = 0;
    }
  }
  // add cccharge  
  Addcccharge() {
    this.showAddCCcharge = true;
    this.CurrentItem.CCCharge = this.coreService.Parameters.find(p => p.ParameterName == "PharmacyCCCharge" && p.ParameterGroupName == "Pharmacy").ParameterValue;
  }
  Closecccharcge() {
    this.showAddCCcharge = false;
    this.paramerter = new CFGParameterModel();
    this.CurrentItem = new PHRMItemMasterModel();

  }

  //set new CC Charge value in to parameter value 
  saveCCcharges() {
    this.pharmacyBLService.AddCCcharge(this.paramerter)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            this.msgBoxServ.showMessage("success", ['Item Type Details Updated.']);
            this.Closecccharcge();
            this.coreService.InitializeParameters().subscribe(res => {
              this.CallBackLoadParameters(res);
            });
            this.callbackAdd.emit({ submit: true });
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Something Wrong " + res.ErrorMessage]);
          }
        },
        err => {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
        });
  }

  public CallBackLoadParameters(res) {
    if (res.Status == "OK") {
      this.coreService.Parameters = res.Results;
    }
    else {
      alert(res.ErrorMessage);
      console.log(res.ErrorMessage);
    }
  }
  AddPackingTypePopUp(i) {
    this.showCompanyAddPopUp = false;
    this.index = i;
    this.changeDetector.detectChanges();
    this.showCompanyAddPopUp = true;
  }


  OnNewPackingTypeAdded($event) {

    this.showPackingTypeAddPopUp = false;
    var packingType = $event.packingType;
    this.packingtypeList.unshift(packingType);
  }
  // AddCompanyPopUp(i) {
  //   this.showCompanyAddPopUp = false;
  //   this.index = i;
  //   this.changeDetector.detectChanges();
  //   this.showCompanyAddPopUp = true;
  // }
  // OnNewCompanyAdded($event) {

  //   this.showCompanyAddPopUp = false;
  //   var company = $event.company;
  //   this.companyList.unshift(company);
  // }

  AddGenericTypePopUp(i) {
    this.showGenericTypeAddPopUp = false;
    this.index = i;
    this.changeDetector.detectChanges();
    this.showGenericTypeAddPopUp = true;
  }

  OnNewGenericTypeAdded($event) {
    this.showGenericTypeAddPopUp = false;
    var generic = $event.generic;
    this.genericList.push(generic);
    this.genericList.slice();
    this.CurrentItem.GenericId = generic.GenericId;
    this.CurrentItem.ItemValidator.get("GenericId").setValue(generic.GenericName)

  }

  AddUomTypePopUp(i) {
    this.showUOMTypeAddPopUp = false;
    this.index = i;
    this.changeDetector.detectChanges();
    this.showUOMTypeAddPopUp = true;
  }

  OnNewUomTypeAdded($event) {
    this.showUOMTypeAddPopUp = false;
    var uom = $event.uom;
    this.uomList.push(uom);
    this.uomList.slice();
    this.CurrentItem.UOMId = uom.UOMId;
    this.CurrentItem.ItemValidator.get("UOMId").setValue(uom.UOMName)
  }

  AddItemTypePopUp(i) {
    this.showItemTypeAddPopUp = false;
    this.index = i;
    this.changeDetector.detectChanges();
    this.showItemTypeAddPopUp = true;
  }

  OnNewItemTypeAdded($event) {
    this.showItemTypeAddPopUp = false;
    var itemtype = $event.itemtype;
    this.itemtypeList.push(itemtype);
    this.itemtypeList.slice();
    this.CurrentItem.ItemTypeId = itemtype.ItemTypeId;
    this.CurrentItem.ItemValidator.get("ItemTypeId").setValue(itemtype.ItemTypeName)
  }

  AddCompanyPopUp() {
    this.showCompanyAddPopUp = false;
    this.changeDetector.detectChanges();
    this.showCompanyAddPopUp = true;
  }

  OnNewComapnyAdded($event) {
    this.showCompanyAddPopUp = false;
    var company = $event.company;
    this.companyList.push(company);
    this.companyList.slice();
    this.CurrentItem.CompanyId = company.CompanyId;
    this.CurrentItem.ItemValidator.get("CompanyId").setValue(company.CompanyName)
  }

  setFocusById(IdToBeFocused) {
    window.setTimeout(function () {
      document.getElementById(IdToBeFocused).focus();
    }, 20);
  }
}


