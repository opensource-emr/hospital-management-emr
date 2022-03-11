import { Injectable, Directive } from '@angular/core';
import { BillingTransaction } from '../shared/billing-transaction.model';
import { BillingReceiptModel } from "./billing-receipt.model";
import { CoreService } from "../../core/shared/core.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { InsuranceVM } from '../shared/patient-billing-context-vm';
import { BillItemPriceVM } from './billing-view-models';
import { CreditOrganization } from '../../settings-new/shared/creditOrganization.model';
import { PatientLatestVisitContext } from '../../patients/shared/patient-lastvisit-context';

@Injectable()
export class BillingService {
  public taxLabel: string = "";
  public taxName: string = "";
  public taxPercent: number = 0;
  public taxId: number = 0;
  public currencyUnit: string = "";
  public BillingType: string = "";//for: inpatient, outpatient, etc.. 
  public BillingFlow: string = "normal";//normal for normal billing and insurance for insurance billing
  public Insurance: InsuranceVM;
  public isInsuranceBilling: boolean = false;
  public BillingMainDotMatrixPrinterPageDimension: any;
  public DepositReceiptDotMatrixPageDimension: any;
  public OpdStickerDotMatrixPageDimension: any;
  public EmergencyStickerDotMatrixPageDimension: any;
  public DischargeBillPageDimension: any;
  //public defaultPrinterName: string = null;

  public adtAdditionalBillItms: Array<BillItemPriceVM>;
  //sud:9sept'21--needed to centralize the visit context of current patient.
  public PatLastVisitContext: PatientLatestVisitContext = new PatientLatestVisitContext();

  constructor(public coreService: CoreService, public msgBoxServ: MessageboxService) {
    this.GetTaxDetails();
    this.GetCurrencyUnit();
  }
  public GetTaxDetails() {
    let taxInfo1 = this.coreService.Parameters.find(a => a.ParameterName == 'TaxInfo');
    if (taxInfo1) {
      let taxInfoStr = taxInfo1.ParameterValue;
      let taxInfo = JSON.parse(taxInfoStr);
      this.taxName = taxInfo.TaxName;
      this.taxLabel = taxInfo.TaxLabel;
      this.taxPercent = taxInfo.TaxPercent;
      this.taxId = taxInfo.TaxId;
    }

  }
  public GetCurrencyUnit() {
    var currParameter = this.coreService.Parameters.find(a => a.ParameterName == "Currency")
    if (currParameter)
      this.currencyUnit = JSON.parse(currParameter.ParameterValue).CurrencyUnit;
    else
      this.msgBoxServ.showMessage("error", ["Please set currency unit in parameters."]);
  }
  globalBillingTransaction: BillingTransaction = new BillingTransaction();
  //public model: BillingTransaction = new BillingTransaction();
  public CreateNewGlobalBillingTransaction(): BillingTransaction {
    this.globalBillingTransaction = new BillingTransaction();
    return this.globalBillingTransaction;
  }
  public getGlobalBillingTransaction(): BillingTransaction {
    return this.globalBillingTransaction;
  }


  globalBillingReceipt: BillingReceiptModel = new BillingReceiptModel();
  public GetGlobalBillingReceipt(): BillingReceiptModel {
    return this.globalBillingReceipt;
  }


  //sud: 21Aug'18-- whether or not to show DischargeBill--Configurable from parameter
  public ShowIPBillSeparately(): boolean {
    let ipBillDisplayJson = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == 'ShowIpReceiptSeparately');

    if (ipBillDisplayJson && ipBillDisplayJson.ParameterValue == 1) {
      return true;
    }
    else return false;
  }

  public ResetToNormalBilling() {
    this.BillingFlow = "normal";
    this.Insurance = null;
  }

  //sud:4Sept'19--adding public variable for common use.
  //below variable will be set from billing-main at the time of loading.
  public allBillItemsPriceList: Array<BillItemPriceVM> = [];

  public LoadAllBillItemsPriceList(billItms: Array<BillItemPriceVM>) {
    this.allBillItemsPriceList = billItms;
  }

  //sud: 30Apr'20-- For reusability.
  public AllDoctorsListForBilling = [];//this variable will be set from billing-main component..
  public AllEmpListForBilling = [];//
  public AllCreditOrganizationsList = [];


  public SetAllDoctorList(docListFromServer: Array<any>) {
    this.AllDoctorsListForBilling = docListFromServer;
  }

  //this creates a duplicate and returns the doctor's list.
  //shouldn't send the same array since we're adding additional fields in the billing components
  //which will change this shared object.. 
  public GetDoctorsListForBilling(): Array<any> {
    let docListToReturn = [];
    if (this.AllDoctorsListForBilling) {
      // //need to individually map the objects to avoid Reference-Type issue
      docListToReturn = this.AllDoctorsListForBilling.map(doc => Object.assign({}, doc));
    }
    return docListToReturn;
  }

  public SetAllEmployeeList(empListFromServer: Array<any>) {
    this.AllEmpListForBilling = empListFromServer;
  }

  public SetAllCreditOrgList(creditOrgFromServer: Array<CreditOrganization>) {
    this.AllCreditOrganizationsList = creditOrgFromServer;
  }

  public SetAdtAdditionalBillItms(items: Array<BillItemPriceVM>) {
    this.adtAdditionalBillItms = items;
  }
}
