
import { Component } from "@angular/core";
import { ENUM_ACC_ADDLedgerLedgerType } from "../../../shared/shared-enums";

// Bikash,31st March 2022, refactored ledger mapping into respective separate files 
// i.e. Billing items, consultant, credit organization, inventory subcategory, inventory-vendor and pharmacy suppliers mappings

@Component({
  templateUrl: './ledger-mapping.html'
})
export class LedgerMappingComponent {

  public ledgerType: string;
  public typeledger: any = true;
  public typevendor: any = false;
  public typesupplier: boolean = true;
  public typeConsultant: boolean = false;
  public typeCreditOrganization: boolean = false;
  public typeInventoryVendor: boolean = false;
  public typeinventorysubcategory: boolean = false;
  public typeBillingLedger: boolean = false;
  public typePaymentMode: boolean = false;
  public typeBankReconciliationCategory: boolean = false;
  public typeMedicareTypes: boolean = false;

  constructor() {
    // initializing ledger type as 'billing income ledger' //Bikash,31st March 2022
    this.ledgerType = ENUM_ACC_ADDLedgerLedgerType.PharmacySupplier;
  }

  ToggleLedgerType(ledgerType) {

    this.ledgerType = ledgerType;


    if (ledgerType == ENUM_ACC_ADDLedgerLedgerType.PharmacySupplier) {
      this.MakeAllLedgerTypeFalse();
      this.typesupplier = true;

    }
    else if (ledgerType == ENUM_ACC_ADDLedgerLedgerType.InventoryVendor) {

      this.MakeAllLedgerTypeFalse();
      this.typeInventoryVendor = true;
    }
    else if (ledgerType == ENUM_ACC_ADDLedgerLedgerType.Consultant) {
      this.MakeAllLedgerTypeFalse();
      this.typeConsultant = true;
    }
    else if (ledgerType == ENUM_ACC_ADDLedgerLedgerType.CreditOrganization) {
      this.MakeAllLedgerTypeFalse();
      this.typeCreditOrganization = true;
    }
    else if (ledgerType == ENUM_ACC_ADDLedgerLedgerType.InventorySubCategory) {
      this.MakeAllLedgerTypeFalse();
      this.typeinventorysubcategory = true;
    }
    else if (ledgerType == ENUM_ACC_ADDLedgerLedgerType.BillingPriceItem) {
      this.MakeAllLedgerTypeFalse();
      this.typeBillingLedger = true;
    }
    // else if (ledgerType == ENUM_ACC_ADDLedgerLedgerType.BillingPriceItem) {
    //   this.MakeAllLedgerTypeFalse();
    //   this.typeBillingLedger = true;
    // }
    else if (ledgerType == ENUM_ACC_ADDLedgerLedgerType.PaymentModes) {
      this.MakeAllLedgerTypeFalse();
      this.typePaymentMode = true;
    }
    else if (ledgerType == ENUM_ACC_ADDLedgerLedgerType.BankReconciliationCategory) {
      this.MakeAllLedgerTypeFalse();
      this.typeBankReconciliationCategory = true;
    }
    else if (ledgerType == ENUM_ACC_ADDLedgerLedgerType.MedicareTypes) {
      this.MakeAllLedgerTypeFalse();
      this.typeMedicareTypes = true;
    }
  }

  MakeAllLedgerTypeFalse() {
    this.typesupplier = false;
    this.typeBillingLedger = false;
    this.typeConsultant = false;
    this.typeCreditOrganization = false;
    this.typeinventorysubcategory = false;
    this.typeInventoryVendor = false;
    this.typePaymentMode = false;
    this.typeBankReconciliationCategory = false;
    this.typeMedicareTypes = false;
  }
}
