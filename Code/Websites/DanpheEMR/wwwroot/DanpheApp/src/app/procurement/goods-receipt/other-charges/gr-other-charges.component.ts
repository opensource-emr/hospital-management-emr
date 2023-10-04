import { animate, style, transition, trigger } from "@angular/animations";
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { CoreService } from "../../../core/shared/core.service";
import { InventoryReportsBLService } from "../../../inventory/reports/shared/inventory-reports.bl.service";
import { OtherChargesMasterModel } from "../../../inventory/settings/othercharges/other-charges.model";
import { VendorsBLService } from "../../../inventory/settings/shared/vendors.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { GoodReceiptService } from "../good-receipt.service";
import { GoodsReceiptOtherChargeModel, GROtherChargesItemModel } from "../goods-receipt-other-charges.model";
import * as _ from 'lodash';
import { CommonFunctions } from "../../../shared/common.functions";

@Component({
  selector: "add-other-charges",
  templateUrl: "./gr-other-charges.component.html",
  styleUrls: ['./gr-other-charges.component.css'],
  animations: [
    trigger(
      'enterAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(0)', opacity: 0 }),
        animate('500ms', style({ transform: 'translateY(10%)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateY(10%)', opacity: 1 }),
        animate('500ms', style({ transform: 'translateY(0)', opacity: 0 }))
      ])
    ]
    )
  ],
})
export class GROtherChargesComponent implements OnInit {
  @Input('showAddPage') showAddOtherChargesPopUp: boolean = false;
  @Input('index') grItemIndex: number;
  @Input('OtherCharges') OtherCharges: any;
  @Input('gr-edit') IsGRItemNotEditable: boolean = false;
  @Output("callback-close-othercharges-event") closeOtherChargesPopupEvent: EventEmitter<object> = new EventEmitter();
  @Output("callback-submit-event") otherChargeSubmitEvent: EventEmitter<Object> = new EventEmitter<Object>();
  @Input('vendor-list') public vendorList: any[];
  selectedVendor: any = "";
  otherChargesDetails: OtherChargesMasterModel[] = [];
  otherChargesForm: FormGroup;
  model: GoodsReceiptOtherChargeModel;
  showForm: boolean = false;
  showVendorSelection: boolean = false;
  addOtherChargeInGRTotalAmount: boolean = false;
  defaultCharges: OtherChargesMasterModel[] = [];
  constructor(public msgBoxServ: MessageboxService, public fb: FormBuilder, private coreService: CoreService,
    public _goodsReceiptService: GoodReceiptService
  ) {
    this.checkOtherChargeFormCustomization();
  }
  ngOnInit() {
    this.getINVOtherChargesDetails();
  }

