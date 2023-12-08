import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from "moment";
import { CoreService } from "../../../core/shared/core.service";
import { Employee } from "../../../employee/shared/employee.model";
import { SecurityService } from '../../../security/shared/security.service';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { DanpheCache, MasterType } from "../../../shared/danphe-cache-service-utility/cache-services";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { IntegrationName } from "../../shared/integration-name.model";
import { ServiceDepartment } from '../../shared/service-department.model';
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { BillServiceItemModel, BillServiceItemsPriceCategoryMap, ServiceCategories } from "../shared/bill-service-item.model";
@Component({
  selector: 'app-bill-service-item',
  templateUrl: './bill-service-item.component.html',
})
export class BillServiceItemComponent {
  public loading: boolean = false;
  public CurrentBillingItem: BillServiceItemModel = new BillServiceItemModel();
  public showAddServiceDepartmentPopUp: boolean = false;
  @Input("selectedItem")
  public selectedItem: BillServiceItemModel;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public srvdeptList: Array<ServiceDepartment> = new Array<ServiceDepartment>();
  @Input('service-categories')
  public ServiceCategoryList: Array<ServiceCategories> = new Array<ServiceCategories>();
  @Input('integration-name-list')
  public integrationNameList: Array<IntegrationName> = new Array<IntegrationName>();
  public allEmployeeList: Array<Employee> = [];
  public docterList: Array<Employee> = [];
  public defaultDoctorList: string;
  public PreSelectedDoctors: Array<Employee> = [];
  public BillItemsPriceCatMap: BillServiceItemsPriceCategoryMap[] = [];
  public tempBillItemsPriceCatMap: BillServiceItemsPriceCategoryMap[] = [];
  public isSrvDeptValid: boolean;
  public selectedServiceCategory: ServiceCategories;
  public isServiceCategoryValid: boolean = false;
  public selectedSrvDept: ServiceDepartment = new ServiceDepartment();
  @Input('update') update: boolean = false;
  public selectedIntegration: IntegrationName;
  public tempData: { tempItemName: string, tempItemCode: string } = { tempItemName: '', tempItemCode: '' };

  constructor(
    public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public router: Router,
    public coreService: CoreService, public settingsService: SettingsService) {
    this.GetSrvDeptList();
    this.GetPriceGategories();

    this.allEmployeeList = DanpheCache.GetData(MasterType.Employee, null);
    this.docterList = this.allEmployeeList.filter(a => a.IsAppointmentApplicable == true);
    this.GoToNextInput("ServiceDepartmentName");



  }

  ngOnInit() {

    this.loading = false;
    if (this.selectedItem) {
      this.update = true;
      this.CurrentBillingItem = Object.assign(this.CurrentBillingItem, this.selectedItem);
      this.selectedIntegration = this.integrationNameList.find(i => i.IntegrationName === this.selectedItem.IntegrationName);
      this.selectedServiceCategory = this.ServiceCategoryList.find(c => c.ServiceCategoryId === this.selectedItem.ServiceCategoryId);


      if (this.CurrentBillingItem.DefaultDoctorList && this.CurrentBillingItem.DefaultDoctorList.length) {
        this.AssignPreSelectedDocter();
      }

      this.selectedSrvDept.ServiceDepartmentName = this.CurrentBillingItem.ServiceDepartmentName;
      this.CurrentBillingItem.EnableControl("ServiceDepartmentId", false);
      this.CurrentBillingItem.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
      this.CurrentBillingItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.GetBilCfgItemsVsPriceCategory(this.selectedItem.ServiceItemId);
    }
    else {
      this.CurrentBillingItem = new BillServiceItemModel();
      this.selectedSrvDept = null;
      this.CurrentBillingItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentBillingItem.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
      this.update = false;
    }

  }

