import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from "moment";
import { Observable, Subscription } from "rxjs-compat";
import { CoreService } from "../../../core/shared/core.service";
import { DispensaryService } from "../../../dispensary/shared/dispensary.service";
import { Employee } from "../../../employee/shared/employee.model";
import { Patient } from "../../../patients/shared/patient.model";
import { PatientService } from "../../../patients/shared/patient.service";
import { SecurityService } from "../../../security/shared/security.service";
import { SettingsBLService } from "../../../settings-new/shared/settings.bl.service";
import { CallbackService } from "../../../shared/callback.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { RouteFromService } from "../../../shared/routefrom.service";
import { ENUM_BillingStatus, ENUM_DanpheHTTPResponseText, ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status, ENUM_ServiceBillingContext } from "../../../shared/shared-enums";
import { PharmacySchemePriceCategory_DTO } from "../../shared/dtos/pharmacy-scheme-pricecategory.dto";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { PHRMPatient } from "../../shared/phrm-patient.model";
import { PHRMStoreModel } from "../../shared/phrm-store.model";
import { PHRMPatientConsumptionItem } from "../shared/phrm-patient-consumption-item.model";
import { PHRMPatientConsumption } from "../shared/phrm-patient-consumption.model";
import { WardSubStoreMap_DTO } from "../shared/ward-substores-map.dto";
@Component({
    selector: 'phrm-patient-consumption-add',
    templateUrl: "./phrm-patient-consumption-add.html",
    styleUrls: ['./phrm-patient-consumption-add.component.css'],
    host: { '(window:keydown)': 'hotkeys($event)' }

})
export class PHRMPatientConsumptionAddComponent {
    SelectedItem: ConsumptionItem;
    IsCurrentDispensaryInsurace: boolean;
    searchPatient: Patient = new Patient();
    currentPatient: PHRMPatient = new PHRMPatient();
    currentActiveDispensary: PHRMStoreModel = new PHRMStoreModel();
    PatientSearchMinCharacterCount: number = 0;
    patientConsumptionItems: Array<PHRMPatientConsumptionItem> = new Array<PHRMPatientConsumptionItem>();
    patientConsumptionItem: PHRMPatientConsumptionItem = new PHRMPatientConsumptionItem();
    patientConsumption: PHRMPatientConsumption = new PHRMPatientConsumption();
    patientConsumptionGenericName: any;
    FilteredGenericList: Array<PatientConsumptionGeneric> = new Array<PatientConsumptionGeneric>();
    Items: Array<ConsumptionItem> = new Array<ConsumptionItem>();
    Item: ConsumptionItem = new ConsumptionItem();
    ItemTypeListApiSubscription: Subscription;
    SelectedPrescriber: Employee = new Employee();
    ReferrerList: Array<Employee> = [];
    TotalAmount: number = null;
    @Output("callback-add") callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    @Input() public CurrentCounterId: number = null;
    FilteredItems: ConsumptionItem[] = [];
    GenericList: PatientConsumptionGeneric[] = [];
    loading: boolean = false;
    showPrintPage: boolean = false;
    PatientConsumptionId: number = null;
    @Input('ward-id') WardId: number = 0;
    WardSubStoreMapList: WardSubStoreMap_DTO[] = [];
    StoreId: number = 0;
    @Input('patient-id') PatientId: number = 0;
    SelectedStore: WardSubStoreMap_DTO = new WardSubStoreMap_DTO();
    SchemePriceCategoryObj: PharmacySchemePriceCategoryCustomType = { SchemeId: 0, PriceCategoryId: 0 };
    serviceBillingContext: string = ENUM_ServiceBillingContext.IpPharmacy;
    SchemePriceCategory: PharmacySchemePriceCategory_DTO = new PharmacySchemePriceCategory_DTO();
    PatientConsumptionAmount = { SubTotal: 0, DiscountAmount: 0, TotalAmount: 0 };
    oldPriceCategoryId: number = 0;
    patSummary = { IsLoaded: false, PatientId: 0, CreditAmount: 0, ProvisionalAmt: 0, TotalDue: 0, DepositBalance: 0, BalanceAmount: 0, GeneralCreditLimit: 0, IpCreditLimit: 0, OpCreditLimit: 0, OpBalance: 0, IpBalance: 0 };
    confirmationTitle: string = "Confirm !";
    confirmationMessage: string = "Are you sure you want to Proceed ?";
    IsPrescriberMandatory: boolean = false;
    NMCNoAddPopup: boolean = false;
    MedicalCertificateNo: null;
    EmployeeDetails: Employee;
    ShowNMCNoAddButton: boolean = false;
    constructor(public dispensaryService: DispensaryService,
        public patientService: PatientService,
        public settingsBlService: SettingsBLService,
        public securityService: SecurityService,
        public callBackService: CallbackService,
        public messageboxService: MessageboxService,
        public router: Router,
        public routeFromService: RouteFromService,
        public pharmacyBLService: PharmacyBLService, public coreService: CoreService,) {
        this.currentActiveDispensary = this.dispensaryService.activeDispensary;
        this.GetReferrals();
        this.GetPatientSearchMinCharacterCountParameter();
        this.getGenericList();

    }
    ngOnInit(): void {
        if (this.PatientId) {
            this.GetPatientDetails(this.PatientId);
            setTimeout(() => {
                this.coreService.FocusInputById('id_input_selectReferral');
            }, 200);
        }
        else {
            this.coreService.FocusInputById('id_input_search_patient');
        }
    }
    public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {
        return this.pharmacyBLService.GetIPPatientList(keyword);
    }
    InsurancePatientListFormatter(data: any): string {
        let html = `[${data['PatientCode']}] | ${data["ShortName"]} | NSHI [ ${data['Ins_NshiNumber']}]`;
        return html;
    }
    public GetPatientSearchMinCharacterCountParameter() {
        let param = this.coreService.Parameters.find(a => a.ParameterGroupName === 'Common' && a.ParameterName === 'PatientSearchMinCharacterCount');
        if (param) {
            let obj = JSON.parse(param.ParameterValue);
            this.PatientSearchMinCharacterCount = parseInt(obj.MinCharacterCount);
        }
    }
    SetFocusById(IdToBeFocused: string, defaultTimeInMs: number = 100) {
        window.setTimeout(function () {
            let elemToFocus = document.getElementById(IdToBeFocused)
            if (elemToFocus != null && elemToFocus != undefined) {
                elemToFocus.focus();
            }
        }, defaultTimeInMs);
    }
    patientListFormatter(data: any): string {
        let html = `${data["ShortName"]} [ ${data['PatientCode']} ]`;
        return html;
    }

