import { HttpErrorResponse } from "@angular/common/http";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import * as moment from "moment";
import { BillingSubSchemeModel } from "../../../billing/shared/bill-sub-scheme.model";
import { BillingSubScheme_DTO } from "../../../billing/shared/dto/bill-subscheme.dto";
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from "../../../security/shared/security.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import {
  ENUM_DanpheHTTPResponseText,
  ENUM_DanpheHTTPResponses,
  ENUM_MessageBox_Status,
} from "../../../shared/shared-enums";
import { CreditOrganization } from "../../price-cateogory/model/credit-organiztion.model";
import { PaymentModes } from "../../shared/PaymentMode";
import { BillingSchemeModel } from "../../shared/bill-scheme.model";
import { PriceCategory } from "../../shared/price.category.model";
import { SettingsBLService } from "../../shared/settings.bl.service";

@Component({
  selector: "bill-scheme",
  templateUrl: "./bill-scheme.component.html",
  styleUrls: ["./bill-scheme.component.css"],
})
export class BillSchemeComponent {
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  @Output("callback-close")
  callbackClose: EventEmitter<Object> = new EventEmitter<Object>();

  public isAddNewPriceCategory: boolean = true;
  public defaultPayment: Array<PaymentModes> = new Array<PaymentModes>();
  public CreditOrganizations: Array<CreditOrganization> =
    new Array<CreditOrganization>();
  public priceCategoryList: Array<PriceCategory> = new Array<PriceCategory>();

  public tempCreditOrganization: Array<CreditOrganization> =
    new Array<CreditOrganization>();
  public tempdefaultPaymentlist: Array<PaymentModes> =
    new Array<PaymentModes>();
  public BillingSubScheme: BillingSubSchemeModel = new BillingSubSchemeModel();
  // public setBillItmGriColumns: SettingsGridColumnSettings = null;
  // public BillingSubSchemeColumns: Array<any> = null;
  public BillingSubSchemeList: Array<BillingSubScheme_DTO> = new Array<BillingSubScheme_DTO>();
  public CurrentPayment: PaymentModes = new PaymentModes();
  public CurrentCreditOrganizationModel: CreditOrganization =
    new CreditOrganization();
  DiscountSettings: any;

  @Input("bill-scheme-to-edit")
  BillSchemeId: number = 0;

  @Input("component-mode")
  ComponentMode: string = "add";

  ValidFromDate: string = "";
  ValidToDate: string = "";
  CopaymentSettings: {
    SettingsFor: string;
    IsApplicable: boolean;
    CopayCashPercent: number;
    CopayCreditPercent: number;
  }[];
  CallBackAddUpdate: any;
  loading: boolean = false;

  isval: boolean = false;

  @Input("show-Scheme-Add-Update-Page")
  public ShowSchemeAddUpdatePage: boolean = false;
  // public set value(val: boolean) {
  //   this.showAddNewPage = val;
  //   if (this.billScheme && this.billScheme.SchemeId != 0) {
  //     this.update = true;
  //     //this.billScheme = new billScheme();
  //     this.billScheme = Object.assign({}, this.billScheme, this.billScheme);
  //     this.billScheme.SchemeValidator.controls['SchemeName'].setValue(this.billScheme.SchemeName);
  //     this.billScheme.SchemeValidator.controls['SchemeCode'].setValue(this.billScheme.SchemeCode);
  //     this.billScheme.SchemeValidator.controls['CommunityName'].setValue(this.billScheme.CommunityName);

  //   } else {
  //     //this.billScheme = new billScheme();
  //     this.update = false;
  //   }
  // }

  public billScheme: BillingSchemeModel = new BillingSchemeModel();

  constructor(
    public settingsBLService: SettingsBLService,
    public messageBoxService: MessageboxService,
    public coreService: CoreService,
    private securityService: SecurityService
  ) {
    this.getCreditOrganizationList();
    this.GetPriceCategory();
    this.ValidFromDate = moment().format("YYYY-MM-DD");
    this.ValidToDate = moment().format("YYYY-MM-DD");
  }