  getINVOtherChargesDetails() {
    this._goodsReceiptService.getINVOtherChargesDetails()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.otherChargesDetails = res.Results;
          this.otherChargesDetails = this.otherChargesDetails.filter(charge => charge.IsActive == true);
          this.defaultCharges = this.otherChargesDetails.filter(charge => charge.IsDefault == true);
          if (this.OtherCharges.OtherChargesItem.length > 0) {
            this.model = new GoodsReceiptOtherChargeModel();
            this.model.TotalOtherCharge = this.OtherCharges.TotalOtherCharge;
            this.OtherCharges.OtherChargesItem.forEach(a => {
              var itemOtherCharge = new GROtherChargesItemModel();
              itemOtherCharge.Amount = a.Amount;
              itemOtherCharge.ChargeName = a.ChargeName;
              itemOtherCharge.ChargeId = a.ChargeId;
              itemOtherCharge.SelectedCharge = { 'ChargeId': a.ChargeId, 'ChargeName': a.ChargeName, 'VATPercentage': a.VATPercentage };
              itemOtherCharge.TotalAmount = a.TotalAmount;
              itemOtherCharge.VATAmount = a.VATAmount;
              itemOtherCharge.VATPercentage = a.VATPercentage;
              itemOtherCharge.VendorName = a.VendorName;
              this.model.OtherChargesItem.push(itemOtherCharge);
            });
          }
          else {
            this.model = new GoodsReceiptOtherChargeModel();
            if (this.defaultCharges.length) {
              for (let i = 0; i < this.defaultCharges.length; i++) {
                this.model.OtherChargesItem.push(new GROtherChargesItemModel())
                this.model.OtherChargesItem[i].SelectedCharge = { 'ChargeId': this.defaultCharges[i].ChargeId, 'ChargeName': this.defaultCharges[i].ChargeName, 'VATPercentage': this.defaultCharges[i].VATPercentage == null ? 0 : this.defaultCharges[i].VATPercentage };
                this.model.OtherChargesItem[i].VATPercentage = this.defaultCharges[i].VATPercentage == null ? 0 : this.defaultCharges[i].VATPercentage;
                this.model.OtherChargesItem[i].Amount = 0;
                this.model.OtherChargesItem[i].VATAmount = 0;
                this.model.OtherChargesItem[i].TotalAmount = 0;
                this.model.OtherChargesItem[i].VendorName = null;
              }
            }
            else {
              this.model.OtherChargesItem.push(new GROtherChargesItemModel())
            }
          }
        }
        this.showForm = true;
      },
        err => {
          console.log(err.error.ErrorMessage);
        })
  }

  calculateTotalOtherCharge() {
    this.model.TotalOtherCharge = 0;
    this.model.OtherChargesItem.forEach(charge => {
      if (charge.Amount > 0) {
        if (charge.VATPercentage > 0) {
          charge.VATAmount = (charge.Amount * charge.VATPercentage) / 100;
          charge.VATAmount = CommonFunctions.parsePhrmAmount(charge.VATAmount);
        }
        else {
          charge.VATAmount = 0;
        }
      }
      if (charge.Amount > 0 && charge.VATAmount == 0) {
        charge.VATPercentage = 0;
      }
      charge.TotalAmount = CommonFunctions.parsePhrmAmount(charge.Amount + charge.VATAmount);
    })
    this.model.TotalOtherCharge = CommonFunctions.parsePhrmAmount(this.model.OtherChargesItem.reduce((a, b) => a + b.TotalAmount, 0));
  }

  OnVATAmountChangeCalculateTotalOtherCharge() {
    this.model.TotalOtherCharge = 0;
    this.model.OtherChargesItem.forEach(charge => {
      if (charge.VATAmount > 0) {
        charge.VATPercentage = CommonFunctions.parsePhrmAmount((charge.VATAmount / charge.Amount) * 100);
        charge.VATPercentage === Infinity ? charge.VATPercentage = 0 : charge.VATPercentage = charge.VATPercentage;
      }
      else {
        charge.VATPercentage = 0;
      }
      charge.TotalAmount = CommonFunctions.parsePhrmAmount(charge.Amount + charge.VATAmount);
    })
    this.model.TotalOtherCharge = CommonFunctions.parsePhrmAmount(this.model.OtherChargesItem.reduce((a, b) => a + b.TotalAmount, 0));
  }

  Save() {
    var validator = this.checkValidation();
    if (!validator.isValid) {
      this.msgBoxServ.showMessage('Error', [`${validator.messageArr}`])
      return;
    }
    var temp = this.model.OtherChargesItem.map(item => {
      return _.omit(item, ['ItemOtherChargeValidator']);
    })
    this.model.OtherChargesItem = temp;
    this.otherChargeSubmitEvent.emit({ otherCharges: this.model, grItemIndex: this.grItemIndex });
  }
  checkValidation() {
    let validationObj = { isValid: true, messageArr: [] };
    if (!this.model.OtherChargesItem || this.model.OtherChargesItem.length == 0) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Please add at-least one item..");
      return validationObj;
    }

    if (this.model.OtherChargesItem.some(a => a.ChargeId == 0 || a.ChargeId == undefined || a.ChargeId == null)) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Enter Invalid ChargeName.");
    }

    if (this.model.OtherChargesItem.some(a => a.Amount < 0 || a.Amount == undefined || a.Amount == null)) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Enter Valid Amount.");
    }

    if (this.model.OtherChargesItem.some(a => a.VATPercentage < 0 || a.VATPercentage == undefined || a.VATPercentage == null)) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Enter Valid VATPercentage.");
    }
    if (this.model.OtherChargesItem.some(a => a.VendorName == undefined || a.VendorName == null)) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Vendor Is Mandatory.");
    }

    if (this.DuplicateChargeCheck()) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Duplicate ChargeName.");
    }

    this.model.OtherChargesItem.forEach(charge => {
      for (var a in charge.ItemOtherChargeValidator.controls) {
        charge.ItemOtherChargeValidator.controls[a].markAsDirty();
        charge.ItemOtherChargeValidator.controls[a].updateValueAndValidity();
      }
    })
    return validationObj;
  }
  onChargeNameChanged(data: any, index) {
    if (typeof (data) == 'object') {
      this.model.OtherChargesItem[index].ChargeId = data.ChargeId;
      this.model.OtherChargesItem[index].ChargeName = data.ChargeName;
      this.model.OtherChargesItem[index].VATPercentage = data.VATPercentage == null ? 0 : data.VATPercentage;
    }
    if (typeof (data) == 'string') {
      this.model.OtherChargesItem[index].ChargeId = null;
    }
  }
  itemListFormatter(data: any): string {
    let html = data["ChargeName"];
    return html;
  }

  addOtherChargesItem() {
    this.model.OtherChargesItem.push(new GROtherChargesItemModel());
  }
  deleteOtherChargesItem(index: number) {

    this.model.OtherChargesItem.splice(index, 1);

    if (this.model.OtherChargesItem.length == 0) {
      this.addOtherChargesItem();
    }
    this.calculateTotalOtherCharge();
  }

  setFocusById(IdToBeFocused, i: any) {
    window.setTimeout(function () {
      document.getElementById(IdToBeFocused + i).focus();
    }, 0);
  }

  Close() {
    this.closeOtherChargesPopupEvent.emit();
  }
  Discard() {
    if (!this.IsGRItemNotEditable) {
      this.model = new GoodsReceiptOtherChargeModel();
      this.otherChargeSubmitEvent.emit({ otherCharges: this.model, grItemIndex: this.grItemIndex });
    }
  }
  VendorListFormatter(data: any): string {
    return data["VendorName"];
  }
  onVendorChanged($event, index: number) {
    if (typeof ($event) == 'object') {
      this.model.OtherChargesItem[index].VendorId = $event.VendorId;
      this.model.OtherChargesItem[index].VendorName = $event.VendorName;
    }
  }
  checkOtherChargeFormCustomization() {
    let otherChargeParameterStr = this.coreService.Parameters.find(p => p.ParameterName == "GROtherChargesFormCustomization" && p.ParameterGroupName == "Procurement");
    if (otherChargeParameterStr != null) {
      let otherChargeParameter = JSON.parse(otherChargeParameterStr.ParameterValue);
      if (otherChargeParameter.showVendorSelectionInOtherCharges) {
        this.showVendorSelection = true;
      }
      if (otherChargeParameter.addOtherChargeInGRTotalAmount) {
        this.addOtherChargeInGRTotalAmount = true;
      }
    }
  }
  DuplicateChargeCheck() {
    for (let i = 0; i < this.model.OtherChargesItem.length; i++) {
      for (let j = i; j < this.model.OtherChargesItem.length; j++) {
        if (i != j) {
          if (this.model.OtherChargesItem[i].ChargeId == this.model.OtherChargesItem[j].ChargeId) {
            return true;
          }
        }
      }
    }
  }

}
