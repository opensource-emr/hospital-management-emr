import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { ServiceDepartmentVM } from "../../../shared/common-masters.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import {
  ENUM_DanpheHTTPResponses,
  ENUM_MessageBox_Status,
} from "../../../shared/shared-enums";
import { SettingsBLService } from "../../shared/settings.bl.service";
import { BillServiceItemSchemeSetting_DTO } from "../shared/dto/bill-service-item-scheme-setting.dto";
import { ServiceItem_DTO } from "../shared/dto/service-item.dto";

@Component({
  selector: "bill-service-item-scheme-setting",
  templateUrl: "./bill-service-item-scheme-setting.component.html",
})
export class BillServiceItemSchemeSettingComponent implements OnInit {
  @Input("selected-scheme")
  public SelectedScheme = { SchemeId: 0, SchemeCode: "", SchemeName: "" };

  @Output("callback-close")
  callbackClose: EventEmitter<Object> = new EventEmitter<Object>();
  public serviceDepartmentList: Array<ServiceDepartmentVM> = new Array<ServiceDepartmentVM>();
  public serviceItemSettingList: Array<BillServiceItemSchemeSetting_DTO> = new Array<BillServiceItemSchemeSetting_DTO>();
  public FilteredServiceItemSettingList: Array<BillServiceItemSchemeSetting_DTO> = new Array<BillServiceItemSchemeSetting_DTO>();
  public serviceItemList: ServiceItem_DTO[] = [];
  public serviceItems: BillServiceItemSchemeSetting_DTO = new BillServiceItemSchemeSetting_DTO();
  public billServiceItemschemesettingDetails: BillServiceItemSchemeSetting_DTO[] =
    [];
  public tempBillServiceItemschemesettingDetails: BillServiceItemSchemeSetting_DTO[] =
    [];
  public ServiceDepartmentIds: number[] = [];
  public isAllChecked: boolean = false;
  public GlobalCopayCashPercent: number;
  public GlobalCopayCreditPercent: number;
  public headRegistrationDiscountPercent: number;
  public headOPDdiscountPercent: number;
  public headIPDdiscountPercent: number;
  public headAdmissiondiscountPercent: number;
  public isButtonDisabled: boolean = false;
  public headRegistrationDiscountPercentMsg: string;
  public headOPDdiscountPercentMsg: string;
  public headIPDdiscountPercentMsg: string;
  public headAdmissiondiscountPercentMsg: string;
  public GlobalCopayCashPercentMsg: string;
  public GlobalCopayCreditPercentMsg: string;
  public IsSelectAllCopayment: boolean;
  public selectAll: boolean = false;
  public selectedItem = new BillServiceItemSchemeSetting_DTO();
  public ServiceItemSettingListToFilterByItemName = new Array<BillServiceItemSchemeSetting_DTO>();

  constructor(
    public settingsBLService: SettingsBLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService
  ) {
    this.GetServiceDepartments();
    this.getServiceItemList();
  }
  ngOnInit() {
    if (this.SelectedScheme.SchemeId > 0) {
      this.GetServiceItemSchemeSettings(this.SelectedScheme.SchemeId);
    }
  }

  ItemListFormatter(data) {
    return data['ServiceItemName']
  }

  OnItemNameChanged() {
    if (this.selectedItem && this.selectedItem.ServiceItemId) {
      const filteredItem = this.ServiceItemSettingListToFilterByItemName.filter(item => item.ServiceItemId === this.selectedItem.ServiceItemId);
      this.FilteredServiceItemSettingList = filteredItem;
      console.log(filteredItem);
    } else {
      this.FilteredServiceItemSettingList = this.ServiceItemSettingListToFilterByItemName;
    }
  }
  Close() {
    this.callbackClose.emit();
  }
  DiscardChanges() {
    this.Close();
  }
  AssignDefaultDepartment($event) {
    if ($event) {
      this.selectedItem = new BillServiceItemSchemeSetting_DTO();
      this.ServiceDepartmentIds = $event.map((a) => a.ServiceDepartmentId);
      this.FilteredServiceItemSettingList = this.serviceItemSettingList.filter((itmset) => this.ServiceDepartmentIds.includes(itmset.ServiceDepartmentId));
      this.ServiceItemSettingListToFilterByItemName = this.FilteredServiceItemSettingList;
      this.MapServiceItemSetting();
    }
  }