  ngOnInit() {
    if (this.ComponentMode.toLowerCase() === "edit" && this.BillSchemeId) {
      this.GetSchemeBySchemeId(this.BillSchemeId);
    }
  }

  GetSchemeBySchemeId(BillSchemeId: number) {
    this.settingsBLService.GetBillingSchemeById(BillSchemeId).subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.billScheme = Object.assign({}, this.billScheme, res.Results);
          this.selectedCreditOrganization = this.CreditOrganizations.find(
            (a) =>
              a.OrganizationId === this.billScheme.DefaultCreditOrganizationId
          );
          this.selectedPriceCategory = this.priceCategoryList.find(
            (a) => a.PriceCategoryId === this.billScheme.DefaultPriceCategoryId
          );
          this.updateCopaymentCheckboxState();
        } else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
            "Bill Scheme not found",
          ]);
        }
      },
      (err) => {
        this.logError(HttpErrorResponse);
      }
    );
  }

  close() {
    this.billScheme = new BillingSchemeModel();
    this.callbackAdd.emit({ action: "close", data: null });
    this.ShowSchemeAddUpdatePage = false;
  }

  OnCreditOrganizationChange() {
    if (this.selectedCreditOrganization.OrganizationId > 0) {
      this.billScheme.DefaultCreditOrganizationId =
        this.selectedCreditOrganization.OrganizationId;
    } else {
      this.billScheme.DefaultCreditOrganizationId = null;
    }
  }
  OnPriceCategoryChange() {
    if (this.selectedPriceCategory.PriceCategoryId > 0) {
      this.billScheme.DefaultPriceCategoryId =
        this.selectedPriceCategory.PriceCategoryId;
    } else {
      this.billScheme.DefaultPriceCategoryId = null;
    }
  }

  selectedCreditOrganization: CreditOrganization = new CreditOrganization();
  selectedPriceCategory: PriceCategory = new PriceCategory();
  AddBillScheme() {
    this.loading = true;
    for (let i in this.billScheme.SchemeValidator.controls) {
      this.billScheme.SchemeValidator.controls[i].markAsDirty();
      this.billScheme.SchemeValidator.controls[i].updateValueAndValidity();
    }
    // if (this.billScheme.IsValidCheck(undefined, undefined)) {
    this.billScheme.CreatedOn = moment().format("YYYY-MM-DD");
    if (this.billScheme.HasSubScheme !== true) {
      this.billScheme.BillingSubSchemes = new Array<BillingSubSchemeModel>();
    }
    this.settingsBLService.PostBillScheme(this.billScheme)
      .finally(() => { this.loading = false; })
      .subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status == ENUM_DanpheHTTPResponseText.OK) {
            this.callbackAdd.emit({ action: "add", data: res.Results });
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [
              "Billing Scheme  Added",
            ]);
            this.billScheme = new BillingSchemeModel();
            this.loading = false;
            this.close();
          } else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
              "Billing Scheme not Added",
            ]);
            this.loading = false;
          }
        },
        (err) => {
          this.logError(err);
        }
      );
    // }
    //   else {
    //     this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["some data are invalid."]);
    // }
  }

  logError(err: any) {
    console.log(err);
  }

  showMessageBox(status: string, message: string) {
    this.messageBoxService.showMessage(status, [message]);
  }
  UpdateBillScheme() {
    if (this.billScheme.HasSubScheme !== true) {
      this.billScheme.BillingSubSchemes = new Array<BillingSubSchemeModel>();
    }
    this.settingsBLService
      .UpdateBillScheme(this.billScheme)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == ENUM_DanpheHTTPResponseText.OK) {
          this.callbackAdd.emit({ action: "edit", data: res.Results });
          this.billScheme = new BillingSchemeModel();
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [
            "Updated.",
          ]);
        } else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [
            "failed to update",
          ]);
        }
      });
  }
  filterPaymentMode() {
    this.tempdefaultPaymentlist = this.defaultPayment.filter(
      (a) => a.PaymentSubCategoryId == this.CurrentPayment.PaymentSubCategoryId
    );
  }
  filteCreditOrganization() {
    this.tempCreditOrganization = this.CreditOrganizations.filter(
      (a) =>
        a.OrganizationId == this.CurrentCreditOrganizationModel.OrganizationId
    );
  }
  public getCreditOrganizationList() {
    this.settingsBLService.GetCreditOrganizationList().subscribe((res) => {
      if (res.Status == "OK") {
        this.CreditOrganizations = res.Results;
      } else {
        alert("Failed ! " + res.ErrorMessage);
      }
    });
  }
  GetPriceCategory() {
    this.settingsBLService
      .GetPriceCategory()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.priceCategoryList = res.Results;
        } else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [
            "price category not available",
          ]);
        }
      });
  }

  DiscardChanges() {
    this.close();
  }

  isDirty(field) {
    this.isval = this.billScheme.SchemeValidator.controls[field].dirty;
    return this.isval;
  }

  public isValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.billScheme.SchemeValidator.valid;
    } else {
      return !this.billScheme.SchemeValidator.hasError(validator, fieldName);
    }
  }

  updateCopaymentCheckboxState() {
    if (
      this.billScheme.IsBillingCoPayment ||
      this.billScheme.IsPharmacyCoPayment
    ) {
      this.billScheme.IsCopaymentApplicable = true;
    } else {
      this.billScheme.IsCopaymentApplicable = false;
    }
  }
  GoToNextInput(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
      nextEl.select();
    }
  }

  public AddSubSchemeItemToList(): void {
    if (this.BillingSubScheme.SubSchemeName !== "") {
      const isDuplicate = this.billScheme.BillingSubSchemes.some(subScheme => subScheme.SubSchemeName.toLowerCase() === this.BillingSubScheme.SubSchemeName.toLowerCase());
      if (isDuplicate) {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [
          "Duplicate SubSchemeName.",
        ]);
      }
      else {
        if (this.BillingSubScheme.SubSchemeId === 0) {
          this.BillingSubScheme.SchemeId = this.BillSchemeId > 0 ? this.BillSchemeId : 0;
          this.BillingSubScheme.IsActive = true;
          this.billScheme.BillingSubSchemes.push(this.BillingSubScheme);
          this.BillingSubScheme = new BillingSubSchemeModel();
        }
        else {
          this.billScheme.BillingSubSchemes.map((subScheme) => {
            if (subScheme.SubSchemeId === this.BillingSubScheme.SubSchemeId) {
              subScheme.SubSchemeName = this.BillingSubScheme.SubSchemeName;
              this.BillingSubScheme = new BillingSubSchemeModel();
            }
          });
        }
      }
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [
        "SubScheme can't be empty.",
      ]);
    }
  }

  public GetBillingSubSchemesBySchemeId(SchemeId: number): void {
    this.settingsBLService.GetBillingSubSchemesBySchemeId(SchemeId).subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.billScheme.BillingSubSchemes = res.Results;
        }
        else[
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to get Billing Sub Schemes."])
        ]
      },
      (err) => {
        this.logError(err);
      }
    )
  }

  public ActivateDeactivateSubScheme(SubSchemeId: number): void {
    this.settingsBLService.ActivateDeactivateSubScheme(SubSchemeId)
      .subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.GetBillingSubSchemesBySchemeId(this.billScheme.SchemeId);
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [
              `SubScheme ${res.Results ? 'Activated' : 'Deactivated'} Successfully.`,
            ]);
          } else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
              `Unable to Change Status.`,
            ]);
          }
        },
        (err) => {
          this.logError(err);
        }
      );
  }

  public DeleteSubSchemeFromRow(index: number): void {
    this.billScheme.BillingSubSchemes.splice(index, 1);
  }

  public EditSubScheme(selectedSubScheme: BillingSubSchemeModel): void {
    if (selectedSubScheme) {
      this.BillingSubScheme.SubSchemeName = selectedSubScheme.SubSchemeName;
      this.BillingSubScheme.SubSchemeId = selectedSubScheme.SubSchemeId
    }
  }
}
