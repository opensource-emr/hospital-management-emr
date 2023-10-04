import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output, Renderer2 } from "@angular/core";

import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import PHRMGridColumns from '../../shared/phrm-grid-columns';

import * as _ from 'lodash';
import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from '../../../security/shared/security.service';
import { CFGParameterModel } from "../../../settings-new/shared/cfg-parameter.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status, ENUM_StockLocations } from "../../../shared/shared-enums";
import { Store } from "../../rack/phrm-rack.component";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { PHRMCompanyModel } from "../../shared/phrm-company.model";
import { PHRMGenericModel } from '../../shared/phrm-generic.model';
import { PHRMItemMasterModel } from "../../shared/phrm-item-master.model";
import { PHRMItemTypeModel } from "../../shared/phrm-item-type.model";
import { PHRM_MAP_MstItemsPriceCategory } from "../../shared/phrm-items-price-category-map";
import { PHRMPackingTypeModel } from "../../shared/phrm-packing-type.model";
import { PHRMSalesCategoryModel } from "../../shared/phrm-sales-category.model";
import { PHRMSupplierModel } from "../../shared/phrm-supplier.model";
import { PHRMUnitOfMeasurementModel } from "../../shared/phrm-unit-of-measurement.model";
import { PHRMMapItemToRack } from "../../shared/rack/Phrm_Map_ItemToRack";
import { PhrmRackModel } from "../../shared/rack/phrm-rack.model";

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
  phrmMapList: PHRMMapItemToRack[] = [];
  public item: Array<PHRMItemMasterModel> = new Array<PHRMItemMasterModel>();
  public ItemName: string = null;
  public itemGridColumns: Array<any> = null;
  public showItemAddPage: boolean = false;
  public showPackingTypeAddPopUp: boolean = false;
  public showGenericTypeAddPopUp: boolean = false;
  public showUOMTypeAddPopUp: boolean = false;
  public showItemTypeAddPopUp: boolean = false;
  public showSelectcompanyTypeAddPopUp: boolean = false;
  public showSelectcategorymanageTypeAddPopUp: boolean = false;
  public currentItem: PHRMMapItemToRack = new PHRMMapItemToRack();
  //for cccharge list 
  public ccChargelist: any;
  public ccchargeData: any;
  // for cccharges popup
  public showAddCCcharge: boolean = false;
  public update: boolean = false;
  public index: number;
  public selCompany: PHRMCompanyModel;
  public selCategory: PHRMSalesCategoryModel;
  public selItemType: PHRMItemTypeModel;
  public selGenName: PHRMGenericModel;
  public selUOM: PHRMUnitOfMeasurementModel;

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
  public SelectedRack: PhrmRackModel;
  public globalListenFunc: Function;
  public ESCAPE_KEYCODE = 27;   //to close the window on click of ESCape.
  RackList: Array<PhrmRackModel> = new Array<PhrmRackModel>();

  StoreList: Array<Store> = new Array<Store>();
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  showCompanyAddPopUp: boolean;
  public PHRM_MAP_MstItemsPriceCategories: Array<PHRM_MAP_MstItemsPriceCategory> = new Array<PHRM_MAP_MstItemsPriceCategory>();
  StoreWiseRackAllocationData: Array<StoreWiseRackAllocation> = Array<StoreWiseRackAllocation>();
  @Input("showAddPage")
  public set value(val: boolean) {
    this.showItemAddPage = val;
  }
  RackData: Array<Rack> = new Array<Rack>();
  StoreWiseRack: StoreWiseRackAllocation;
  RackListForAllocation: Array<Rack> = new Array<Rack>();
  loading: boolean = false;


  constructor(
    public coreService: CoreService,
    public pharmacyBLService: PharmacyBLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService, public renderer2: Renderer2,) {
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
    this.GetPriceGategories();
    this.GetLocationList();
    this.GetParentList();
    this.GetAllRackList();
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

  getRackList(i: number): Array<PhrmRackModel> {
    return this.RackList.filter(r => r.StoreId == this.StoreList[i].StoreId || r.StoreId == null);
  }
  public GetLocationList(): void {
    this.pharmacyBLService.GetAllPharmacyStore().subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.StoreList = []
        this.StoreList = res.Results;
      }
    })
  }
  GetParentList(): void {
    this.pharmacyBLService.GetRackList()
      .subscribe(res => {
        // let rackList = [];
        // rackList = res;
        // ParentRackList.unshift({ RackId: null, RackNo: 'None', StoreId: null });
        this.RackList = res;
        this.RackList = this.RackList.slice();
      });
  }

  public GetPackingTypeList() {
    this.pharmacyBLService.GetPackingTypeList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == ENUM_DanpheHTTPResponses.OK) {
          this.packingtypeList = res.Results;
        }
        else {
          alert(ENUM_MessageBox_Status.Failed + res.ErrorMessage);
          console.log(res.ErrorMessage)
        }
      });
  }
  public getGenericList() {
    this.pharmacyBLService.GetGenericList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == ENUM_DanpheHTTPResponses.OK) {
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
    }
  }
  public getItemList() {
    this.pharmacyBLService.GetItemList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == ENUM_DanpheHTTPResponses.OK) {
          let ItemList = res.Results;

          ItemList.forEach(i => {
            i.RackNo = i.RackNoDetails.map((r) => {
              return r.RackNo
            }).join(",");
          });
          this.itemList = ItemList;
        }
        else {
          alert(ENUM_MessageBox_Status.Failed + res.ErrorMessage);
          console.log(res.ErrorMessage)
        }
      },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + err.ErrorMessage]);
        });
  }




  public getSuppliers() {
    this.pharmacyBLService.GetSupplierList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == ENUM_DanpheHTTPResponses.OK) {
          if (res.Results.length) {
            this.supplierList = res.Results;
          }
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + err.ErrorMessage]);
        });
  }
  public getCompanies() {
    this.pharmacyBLService.GetCompanyList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == ENUM_DanpheHTTPResponses.OK) {
          if (res.Results.length) {
            this.companyList = res.Results;
          }
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + err.ErrorMessage]);
        });
  }
  public getSalesCategoryList() {
    this.pharmacyBLService.GetSalesCategoryList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == ENUM_DanpheHTTPResponses.OK) {
          this.salesCategoryList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + err.ErrorMessage]);
        });
  }
  public getItemTypes() {
    this.pharmacyBLService.GetItemTypeListManage()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == ENUM_DanpheHTTPResponses.OK) {
          if (res.Results.length) {
            this.itemtypeList = res.Results;
          }
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + err.ErrorMessage]);
        });
  }
  public getUOMs() {
    this.pharmacyBLService.GetUnitOfMeasurementList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == ENUM_DanpheHTTPResponses.OK) {
          if (res.Results.length) {
            this.uomList = res.Results;
          }
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + err.ErrorMessage]);
        });
  }
  ItemGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "edit": {
        this.selectedItem = null;
        this.update = true;
        this.index = this.itemList.findIndex(a => a.ItemId == $event.Data.ItemId);
        this.showItemAddPage = true;
        this.changeDetector.detectChanges();
        this.selectedItem = $event.Data;
        this.CurrentItem.ItemId = this.selectedItem.ItemId;
        this.CurrentItem.ItemName = this.selectedItem.ItemName;
        this.CurrentItem.GenericName = $event.Data.GenericName;
        this.CurrentItem.ItemCode = this.selectedItem.ItemCode;
        this.CurrentItem.CompanyId = this.selectedItem.CompanyId;
        this.selCompany = $event.Data.CompanyName;
        this.CurrentItem.ItemTypeId = this.selectedItem.ItemTypeId;
        this.selItemType = $event.Data.ItemTypeName;
        this.CurrentItem.UOMId = this.selectedItem.UOMId;
        this.selUOM = $event.Data.UOMName;
        this.selCategory = this.salesCategoryList.find(a => a.SalesCategoryId == this.CurrentItem.SalesCategoryId);
        this.CurrentItem.ReOrderQuantity = this.selectedItem.ReOrderQuantity;
        this.CurrentItem.MinStockQuantity = this.selectedItem.MinStockQuantity;
        this.CurrentItem.BudgetedQuantity = this.selectedItem.BudgetedQuantity;
        this.CurrentItem.PurchaseVATPercentage = this.selectedItem.PurchaseVATPercentage;
        this.CurrentItem.SalesVATPercentage = this.selectedItem.SalesVATPercentage;
        this.CurrentItem.IsVATApplicable = this.selectedItem.IsVATApplicable;
        this.CurrentItem.IsActive = this.selectedItem.IsActive;
        this.CurrentItem.GenericId = this.selectedItem.GenericId;
        this.selGenName = $event.Data.GenericName;
        this.CurrentItem.IsInsuranceApplicable = this.selectedItem.IsInsuranceApplicable;
        this.CurrentItem.GovtInsurancePrice = this.selectedItem.GovtInsurancePrice;

        this.CurrentItem.IsInternationalBrand = this.selectedItem.IsInternationalBrand;
        this.CurrentItem.CCCharge = this.selectedItem.CCCharge;
        if (this.CurrentItem.CCCharge == null) {
          this.CurrentItem.CCCharge = 0;
        }
        this.ccchargeData = this.ccChargelist.find(c => c.CCChargevalue == this.CurrentItem.CCCharge);
        this.CurrentItem.IsNarcotic = this.selectedItem.IsNarcotic;
        this.CurrentItem.ABCCategory = this.selectedItem.ABCCategory;
        this.CurrentItem.PackingTypeId = this.selectedItem.PackingTypeId;
        this.CurrentItem.VED = this.selectedItem.VED;
        this.CurrentItem.SalesCategoryId = this.selectedItem.SalesCategoryId;
        this.CurrentItem.Dosage = this.selectedItem.Dosage;
        this.CurrentItem.CCCharge = $event.Data.CCCharge;
        this.CurrentItem.PurchaseRate = this.selectedItem.PurchaseRate;
        this.CurrentItem.PurchaseDiscount = this.selectedItem.PurchaseDiscount;
        this.CurrentItem.SalesRate = this.selectedItem.SalesRate;
        this.showItemAddPage = true;
        this.GetPriceGategories();
        this.CurrentItem.PHRM_MAP_MstItemsPriceCategories.forEach(itm => {
          itm.GenericId = this.CurrentItem.GenericId;
          $event.Data.PHRM_MAP_MstItemsPriceCategories.forEach(gItm => {
            if (itm.PriceCategoryId == gItm.PriceCategoryId) {
              itm.PriceCategoryMapId = gItm.PriceCategoryMapId;
              itm.Price = gItm.Price;
              itm.DiscountApplicable = gItm.DiscountApplicable
              itm.Discount = gItm.Discount;
              itm.ItemLegalCode = gItm.ItemLegalCode;
              itm.ItemLegalName = gItm.ItemLegalName;
              itm.IsActive = gItm.IsActive;
              itm.ItemId = gItm.ItemId;
            }
          })
        });
        this.setFocusToItem('category');
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
        this.index = this.itemList.findIndex(a => a.ItemId == $event.Data.ItemId);
        this.showAddToRackPage = false;
        this.selectedItemId = null;
        var storeRackId = $event.Data.StoreRackId;
        this.CurrentItem.StoreRackId = storeRackId;
        this.selectedItemId = $event.Data.ItemId;
        var rackNo = $event.Data.RackNo;
        var selectedRack = this.DispensaryRackList.find(rack => rack.RackNo == rackNo);
        if (selectedRack != null) {
          this.rackId = selectedRack.RackId;
        }
        this.ItemName = $event.Data.ItemName;
        this.GetAllocatedRackData($event.Data.ItemId);
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
    this.GetPriceGategories();
  }
  Add() {
    this.CurrentItem.PHRM_MAP_MstItemsPriceCategories = this.CurrentItem.PHRM_MAP_MstItemsPriceCategories.filter(itm => itm.IsActive == true);
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
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Packaging Type is required"])
      }
      else {
        this.CurrentItem.ItemValidator.controls['PackingTypeId'].disable();
      }

    }

    if (this.CurrentItem.GenericId == 0 || this.CurrentItem.ItemTypeId == 0 || this.CurrentItem.CompanyId == 0) {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Generic name or type or company is missing "]);

    }
    else {
      if (this.CurrentItem.IsValidCheck(undefined, undefined)) {
        if (this.checkGovtInsurancePrice()) {
          this.CurrentItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
          this.CurrentItem.CreatedOn = moment().format('YYYY-MM-DD');
          this.pharmacyBLService.AddItem(this.CurrentItem)
            .finally(() => { this.ClearItemData() })
            .subscribe(
              (res: DanpheHTTPResponse) => {
                if (res.Status == ENUM_DanpheHTTPResponses.OK) {
                  this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Item Added."]);
                  this.CallBackAddUpdate(res)
                  this.CurrentItem = new PHRMItemMasterModel();
                }
                else {
                  this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + res.ErrorMessage]);
                }
              },
              err => {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + err.ErrorMessage]);
              });
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Please Add Valid Insurance Price."])
        }
      }

    }
  }
  Update() {
    for (var i in this.CurrentItem.ItemValidator.controls) {
      this.CurrentItem.ItemValidator.controls[i].markAsDirty();
      this.CurrentItem.ItemValidator.controls[i].updateValueAndValidity();
    }
    if (this.IsPkgitem == false) {
      this.CurrentItem.ItemValidator.controls['PackingTypeId'].disable();
    }
    else {
      if (this.CurrentItem.PackingTypeId == null)
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Packaging Type is required"])
      else {
        this.CurrentItem.ItemValidator.controls['PackingTypeId'].disable();
      }
    }
    if (this.CurrentItem.IsValidCheck(undefined, undefined)) {
      if (this.checkGovtInsurancePrice()) {
        this.CurrentItem.CreatedOn = moment().format('YYYY-MM-DD');
        this.CurrentItem.CreatedBy = 0;
        this.CurrentItem.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
        this.CurrentItem.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.CurrentItem.PHRM_MAP_MstItemsPriceCategories = [];
        this.pharmacyBLService.UpdateItem(this.CurrentItem)
          .finally(() => { this.ClearItemData() })
          .subscribe(
            (res: DanpheHTTPResponse) => {
              if (res.Status == ENUM_DanpheHTTPResponses.OK) {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Item  Details Updated.']);
                this.CallBackAddUpdate(res);
                this.CurrentItem = new PHRMItemMasterModel();
              }
              else {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + res.ErrorMessage]);
              }
            },
            err => {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + err.ErrorMessage]);
            });
      }
      else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Please Add Valid Insurance Price."])
      }
    }
  }
  checkGovtInsurancePrice() {
    if (this.CurrentItem.IsInsuranceApplicable == true && this.CurrentItem.GovtInsurancePrice <= 0) return false;
    if (this.CurrentItem.IsInsuranceApplicable == true && this.CurrentItem.GovtInsurancePrice == null) return false;
    return true;
  }
  CallBackAddUpdate(res) {
    if (res.Status == ENUM_DanpheHTTPResponses.OK) {
      var item: any = {};
      item = { ...res.Results }
      let newCompany = this.companyList.find(c => c.CompanyId == res.Results.CompanyId);
      item.CompanyName = (newCompany != null) ? newCompany.CompanyName : null;

      let newSupplier = this.supplierList.find(c => c.SupplierId == res.Results.SupplierId)
      item.SupplierName = (newSupplier != null) ? newSupplier.SupplierName : null;


      let newUom = this.uomList.find(c => c.UOMId == res.Results.UOMId);
      item.UOMName = (newUom != null) ? newUom.UOMName : null;

      let genericData = this.genericList.find(g => g.GenericId == res.Results.GenericId);
      item.GenericName = (genericData != null) ? genericData.GenericName : null;

      let newItemType = this.itemtypeList.find(c => c.ItemTypeId == res.Results.ItemTypeId);
      item.ItemTypeName = (newItemType != null) ? newItemType.ItemTypeName : null;
      item.PHRM_MAP_MstItemsPriceCategories = [...res.Results.PHRM_MAP_MstItemsPriceCategories];
      this.GetPriceGategories();
      this.CallBackAdd(item);
    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['some error ' + res.ErrorMessage]);
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
            (res: DanpheHTTPResponse) => {
              if (res.Status == ENUM_DanpheHTTPResponses.OK) {
                let responseMessage = res.Results.IsActive ? "Item is now activated." : "Item is now Deactivated.";
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [responseMessage]);
                this.getItemList();
              }
              else {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Something wrong' + res.ErrorMessage]);
              }
            },
            err => {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + err.ErrorMessage]);
            });
      }
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
    this.phrmMapList = [];
    this.currentItem = new PHRMMapItemToRack();

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
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Check error in Console log !"]);
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
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Ledgers type not found.']);
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
        let rackList = res;
        if (rackList !== null) {
          this.DispensaryRackList = rackList.filter(a => a.ParentId !== null && a.LocationId === ENUM_StockLocations.Dispensary);
          this.StoreRackList = rackList.filter(a => a.ParentId !== null && a.LocationId === ENUM_StockLocations.Store);
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Data not found']);
        }
      },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Something Wrong " + err.ErrorMessage]);
        });
  }

  AddtoRack() {
    let itemId = this.selectedItemId;
    this.pharmacyBLService.addtoRack(itemId, this.rackId, this.CurrentItem.StoreRackId)
      .subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status == ENUM_DanpheHTTPResponses.OK) {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Item added to Rack.']);
            const selectedItem = this.itemList.find(item => item.ItemId == itemId);
            selectedItem.RackNo = (this.rackId) ? this.DispensaryRackList.find(rack => rack.RackId == this.rackId).RackNo : '';
            selectedItem.StoreRackId = this.CurrentItem.StoreRackId;
            this.itemList = this.itemList.slice();
            this.selectedItemId = null;
            this.showAddToRackPage = false;
          }
          else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + res.ErrorMessage]);
          }
        },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + err.ErrorMessage]);
        },
        () => {
          this.rackId = null;
        });
  }

  getCCchargevalue(event) {

    if (event.currentTarget.checked) {
      this.ccchargeData = this.coreService.Parameters.find(p => p.ParameterName == "PharmacyCCCharge" && p.ParameterGroupName == "Pharmacy").ParameterValue;
      this.CurrentItem.CCCharge = this.ccchargeData;
    }
    else {
      this.ccchargeData = 0;
      this.CurrentItem.CCCharge = 0;
    }
  }
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
        (res: DanpheHTTPResponse) => {
          if (res.Status == ENUM_DanpheHTTPResponses.OK) {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Item Type Details Updated.']);
            this.Closecccharcge();
            this.coreService.InitializeParameters().subscribe(res => {
              this.CallBackLoadParameters(res);
            });
            this.callbackAdd.emit({ submit: true });
          }
          else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + res.ErrorMessage]);
          }
        },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + err.ErrorMessage]);
        }
      );
  }

  public CallBackLoadParameters(res) {
    if (res.Status == ENUM_DanpheHTTPResponses.OK) {
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

  setFocusToItem(IdToBeFocused) {
    window.setTimeout(function () {
      document.getElementById(IdToBeFocused).focus();
    }, 500);
  }

  public GetPriceGategories() {
    let priceCategory = this.coreService.Masters.PriceCategories;
    var activePriceCategories = priceCategory.filter(a => a.IsActive === true && a.IsPharmacyRateDifferent === true);
    this.PHRM_MAP_MstItemsPriceCategories = [];
    activePriceCategories.forEach(itm => {
      let temp = new PHRM_MAP_MstItemsPriceCategory();
      temp.PriceCategoryId = itm.PriceCategoryId;
      temp.PriceCategoryName = itm.PriceCategoryName;
      temp.ItemLegalCode = "";
      temp.Price = 0;
      temp.Discount = 0;
      temp.ItemLegalName = "";
      this.PHRM_MAP_MstItemsPriceCategories.push(temp);
    });
    this.CurrentItem.PHRM_MAP_MstItemsPriceCategories = [...this.PHRM_MAP_MstItemsPriceCategories];
  }

  DiscountChange(index: number) {
    this.CurrentItem.PHRM_MAP_MstItemsPriceCategories[index].DiscountApplicable = this.CurrentItem.PHRM_MAP_MstItemsPriceCategories[index].Discount > 0 ? true : false;
  }

  AddPHRMItemsPriceCategoryMap(ItemsPriceCategory: any, index: number) {
    if (ItemsPriceCategory.IsActive) {
      if (this.checkPriceCategoryValidations(ItemsPriceCategory)) {
        this.CurrentItem.PHRM_MAP_MstItemsPriceCategories[index].loading = true;
        ItemsPriceCategory.ItemId = this.CurrentItem.ItemId;
        ItemsPriceCategory.PriceCategoryMapId = 0;
        this.pharmacyBLService.AddPriceCategory(ItemsPriceCategory).finally(() => {
          this.CurrentItem.PHRM_MAP_MstItemsPriceCategories[index].loading = false;
        }).subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == ENUM_DanpheHTTPResponses.OK) {
            this.itemList[this.index].PHRM_MAP_MstItemsPriceCategories.push(res.Results);
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Price Category Added Successfully."]);
          }
          else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
          }
        },
          err => {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to Addd Price Category.", "Please check the console."]);
            console.log(err.ErrorMessage);
          });
      }
    }
  }
  UpdatePHRMItemsPriceCategoryMap(ItemsPriceCategory: any, index: number) {
    if (ItemsPriceCategory) {
      if (this.checkPriceCategoryValidations(ItemsPriceCategory)) {
        this.CurrentItem.PHRM_MAP_MstItemsPriceCategories[index].loading = true;
        this.pharmacyBLService.UpdatePriceCategory(ItemsPriceCategory).finally(() => {
          this.CurrentItem.PHRM_MAP_MstItemsPriceCategories[index].loading = false;
        }).subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == ENUM_DanpheHTTPResponses.OK) {
            this.itemList[this.index].PHRM_MAP_MstItemsPriceCategories[index] = res.Results;
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Price Category Updated Successfully"]);
          }
          else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed To update Price Category"]);
          }
        },
          err => {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed To Update Price Category", "Please check console."]);
            console.log(err.ErrorMessage);
          });
      }
    }
  }

  checkPriceCategoryValidations(ItemsPriceCategory: any) {
    let valid = true;
    if (ItemsPriceCategory.Price < 0 || ItemsPriceCategory.Discount < 0) {
      valid = false;
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Price or Discount cannot be less than zero"]);
    }
    if (ItemsPriceCategory.Discount > 100) {
      valid = false;
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Discount cannot be more than 100%"]);
    }
    return valid;
  }
  GetAllRackList() {
    this.pharmacyBLService.GetAllRackList().subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.RackListForAllocation = res.Results;
      }
    });
  }
  GetAllocatedRackData(ItemId: number) {
    this.pharmacyBLService.GetItemRackAllocationData(ItemId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.RackData = [];
          this.RackData = res.Results;

          this.StoreWiseRackAllocationData = [];
          this.StoreList.forEach(s => {
            let data = new StoreWiseRackAllocation();
            data.StoreId = s.StoreId;
            data.StoreName = s.StoreName;

            let selectedRack = this.RackData.find(a => a.StoreId == s.StoreId);
            data.selectedRack = selectedRack ? selectedRack : null;
            data.previouslySelectedRack = selectedRack ? selectedRack : null;

            let RackListForAllocation = this.RackListForAllocation.filter(b => b.StoreId === s.StoreId);
            RackListForAllocation.unshift({ ItemId: this.selectedItemId, RackId: null, RackNo: 'None', StoreId: s.StoreId });
            data.FilteredRackList = RackListForAllocation.filter(b => b.StoreId === s.StoreId);
            this.StoreWiseRackAllocationData.push(data);
          });
          this.showAddToRackPage = true;
        }
      });
  }

  OnRackChange($event, i): void {
    if ($event && !_.isEqual(this.StoreWiseRackAllocationData[i].previouslySelectedRack, $event)) {
      this.currentItem = new PHRMMapItemToRack();
      this.currentItem = $event;
      this.currentItem.ItemId = this.selectedItemId;
      let index = this.phrmMapList.findIndex(item => item.ItemId === this.selectedItemId && item.StoreId === $event.StoreId);
      if (index >= 0) {
        this.phrmMapList[index] = $event;
        this.phrmMapList.slice();
      }
      else {
        this.phrmMapList.push(this.currentItem);
      }
    }
  }

  AddItemToRack() {
    if (this.phrmMapList.length > 0) {
      this.loading = true;
      this.pharmacyBLService.AddItemToRack(this.phrmMapList).finally(() => {
        this.loading = false;
        this.itemList = this.itemList.slice();
        this.ClearItemData();
      }).subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          let rackData = '';
          rackData = res.Results.map((r) => {
            return r.RackNo
          }).join(",");
          this.itemList[this.index].RackNo = rackData;
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Item Added To Rack Successfully"]);
        };
      });
    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Please Add Item To AtLeast One Rack"]);
    }
  }
  RackListFormatter(data: any): string {
    let html = data["RackNo"];
    return html;
  }

}
export class StoreWiseRackAllocation {
  StoreId: number = null;
  StoreName: string = null;
  selectedRack: Rack = null;
  previouslySelectedRack: Rack = null;
  FilteredRackList: Rack[] = [];
}

export class Rack {
  ItemId: number = null;
  RackId: number = null;
  RackNo: string = '';
  StoreId: number = null;

}


