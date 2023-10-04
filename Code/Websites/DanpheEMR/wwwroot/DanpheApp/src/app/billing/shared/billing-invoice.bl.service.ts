import { Injectable } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { CoreService } from "../../core/shared/core.service";

@Injectable()
export class BillingInvoiceBlService {

  constructor(
    public coreService: CoreService
  ) {

  }

  CreateFormGroupForInvoiceItems(): FormGroup {
    const formBuilder = new FormBuilder();
    return formBuilder.group({
      'ItemCode': ['', Validators.compose([Validators.required])],
      'ServiceItemId': ['', Validators.compose([Validators.required])],
      'ItemName': ['', Validators.compose([Validators.required])],
      'Quantity': [1, Validators.compose([Validators.required, Validators.min(0)])],
      'Price': [0, Validators.compose([Validators.required, Validators.min(0)])],
      'DiscountPercent': [0, Validators.compose([this.discountPercentValidator])],
      'DiscountAmount': [0, Validators.compose([this.discountAmountValidator])],
      'PerformerId': [0, Validators.compose([])],
      'PerformerName': ['', Validators.compose([])],
      'PrescriberId': [0, Validators.compose([])],
      'SubTotal': [0, Validators.compose([])],
      'TotalAmount': [0, Validators.compose([])],
      'IsCoPayment': [false, Validators.compose([])],
      'CoPaymentCashPercent': [0, Validators.compose([])],
      'CoPaymentCreditPercent': [0, Validators.compose([])],
      'CoPaymentCashAmount': [0, Validators.compose([])],
      'CoPaymentCreditAmount': [0, Validators.compose([])],
      'ServiceDepartmentId': [0, Validators.compose([])],
      'ServiceDepartmentName': [0, Validators.compose([])],
      'IntegrationItemId': [0, Validators.compose([])],
    });
  }
  discountPercentValidator(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      if (control.value < 0 || control.value > 100)
        return { 'invalidPercent': true };
    }

  }

  discountAmountValidator(control: FormControl): { [key: string]: boolean } {
    if (control && control.value < 0)
      return { 'invalidNumber': true };
    else
      return;
  }
  CalculatePercentage(value: number = 0, Total: number): number {
    const percentage = (value / Total) * 100;
    return percentage;
  }

  CalculateAmountFromPercentage(percentage: number = 0, Total: number = 0): number {
    const amount = (percentage * Total) / 100;
    return amount;
  }


  public GetParam_InvoiceLabelName(): string {
    const currParam = this.coreService.Parameters.find(a => a.ParameterGroupName === "Billing" && a.ParameterName === "BillingInvoiceDisplayLabel");
    if (currParam && currParam.ParameterValue) {
      return currParam.ParameterValue;
    }
  }
  public GetParam_BillingRequestDisplaySettings(): object {
    const StrParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "OPBillingRequestDisplaySettings");
    if (StrParam && StrParam.ParameterValue) {
      let currParam = JSON.parse(StrParam.ParameterValue);
      return currParam;
    }
  }

  public GetParam_BillingExternalReferrerSettings(): { EnableExternal: true, DefaultExternal: false } {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "ExternalReferralSettings");
    if (currParam && currParam.ParameterValue) {
      const externalReferralSettings = JSON.parse(currParam.ParameterValue);
      return externalReferralSettings;
    }
  }
  GetParam_IsAdditionalDiscOnProvisional(): boolean {
    let param = this.coreService.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "AllowAdditionalDiscOnProvisionalInvoice");
    if (param) {
      let paramValue = param.ParameterValue;
      if (paramValue != null && paramValue != '' && (paramValue == 'true' || paramValue == 1)) {
        return true;
      }
      else {
        return false;
      }

    }
  }

  ItemsListFormatter(data: any): string {
    let html: string = "";
    html = "<font color='blue'; size=03 >" + data["ItemCode"] + "&nbsp;&nbsp;" + ":" + "&nbsp;" + data["ItemName"].toUpperCase() + "</font>" + "&nbsp;&nbsp;";
    html += "(<i>" + data["ServiceDepartmentName"] + "</i>)" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + "<b>" + data["Price"] + "</b>";
    return html;
  }

  PerformerListFormatter(data: any): string {
    return data["FullName"];
  }

  DepartmentListFormatter(data: any): string {
    let html = data["DepartmentName"];
    return html;
  }
}