  public GetPriceGategories() {
    let priceCategory = this.coreService.Masters.PriceCategories;
    let activePriceCategories = priceCategory.filter(a => a.IsActive === true);
    for (let index = 0; index < activePriceCategories.length; index++) {
      let temp = new BillServiceItemsPriceCategoryMap();
      temp.PriceCategoryId = activePriceCategories[index].PriceCategoryId;
      temp.PriceCategoryName = activePriceCategories[index].PriceCategoryName;
      temp.ItemLegalCode = '';
      temp.Price = 0;
      temp.ItemLegalName = '';
      this.BillItemsPriceCatMap.push(temp);
    }
  }


  GetBilCfgItemsVsPriceCategory(ServiceItemId: number) {
    if (ServiceItemId) {
      this.settingsBLService.GetServiceItemsVsPriceCategory(ServiceItemId).subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status == ENUM_DanpheHTTPResponses.OK) {
            console.log(this.BillItemsPriceCatMap);
            let billItemsPriceCategoryMapFromServer: Array<BillServiceItemsPriceCategoryMap> = res.Results;
            this.BillItemsPriceCatMap.map(a => {
              let matchedData = billItemsPriceCategoryMapFromServer.find(b => b.PriceCategoryId == a.PriceCategoryId);
              if (matchedData) {
                a.PriceCategoryServiceItemMapId = matchedData.PriceCategoryServiceItemMapId;
                a.ServiceItemId = matchedData.ServiceItemId;
                a.IsSelected = true;
                a.IsDiscountApplicable = matchedData.IsDiscountApplicable;
                a.ItemLegalCode = matchedData.ItemLegalCode;
                a.ItemLegalName = matchedData.ItemLegalName;
                a.Price = matchedData.Price;
                a.HasAdditionalBillingItems = matchedData.HasAdditionalBillingItems;
                a.IsIncentiveApplicable = matchedData.IsIncentiveApplicable;
                a.IsPriceChangeAllowed = matchedData.IsPriceChangeAllowed;
                a.IsZeroPriceAllowed = matchedData.IsPriceChangeAllowed;

              }
            });
          } else {
            console.log(res);
          }
        },
        (err: DanpheHTTPResponse) => {
          console.log(err);
        }
      );
    }
  }

  AssignSelectedDepartment() {
    if (this.selectedSrvDept) {
      const selectedServiceDept = this.srvdeptList.find(dept => dept.ServiceDepartmentName === this.selectedSrvDept.ServiceDepartmentName);

      if (selectedServiceDept) {
        this.CurrentBillingItem.BillingItemValidator.get('IntegrationName').setValue(selectedServiceDept.IntegrationName);
        let selIntegration = this.integrationNameList.find(i => i.IntegrationName === selectedServiceDept.IntegrationName);
        if (selIntegration) {
          this.CurrentBillingItem.IntegrationItemId = selIntegration.IntegrationNameID;
          this.CurrentBillingItem.IntegrationName = selIntegration.IntegrationName;
        }
      }
      if (selectedServiceDept && selectedServiceDept.IntegrationName == null) {
        let selIntegration = this.integrationNameList.find(i => i.IntegrationName === 'None');
        if (selIntegration) {
          this.CurrentBillingItem.IntegrationItemId = selIntegration.IntegrationNameID;
          this.CurrentBillingItem.IntegrationName = selIntegration.IntegrationName;
          this.CurrentBillingItem.BillingItemValidator.get('IntegrationName').setValue(selIntegration.IntegrationName);
        }
      }
    }
  }

  public GetSrvDeptList() {
    try {
      this.settingsBLService.GetServiceDepartments()
        .subscribe(res => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            if (res.Results.length) {
              this.srvdeptList = res.Results;

            }
            else {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Check log for error message."]);
              this.logError(res.ErrorMessage);
            }
          }
        },
          err => {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to get service departments Check log for error message."]);
            this.logError(err.ErrorMessage);
          });
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  showMessageBox(arg0: string, arg1: string) {
    throw new Error("Method not implemented.");
  }
  logError(ErrorMessage: any) {
    throw new Error("Method not implemented.");
  }
  ShowCatchErrMessage(exception: any) {
    throw new Error("Method not implemented.");
  }
  CheckValidations(): boolean {
    let isValid: boolean = true;
    for (var i in this.CurrentBillingItem.BillingItemValidator.controls) {
      this.CurrentBillingItem.BillingItemValidator.controls[i].markAsDirty();
      this.CurrentBillingItem.BillingItemValidator.controls[i].updateValueAndValidity();
    }
    isValid = this.CurrentBillingItem.IsValidCheck(undefined, undefined);
    return isValid;
  }

  Add() {
    this.CurrentBillingItem.BilCfgItemsVsPriceCategoryMap = this.BillItemsPriceCatMap.filter(a => a.IsSelected === true);
    if (this.CheckValidations() && !this.loading) {
      this.CurrentBillingItem.DefaultDoctorList = this.defaultDoctorList ? this.defaultDoctorList : null;
      this.settingsBLService.AddServiceItems(this.CurrentBillingItem)
        .subscribe(
          (res: DanpheHTTPResponse) => {
            if (res.Status == ENUM_DanpheHTTPResponses.OK) {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Item Added Successfully']);
              this.CurrentBillingItem = new BillServiceItemModel();
            }
            else {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to add service Item, check log for details"]);
            }
            this.loading = false;
            this.Close();
          },
          err => {
            this.logError(err);
            this.loading = false;
          });
    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Please fill all mandatory fields."]);
    }
  }

  Discard() {
    this.CurrentBillingItem = new BillServiceItemModel;
    this.selectedItem = null;
    this.callbackAdd.emit({ action: "close", item: null });
    this.update = false;
    this.router.navigate(["/Settings/BillingManage/ServiceItems"]);
  }

  AddBillServiceItemsPriceCategoryMap(rowToAdd: BillServiceItemsPriceCategoryMap, index: number) {
    if (rowToAdd.IsSelected) {

      rowToAdd.ServiceItemId = this.CurrentBillingItem.ServiceItemId;
      rowToAdd.ServiceDepartmentId = this.CurrentBillingItem.ServiceDepartmentId;
      this.settingsBLService.AddBillServiceItemsPriceCategoryMap(rowToAdd).subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status == ENUM_DanpheHTTPResponses.OK) {
            this.BillItemsPriceCatMap[index].PriceCategoryServiceItemMapId = res.Results.PriceCategoryMapId;
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Successfully added BillServiceItemsPriceCategoryMap!']);
            this.changeDetector.detectChanges();
          }
        },
        (err: DanpheHTTPResponse) => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Cannot Add BillServiceItemsPriceCategoryMap!"]);
          console.log(err.ErrorMessage);
        }
      );
    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Check log for Details "]);
    }
  }

  UpdateServiceItemsPriceCategoryMap(rowToUpdate: BillServiceItemsPriceCategoryMap) {
    if (rowToUpdate) {
      rowToUpdate.IsActive = rowToUpdate.IsSelected;
      this.settingsBLService.UpdateBillServiceItemsPriceCategoryMap(rowToUpdate).subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Successfully Updated BillServiceItemsPriceCategoryMap!']);
            this.changeDetector.detectChanges();

          }
        },
        (err: DanpheHTTPResponse) => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Cannot Update BillServiceItemsPriceCategoryMap!"]);
          console.log(err.ErrorMessage);
        }
      );
    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Check log for Details "]);
    }
  }





  ServiceDeptListFormatter(data: any): string {
    return data["ServiceDepartmentName"];
  }

  ServiceCatListFormatter(data: any): string {
    return data["ServiceCategoryName"];
  }

  IntegrationNameListFormatter(data: any): string {
    return data["IntegrationName"];
  }

  OnSrvDeptValueChanged() {
    let srvDept = null;
    if (!this.selectedSrvDept) {
      this.CurrentBillingItem.ServiceDepartmentId = null;
      this.isSrvDeptValid = false;
    }
    else if (typeof (this.selectedSrvDept) === 'string') {
      srvDept = this.srvdeptList.find(a => a.ServiceDepartmentName.toLowerCase() == this.selectedSrvDept.ServiceDepartmentName.toLowerCase());
    }
    else if (typeof (this.selectedSrvDept) === "object") {
      srvDept = this.selectedSrvDept;
    }

    if (srvDept) {
      this.CurrentBillingItem.ServiceDepartmentId = srvDept.ServiceDepartmentId;
      this.isSrvDeptValid = true;
    }
    else {
      this.CurrentBillingItem.ServiceDepartmentId = null;
      this.isSrvDeptValid = false;
    }
  }

  OnIntegrationChange() {
    if (this.selectedIntegration.IntegrationNameID > 0) {
      this.CurrentBillingItem.IntegrationItemId = this.selectedIntegration.IntegrationNameID;
      this.CurrentBillingItem.IntegrationName = this.selectedIntegration.IntegrationName;
    }
    else {
      this.CurrentBillingItem.IntegrationItemId = 0;
      this.CurrentBillingItem.IntegrationName = null;
    }
  }
  OnCategoryValueChanged() {

    if (this.selectedServiceCategory.ServiceCategoryId > 0) {
      this.CurrentBillingItem.ServiceCategoryId = this.selectedServiceCategory.ServiceCategoryId;
      this.isServiceCategoryValid = true;
    }
    else {
      this.CurrentBillingItem.ServiceCategoryId = null;
      this.isServiceCategoryValid = false;
    }
  }
  Update() {
    this.CurrentBillingItem.BilCfgItemsVsPriceCategoryMap = this.BillItemsPriceCatMap.filter(a => a.IsSelected === true);
    if (this.CheckValidations() && !this.loading) {
      this.CurrentBillingItem.DefaultDoctorList = this.defaultDoctorList ? this.defaultDoctorList : null;
      this.settingsBLService.UpdateServiceItem(this.CurrentBillingItem)
        .subscribe(
          (res: DanpheHTTPResponse) => {

            if (res.Status == ENUM_DanpheHTTPResponses.OK) {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Service Item Details Updated']);
            }
            else {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed updating Service Item, check log for details']);
            }
            this.CurrentBillingItem = new BillServiceItemModel();
            this.loading = false;
            this.Close();
          },
          err => {
            this.logError(err);
            this.loading = false;
          });



    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Please fill all mandatory fields."]);
    }
  }
  Close() {
    this.CurrentBillingItem = new BillServiceItemModel;
    this.selectedItem = null;
    this.callbackAdd.emit({ action: "close", item: null });
    this.update = false;
  }

  OnNewServiceDepartmentAdded($event) {
    if ($event.action == "add") {
      var serviceDepartment = $event.servDepartment;
      this.srvdeptList.push(serviceDepartment);
      this.srvdeptList = this.srvdeptList.slice();
      this.selectedSrvDept = serviceDepartment;
      this.OnSrvDeptValueChanged();

    }

    this.showAddServiceDepartmentPopUp = false;
  }

  public AssignDefaultDocter($event) {
    this.defaultDoctorList;
    let defDocListString = [];
    let selectedDoc = $event;
    selectedDoc.forEach(x => {
      defDocListString.push(x.EmployeeId);
    });

    var DocListString = defDocListString.join(",");
    if (defDocListString) {
      this.defaultDoctorList = "[" + DocListString + "]";
    }

  }

  public AssignPreSelectedDocter() {
    var str = JSON.parse(this.CurrentBillingItem.DefaultDoctorList);
    str.forEach(a => {
      var abd = this.docterList.find(b => b.EmployeeId == a);
      this.PreSelectedDoctors.push(abd);
    });
  }

  public GoToNextInput(id: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }
  KeysPressed(event) {
    if (event.keyCode == 27) {
      this.Close();
    }
  }

  AssignItemLegalNameCode(index: number) {
    if (this.BillItemsPriceCatMap[index].IsSelected) {
      const item = this.BillItemsPriceCatMap[index];
      if (!item.ItemLegalCode) {
        item.ItemLegalCode = this.CurrentBillingItem.ItemCode;
      }
      if (!item.ItemLegalName) {
        item.ItemLegalName = this.CurrentBillingItem.ItemName;
      }
    }
    else {
      const item = this.BillItemsPriceCatMap[index];
      item.ItemLegalCode = '';
      item.ItemLegalName = '';
    }
  }
}
