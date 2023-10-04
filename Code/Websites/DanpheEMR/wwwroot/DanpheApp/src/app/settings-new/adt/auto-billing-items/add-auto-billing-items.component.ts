import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdtAutoBillingItem_DTO } from '../../../adt/shared/DTOs/adt-auto-billingItems.dto';
import { Bed } from '../../../adt/shared/bed.model';
import { BedFeature } from '../../../adt/shared/bedfeature.model';
import { CoreService } from '../../../core/shared/core.service';
import { Scheme_DTO } from '../../../pharmacy/patient-consumption/shared/scheme.dto';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { BillServiceItemModel } from '../../billing/shared/bill-service-item.model';
import { SettingsBLService } from '../../shared/settings.bl.service';

@Component({
  selector: 'add-auto-billing-items',
  templateUrl: './add-auto-billing-items.component.html',
})
export class AddAutoBillingItemsComponent implements OnInit {
  public AutoBillingItems: AdtAutoBillingItem_DTO = new AdtAutoBillingItem_DTO();
  public autoBillingItems: AdtAutoBillingItem_DTO = new AdtAutoBillingItem_DTO();
  public AutoBillingItemsValidator: FormGroup = null;
  public BedFeatureList: Array<BedFeature> = [];
  public selectedBedFeature: BedFeature = new BedFeature();
  public BedFeatures: BedFeature = new BedFeature();
  public CurrentBed: Bed = new Bed();

  public BedFeatureObj: BedFeature = new BedFeature();
  public showAddPage: boolean = false;
  @Input("selectedBedFeatureItem")
  public selectedBedFeatureItem: BedFeature;
  @Input("selectedSchemeItem")
  public selectedSchemeItem: Scheme_DTO;
  @Input("selectedServiceItem")
  public selectedServiceItem: BillServiceItemModel;
  BedPrice: any;
  public SchemeList: Array<Scheme_DTO> = [];
  ServiceItemList: Array<BillServiceItemModel> = [];
  public BedFeatureName: string = '';
  public BedFeatureId: number = 0;
  SchemeName: any;
  SchemeId: any;
  ServiceItemName: any;
  ServiceItemId: number;
  MinimumChargeAmount: any;
  PercentageOfBedCharge: any;
  IsRepeatable: any;
  public update: boolean = false;
  public isSubmitted: boolean = false;

  public SchemeObj: Scheme_DTO = new Scheme_DTO();

  @Output('callback-add')
  callBackAdd: EventEmitter<object> = new EventEmitter<object>();
  @Output('callback-update')
  callBackUpdate: EventEmitter<Object> = new EventEmitter<Object>();
  public ServiceItemObj: BillServiceItemModel;
  selectedBedFeatureId: number;

  @Input("showAddPage")
  public set value(val: boolean) {
    this.showAddPage = val;
    if (this.selectedBedFeatureItem && this.selectedSchemeItem && this.selectedServiceItem) {
      this.update = true;
      this.BedFeatureObj = Object.assign(this.AutoBillingItems, this.selectedBedFeatureItem);
      this.SchemeObj = Object.assign(this.AutoBillingItems, this.selectedSchemeItem);
      this.ServiceItemObj = Object.assign(this.AutoBillingItems, this.selectedServiceItem);
      this.SetFocusById('BedFeatureName')
    }
    else {
      this.AutoBillingItems = new AdtAutoBillingItem_DTO();
      this.update = false;
    }
    this.GetBedFeatureList();
    this.GetSchemList();
    this.GetServiceItems();
  }
  constructor(
    public settingsBLService: SettingsBLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,

  ) {
    this.GetBedFeatureList();
    this.GetSchemList();
    this.GetServiceItems();
    this.BedFeatureObj = this.BedFeatureList.find(x => x.BedFeatureId == this.selectedBedFeatureId);
    this.isSubmitted = false;
    var _formbuilder = new FormBuilder();
    this.AutoBillingItemsValidator = _formbuilder.group({
      'BedFeatureName': ['', Validators.required],
      'SchemeName': ['', Validators.required],
      'ServiceItem': ['', Validators.required],
      'MinimumChargeAmount': [0, Validators.compose([Validators.required, Validators.min(0)])],
      'PercentageOfBedCharge': [0, Validators.compose([Validators.required, Validators.min(0), Validators.max(100)])],
    });
  }

  ngOnInit() {
  }
  Close() {
    this.AutoBillingItems = new AdtAutoBillingItem_DTO();
    this.SchemeObj = null;
    this.BedFeatureObj = null;
    this.ServiceItemObj = null;
    this.update = false;
    this.showAddPage = false;
    this.isSubmitted = false;
    this.AutoBillingItemsValidator.reset();
    this.callBackAdd.emit()

  }