  GetServiceDepartments() {
    this.serviceDepartmentList = this.coreService.Masters.ServiceDepartments;
  }
  selectAllServiceItems(event) {
    let isChecked = event.target.checked;
    this.FilteredServiceItemSettingList.forEach(
      (item) => (item.itemIsSelected = isChecked)
    );
    if (!event.target.checked) {
      this.headRegistrationDiscountPercent = 0;
      this.headOPDdiscountPercent = 0;
      this.headIPDdiscountPercent = 0;
      this.headAdmissiondiscountPercent = 0;
      this.GlobalCopayCashPercent = 0;
      this.GlobalCopayCreditPercent = 0;
      this.IsSelectAllCopayment = false;

      this.FilteredServiceItemSettingList.forEach((row) => {
        row.RegDiscountPercent = this.headRegistrationDiscountPercent;
        row.OpBillDiscountPercent = this.headOPDdiscountPercent;
        row.IpBillDiscountPercent = this.headIPDdiscountPercent;
        row.AdmissionDiscountPercent = this.headAdmissiondiscountPercent;
        row.CoPaymentCashPercent = this.GlobalCopayCashPercent;
        row.CoPaymentCreditPercent = this.GlobalCopayCreditPercent;
        row.IsCoPayment = false;
      });
    }
  }

  selectAllCopayment(event) {
    let isChecked = event.target.checked;
    this.FilteredServiceItemSettingList.forEach((item) => {
      item.IsCoPayment = isChecked;
      if (!isChecked) {
        item.IsCoPayment = false;
      }
    });

    if (!isChecked) {
      this.GlobalCopayCashPercent = 0;
      this.GlobalCopayCreditPercent = 0;
    }
  }

  onCoPayCashChange(row) {
    const maxPercent = 100;
    let newCoPayCreditPercent = maxPercent - row.CoPaymentCashPercent;
    row.CoPaymentCreditPercent = newCoPayCreditPercent;
  }

  // onCoPayCreditChange(row) {
  //   const maxPercent = 100;
  //   let newCoPayCashPercent = maxPercent - row.CoPaymentCreditPercent;
  //   row.CoPaymentCashPercent = newCoPayCashPercent;
  // }

  onDiscountPercentCheckboxChange(row) {
    if (!row.itemIsSelected) {
      row.RegDiscountPercent = 0;
      row.OpBillDiscountPercent = 0;
      row.IpBillDiscountPercent = 0;
      row.AdmissionDiscountPercent = 0;
      row.CoPaymentCashPercent = 0;
      row.CoPaymentCreditPercent = 0;
      row.IsCoPayment = false;
    }
  }

  onCopayCheckboxChange(event: any, row: any) {
    if (!event.target.checked) {
      row.IsCoPayment = false;
      row.CoPaymentCashPercent = 0;
      row.CoPaymentCreditPercent = 0;
    }
  }

  onGlobalCoPayCashChange() {
    const maxPercent = 100;

    // let GlobalCopayCashPercent = maxPercent - this.GlobalCopayCashPercent;
    // this.GlobalCopayCreditPercent = GlobalCopayCashPercent;

    this.FilteredServiceItemSettingList.forEach((row) => {
      row.CoPaymentCashPercent = this.GlobalCopayCashPercent;
      //row.CoPaymentCreditPercent = maxPercent - row.CoPaymentCashPercent;
    });
  }

  onGlobalCoPayCreditChange() {
    const maxPercent = 100;

    // let GlobalCopayCreditPercent = maxPercent - this.GlobalCopayCreditPercent;
    // this.GlobalCopayCashPercent = GlobalCopayCreditPercent;

    this.FilteredServiceItemSettingList.forEach((row) => {
      row.CoPaymentCreditPercent = this.GlobalCopayCreditPercent;
      // row.CoPaymentCashPercent = maxPercent - row.CoPaymentCreditPercent;
    });
  }
  updateRegDiscountPercent() {
    this.FilteredServiceItemSettingList.forEach((row) => {
      row.RegDiscountPercent = this.headRegistrationDiscountPercent;
    });
  }
  upateOPDdiscountPercent() {
    this.FilteredServiceItemSettingList.forEach((row) => {
      row.OpBillDiscountPercent = this.headOPDdiscountPercent;
    });
  }
  upateIPDdiscountPercent() {
    this.FilteredServiceItemSettingList.forEach((row) => {
      row.IpBillDiscountPercent = this.headIPDdiscountPercent;
    });
  }
  upateAdmissiondiscountPercent() {
    this.FilteredServiceItemSettingList.forEach((row) => {
      row.AdmissionDiscountPercent = this.headAdmissiondiscountPercent;
    });
  }