    onClickPatient($event) {
        if ($event.PatientId > 0 || $event.PatientId == -1) {
            this.GetPatientDetails($event.PatientId);
        }
    }
    private GetPatientDetails(PatientId: number) {
        this.pharmacyBLService.GetPatientByPatId(PatientId)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    if (res.Results.VisitType === null) {
                        this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ['Patient visit details not found. Please check-in this patient from Appointment.']);
                        return;
                    }
                    this.currentPatient.PatientVisitId = res.Results.PatientVisitId;
                    this.currentPatient.VisitType = res.Results.VisitType;
                    this.currentPatient.PatientId = res.Results.PatientId;
                    this.currentPatient.FirstName = res.Results.FirstName;
                    this.currentPatient.LastName = res.Results.LastName;
                    this.currentPatient.Age = res.Results.Age;
                    this.currentPatient.ShortName = res.Results.ShortName;
                    this.currentPatient.Gender = res.Results.Gender;
                    this.currentPatient.PhoneNumber = res.Results.PhoneNumber;
                    this.currentPatient.PatientCode = res.Results.PatientCode;
                    this.currentPatient.SchemeId = res.Results.SchemeId;
                    this.currentPatient.SchemeName = res.Results.SchemeName;
                    this.currentPatient.PriceCategoryId = res.Results.PriceCategoryId;
                    this.LoadPatientInvoiceSummary(PatientId, res.Results.SchemeId, res.Results.PatientVisitId);
                    this.SchemePriceCategoryObj = { SchemeId: res.Results.SchemeId, PriceCategoryId: res.Results.PriceCategoryId };
                }
            }
            );
    }

    OnSchemePriceCategoryChanged(schemePriceObj: PharmacySchemePriceCategory_DTO): void {
        this.patientConsumptionItems = [];
        this.patientConsumptionItem = new PHRMPatientConsumptionItem();
        this.SchemePriceCategory = schemePriceObj;
        this.SchemePriceCategory.DiscountPercent = this.SchemePriceCategory.IsDiscountApplicable ? this.SchemePriceCategory.DiscountPercent : 0;
        if (this.SchemePriceCategory.PriceCategoryId !== this.oldPriceCategoryId) {
            this.GetDefaultStore();
            this.oldPriceCategoryId = this.SchemePriceCategory.PriceCategoryId;
        }
    }

    Add() {
        var CheckIsValid: boolean = true;
        if (this.patientConsumptionItems.length < 0) {
            this.messageboxService.showMessage(ENUM_MessageBox_Status.Error, ['Add Items']);
            return;
        }
        if (this.patientConsumptionItem.Quantity > this.patientConsumptionItem.AvailableQuantity) {
            this.messageboxService.showMessage(ENUM_MessageBox_Status.Error, ['Consumption Quantity Should not be greater than Available Quantity']);
            return;
        }

        for (let a in this.patientConsumptionItem.PatientConsumptionValidator.controls) {
            this.patientConsumptionItem.PatientConsumptionValidator.controls[a].markAsDirty();
            this.patientConsumptionItem.PatientConsumptionValidator.controls[a].updateValueAndValidity();
        }
        if (this.patientConsumptionItem.IsValidCheck(undefined, undefined) == false) {
            CheckIsValid = false;
        }
        if (CheckIsValid) {
            if (this.patientConsumptionItems.some(i => i.ItemId === this.patientConsumptionItem.ItemId && i.BatchNo === this.patientConsumptionItem.BatchNo)) {
                return this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ['Duplicate item cannot be added ']);
            }
            let item = Object.assign({}, this.patientConsumptionItem);
            this.patientConsumptionItems.push(item);

            this.MainLevelCalculation();

            this.DeductStockQuantityLocally();
            if (this.patientConsumptionItems.length > 0) {
                this.patientConsumptionItem = new PHRMPatientConsumptionItem();
                this.patientConsumptionGenericName = null;
                this.SelectedItem = null;
                this.Item.AvailableQuantity = null;
                this.ResetGenericAndItemList();
            }
        }
    }

    MainLevelCalculation() {
        let subtotal = 0;
        let discountAmount = 0;
        let totalAmount = 0;

        if (this.patientConsumptionItems.length) {
            subtotal = this.patientConsumptionItems.reduce((a, b) => a + b.SubTotal, 0);
            discountAmount = this.patientConsumptionItems.reduce((a, b) => a + b.DiscountAmount, 0);
            totalAmount = this.patientConsumptionItems.reduce((a, b) => a + b.TotalAmount, 0);
        }

        this.patientConsumption.SubTotal = CommonFunctions.parseAmount(subtotal, 4);
        this.patientConsumption.DiscountAmount = CommonFunctions.parseAmount(discountAmount, 4);
        this.patientConsumption.TotalAmount = CommonFunctions.parseAmount(totalAmount, 4);
    }

    ResetGenericAndItemList() {
        this.FilteredGenericList = this.GenericList;
        this.FilteredItems = this.Items;
    }

    public getGenericList() {
        this.pharmacyBLService.GetGenericList()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.GenericList = res.Results;
                    this.FilteredGenericList = res.Results;
                }
            });
    }


    GetDefaultStore() {
        if (this.WardId) {
            this.pharmacyBLService.GetWardSubStoreMapDetails(this.WardId).subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.WardSubStoreMapList = res.Results;
                    let WardDefaultSubStore = this.WardSubStoreMapList.find(a => a.IsDefault === true);
                    this.SelectedStore = WardDefaultSubStore;
                    if (WardDefaultSubStore) {
                        this.StoreId = WardDefaultSubStore.StoreId;
                        this.LoadItemTypeList(this.StoreId, this.SchemePriceCategory.PriceCategoryId)
                    }
                    else {
                        this.messageboxService.showMessage(ENUM_MessageBox_Status.Failed, ['Default store not found for this Ward']);
                    }
                }
            })
        }
        else {
            this.StoreId = this.currentActiveDispensary.StoreId;
            this.LoadItemTypeList(this.StoreId, this.SchemePriceCategory.PriceCategoryId);
        }
    }
    LoadItemTypeList(StoreId: number, PriceCategoryId: number): void {
        this.ItemTypeListApiSubscription = this.pharmacyBLService.GetDispensaryAvailableStock(StoreId, PriceCategoryId)
            .subscribe(res => this.CallBackGetItemTypeList(res));
    }
    CallBackGetItemTypeList(res) {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
            if (res.Results) {
                this.Items = [];
                this.Items = res.Results;
                this.FilteredItems = res.Results;
            }
        }
    }
    onChangeItem() {
        if (this.SelectedItem.ItemId > 0) {
            this.patientConsumptionGenericName = this.SelectedItem.GenericName;
            this.Item.AvailableQuantity = this.Items.filter(item => item.ItemId == this.SelectedItem.ItemId && item.BatchNo == this.SelectedItem.BatchNo)[0].AvailableQuantity;
            this.patientConsumptionItem.ItemName = this.SelectedItem.ItemName;
            this.patientConsumptionItem.GenericName = this.SelectedItem.GenericName;
            this.patientConsumptionItem.GenericId = this.SelectedItem.GenericId;
            this.patientConsumptionItem.Quantity = 0;
            this.patientConsumptionItem.SalePrice = this.SelectedItem.SalePrice;
            this.patientConsumptionItem.NormalSalePrice = this.SelectedItem.NormalSalePrice;
            this.patientConsumptionItem.BatchNo = this.SelectedItem.BatchNo;
            this.patientConsumptionItem.ItemId = this.SelectedItem.ItemId;
            this.patientConsumptionItem.ExpiryDate = this.SelectedItem.ExpiryDate;
            this.patientConsumptionItem.AvailableQuantity = this.Item.AvailableQuantity;
            this.patientConsumptionItem.IsNarcotic = this.SelectedItem.IsNarcotic;
            if (this.SelectedItem.IsNarcotic) {
                this.IsPrescriberMandatory = true;
            }
        }
    }

    OnPrescriberChanged() {
        if (this.SelectedPrescriber && this.SelectedPrescriber.EmployeeId) {
            this.patientConsumption.PrescriberId = this.SelectedPrescriber.EmployeeId;
            this.patientConsumption.MedCertificationNo = this.SelectedPrescriber.MedCertificationNo;
        }
        else {
            this.patientConsumption.PrescriberId = null;
            this.patientConsumption.MedCertificationNo = null;
        }

    }
    onChangeGenericName() {
        this.patientConsumptionItem.GenericName = this.patientConsumptionGenericName.GenericName;
        this.FilteredItems = this.Items.filter(a => a.GenericId == this.patientConsumptionGenericName.GenericId);

    }
    phrmItemGenericFormatter(data: any): string {
        let html = "";
        if (data["GenericId"]) {
            html = `<font color='blue'; size=03 >${data["GenericName"]}</font>`;
        }
        return html;
    }
    phrmItemListFormatter(data: any): string {
        let html = "";
        let date = new Date();
        let datenow = date.setMonth(date.getMonth() + 0);
        let datethreemonth = date.setMonth(date.getMonth() + 3);
        if (data["ItemId"]) {
            let expiryDate = new Date(data["ExpiryDate"]);
            let expDate = expiryDate.setMonth(expiryDate.getMonth() + 0);
            if (expDate < datenow) {
                html = `<font color='crimson'; size=03 >${data["ItemName"]}</font> <b>|Unit|${data["Unit"]}</b> |E:${moment(data["ExpiryDate"]).format('YYYY-MM-DD')} |B.No.|${data["BatchNo"]} |Qty|${data["AvailableQuantity"]} |SalePrice|${data["SalePrice"]}`;
            }
            if (expDate < datethreemonth && expDate > datenow) {

                html = `<font  color='#FFBF00'; size=03 >${data["ItemName"]}</font><b>|Unit|${data["Unit"]}</b> |E:${moment(data["ExpiryDate"]).format('YYYY-MM-DD')} |B.No.|${data["BatchNo"]} |Qty|${data["AvailableQuantity"]} |SalePrice|${data["SalePrice"]}`;
            }
            if (expDate > datethreemonth) {
                html = `<font color='blue'; size=03 >${data["ItemName"]}</font><b>|Unit|${data["Unit"]}</b> |E:${moment(data["ExpiryDate"]).format('YYYY-MM-DD')} |B.No.|${data["BatchNo"]} |Qty|${data["AvailableQuantity"]} |SalePrice|${data["SalePrice"]}`;
            }
        }
        else {
            html = data["ItemName"];
        }
        return html;
    }
    AssignedToDocListFormatter(data: any): string {
        let html = "";
        if (data["EmployeeId"]) {
            html = `<font color='blue'; size=03 >${data["FullName"]}</font>`;
        }
        return html;
    }
    SaveConsumption() {
        if (this.currentPatient.PatientId <= 0) {
            return this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ['Patient visit details not found.Please check-in this patient from Appointment.']);
        }

        if (this.patientConsumptionItems.length === 0) {
            return this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ['Add Items']);
        }

        if (this.patientConsumptionItems.some(itm => itm.IsNarcotic)) {
            if (!this.patientConsumption.PrescriberId) {
                return this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ['Prescriber is mandatory for narcotic sales']);
            }
            if (this.patientConsumption.MedCertificationNo === null) {
                this.ShowNMCNoAddButton = true;
                return this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ['NMC number is mandatory for Narcotic Sales']);
            }
        }
        this.MapPatientConsumptionData();
        this.loading = true;

        this.pharmacyBLService.PostPatientConsumption(this.patientConsumption)
            .finally(() => this.loading = false)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.PatientConsumptionId = res.Results;
                    this.showPrintPage = true;
                    this.messageboxService.showMessage(ENUM_MessageBox_Status.Success, ['Consumption is added Successfully']);
                    this.ResetFields();
                }
                else {
                    this.messageboxService.showMessage(ENUM_MessageBox_Status.Error, ['Sorry, Consumption is not added']);
                }
            });
    }
    private ResetFields() {
        this.patientConsumption = new PHRMPatientConsumption();
        this.patientConsumptionItems = [];
        this.patientConsumptionItem = new PHRMPatientConsumptionItem();
        this.Item.AvailableQuantity = null;
        this.SelectedPrescriber = new Employee();
        this.currentPatient = new PHRMPatient();
        this.searchPatient = new Patient();
        this.patientConsumptionGenericName = null;
        this.TotalAmount = null;
    }

    private MapPatientConsumptionData() {
        this.patientConsumption.PatientId = this.currentPatient.PatientId;
        this.patientConsumption.PatientVisitId = this.currentPatient.PatientVisitId;
        this.patientConsumption.PatientConsumptionItems = this.patientConsumptionItems;
        this.patientConsumption.StoreId = this.StoreId;
        this.patientConsumption.PatientName = this.currentPatient.ShortName;
        this.patientConsumption.BillingStatus = ENUM_BillingStatus.unpaid;
        this.patientConsumption.SchemeId = this.currentPatient.SchemeId;
        this.patientConsumption.CounterId = this.CurrentCounterId;
        this.patientConsumption.PatientConsumptionItems.forEach((item) => {
            item.PatientId = this.patientConsumption.PatientId;
            item.PatientvisitId = this.patientConsumption.PatientVisitId;
            item.PrescriberId = this.patientConsumption.PrescriberId;
            item.PriceCategoryId = this.currentPatient.PriceCategoryId;
            item.CounterId = this.CurrentCounterId;
            item.StoreId = this.StoreId;
            item.VisitType = this.currentPatient.VisitType;
            item.Remarks = this.patientConsumptionItem.Remarks;
        });
    }

    private DeductStockQuantityLocally() {
        this.patientConsumptionItems.forEach(soldStock => {
            let item = this.Items.find(i => i.ItemId == soldStock.ItemId && i.BatchNo == soldStock.BatchNo && i.SalePrice == soldStock.SalePrice && i.SalePrice == soldStock.SalePrice);
            if (item != null)
                item.AvailableQuantity -= soldStock.Quantity;
        });
        this.Items = this.Items.filter(x => x.AvailableQuantity > 0);
    }
    GetReferrals() {
        this.settingsBlService.GetAllReferrerList()
            .subscribe((res: DanpheHTTPResponse) => {

                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {

                    if (res.Results.length) {
                        this.ReferrerList = res.Results;
                    }
                }
            });
    }
    DeleteRow(index) {
        try {
            this.patientConsumptionItems.splice(index, 1);
            if (!this.patientConsumptionItems.some(itm => itm.IsNarcotic)) {
                this.IsPrescriberMandatory = false;
            }
            this.MainLevelCalculation();

        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            this.routeFromService.RouteFrom = null;
            this.messageboxService.showMessage(ENUM_MessageBox_Status.Error, ["Check error in Console log !"]);
            console.log("Error Messsage =>  " + ex.message);
        }
    }
    Close() {
        this.patientConsumption = new PHRMPatientConsumption();
        this.patientConsumptionItems = [];
        this.patientConsumptionItem = new PHRMPatientConsumptionItem();
        this.Item.AvailableQuantity = null;
        this.SelectedPrescriber = new Employee();
        this.currentPatient = new PHRMPatient();
        this.searchPatient = new Patient();
        this.patientConsumptionGenericName = null;
        this.TotalAmount = null;
        this.callbackAdd.emit();
    }
    DiscardConsumption() {
        this.Close();
    }
    ngOnDestroy() {
        if (this.ItemTypeListApiSubscription)
            this.ItemTypeListApiSubscription.unsubscribe();
    }

    OnQuantityChange() {
        if (this.patientConsumptionItem.Quantity) {
            let subtotal = 0;
            let discountAmount = 0;
            let totalAmount = 0;

            subtotal = this.patientConsumptionItem.Quantity * this.patientConsumptionItem.SalePrice;
            discountAmount = subtotal * this.SchemePriceCategory.DiscountPercent / 100;
            totalAmount = subtotal - discountAmount;

            this.patientConsumptionItem.SubTotal = CommonFunctions.parseAmount(subtotal, 4);
            this.patientConsumptionItem.DiscountPercentage = this.SchemePriceCategory.DiscountPercent;
            this.patientConsumptionItem.DiscountAmount = CommonFunctions.parseAmount(discountAmount, 4);
            this.patientConsumptionItem.TotalAmount = CommonFunctions.parseAmount(totalAmount, 4);
        }
        else {
            this.patientConsumptionItem.SubTotal = 0;
            this.patientConsumptionItem.DiscountAmount = 0;
            this.patientConsumptionItem.TotalAmount = 0;
            this.patientConsumptionItem.DiscountPercentage = 0;
        }
    }

    ClosePrintPage() {
        this.showPrintPage = false;
        this.PatientConsumptionId = null;
        this.callbackAdd.emit();
    }

    StoreListFormatter(data: any): string {
        let html = "";
        if (data["StoreId"]) {
            html = `<font color='blue'; size=03 >${data["StoreName"]}</font>`;
        }
        return html;
    }

    OnStoreChanged() {
        if (this.SelectedStore && this.SelectedStore.StoreId) {
            this.LoadItemTypeList(this.SelectedStore.StoreId, this.currentPatient.PriceCategoryId);
            this.patientConsumptionItem = new PHRMPatientConsumptionItem();
        }
    }

    LoadPatientInvoiceSummary(patientId: number, SchemeId?: number, PatientVisitId?: number) {
        if (patientId > 0) {
            this.pharmacyBLService.GetPatientSummary(patientId, SchemeId, PatientVisitId)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.patSummary = res.Results;
                        this.patSummary.CreditAmount = CommonFunctions.parseAmount(this.patSummary.CreditAmount);
                        this.patSummary.ProvisionalAmt = CommonFunctions.parseAmount(this.patSummary.ProvisionalAmt);
                        this.patSummary.BalanceAmount = CommonFunctions.parseAmount(this.patSummary.BalanceAmount);
                        this.patSummary.DepositBalance = CommonFunctions.parseAmount(this.patSummary.DepositBalance);
                        this.patSummary.TotalDue = CommonFunctions.parseAmount(this.patSummary.TotalDue);
                        this.patSummary.GeneralCreditLimit = CommonFunctions.parseAmount(this.patSummary.GeneralCreditLimit);
                        this.patSummary.IpCreditLimit = CommonFunctions.parseAmount(this.patSummary.IpCreditLimit);
                        this.patSummary.OpCreditLimit = CommonFunctions.parseAmount(this.patSummary.OpCreditLimit);
                        this.patSummary.IsLoaded = true;
                    }
                    else {
                        this.messageboxService.showMessage("Select Patient", [res.ErrorMessage]);
                        this.loading = false;
                    }
                });
        }
    }

    OpenAddNMCPopup() {
        if (!this.SelectedPrescriber || !this.SelectedPrescriber.EmployeeId) {
            return this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ['Please select prescriber first.']);
        }
        this.NMCNoAddPopup = true;
    }
    CloseAddNMCPopup() {
        this.NMCNoAddPopup = false;
    }
    SaveNMCNo() {
        if (this.MedicalCertificateNo == null) {
            this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ['Please provide NMC No.']);
            return;
        }
        this.pharmacyBLService.UpdateNMCNo(this.SelectedPrescriber.EmployeeId, this.MedicalCertificateNo).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.NMCNoAddPopup = false;
                this.EmployeeDetails = res.Results;
                if (this.EmployeeDetails) {
                    this.patientConsumption.MedCertificationNo = this.EmployeeDetails.MedCertificationNo;
                    if (this.patientConsumption.MedCertificationNo) {
                        this.ShowNMCNoAddButton = false;
                    }
                }
                this.MedicalCertificateNo = null;
            }
        });
    }

    handleConfirm() {
        this.SaveConsumption();
    }
    handleCancel() {
        this.loading = false;
    }
    public hotkeys(event) {
        if (event.keyCode === 27) {
            //For ESC key => close the pop up
            this.ClosePrintPage();
        }
    }
}

export class PatientConsumptionGeneric {
    GenericId: number = 0;
    GenericName: string = "";
}
export class ConsumptionItem {
    ItemId: number = 0;
    ItemName: string = "";
    GenericName: string = "";
    GenericId: number = 0;
    AvailableQuantity: number = 0;
    RackNo: string = "";
    BatchNo: string = "";
    SalePrice: number = 0;
    ExpiryDate: string = "";
    NormalSalePrice: number = 0;
    IsNarcotic: boolean = false;

}