  public SetFocusById(id: string): void {
    window.setTimeout(function () {
      let elementToBeFocused = document.getElementById(id);
      if (elementToBeFocused) {
        elementToBeFocused.focus();
      }
    }, 600);
  }
  public IsValid(): boolean {
    if (this.AutoBillingItemsValidator.valid) { return true; }
    else { return false; }
  }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.AutoBillingItemsValidator.valid;
    }
    else
      return !(this.AutoBillingItemsValidator.hasError(validator, fieldName));
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.AutoBillingItemsValidator.dirty;
    else
      return this.AutoBillingItemsValidator.controls[fieldName].dirty;
  }



  BedFeatureFormatter(data): string {
    let html = data["BedFeatureName"];
    return html;
  }
  SchemeListFormatter(data): string {
    let html = data["SchemeName"];
    return html;
  }
  ServiceItemFormatter(data): string {
    let html = data["ItemName"];
    return html;
  }
  public GetBedFeatureList() {
    this.settingsBLService.GetBedFeatureList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.BedFeatureList = res.Results;
            this.BedFeatureName = res.Results[0].BedFeatureFullName;
          }
          else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Check log for error message."]);
            this.logError(res.ErrorMessage);
          }
        }
      },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Check log for error message."]);
          this.logError(err.ErrorMessage);
        });
  }
  public BedFeatureEventHandler() {
    const tempSelectedBedFeature = this.BedFeatureObj;
    if (tempSelectedBedFeature) {
      this.AutoBillingItems.BedFeatureName = this.BedFeatureObj.BedFeatureFullName;
      this.AutoBillingItems.BedFeatureId = this.BedFeatureObj.BedFeatureId;
    }
  }
  public SchemeEventHandler() {
    const tempSchemeObj = this.SchemeObj;
    if (tempSchemeObj) {
      this.AutoBillingItems.SchemeName = this.SchemeObj.SchemeName;
      this.AutoBillingItems.SchemeId = this.SchemeObj.SchemeId;
    }
  }
  public ServiceItemEventHandler() {
    const tempserviceItemObj = this.ServiceItemObj;
    if (tempserviceItemObj) {
      this.AutoBillingItems.ServiceItemId = this.ServiceItemObj.ServiceItemId;
      this.AutoBillingItems.ItemName = this.ServiceItemObj.ItemName;
    }
  }
  logError(err: any) {
    console.log(err);
  }
  public GetSchemList() {
    this.settingsBLService.GetBillingSchmes().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.SchemeList = res.Results;
        } else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [
            `Error: ${res.ErrorMessage}`,
          ]);
        }
      },
      (err: DanpheHTTPResponse) => {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [
          `Error: ${err.ErrorMessage}`,
        ]);
      }
    );
  }
  public GetServiceItems() {
    this.settingsBLService.GetServiceItemList()
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.ServiceItemList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get Service Items, check log for details']);
        }

      });
  }

  public AddAutoBillingItems() {
    this.isSubmitted = true;
    for (var i in this.AutoBillingItemsValidator.controls) {
      this.AutoBillingItemsValidator.controls[i].markAsDirty();
      this.AutoBillingItemsValidator.controls[i].updateValueAndValidity();
    }
    if (this.IsValidCheck(undefined, undefined)) {
      // Check if any fields have been entered
      const hasData = Object.values(this.AutoBillingItems).some(value => !!value);

      if (hasData) {
        this.settingsBLService.AddAutoBillingItems(this.AutoBillingItems)
          .subscribe(
            (res: DanpheHTTPResponse) => {
              if (res.Status == "OK") {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Save successful"]);
                this.Close();
                this.isSubmitted = false;
              } else {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Auto billing Items with same Bed feature, Scheme, and Service item already exists"]);
              }
            },
            (err) => {
              this.logError(err);
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["An error occurred while processing the request"]);
            }
          );
      } else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Please enter data"]);
      }
    } else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Please fill all mandatory fields"]);
    }
  }

  public UpdateAutoBillingItems(): void {
    // For checking validations, marking all the fields as dirty and checking the validity.
    this.isSubmitted = true;
    for (var i in this.AutoBillingItemsValidator.controls) {
      this.AutoBillingItemsValidator.controls[i].markAsDirty();
      this.AutoBillingItemsValidator.controls[i].updateValueAndValidity();
    }
    if (this.IsValidCheck(undefined, undefined)) {
      this.settingsBLService.UpdateAdtAutoBillingItems(this.AutoBillingItems)
        .subscribe(
          (res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Auto Billing Item Details Updated"]);
              this.AssignValueToCallBackUpdate(res.Results);
              this.Close();
            } else {
              this.logError(res.ErrorMessage);
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Auto billing Items with same Bed feature, Scheme, and Service item already exists cannot be updated.."]);
            }
          },
          (err) => {
            this.logError(err);
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["An error occurred while processing the request"]);
          }
        );
    } else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Please fill all mandatory fields"]);
    }
  }

  public AssignValueToCallBackUpdate(autobill: AdtAutoBillingItem_DTO): void {
    let autoBilling: any = {};
    autoBilling.BedFeatureId = autobill.BedFeatureId;
    autoBilling.BedFeatureName = autobill.BedFeatureName;
    autoBilling.SchemeId = autobill.SchemeId;
    autoBilling.SchemeName = autobill.SchemeName;
    autoBilling.ServiceItemId = autobill.ServiceItemId;
    autoBilling.ServiceItemName = autobill.ServiceItemName;
    autoBilling.IsActive = autobill.IsActive;
    autoBilling.MinimumChargeAmount = autobill.MinimumChargeAmount;
    autoBilling.PercentageOfBedCharge = autobill.PercentageOfBedCharges;
    this.callBackUpdate.emit({ autoBilling: autoBilling });

  }
  public AssignValueToCallBackAdd(autobill: AdtAutoBillingItem_DTO): void {
    let autoBilling: any = {};
    autoBilling.BedFeatureId = autobill.BedFeatureId;
    autoBilling.BedFeatureName = autobill.BedFeatureName;
    autoBilling.SchemeId = autobill.SchemeId;
    autoBilling.SchemeName = autobill.SchemeName;
    autoBilling.ServiceItemId = autobill.ServiceItemId;
    autoBilling.ServiceItemName = autobill.ServiceItemName;
    autoBilling.IsActive = autobill.IsActive;
    autoBilling.MinimumChargeAmount = autobill.MinimumChargeAmount;
    autoBilling.PercentageOfBedCharge = autobill.PercentageOfBedCharges;
    this.callBackAdd.emit({ autoBilling });

  }

}