  GetServiceItemSchemeSettings(SchemeId: number) {
    if (SchemeId) {
      this.settingsBLService.GetServiceItemSchemeSettings(SchemeId).subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status == ENUM_DanpheHTTPResponses.OK) {
            this.tempBillServiceItemschemesettingDetails = res.Results;
          } else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
              "Failed to get Service Items scheme setting",
            ]);
          }
        },
        (err: DanpheHTTPResponse) => {
          console.log(err);
        }
      );
    }
  }

  public getServiceItemList() {
    this.settingsBLService.GetServiceItemList().subscribe((res) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.serviceItemSettingList = [];
        this.serviceItemList = res.Results.filter((item) => item.IsActive);

        this.serviceItemList.forEach((item) => {
          let serviceItemSetting = new BillServiceItemSchemeSetting_DTO();
          serviceItemSetting.ServiceItemId = item.ServiceItemId;
          serviceItemSetting.SchemeId = this.SelectedScheme.SchemeId;
          serviceItemSetting.itemIsSelected = item.itemIsSelected;
          serviceItemSetting.ServiceItemCode = item.ItemCode;
          serviceItemSetting.ServiceItemName = item.ItemName;
          serviceItemSetting.ServiceDepartmentId = item.ServiceDepartmentId;
          this.serviceItemSettingList.push(serviceItemSetting);
        });
      } else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
          "Failed to get Service Items, check log for details",
        ]);
      }
    });
  }

  MapServiceItemSetting() {
    this.serviceItemSettingList.forEach((itm) => {
      let matcheddata = this.tempBillServiceItemschemesettingDetails.find(
        (x) => x.ServiceItemId === itm.ServiceItemId
      );
      if (matcheddata) {
        itm.ServiceItemSchemeSettingId = matcheddata.ServiceItemSchemeSettingId;
        itm.itemIsSelected = matcheddata.itemIsSelected = true;
        itm.initialSelectionState = matcheddata.itemIsSelected; // Set initialSelectionState to itemIsSelected
        itm.SchemeId = matcheddata.SchemeId;
        itm.ServiceItemId = matcheddata.ServiceItemId;
        itm.ServiceDepartmentId = matcheddata.ServiceDepartmentId;
        itm.RegDiscountPercent = matcheddata.RegDiscountPercent;
        itm.OpBillDiscountPercent = matcheddata.OpBillDiscountPercent;
        itm.IpBillDiscountPercent = matcheddata.IpBillDiscountPercent;
        itm.AdmissionDiscountPercent = matcheddata.AdmissionDiscountPercent;
        itm.IsCoPayment = matcheddata.IsCoPayment;
        itm.CoPaymentCashPercent = matcheddata.CoPaymentCashPercent;
        itm.CoPaymentCreditPercent = matcheddata.CoPaymentCreditPercent;
        itm.IsActive = matcheddata.IsActive;
      } else {
        itm.initialSelectionState = false;
      }
    });
  }

  checkCopayDiscountPercentValidity(): boolean {
    let isValid = false;
    const invalidCopayPercent = this.serviceItemSettingList.filter((a) => a.itemIsSelected === true).some(
      (a) =>
        a.IsValidCopayCashPercent === false ||
        a.IsValidCopayCreditPercent === false
    );
    if (invalidCopayPercent) {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Invalid Copay percent",
      ]);
      isValid = false;
    }
    else {
      isValid = true;
    }
    return isValid;
  }

  CheckDiscountPercentsValidity(): boolean {
    let isValid = false;
    const invalidDiscountPercentItems = this.serviceItemSettingList.filter(x => x.itemIsSelected === true).some(
      (a) =>
        a.IsValidRegDiscountPercent === false ||
        a.IsValidOpBillDiscountPercent === false ||
        a.IsValidAdmissionDiscountPercent === false ||
        a.IsValidIpBillDiscountPercent === false
    );
    if (invalidDiscountPercentItems) {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
        "Invalid Discount Percent",
      ]);

      isValid = false;
    } else {
      isValid = true;
    }
    return isValid;
  }

  AddServiceItemSchemeSettings() {

    this.billServiceItemschemesettingDetails = this.serviceItemSettingList.filter(
      (a) => a.itemIsSelected || (a.itemIsSelected === a.initialSelectionState && a.itemIsSelected === true) || a.initialSelectionState === true
    );
    if (this.checkCopayDiscountPercentValidity() && this.CheckDiscountPercentsValidity()) {
      this.isButtonDisabled = true;
      this.settingsBLService
        .PostServiceItemSchemeSettings(this.billServiceItemschemesettingDetails)
        .subscribe(
          (res: DanpheHTTPResponse) => {
            if (res.Status == ENUM_DanpheHTTPResponses.OK) {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [
                "Service Item Settings Added Successfully",
              ]);
              this.billServiceItemschemesettingDetails = [];
            } else {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
                "Failed to add service Item settings, check log for details",
              ]);
            }
            this.Close();
            this.isButtonDisabled = false;
          },
          (err) => {
            this.logError(err);
          }
        );
    }
  }

  logError(err: any) {
    console.log(err);
  }

  CheckDiscountPercent(row: BillServiceItemSchemeSetting_DTO) {
    if (row) {
      const regDiscountPercent = row.RegDiscountPercent;
      const opBillDiscountPercent = row.OpBillDiscountPercent;
      const ipBillDiscountPercent = row.IpBillDiscountPercent;
      const admissionDiscountPercent = row.AdmissionDiscountPercent;
      const minimumDiscountPercent = 0;
      const maxDiscountPercent = 100;

      if (
        regDiscountPercent < minimumDiscountPercent || regDiscountPercent > maxDiscountPercent) {
        row.IsValidRegDiscountPercent = false;
      } else {
        row.IsValidRegDiscountPercent = true;
      }

      if (
        opBillDiscountPercent < minimumDiscountPercent || opBillDiscountPercent > maxDiscountPercent) {
        row.IsValidOpBillDiscountPercent = false;
      } else {
        row.IsValidOpBillDiscountPercent = true;
      }

      if (
        ipBillDiscountPercent < minimumDiscountPercent || ipBillDiscountPercent > maxDiscountPercent) {
        row.IsValidIpBillDiscountPercent = false;
      } else {
        row.IsValidIpBillDiscountPercent = true;
      }

      if (
        admissionDiscountPercent < minimumDiscountPercent || admissionDiscountPercent > maxDiscountPercent) {
        row.IsValidAdmissionDiscountPercent = false;
      } else {
        row.IsValidAdmissionDiscountPercent = true;
      }
    }
  }
  CheckGlobalDiscountPercent() {
    const minimumDiscountPercent = 0;
    const maxDiscountPercent = 100;
    if (
      this.headRegistrationDiscountPercent < minimumDiscountPercent || this.headRegistrationDiscountPercent > maxDiscountPercent) {
      this.headRegistrationDiscountPercentMsg = " Invalid percent";
    } else if (
      this.headRegistrationDiscountPercent > minimumDiscountPercent || this.headRegistrationDiscountPercent < maxDiscountPercent) {
      this.headRegistrationDiscountPercentMsg = "";
    }
    if (
      this.headOPDdiscountPercent < minimumDiscountPercent || this.headOPDdiscountPercent > maxDiscountPercent) {
      this.headOPDdiscountPercentMsg = " Invalid percent";
    } else if (
      this.headOPDdiscountPercent > minimumDiscountPercent || this.headOPDdiscountPercent < maxDiscountPercent) {
      this.headOPDdiscountPercentMsg = "";
    }
    if (
      this.headIPDdiscountPercent < minimumDiscountPercent || this.headIPDdiscountPercent > maxDiscountPercent) {
      this.headIPDdiscountPercentMsg = " Invalid percent";
    } else if (
      this.headIPDdiscountPercent > minimumDiscountPercent || this.headIPDdiscountPercent < maxDiscountPercent) {
      this.headIPDdiscountPercentMsg = "";
    }
    if (
      this.headAdmissiondiscountPercent < minimumDiscountPercent || this.headAdmissiondiscountPercent > maxDiscountPercent) {
      this.headAdmissiondiscountPercentMsg = " Invalid percent";
    } else if (
      this.headAdmissiondiscountPercent > minimumDiscountPercent || this.headAdmissiondiscountPercent < maxDiscountPercent) {
      this.headAdmissiondiscountPercentMsg = "";
    }
    if (
      this.GlobalCopayCashPercent < minimumDiscountPercent || this.GlobalCopayCashPercent > maxDiscountPercent) {
      this.GlobalCopayCashPercentMsg = " Invalid percent";
    } else {
      this.GlobalCopayCashPercentMsg = "";
    }
    if (
      this.GlobalCopayCreditPercent < minimumDiscountPercent || this.GlobalCopayCreditPercent > (maxDiscountPercent - this.GlobalCopayCashPercent)) {
      this.GlobalCopayCreditPercentMsg = " Invalid percent";
    } else {
      this.GlobalCopayCreditPercentMsg = "";
    }
  }

  CheckCopayPercent(row: BillServiceItemSchemeSetting_DTO) {
    if (row) {
      const minimumDiscountPercent = 0;
      const maxDiscountPercent = 100;
      const coPayCashPercent = row.CoPaymentCashPercent;
      const coPayCreditPercent = row.CoPaymentCreditPercent;
      if (
        coPayCashPercent < minimumDiscountPercent || coPayCashPercent > maxDiscountPercent) {
        row.IsValidCopayCashPercent = false;
      } else {
        row.IsValidCopayCashPercent = true;
      }
      if (
        coPayCreditPercent < minimumDiscountPercent || coPayCreditPercent > (maxDiscountPercent - coPayCashPercent)) {
        row.IsValidCopayCreditPercent = false;
      } else {
        row.IsValidCopayCreditPercent = true;
      }
    }
  }
}
