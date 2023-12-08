import { HttpClient } from "@angular/common/http";
import { ChangeDetectorRef, Component, Injector, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import html2canvas from "html2canvas";
import { Base64, fromUint8Array } from "js-base64";
import * as jsPDF from "jspdf";
import * as _ from "lodash";
import * as moment from "moment/moment";
import { PDFDocument } from "pdf-lib";
import { VisitBLService } from "../../appointments/shared/visit.bl.service";
import { BillingBLService } from "../../billing/shared/billing.bl.service";
import { BillingService } from "../../billing/shared/billing.service";
import { PatientWiseSSFClaimList, SSFBil_VM, SSFClaimList, SSFInvoiceReturnsList, SSF_BillingInvoiceInfoVM, SSF_BillingInvoiceItems } from "../../billing/shared/invoice-print-vms";
import { CoreService } from "../../core/shared/core.service";
import { LabReportVM } from "../../labs/reports/lab-report-vm";
import { LabComponentModel } from "../../labs/shared/lab-component-json.model";
import { LabsBLService } from "../../labs/shared/labs.bl.service";
import { PatientService } from "../../patients/shared/patient.service";
import { PharmacyReceiptModel } from "../../pharmacy/shared/pharmacy-receipt.model";
import { GeneralFieldLabels } from "../../shared/DTOs/general-field-label.dto";
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { CommonFunctions } from "../../shared/common.functions";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { RouteFromService } from "../../shared/routefrom.service";
import { ENUM_ClaimCategory, ENUM_ClaimExtensionUrl, ENUM_ClaimResourceType, ENUM_Country, ENUM_DanpheHTTPResponseText, ENUM_DanpheHTTPResponses, ENUM_DefaultICDCode, ENUM_FileSizeUnits, ENUM_ICDCoding, ENUM_MessageBox_Status, ENUM_SSFSchemeTypeSubProduct, ENUM_SSF_BookingStatus, ENUM_ValidFileFormats, ENUM_VisitType } from "../../shared/shared-enums";
import { Category, ClaimBillablePeriod, ClaimBookingRoot_DTO, ClaimCategory, ClaimCoding, ClaimDiagnosis, ClaimDiagnosisCodeableConcept, ClaimEnterer, ClaimExtension, ClaimFacility, ClaimItem, ClaimPatient, ClaimProductOrService, ClaimProvider, ClaimQuantity, ClaimRoot, ClaimSupportingInfo, ClaimTotal, ClaimType, ClaimUnitPrice, Coding, SSFClaimResponseInfo, SSFSchemeTypeSubProduct, ValueAttachement } from "../shared/SSF-Models";
import { SsfDlService } from "./ssf-dl.services";


@Component({
  selector: 'ssf-claim',
  templateUrl: './ssf-claim.component.html',
  styleUrls: ['./ssf-claim.component.css']
})
export class SSFClaimComponent implements OnInit {

  public ShowBill: boolean = false;
  public finalAge: string = null;
  public localDateTime: string;
  public ipdNumber: string = null;
  public isInsurance: boolean = false;
  public patientType: string = "inpatient";
  public taxLabel: string;
  //public currencyUnit: string;
  public patientQRCodeInfo: string = "";
  public Invoice_Label: string = "INVOICE";//sud:19Nov'19--we're getting this value from Parameter since different hospital needed it differently.
  public EnableCreditNote: boolean;
  public ShowProviderName: boolean;
  public generatingDocumentHold: boolean = false;
  public CreditInvoiceDisplaySettings = { ShowPatAmtForCrOrganization: false, PatAmtValue: "0.00", ValidCrOrgNameList: ["Nepal Govt Dialysis"] };
  public QueueNoSetting = { "ShowInInvoice": false, "ShowInSticker": false };
  public InvoiceDisplaySettings: any = { ShowHeader: true, ShowQR: true, ShowHospLogo: true, ShowPriceCategory: false, HeaderType: '' };
  public InvoiceFooterNoteSettings: any = { ShowFooter: true, ShowEnglish: true, ShowNepali: false, EnglishText: "Please bring this invoice on your next visit.", NepaliText: "कृपया अर्को पटक आउँदा यो बिल अनिवार्य रुपमा लिएर आउनुहोला ।" };
  public hospitalCode: string = "";
  public isReceiptDetailLoaded: boolean = false;
  public defaultFocusADT: string = null;
  public defaultFocusVisit: string = null;
  public headerDetail: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };
  public pharmacyHeaderDetail: { hospitalName, address, email, PANno, tel, DDA };
  public closePopUpAfterInvoicePrintFromVisit: boolean = true;
  public closePopUpAfterInvoicePrintFromADT: boolean = true;
  public showLabType: boolean = false;
  public labCount: number = 0;
  public showMunicipality: boolean = false;
  public BillingInvoiceItemList: Array<SSF_BillingInvoiceItems> = new Array<SSF_BillingInvoiceItems>();
  public BillingInvoiceInfo: SSF_BillingInvoiceInfoVM = new SSF_BillingInvoiceInfoVM();
  public SsfClaimObject: SSFBil_VM = new SSFBil_VM();
  public SelectedClaimObject: SSFBil_VM = new SSFBil_VM();
  public ClaimRoot: ClaimRoot = new ClaimRoot();
  public SSFClaimReportColumns: any;
  public searchString: string = null;
  public page: number = 1;
  public initialLoad: boolean = true;
  public fromDate: any;
  public toDate: any;
  public FiscalYearId: number = 0;
  public PatientWiseClaimList: Array<PatientWiseSSFClaimList> = new Array<PatientWiseSSFClaimList>();
  public files = Array<any>();
  public ShowFileUploadPopUp: boolean = false;
  public IsClaimProcessed: boolean = false;
  public fileFromUser = Array<any>();
  public documentCounter: number = 0;
  public loading = false;
  public isSubmitClicked = false;
  public SSFConfiguration: any;
  public areAllFileSizeValid = true;
  public selectedIndex: number = -1;
  public SchemeTypeSubProduct = Array<SSFSchemeTypeSubProduct>();
  public claimExtensionArray = Array<ClaimExtension>();
  public TotalUploadedFiles: number = 0;
  public showReport: boolean = false;
  public requisitionIdList = [];
  public labReportFormat: string = 'format1';
  public templateReport: Array<LabReportVM> = [];
  public singleReport: LabReportVM;
  public LabHeader: any = null;
  public showHeader: boolean = false;
  public showRangeInRangeDescription: boolean = false;
  public defaultColumns = { "Name": true, "Result": true, "Range": true, "Method": false, "Unit": true, "Remarks": false };
  public showImagingReport: boolean = false;
  public imagingRequisitionId: number = 0;
  public showImageFilePreviewPopUp: boolean = false;
  public showNonImageFilePreviewPopUp: boolean = false;
  public fileSrc: any;
  public totalSizeOfFiles: string = "";
  public maximumAllowedFileSizeLimit: string = "5 MB";
  public documentsToBeAutoGenerated = new Array<DocumentsToBeAutoGenerated>();
  public documentCode: string = "";
  public PharmacyReceipts = new Array<any>();
  public generatePharmacyInvoice: boolean = false;
  public pharmacyReceipt: any;
  public selectedVisit: any = null;
  public showOpdSticker: boolean = false;
  public combinedPdf = new Array<any>();
  public isItemLevelVATApplicable: boolean = false;
  public isMainVATApplicable: boolean = false;
  public isitemlevlDis: boolean = false;
  public isMainDiscountAvailable: boolean = false;
  public isItemLevelDiscountApplicable: boolean = false;
  public showFooter: boolean = false;
  public showEnglish: boolean = false;
  public englishText: string = "";
  public showNepali: boolean = false;
  public nepaliText: string = "";
  public docCodeToCompare: string = "";
  public disableProcessClaimButton: boolean = true;
  public CountryNepal: string = ENUM_Country.Nepal;
  public BillingPackageInvoiceColumnSelection: any = null;
  public confirmationTitle: string = "Confirm !";
  public confirmationMessage: string = "Have you verified all the documents being uploaded?";
  public selectedPatientClaimCode: string = "";
  public ActiveIcdVersionInSSF = { ActiveICD: "ICD10", ICDCoding: "icd_0" };
  public PharmacyInvoiceLabel: string = "";
  public GeneralFieldLabel = new GeneralFieldLabels();

  public ShowClaimBooking: boolean = false;
  public TotalInvoiceAmountForClaim: number = 0;
  public Invoices = new Array<SSFClaimList>();
  public AlreadyBookedInvoiceAmount: number = 0;
  public RemainingInvoiceAmountToBook: number = 0;
  public ClaimBooking = new ClaimBookingRoot_DTO();

  public SelectedPatient = {
    PatientId: null,
    HospitalNo: null,
    Patient: null,
    LatestClaimCode: null,
    IsAccidental: false,
    PolicyNo: null,
    PolicyHolderUUID: null
  }

  public SelectedPatientHospitalNo: string = null;
  public SelectedPatientUUID: string = null;
  public SubProductForClaimBooking: number = null;
  public IsAccidentalClaim: boolean = false;
  public bookClaimClicked: boolean = false;
  public SsfInvoiceReturns = new Array<SSFInvoiceReturnsList>();
  public SelectedPatientsInvoiceReturns = new Array<SSFInvoiceReturnsList>();
  public TotalReturnAmountForClaim: number = 0;
  public AlreadyBookedReturnAmount: number = 0;
  public RemainingReturnAmountToBook: number = 0;


  constructor(
    public billingBLService: BillingBLService,
    public nepaliCalendarServ: NepaliCalendarService,
    public billingService: BillingService,
    public coreService: CoreService,
    public httpobj: HttpClient,
    public router: Router,
    public injector: Injector,
    public msgBox: MessageboxService,
    public patientService: PatientService,
    public routeFromService: RouteFromService,
    public changeDetector: ChangeDetectorRef,
    public visitBlService: VisitBLService,
    public labBLService: LabsBLService,
    private _domSanitizer: DomSanitizer,
    private _ssfDlService: SsfDlService) {
    this.GeneralFieldLabel = coreService.GetFieldLabelParameter();

    this.taxLabel = this.billingService.taxLabel;
    //this.currencyUnit = this.billingService.currencyUnit;
    this.SetInvoiceLabelNameFromParam();
    this.GetBillingPackageInvoiceColumnSelection();
    this.GetPharmacyInvoiceFooterParameter();
    //this.ShowHideSubTotalAndDiscount();
    this.ShowProviderName = this.coreService.SetShowProviderNameFlag();
    this.LoadCreditInvoiceDisplaySettingsFromParameter();
    this.QueueNoSetting = this.coreService.GetQueueNoSetting();
    this.InvoiceDisplaySettings = this.coreService.GetInvoiceDisplaySettings();
    this.InvoiceFooterNoteSettings = this.coreService.GetInvoiceFooterNoteSettings();
    this.hospitalCode = this.coreService.GetHospitalCode();
    if (!this.hospitalCode) {
      this.hospitalCode = "default";
    }

    this.showMunicipality = this.coreService.ShowMunicipality().ShowMunicipality;
    this.readParameters();
    this.checkSalesCustomization();
  }
  ngOnInit() {
  }

  public readParameters(): void {
    let paramValue = this.coreService.Parameters.find(a => a.ParameterName === 'BillingHeader').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);

    let StrParam = this.coreService.Parameters.find(a => a.ParameterGroupName === "Billing" && a.ParameterName === "OPBillingRequestDisplaySettings");
    if (StrParam && StrParam.ParameterValue) {
      let currParam = JSON.parse(StrParam.ParameterValue);
      this.showLabType = currParam.LabType;
    }
    this.labCount = this.coreService.labTypes.length;

    let ssfParams = this.coreService.Parameters.find(a => a.ParameterGroupName === "SSF" && a.ParameterName === "SSFConfiguration");
    if (ssfParams && ssfParams.ParameterValue) {
      let currParam = JSON.parse(ssfParams.ParameterValue);
      this.SSFConfiguration = currParam;
    }
    this.LabHeader = this.coreService.GetLabReportHeaderSetting();
    this.showRangeInRangeDescription = this.coreService.EnableRangeInRangeDescriptionStep();
    this.showHeader = true;
    this.labReportFormat = this.coreService.GetLabReportFormat();


    const pharmacyHeaderParamValue = this.coreService.Parameters.find(a => a.ParameterName === 'Pharmacy BillingHeader').ParameterValue;
    if (pharmacyHeaderParamValue)
      this.pharmacyHeaderDetail = JSON.parse(pharmacyHeaderParamValue);

    const params = this.coreService.Parameters.find(p => p.ParameterGroupName === "SSF" && p.ParameterName === "ActiveICDVersionInSSF");
    if (params) {
      const activeIcdVersionInSSF = JSON.parse(params.ParameterValue);
      if (activeIcdVersionInSSF) {
        this.ActiveIcdVersionInSSF.ActiveICD = activeIcdVersionInSSF.ActiveICD;
        this.ActiveIcdVersionInSSF.ICDCoding = activeIcdVersionInSSF.ICDCoding;
      }
    }

  }


  public checkSalesCustomization(): void {
    let salesParameterString = this.coreService.Parameters.find(p => p.ParameterName === "SalesFormCustomization" && p.ParameterGroupName === "Pharmacy");
    if (salesParameterString !== null) {
      let SalesParameter = JSON.parse(salesParameterString.ParameterValue);
      this.isItemLevelVATApplicable = (SalesParameter.EnableItemLevelVAT === true);
      this.isMainVATApplicable = (SalesParameter.EnableMainVAT === true);
      this.isitemlevlDis = (SalesParameter.EnableItemLevelDiscount === true);
      this.isMainDiscountAvailable = (SalesParameter.EnableMainDiscount === true);
      this.isItemLevelDiscountApplicable = (SalesParameter.EnableItemLevelDiscount === true);

    }
  }

  public GetPharmacyInvoiceFooterParameter(): void {
    let InvFooterParameterStr = this.coreService.Parameters.find(p => p.ParameterName === "PharmacyInvoiceFooterNoteSettings" && p.ParameterGroupName === "Pharmacy");
    if (InvFooterParameterStr !== null) {
      let FooterParameter = JSON.parse(InvFooterParameterStr.ParameterValue);
      if (FooterParameter.ShowFooter === true) {
        this.showFooter = true;
        if (FooterParameter.ShowEnglish === true) {
          this.showEnglish = true;
          this.englishText = FooterParameter.EnglishText;
        }
        if (FooterParameter.ShowNepali === true) {
          this.showNepali = true;
          this.nepaliText = FooterParameter.NepaliText;
        }
      }
    }
  }

  public SetInvoiceLabelNameFromParam(): void {
    let currParam = this.coreService.Parameters.find(a => a.ParameterGroupName === "Billing" && a.ParameterName === "BillingInvoiceDisplayLabel");
    if (currParam && currParam.ParameterValue) {
      this.Invoice_Label = currParam.ParameterValue;
    }
    let currParam1 = this.coreService.Parameters.find(a => a.ParameterGroupName === "Pharmacy" && a.ParameterName === "PharmacyInvoiceDisplayLabel");
    if (currParam1 && currParam1.ParameterValue) {
      this.PharmacyInvoiceLabel = currParam1.ParameterValue;
    }
  }

  public GetBillingPackageInvoiceColumnSelection(): void {
    let currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "BillingPackageInvoiceColumnSelection");
    if (currParam && currParam.ParameterValue) {
      this.BillingPackageInvoiceColumnSelection = JSON.parse(currParam.ParameterValue);
    }
  }


  public GetLocalDate(engDate: string): string {
    let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
    return npDate + " BS";
  }

  public CheckPatientAllInvoice(patientInfo, ind): void {
    this.selectedPatientClaimCode = patientInfo.ClaimCode.toString();
    if (patientInfo.SchemeType === 1) {
      this.IsAccidentalClaim = true;
    }
    this.SelectedPatient.IsAccidental = patientInfo.SchemeType;
    this.SelectedPatient.LatestClaimCode = this.selectedPatientClaimCode;
    let index = this.PatientWiseClaimList.findIndex(a => a.PatientId === patientInfo.PatientId && a.ClaimCode === patientInfo.ClaimCode);
    this.PatientWiseClaimList.forEach((a, ind) => {
      if (ind === index) {
        a.InvoiceList.forEach(element => {
          patientInfo.IsSelected ? element.IsSelected = true : element.IsSelected = false;
        });
      }
      else {
        a.IsSelected = false;
        a.InvoiceList.forEach(b => b.IsSelected = false);
      }
    });
    this.SelectedClaimObject.PatientInfo = [];
    this.SelectedClaimObject.BillingInvoiceInfo = [];
    this.SelectedClaimObject.BillingInvoiceItems = [];
    this.SelectedClaimObject.PhrmInvoiceItems = [];
    this.SelectedClaimObject.PhrmInvoices = [];
    if (this.PatientWiseClaimList[index].IsSelected) {
      let patInfo = this.SsfClaimObject.PatientInfo.find(a => a.PatientId === patientInfo.PatientId && a.ClaimCode === patientInfo.ClaimCode);
      let invoiceInfo = this.SsfClaimObject.BillingInvoiceInfo.filter(a => a.PatientId === patientInfo.PatientId && a.ClaimCode === patientInfo.ClaimCode);
      let phrmInvoices = this.SsfClaimObject.PhrmInvoices.filter(a => a.PatientId === patientInfo.PatientId && a.ClaimCode === patientInfo.ClaimCode);
      if (patInfo) {
        this.SelectedPatientHospitalNo = patInfo.PatientCode;
        this.SelectedPatientUUID = patInfo.PolicyHolderUID;
        this.SelectedClaimObject.PatientInfo.push(patInfo);
      }
      if (invoiceInfo) {
        this.SelectedClaimObject.BillingInvoiceInfo = invoiceInfo;
      }
      if (phrmInvoices) {
        this.SelectedClaimObject.PhrmInvoices = phrmInvoices;
      }
      this.SelectedClaimObject.BillingInvoiceInfo.forEach(a => {
        let items = this.BillingInvoiceItemList.filter(items => items.BillingTransactionId === a.BillingTransactionId);
        this.SelectedClaimObject.BillingInvoiceItems.push(...items);
      })
      this.SelectedClaimObject.PhrmInvoiceItems = this.SsfClaimObject.PhrmInvoiceItems.filter(pItems => pItems.PatientId === patientInfo.PatientId && pItems.ClaimCode === patientInfo.ClaimCode);
      this.SelectedClaimObject.LabReportInfo = this.SsfClaimObject.LabReportInfo.filter(a => a.PatientId === patientInfo.PatientId && a.ClaimCode === patientInfo.ClaimCode);
      this.SelectedClaimObject.RadiologyReportInfo = this.SsfClaimObject.RadiologyReportInfo.filter(a => a.PatientId === patientInfo.PatientId && a.ClaimCode === patientInfo.ClaimCode);
      this.selectedIndex = index;

      this.ConfigureClaimObjectSettings(this.SelectedClaimObject);

    }

  }

  public ConfigureClaimObjectSettings(claimObject: SSFBil_VM): void {
    if (claimObject) {
      console.log(claimObject);
      this.documentsToBeAutoGenerated = new Array<DocumentsToBeAutoGenerated>();
      let isOpVisitClaim: boolean = false;
      if (claimObject.PatientInfo && claimObject.PatientInfo.length > 0) {
        if (claimObject.PatientInfo[0].VisitType === ENUM_VisitType.outpatient) {
          isOpVisitClaim = true;
        } else {
          isOpVisitClaim = false;
        }
        const sticker = new DocumentsToBeAutoGenerated();
        sticker.id = 1;
        sticker.documentName = "Opd Sticker";
        sticker.docCode = "STICKER";
        sticker.isSelected = false;
        sticker.disabled = isOpVisitClaim ? false : true;;
        this.documentsToBeAutoGenerated.push(sticker);
      }
      if (claimObject.BillingInvoiceInfo && claimObject.BillingInvoiceInfo.length > 0) {
        const billingInvoices = new DocumentsToBeAutoGenerated();
        billingInvoices.id = 2;
        billingInvoices.documentName = "Billing Invoices";
        billingInvoices.docCode = "BIL-INV";
        billingInvoices.isSelected = false;
        billingInvoices.disabled = isOpVisitClaim ? true : false;
        this.documentsToBeAutoGenerated.push(billingInvoices);
      }
      if (claimObject.PhrmInvoices && claimObject.PhrmInvoices.length > 0) {
        const pharmacyInvoices = new DocumentsToBeAutoGenerated();
        pharmacyInvoices.id = 2;
        pharmacyInvoices.documentName = "Pharmacy Invoices";
        pharmacyInvoices.docCode = "PHRM-INV";
        pharmacyInvoices.isSelected = false;
        pharmacyInvoices.disabled = true;
        this.documentsToBeAutoGenerated.push(pharmacyInvoices);
      }
      if (claimObject.LabReportInfo && claimObject.LabReportInfo.length > 0) {
        const labReports = new DocumentsToBeAutoGenerated();
        labReports.id = 3;
        labReports.documentName = "Lab Reports";
        labReports.docCode = "LAB-REPORT";
        labReports.isSelected = false;
        labReports.disabled = true;
        this.documentsToBeAutoGenerated.push(labReports);
      }
      if (claimObject.RadiologyReportInfo && claimObject.RadiologyReportInfo.length > 0) {
        const radiologyReports = new DocumentsToBeAutoGenerated();
        radiologyReports.id = 4;
        radiologyReports.documentName = "Radiology Reports";
        radiologyReports.docCode = "RAD-REPORT";
        radiologyReports.isSelected = false;
        radiologyReports.disabled = true;
        this.documentsToBeAutoGenerated.push(radiologyReports);
      }
      if (!isOpVisitClaim) {
        this.documentsToBeAutoGenerated = this.documentsToBeAutoGenerated.filter(doc => doc.docCode !== "STICKER");
      }
    }
  }

  public ChangePatientType(event): void {
    if (event) {
      this.patientType = event.target.value;
      this.GetSSFInvoiceDetail();
    }
  }

  public selectFiles(event: any): void {
    if (event) {
      this.fileFromUser = Array.from(event.target.files); //* event.target.files returns File object instead of Array hence need to convert it into array with this method.., Krishna 15thSept'22

      this.fileFromUser.forEach(a => a.isFileFromUser = true);

      if (this.checkForValidFileFormat(this.fileFromUser)) {
        this.files = [...this.files, ...this.fileFromUser];  //*  merging files array with the files coming from user , Krishna 15thSept'22
      }
      const totalFileSizeInBytes = this.files.reduce((acc, curr) => acc + curr.size, 0);
      const totalFileSizeInMB = (totalFileSizeInBytes / 1000000); //* converting bytes into MB
      this.totalSizeOfFiles = `${totalFileSizeInMB} MB`;
    }
  }

  public checkForValidFileFormat(filesFromUser: Array<File>): Boolean {
    let isValidFile = false;
    const files = Array.from(filesFromUser);
    const validFileFormats = Object.values(ENUM_ValidFileFormats).toString(); //* converting enum values into a string to compare that with the type of file selected by the user, Krishna, 20thSept'22
    for (let item of files) {
      if (validFileFormats.includes(item.type)) {
        isValidFile = true;
      } else {
        isValidFile = false;
        this.msgBox.showMessage(ENUM_MessageBox_Status.Failed, ["File format is not valid"]);
        break;
      }
    }
    return isValidFile;
  }

  //! Below function can be useful when individual file size validation is required.(We are not implementing this logic for now but keeping it for later)

  public formatBytes(bytes, decimals = 2): string {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = Object.values(ENUM_FileSizeUnits);
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  public OpenFileUpload(patientInfo: PatientWiseSSFClaimList): void {
    this.ClaimRoot = new ClaimRoot();
    let arrayOfSSFSchemeSubProduct = this.PrepareSchemeTypeSubProductArray();

    this.SchemeTypeSubProduct = arrayOfSSFSchemeSubProduct;
    let index = this.PatientWiseClaimList.findIndex(a => a.PatientId === patientInfo.PatientId && a.ClaimCode === patientInfo.ClaimCode);
    if (index === this.selectedIndex && (this.SelectedClaimObject.BillingInvoiceItems.length > 0 || this.SelectedClaimObject.PhrmInvoiceItems.length > 0)) {
      this.Invoices = _.cloneDeep(this.PatientWiseClaimList[index].InvoiceList);
      const latestClaimCode = this.PatientWiseClaimList[index].ClaimCode;
      this.SelectedPatient.LatestClaimCode = latestClaimCode;
      this.SelectedPatient.PatientId = this.PatientWiseClaimList[index].PatientId;


      //Krishna, Map Invoice Returns with invoices.
      //this.AssignInvoiceAndInvoiceReturnsInSingleObject();

      this.GetClaimBookingDetails(latestClaimCode, "Claim");
      //this.ShowFileUploadPopUp = true;
    } else {
      this.ShowFileUploadPopUp = false;
    }
  }

  public AssignInvoiceAndInvoiceReturnsInSingleObject(): void {
    const selectedPatientsInvoiceReturns = this.SsfInvoiceReturns.filter(a => a.PatientId === this.SelectedPatient.PatientId && a.ClaimCode === this.SelectedPatient.LatestClaimCode);
    this.SelectedPatientsInvoiceReturns = selectedPatientsInvoiceReturns;
    this.Invoices.forEach(a => {
      if (a.InvoiceNoFormatted.substring(0, 2) === "BL") {
        a.ModuleName = "Billing";
      } else {
        a.ModuleName = "Pharmacy";
      }
    });

    this.SelectedPatientsInvoiceReturns.forEach(ret => {
      let inv = new SSFClaimList();
      inv.BillingTransactionId = ret.ReturnId;
      inv.InvoiceNoFormatted = ret.CreditNoteNumberFormatted;
      inv.InvoiceTotalAmount = -ret.TotalAmount; //Keep it negative here, SSF takes return as negative values so that they can subtract later with TotalAmount
      inv.ModuleName = ret.ModuleName;
      this.Invoices.push(inv);
    });
  }

  public CloseFileUploadPopUp(): void {
    this.ShowFileUploadPopUp = false;
    this.files = new Array<File>();
    this.IsClaimProcessed = false;
    this.isSubmitClicked = false;
    this.loading = false;
    this.areAllFileSizeValid = true;
    this.ClaimRoot = new ClaimRoot();
    this.documentCounter = 0;
    this.totalSizeOfFiles = "";
    this.PharmacyReceipts = new Array<PharmacyReceiptModel>();
    this.docCodeToCompare = "";
    this.documentCode = "";

    this.documentsToBeAutoGenerated.forEach((itm, index) => {
      itm.isSelected = false;
      if (index === 0) {
        itm.disabled = false;
        itm.cannotGenerateDocument = false;
        itm.isDocumentGenerated = false;
      } else {
        itm.disabled = true;
        itm.cannotGenerateDocument = false;
        itm.isDocumentGenerated = false;
      }
    });
  }


  CloseClaimBookingPopup() {
    this.ShowClaimBooking = false;
    this.SelectedPatient = {
      PatientId: null,
      HospitalNo: null,
      Patient: null,
      LatestClaimCode: null,
      IsAccidental: false,
      PolicyNo: null,
      PolicyHolderUUID: null
    };
    this.TotalInvoiceAmountForClaim = 0;
    this.AlreadyBookedInvoiceAmount = 0;
    this.RemainingInvoiceAmountToBook = 0;
    this.selectedPatientClaimCode = null;
    this.SelectedPatientHospitalNo = null;
    this.Invoices = new Array<SSFClaimList>();
    this.PatientWiseClaimList.map(a => a.IsSelected = false);
  }


  public DeleteFile(index: number): void {
    this.files.splice(index, 1);
    //! calculate totalFileSizes
    this.CalculateTotalSizesOfUploadedFiles();
  }

  public ProcessAndGenerateClaimForBillingInvoices(): void {
    if (this.SelectedClaimObject.BillingInvoiceInfo && this.SelectedClaimObject.BillingInvoiceInfo.length > 0) {
      this.coreService.loading = true;
      if (this.SsfClaimObject && this.CreditInvoiceDisplaySettings.ShowPatAmtForCrOrganization && this.BillingInvoiceInfo.CrOrganizationName
        && this.CreditInvoiceDisplaySettings.ValidCrOrgNameList && this.CreditInvoiceDisplaySettings.ValidCrOrgNameList.length > 0
        && this.CreditInvoiceDisplaySettings.ValidCrOrgNameList.filter(orgName => orgName.toLowerCase() === this.BillingInvoiceInfo.CrOrganizationName.toLowerCase()).length > 0) {
        this.CreditInvoiceDisplaySettings.ShowPatAmtForCrOrganization = true;
      }
      else {
        this.CreditInvoiceDisplaySettings.ShowPatAmtForCrOrganization = false;
      }

      let val = this.coreService.Parameters.find(p => p.ParameterGroupName === 'Appointment' && p.ParameterName === 'VisitPrintSettings');
      let param = JSON.parse(val && val.ParameterValue);
      if (param) {
        this.defaultFocusVisit = param.DefaultFocus;
        this.closePopUpAfterInvoicePrintFromVisit = param.closePopUpAfterInvoicePrint;
      }

      let adtVal = this.coreService.Parameters.find(p => p.ParameterGroupName === 'ADT' && p.ParameterName === 'AdmissionPrintSettings');
      let params = JSON.parse(adtVal && adtVal.ParameterValue);
      if (params) {
        this.defaultFocusADT = params.DefaultFocus;
        this.closePopUpAfterInvoicePrintFromADT = params.closePopUpAfterInvoicePrint;
      }

      this.SsfClaimObject.BillingInvoiceItems = this.BillingInvoiceItemList.filter(a => a.BillingTransactionId === this.SelectedClaimObject.BillingInvoiceInfo[0].BillingTransactionId);
      this.BillingInvoiceInfo = this.SelectedClaimObject.BillingInvoiceInfo[0];
      this.localDateTime = this.GetLocalDate(this.BillingInvoiceInfo.TransactionDate);
      this.finalAge = CommonFunctions.GetFormattedAgeSex(this.SelectedClaimObject.PatientInfo[0].DateOfBirth, this.SelectedClaimObject.PatientInfo[0].Gender);

      this.isInsurance = this.BillingInvoiceInfo.IsInsuranceBilling;
      this.SsfClaimObject.BillingInvoiceItems.forEach(a => a.Price = CommonFunctions.parseAmount(a.Price));
      this.ShowBill = true;
      if (this.SelectedClaimObject.BillingInvoiceInfo.length === 1) {
        setTimeout(() => {
          this.GeneratePdfForInvoicesAndSticker('id_ssf_bill_invoice_print');
          this.ShowBill = false;
          this.coreService.loading = false;
        }, 1000);
      }
      for (let i = 1; i < this.SelectedClaimObject.BillingInvoiceInfo.length; i++) {
        setTimeout(() => {
          this.SsfClaimObject.BillingInvoiceItems = this.BillingInvoiceItemList.filter(a => a.BillingTransactionId == this.SelectedClaimObject.BillingInvoiceInfo[i].BillingTransactionId);
          this.BillingInvoiceInfo = this.SelectedClaimObject.BillingInvoiceInfo[i];
          this.localDateTime = this.GetLocalDate(this.BillingInvoiceInfo.TransactionDate);
          this.finalAge = CommonFunctions.GetFormattedAgeSex(this.SelectedClaimObject.PatientInfo[0].DateOfBirth, this.SelectedClaimObject.PatientInfo[0].Gender);

          this.isInsurance = this.BillingInvoiceInfo.IsInsuranceBilling;
          this.SsfClaimObject.BillingInvoiceItems.forEach(a => a.Price = CommonFunctions.parseAmount(a.Price));
          this.GeneratePdfForInvoicesAndSticker('id_ssf_bill_invoice_print');
          if (i === this.SelectedClaimObject.BillingInvoiceInfo.length - 1) {
            setTimeout(() => {
              this.GeneratePdfForInvoicesAndSticker('id_ssf_bill_invoice_print');
              this.ShowBill = false;
              this.coreService.loading = false;
            }, 1000);
          }
        }, (i * 1000));
      }
    }
  }

  public ProcessAndGenerateClaimForRadiologyReport(): void {
    this.processRadiologyReqs(this.SelectedClaimObject.RadiologyReportInfo);
  }

  public ProcessAndGenerateClaimForLabReport(): void {
    if (this.SelectedClaimObject.LabReportInfo && this.SelectedClaimObject.LabReportInfo.length > 0) {
      let selectedReqs = [];
      this.SelectedClaimObject.LabReportInfo.forEach(a => selectedReqs.push(`[${a.RequisitionIdCSV}]`));
      this.LoadLabReports(selectedReqs);
    }
  }

  public ProcessAndGenerateClaimForPharmacyInvoices(): void {
    //! load PharmacyInvoices
    const PharmacyInvoiceIds = this.SelectedClaimObject.PhrmInvoices.map(a => a.InvoiceId);
    if (PharmacyInvoiceIds && PharmacyInvoiceIds.length > 0) {
      this._ssfDlService.GetPharmacyInvoices(PharmacyInvoiceIds)
        .finally(() => this.GeneratePharmacyInvoicesDocument()).subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
            this.PharmacyReceipts.push(res.Results.pharmacyReceipt);
          }
        });
    }
  }

  public ProcessAndGenerateClaimForOpdSticker(): void {
    if (this.SelectedClaimObject.PatientInfo && this.SelectedClaimObject.PatientInfo.length > 0) {
      this.selectedVisit = this.SelectedClaimObject.PatientInfo[0];
      this.coreService.loading = true;
      this.showOpdSticker = true;
      setTimeout(() => {
        this.GeneratePdfForInvoicesAndSticker('id_registration_sticker_printpage');
        this.showOpdSticker = false;
        this.coreService.loading = false;
      }, 2000);
    }
  }


  public GeneratePharmacyInvoicesDocument() {
    if (this.PharmacyReceipts && this.PharmacyReceipts.length > 0) {
      this.coreService.loading = true;
      this.pharmacyReceipt = this.PharmacyReceipts[0];
      this.generatePharmacyInvoice = true;
      if (this.PharmacyReceipts.length === 1) {
        setTimeout(() => {
          this.GeneratePdfForInvoicesAndSticker('id_ssf_pharmacy_invoice_print');
          this.generatePharmacyInvoice = false;
          this.coreService.loading = false;
        }, 1000);
      }
      for (let i = 1; i < this.PharmacyReceipts.length; i++) {
        setTimeout(() => {
          this.pharmacyReceipt = this.PharmacyReceipts[i];
          this.GeneratePdfForInvoicesAndSticker('id_ssf_pharmacy_invoice_print');
          if (i === this.PharmacyReceipts.length - 1) {
            setTimeout(() => {
              this.GeneratePdfForInvoicesAndSticker('id_ssf_pharmacy_invoice_print');
              this.generatePharmacyInvoice = false;
              this.coreService.loading = false;
            }, 2000);
          }
        }, (i * 2000));
      }
    }
  }

  public ProcessFinalClaim(): void {
    this.loading = true;
    this.disableProcessClaimButton = true;
    const startingIndex = 0;
    const filesFromUser = this.files.filter(a => a.isFileFromUser === true);
    this.TotalUploadedFiles = filesFromUser.length;
    if (this.TotalUploadedFiles > 0) {
      this.GenerateBinaryFromUploadedFile(startingIndex);
    } else {
      this.IsClaimProcessed = true;
      this.msgBox.showMessage(ENUM_MessageBox_Status.Success, [`Claim Processed Successfully, Verify the documents and Process for Claim Submission`]);
    }
  }

  private async mergePDFDocuments(pdfBlobs) {
    const mergedPdf = await PDFDocument.create();
    this.documentCounter++;
    const fileName = `${this.SelectedClaimObject.PatientInfo[0].ShortName}_${this.SelectedClaimObject.PatientInfo[0].PatientId}_${this.documentCode}_${this.documentCounter}.pdf`;
    for (let blob of pdfBlobs) {
      const pdfBytes = await this.readBlobAsArrayBuffer(blob);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const mergedBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const mergedFile = new File([mergedBlob], fileName, { type: 'application/pdf' });
    this.files.push(mergedFile);

    //!Make a logic to unlock next document creation and disabled created ones.
    this.documentsToBeAutoGenerated.forEach((itm, index) => {
      let nextIndex = null;
      if (itm.docCode === this.docCodeToCompare) {
        itm.isDocumentGenerated = true;
        this.generatingDocumentHold = false;
        nextIndex = index;
      }
      if (nextIndex !== null && this.documentsToBeAutoGenerated[nextIndex + 1]) {
        this.documentsToBeAutoGenerated[nextIndex + 1].disabled = false;
      }
    });

    //!Check if any of the documents are still remaining to be generated.
    if (this.documentsToBeAutoGenerated.some(a => (a.docCode !== "LAB-REPORT" && a.isDocumentGenerated === false) && (a.docCode !== "RAD-REPORT" && a.isDocumentGenerated === false))) {
      this.disableProcessClaimButton = true;
    } else {
      this.disableProcessClaimButton = false;
    }

    //! calculate totalFileSizes
    this.CalculateTotalSizesOfUploadedFiles();

    const claimSupportingInfo = new ClaimSupportingInfo();
    const category = new Category();
    const valueAttachment = new ValueAttachement();
    const coding = new Coding();
    coding.code = 'attachment';
    coding.display = 'Attachment';
    category.coding.push(coding);
    category.text = 'attachment';

    const byteArray = new Uint8Array(mergedPdfBytes);
    const data = fromUint8Array(byteArray);
    const urlSafeBase64 = Base64.fromUint8Array(Base64.toUint8Array(data));

    valueAttachment.data = urlSafeBase64;
    valueAttachment.contentType = ENUM_ValidFileFormats.pdf;
    valueAttachment.creation = moment().format('YYYY-MM-DD hh:mm:ss');
    valueAttachment.hash = '';
    valueAttachment.title = fileName;

    claimSupportingInfo.category = category;
    claimSupportingInfo.valueAttachment = valueAttachment;
    this.ClaimRoot.supportingInfo.push(claimSupportingInfo);
  }

  public readBlobAsArrayBuffer(blob: Blob): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(new Uint8Array(reader.result as ArrayBuffer));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }

  public async processRadiologyReqs(radiologyReqs) {
    for (let i = 0; i < radiologyReqs.length; i++) {
      this.imagingRequisitionId = radiologyReqs[i].RequisitionIdCSV;
      this.showImagingReport = true;
      await this.delay(5000);
      this.GenerateRadiologyReportPDF(i + 1);
      await this.delay(50)
      this.showImagingReport = false;
      if (i === radiologyReqs.length - 1) {
        this.coreService.loading = false;
      }
      await this.delay(10)
    }
  }

  public delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  //* This is a recursive function, which will call itself until some condition is satisfied i.e the index reaches the last index of files. Krishna, 28thDec'22.
  //* Recursion is needed here in order to create base64 of every files, loop is not a good option here.
  public GenerateBinaryFromUploadedFile(index: number): void {
    if (index > (this.TotalUploadedFiles - 1)) {
      this.IsClaimProcessed = true;
      this.msgBox.showMessage(ENUM_MessageBox_Status.Success, [`Claim Processed Successfully, Verify the documents and Process for Claim Submission`]);
      return;
    }
    const claimSupportingInfo = new ClaimSupportingInfo();
    const category = new Category();
    const valueAttachment = new ValueAttachement();
    const coding = new Coding();
    coding.code = 'attachment';
    coding.display = 'Attachment'
    category.coding.push(coding);
    category.text = 'attachment';

    valueAttachment.creation = moment().format('YYYY-MM-DD hh:mm:ss');
    valueAttachment.hash = "";
    const file = this.fileFromUser[index];
    index++;
    valueAttachment.contentType = file.type;
    valueAttachment.title = `${this.SelectedClaimObject.PatientInfo[0].ShortName}_${this.SelectedClaimObject.PatientInfo[0].PatientId}_${file.name}`;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const tempResult = reader.result.toString();
      const index = tempResult.indexOf(',');
      valueAttachment.data = tempResult.substring(index + 1);
      claimSupportingInfo.category = category;
      claimSupportingInfo.valueAttachment = valueAttachment;
      this.ClaimRoot.supportingInfo.push(claimSupportingInfo);
    };
    this.GenerateBinaryFromUploadedFile(index);
  }

  public GetSSFInvoiceDetail() {
    this.visitBlService.GetSSFInvoiceDetail(this.fromDate, this.toDate, this.patientType).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.SsfClaimObject = res.Results;
        this.BillingInvoiceItemList = this.SsfClaimObject.BillingInvoiceItems;
        this.PatientWiseClaimList = [];
        this.SsfClaimObject.PatientInfo.forEach(a => {
          let patInfo = new PatientWiseSSFClaimList();
          patInfo.PatientName = a.ShortName;
          patInfo.Address = a.Address;
          patInfo.PolicyNo = a.PolicyNo;
          patInfo.PatientId = a.PatientId;
          patInfo.PatientCode = a.PatientCode;
          let invoices = [];
          const billingInvoices = this.SsfClaimObject.BillingInvoiceInfo.filter(b => b.PatientId === a.PatientId && b.ClaimCode === a.ClaimCode);
          const phrmInvoices = this.SsfClaimObject.PhrmInvoices.filter(p => p.PatientId === a.PatientId && p.ClaimCode === a.ClaimCode);
          invoices = [...billingInvoices, ...phrmInvoices];

          const billingInvoiceReturns = this.SsfClaimObject.BillingInvoiceReturns.filter(b => b.PatientId === a.PatientId && b.ClaimCode === a.ClaimCode);
          const pharmacyInvoiceReturns = this.SsfClaimObject.PharmacyInvoiceReturns.filter(b => b.PatientId === a.PatientId && b.ClaimCode === a.ClaimCode);
          this.SsfInvoiceReturns = [...billingInvoiceReturns, ...pharmacyInvoiceReturns];


          invoices.forEach(c => {
            let SSfClaim = new SSFClaimList();
            SSfClaim.InvoiceNo = c.InvoiceNumber;
            SSfClaim.InvoiceNoFormatted = c.InvoiceNumFormatted;
            SSfClaim.InvoiceTotalAmount = c.TotalAmount;
            SSfClaim.Cash = c.ReceivedAmount;
            SSfClaim.Credit = c.NetReceivableAmount;
            //SSfClaim.ClaimCode = c.ClaimCode;
            SSfClaim.BillingTransactionId = c.BillingTransactionId ? c.BillingTransactionId : c.InvoiceId;
            patInfo.InvoiceList.push(SSfClaim);
          });
          patInfo.ClaimCode = invoices.length > 0 ? invoices[0].ClaimCode : null;
          if (patInfo.ClaimCode) {
            this.PatientWiseClaimList.push(patInfo);
          }
        });
        this.loading = false;
      }
    },
      err => {
        console.log(err);
      });
  }

  public OnFromToDateChange($event): void {
    if ($event) {
      this.fromDate = $event.fromDate;
      this.toDate = $event.toDate;
    }
  }

  public GeneratePdfForInvoicesAndSticker(id: string): void {
    let dom = document.getElementById(id);
    if (dom) {
      let domWidth = dom.style.width;
      dom.style.border = "none";
      dom.style.width = "1020px";
      html2canvas(dom, {
        useCORS: true,
        allowTaint: true,
        scrollY: 0
      }).then((canvas) => {
        //!Krishna, 20thJuly'23, quality scales ranges between 0 and 1, 0 being lowest quality 1 being highest quality. (0.1=lowest quality, 0.5=medium quality and 1 is full quality);
        const image = { type: 'jpeg', quality: 0.5 };
        const margin = [0.5, 0.5];
        let imgWidth = 8.5;
        let pageHeight: number;
        pageHeight = 11;
        let innerPageWidth = imgWidth - margin[0] * 2;
        let innerPageHeight = pageHeight - margin[1] * 2;
        let pxFullHeight = canvas.height;
        let pxPageHeight = Math.floor(canvas.width * (pageHeight / imgWidth));
        let nPages = Math.ceil(pxFullHeight / pxPageHeight);
        pageHeight = innerPageHeight;
        let pageCanvas = document.createElement('canvas');
        let pageCtx = pageCanvas.getContext('2d');
        pageCanvas.width = canvas.width;
        pageCanvas.height = pxPageHeight;
        let pdf = new jsPDF('p', 'in', 'a4');
        for (let page = 0; page < nPages; page++) {
          if (page === nPages - 1 && pxFullHeight % pxPageHeight !== 0) {
            pageCanvas.height = pxFullHeight % pxPageHeight;
            pageHeight = (pageCanvas.height * innerPageWidth) / pageCanvas.width;
          }
          let w = pageCanvas.width;
          let h = pageCanvas.height;
          pageCtx.fillStyle = 'white';
          pageCtx.fillRect(0, 0, w, h);
          pageCtx.drawImage(canvas, 5, page * pxPageHeight, w, h, 0, 0, w, h);
          if (page > 0)
            pdf.addPage();
          let imgData = pageCanvas.toDataURL('image/' + image.type, image.quality);
          //!Krishna, 20thJuly'23, Below in addImage function the last parameter is for compression algorithm.
          /*
              Last Parameter of addImage function can take 'FAST', 'NONE', 'MEDIUM' and 'SLOW'
              NONE: It will use no compression algorithm, meaning no compression will be applied.
              FAST: It will use fast but less aggressive compression algorithm. This will reduce the file size of the images and, consequently, the overall size of the resulting PDF
              MEDIUM: This compression level applies a moderately aggressive compression algorithm to the JPEG images. This will further reduce the file size compared to 'FAST' compression, but it may also lead to a slightly more noticeable loss in image quality.
              SLOW: This compression level employs a slow and more sophisticated compression algorithm that aims to achieve the maximum reduction in file size while preserving the image quality as much as possible. Choosing 'SLOW' may result in smaller file sizes, but the compression process will be more time-consuming.

              Of these many options We are choosing FAST, because it suits our requirement of reducing the file size without being aggressive and in time.
          */
          pdf.addImage(imgData, image.type, margin[1], margin[0], innerPageWidth, pageHeight, undefined, 'FAST');

        }

        let pdfFileCreatedBySystem = pdf.output('blob');
        this.combinedPdf.push(pdfFileCreatedBySystem);
        if (this.documentCode === "Opd-Sticker") {
          if (this.combinedPdf.length === 1) {
            this.mergePDFDocuments(this.combinedPdf);
          }
        } else if (this.documentCode === "Service-Invoices") {
          if (this.combinedPdf.length === this.SelectedClaimObject.BillingInvoiceInfo.length) {
            this.mergePDFDocuments(this.combinedPdf);
          }
        } else if (this.documentCode === "Product-Invoices") {
          if (this.combinedPdf.length === this.SelectedClaimObject.PhrmInvoices.length) {
            this.mergePDFDocuments(this.combinedPdf);
          }
        }
      });
    }
  }

  public checkTotalSizeOfFiles(filesGenerated: Array<File>): Boolean {
    let isAllowedTotalFileSize = false;
    const files = Array.from(filesGenerated);
    const totalAcceptedFileSize = (5 * 1000000); //* converting 5MB into bytes
    const totalFileSize = files.reduce((acc, curr) => acc + curr.size, 0);
    if (totalFileSize > totalAcceptedFileSize) {
      isAllowedTotalFileSize = false;
      this.msgBox.showMessage(ENUM_MessageBox_Status.Failed, ["Total File size is greater than 5MB"]);
    } else {
      isAllowedTotalFileSize = true;
    }
    return isAllowedTotalFileSize;
  }

  public LoadCreditInvoiceDisplaySettingsFromParameter(): void {
    let param = this.coreService.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "CreditInvoiceDisplaySettings");
    if (param) {
      let paramValueStr = param.ParameterValue;
      if (paramValueStr) {
        this.CreditInvoiceDisplaySettings = JSON.parse(paramValueStr);
      }
    }
  }

  public SubmitClaim(): void {
    if (this.isSubmitClicked) {
      this.documentCounter = 0;
      if (this.checkTotalSizeOfFiles(this.files)) {
        this.PrepareClaimRoot();
        console.log(this.ClaimRoot.supportingInfo);
        this.visitBlService.SubmitClaim(this.ClaimRoot)
          .finally(() => { this.CloseFileUploadPopUp(); this.GetSSFInvoiceDetail(); this.loading = false; }).subscribe(
            (res: DanpheHTTPResponse) => {
              if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.msgBox.showMessage(ENUM_MessageBox_Status.Success, ["SSF Claim Successfully Submitted."]);
              }
              else {
                console.log(res.ErrorMessage);
                this.msgBox.showMessage(ENUM_MessageBox_Status.Error, [`Claim Failed:<br> ${res.ErrorMessage}`]);
              }
            },
            (err: DanpheHTTPResponse) => {
              this.msgBox.showMessage(ENUM_MessageBox_Status.Error, ["Something went wrong please try again."]);
            }
          )
      } else {
        this.isSubmitClicked = false;
      }
    }
  }

  public selectSSFSchemeTypeSubProduct(event): void {
    if (event) {
      let claimExtension = new ClaimExtension();
      claimExtension.url = ENUM_ClaimExtensionUrl.subProduct;
      claimExtension.valueString = +event.target.value;
      this.claimExtensionArray.push(claimExtension);
    }
  }

  public PrepareClaimRoot(): void {
    let claimType = new ClaimType();
    claimType.text = "0";
    this.ClaimRoot.claimType = claimType;
    this.ClaimRoot.clientClaimId = this.selectedPatientClaimCode;

    this.SelectedClaimObject.BillingInvoiceInfo = this.SelectedClaimObject.BillingInvoiceInfo.sort((a, b) => a.BillingTransactionId - b.BillingTransactionId); //* sorting invoices in ascending order
    this.SelectedClaimObject.PhrmInvoices = this.SelectedClaimObject.PhrmInvoices.sort((a, b) => a.InvoiceId - b.InvoiceId); //* sorting Pharmacy invoice items in ascending order

    let claimBillablePeriod = new ClaimBillablePeriod();
    if (this.SelectedClaimObject.PatientInfo[0].Admitted === "1") {
      claimBillablePeriod.start = this.SelectedClaimObject.PatientInfo[0].AdmissionDate;
      claimBillablePeriod.end = this.SelectedClaimObject.PatientInfo[0].DischargeDate;
    } else {
      claimBillablePeriod.start = this.SelectedClaimObject.PatientInfo[0].VisitCreationDate.toString(); //* get VisitCreationDate to indicate start of Claim.

      //*To Calculate End Date
      if ((this.SelectedClaimObject.BillingInvoiceInfo && this.SelectedClaimObject.BillingInvoiceInfo.length > 0) && (this.SelectedClaimObject.PhrmInvoices && this.SelectedClaimObject.PhrmInvoices.length > 0)) {
        const lastBillingInvoiceDate = new Date(this.SelectedClaimObject.BillingInvoiceInfo[this.SelectedClaimObject.BillingInvoiceInfo.length - 1].InvoiceDate);
        const lastPharmacyInvoiceDate = new Date(this.SelectedClaimObject.PhrmInvoices[this.SelectedClaimObject.PhrmInvoices.length - 1].InvoiceDate);
        const d1 = moment(lastBillingInvoiceDate, 'DD-MM-YYYY');
        const d2 = moment(lastPharmacyInvoiceDate, 'DD-MM-YYYY');

        let currentDate = moment().format('DD-MM-YYYY');
        if (moment(currentDate).diff(d1, 'days') < moment(currentDate).diff(d2, 'days')) {
          claimBillablePeriod.end = this.SelectedClaimObject.BillingInvoiceInfo[this.SelectedClaimObject.BillingInvoiceInfo.length - 1].InvoiceDate.toString();//* get invoiceDate of last invoice.
        } else {
          claimBillablePeriod.end = this.SelectedClaimObject.PhrmInvoices[this.SelectedClaimObject.PhrmInvoices.length - 1].InvoiceDate.toString(); //* get invoiceDate of last invoice.
        }
      } else if ((this.SelectedClaimObject.BillingInvoiceInfo && this.SelectedClaimObject.BillingInvoiceInfo.length > 0) && !(this.SelectedClaimObject.PhrmInvoices && this.SelectedClaimObject.PhrmInvoices.length > 0)) {
        claimBillablePeriod.end = this.SelectedClaimObject.BillingInvoiceInfo[this.SelectedClaimObject.BillingInvoiceInfo.length - 1].InvoiceDate.toString(); //* get invoiceDate of last invoice.
      } else if (!(this.SelectedClaimObject.BillingInvoiceInfo && this.SelectedClaimObject.BillingInvoiceInfo.length > 0) && (this.SelectedClaimObject.PhrmInvoices && this.SelectedClaimObject.PhrmInvoices.length > 0)) {
        claimBillablePeriod.end = this.SelectedClaimObject.PhrmInvoices[this.SelectedClaimObject.PhrmInvoices.length - 1].InvoiceDate.toString(); //* get invoiceDate of last invoice.
      } else {

      }
    }

    this.ClaimRoot.billablePeriod = claimBillablePeriod;

    this.ClaimRoot.created = moment().format("YYYY-MM-DD");

    let claimEnterer = new ClaimEnterer();
    claimEnterer.reference = this.SSFConfiguration.SSFEnterer;
    this.ClaimRoot.enterer = claimEnterer;

    let claimFacility = new ClaimFacility();
    claimFacility.reference = this.SSFConfiguration.SSFFacility;
    this.ClaimRoot.facility = claimFacility;

    let claimProvider = new ClaimProvider();
    claimProvider.reference = this.SSFConfiguration.SSFProvider;
    this.ClaimRoot.provider = claimProvider;

    let claimExtension = new ClaimExtension();
    if (this.SelectedClaimObject.PatientInfo[0].PolicyHolderEmployerId) {
      claimExtension.url = ENUM_ClaimExtensionUrl.EmployerId;
      claimExtension.valueString = this.SelectedClaimObject.PatientInfo[0].PolicyHolderEmployerId;
      this.claimExtensionArray.push(claimExtension);
    }

    claimExtension = new ClaimExtension();
    claimExtension.url = ENUM_ClaimExtensionUrl.schemeType;
    claimExtension.valueString = this.SelectedClaimObject.PatientInfo[0].SchemeType;
    this.claimExtensionArray.push(claimExtension);

    claimExtension = new ClaimExtension();
    claimExtension.url = ENUM_ClaimExtensionUrl.Admitted;
    claimExtension.valueString = this.SelectedClaimObject.PatientInfo[0].Admitted;
    this.claimExtensionArray.push(claimExtension);

    if (this.SelectedClaimObject.PatientInfo[0].Admitted === "1") {
      claimExtension = new ClaimExtension();
      claimExtension.url = ENUM_ClaimExtensionUrl.DischargeType;
      claimExtension.valueString = this.SelectedClaimObject.PatientInfo[0].DischargeTypeName;
      this.claimExtensionArray.push(claimExtension);

      claimExtension = new ClaimExtension();
      claimExtension.url = ENUM_ClaimExtensionUrl.DischargeDate;
      claimExtension.valueString = moment(this.SelectedClaimObject.PatientInfo[0].DischargeDate).format("DD/MM/YYYY");
      this.claimExtensionArray.push(claimExtension);

      claimExtension = new ClaimExtension();
      claimExtension.url = ENUM_ClaimExtensionUrl.DischargeSummary;
      claimExtension.valueString = this.SelectedClaimObject.PatientInfo[0].CaseSummary;
      this.claimExtensionArray.push(claimExtension);
    }

    claimExtension = new ClaimExtension();
    claimExtension.url = ENUM_ClaimExtensionUrl.IsDead;
    claimExtension.valueString = this.SelectedClaimObject.PatientInfo[0].IsDead;
    this.claimExtensionArray.push(claimExtension);

    this.ClaimRoot.extension = this.claimExtensionArray;

    let diagnosisArray = new Array<ClaimDiagnosis>();
    let diagnosisDetailsFromServer = JSON.parse(this.SelectedClaimObject.PatientInfo[0].Diagnosis);
    if (diagnosisDetailsFromServer && diagnosisDetailsFromServer.length) {
      diagnosisDetailsFromServer.forEach((diag, index) => {
        let diagnosis = new ClaimDiagnosis();
        diagnosis.sequence = index + 1;
        let claimDiagnosisCodeAbleConcept = new ClaimDiagnosisCodeableConcept();
        let claimCoding = new ClaimCoding();
        claimCoding.code = diag.ICD10Code; //* This is something that needs to be updated seems hardcoded in the database.
        claimDiagnosisCodeAbleConcept.coding.push(claimCoding);
        diagnosis.diagnosisCodeableConcept = claimDiagnosisCodeAbleConcept;
        let cType = new ClaimType();
        cType.text = this.ActiveIcdVersionInSSF.ICDCoding;//ENUM_ICDCoding.ICD10;
        diagnosis.type.push(cType);
        diagnosisArray.push(diagnosis);
      });
    }
    else {
      if (this.ActiveIcdVersionInSSF.ICDCoding === ENUM_ICDCoding.ICD10) {
        let diagnosis = {
          sequence: 1,
          type: [
            {
              text: ENUM_ICDCoding.ICD10
            }
          ],
          diagnosisCodeableConcept: {
            coding: [
              {
                code: ENUM_DefaultICDCode.A09
              }
            ]
          }
        }
        diagnosisArray.push(diagnosis);
      }

    }
    this.ClaimRoot.diagnosis = diagnosisArray;

    let claimItemArray = new Array<ClaimItem>();
    let selectedInvoiceItems = this.SelectedClaimObject.BillingInvoiceItems;
    let totalInvoiceItemsAmount = 0;
    if (selectedInvoiceItems && selectedInvoiceItems.length) {
      selectedInvoiceItems.forEach((items, index) => {
        let claimItem = new ClaimItem();
        claimItem.sequence = index + 1;
        let claimCategory = new ClaimCategory();
        claimCategory.text = ENUM_ClaimCategory.Service;
        claimItem.category = claimCategory;
        let claimProductOrService = new ClaimProductOrService();
        claimProductOrService.text = items.ServiceCode;
        claimItem.productOrService = claimProductOrService;
        let claimQuantity = new ClaimQuantity();
        claimQuantity.value = items.Quantity.toString();
        claimItem.quantity = claimQuantity;
        let unitPrice = new ClaimUnitPrice();
        unitPrice.value = items.Price.toString();
        // unitPrice.value = (items.Price * items.Quantity).toString();
        claimItem.unitPrice = unitPrice;
        let claimItemExtension = new ClaimExtension();
        claimItemExtension.url = "http://hl7.org/fhir/StructureDefinition/contactpoint-comment";
        claimItemExtension.valueString = items.ItemName;
        claimItem.extension.push(claimItemExtension);
        claimItemArray.push(claimItem);
        totalInvoiceItemsAmount += items.TotalAmount;
      });
    }

    let existingSequenceCount = claimItemArray.length;
    if (this.SelectedClaimObject.PhrmInvoiceItems && this.SelectedClaimObject.PhrmInvoiceItems.length) {
      this.SelectedClaimObject.PhrmInvoiceItems.forEach((items, index) => {
        let claimItem = new ClaimItem();
        claimItem.sequence = existingSequenceCount + index + 1;

        let claimCategory = new ClaimCategory();
        claimCategory.text = ENUM_ClaimCategory.Item;
        claimItem.category = claimCategory;

        let claimProductOrService = new ClaimProductOrService();
        claimProductOrService.text = items.ServiceCode;
        claimItem.productOrService = claimProductOrService;

        let claimQuantity = new ClaimQuantity();
        claimQuantity.value = items.Quantity.toString();
        claimItem.quantity = claimQuantity;

        let unitPrice = new ClaimUnitPrice();
        unitPrice.value = items.UnitPrice.toString();
        // unitPrice.value = (items.UnitPrice * items.Quantity).toString();
        claimItem.unitPrice = unitPrice;
        let claimItemExtension = new ClaimExtension();
        claimItemExtension.url = "http://hl7.org/fhir/StructureDefinition/contactpoint-comment";
        claimItemExtension.valueString = items.ItemName;
        claimItem.extension.push(claimItemExtension);
        claimItemArray.push(claimItem);
        totalInvoiceItemsAmount += (items.UnitPrice * items.Quantity);
      });

    }

    this.ClaimRoot.item = claimItemArray;

    let total = new ClaimTotal();
    total.value = totalInvoiceItemsAmount;
    this.ClaimRoot.total = total;

    let claimingPatient = new ClaimPatient();
    claimingPatient.reference = `Patient/${this.SelectedClaimObject.PatientInfo[0].PolicyHolderUID}`;
    this.ClaimRoot.patient = claimingPatient;

    this.ClaimRoot.resourceType = ENUM_ClaimResourceType.ResourceType;

    let claimResponseInfo = new SSFClaimResponseInfo()
    claimResponseInfo.PatientId = this.SelectedClaimObject.PatientInfo[0].PatientId;
    claimResponseInfo.PatientCode = this.SelectedClaimObject.PatientInfo[0].PatientCode;
    claimResponseInfo.ClaimedDate = moment().format('YYYY-MM-DD hh:mm:ss');
    claimResponseInfo.ClaimCode = this.SelectedClaimObject.PatientInfo[0].ClaimCode;

    let InvoiceNoList = [];
    if (this.SelectedClaimObject.BillingInvoiceInfo && this.SelectedClaimObject.BillingInvoiceInfo.length) {
      this.SelectedClaimObject.BillingInvoiceInfo.forEach((invoice) => {
        InvoiceNoList.push(invoice.InvoiceNumber);
      });
    }
    if (this.SelectedClaimObject.PhrmInvoices && this.SelectedClaimObject.PhrmInvoices.length) {
      this.SelectedClaimObject.PhrmInvoices.forEach((invoice) => {
        InvoiceNoList.push(invoice.InvoiceNumber);
      });
    }
    claimResponseInfo.InvoiceNoCSV = InvoiceNoList.join(",");
    this.ClaimRoot.claimResponseInfo = claimResponseInfo;
  }

  public LoadLabReports(reqs: string[]): void {
    this.coreService.loading = true;
    let requsitions = JSON.parse(`[${reqs.join(",")}]`);
    this.labBLService.GetReportFromListOfReqIdList(requsitions)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results) {
          this.templateReport = res.Results;
          this.MapSequence();
          this.singleReport = this.templateReport[0];
          this.showReport = true;
          this.GenerateLabReportPDF(1);
        }
        else {
          this.msgBox.showMessage(ENUM_MessageBox_Status.Error, ["Unable to get lab reports."]);
          console.log(res.ErrorMessage);
        }

      }, (err) => { console.log(err.ErrorMessage); });
  }

  public CloseReportPopUP(): void {
    this.showReport = false;
    this.coreService.loading = false;
  }

  public GenerateLabReportPDF(index: number): void {
    if (index > (this.templateReport.length)) {
      this.showReport = false;
      this.coreService.loading = false;
      return;
    }
    this.singleReport = this.templateReport[index - 1]
    setTimeout(() => {
      let dom = document.getElementById("lab-report-main");
      if (dom) {
        dom.style.border = "none";
        let domWidth = dom.style.width;
        dom.style.width = "1020px";
        html2canvas(dom, {
          useCORS: true,
          allowTaint: true,
          scrollY: 0
        }).then((canvas) => {
          //!Krishna, 20thJuly'23, quality scales ranges between 0 and 1, 0 being lowest quality 1 being highest quality. (0.1=lowest quality, 0.5=medium quality and 1 is full quality);
          const image = { type: 'jpeg', quality: 0.5 };
          const margin = [0.5, 0.5];
          let imgWidth = 8.5;
          let pageHeight: number = 11;
          let innerPageHeight = pageHeight - margin[1] * 2;
          let innerPageWidth = imgWidth - margin[0] * 2;
          let pxFullHeight = canvas.height;
          let pxPageHeight = Math.floor(canvas.width * (pageHeight / imgWidth));
          let nPages = Math.ceil(pxFullHeight / pxPageHeight);
          pageHeight = innerPageHeight;
          let pageCanvas = document.createElement('canvas');
          let pageCtx = pageCanvas.getContext('2d');
          pageCanvas.width = canvas.width;
          pageCanvas.height = pxPageHeight;
          let pdf = new jsPDF('p', 'in', 'a4');
          for (let page = 0; page < nPages; page++) {
            if (page === nPages - 1 && pxFullHeight % pxPageHeight !== 0) {
              pageCanvas.height = pxFullHeight % pxPageHeight;
              pageHeight = (pageCanvas.height * innerPageWidth) / pageCanvas.width;
            }
            let w = pageCanvas.width;
            let h = pageCanvas.height;
            pageCtx.fillStyle = 'white';
            pageCtx.fillRect(0, 0, w, h);
            pageCtx.drawImage(canvas, 5, page * pxPageHeight, w, h, 0, 0, w, h);
            if (page > 0)
              pdf.addPage();
            let imgData = pageCanvas.toDataURL('image/' + image.type, image.quality);
            //!Krishna, 20thJuly'23, Below in addImage function the last parameter is for compression algorithm.
            /*
                Last Parameter of addImage function can take 'FAST', 'NONE', 'MEDIUM' and 'SLOW'
                NONE: It will use no compression algorithm, meaning no compression will be applied.
                FAST: It will use fast but less aggressive compression algorithm. This will reduce the file size of the images and, consequently, the overall size of the resulting PDF
                MEDIUM: This compression level applies a moderately aggressive compression algorithm to the JPEG images. This will further reduce the file size compared to 'FAST' compression, but it may also lead to a slightly more noticeable loss in image quality.
                SLOW: This compression level employs a slow and more sophisticated compression algorithm that aims to achieve the maximum reduction in file size while preserving the image quality as much as possible. Choosing 'SLOW' may result in smaller file sizes, but the compression process will be more time-consuming.

                Of these many options We are choosing FAST, because it suits our requirement of reducing the file size without being aggressive and in time.
            */
            pdf.addImage(imgData, image.type, margin[1], margin[0], innerPageWidth, pageHeight, undefined, 'FAST');

          }
          let pdfFileCreatedBySystem = pdf.output('blob');
          this.combinedPdf.push(pdfFileCreatedBySystem);

          if (this.combinedPdf.length === this.templateReport.length) {
            this.mergePDFDocuments(this.combinedPdf);
          }
        });
        index++;
        this.GenerateLabReportPDF(index);
      }
    }, 1000);
  }

  public CalculateTotalSizesOfUploadedFiles(): void {
    //! calculate totalFileSizes
    const totalFileSizeInBytes = this.files.reduce((acc, curr) => acc + curr.size, 0);
    const totalFileSizeInMB = (totalFileSizeInBytes / (1024 * 1024)).toFixed(2); //* converting bytes into MB
    this.totalSizeOfFiles = `${totalFileSizeInMB} MB`;
  }

  public GenerateRadiologyReportPDF(index: number): void {
    let dom = document.getElementById("div_imagingReportWrapper");
    if (dom) {
      dom.style.border = "none";
      let domWidth = dom.style.width;
      dom.style.width = "1020px";
      html2canvas(dom, {
        useCORS: true,
        allowTaint: true,
        scrollY: 0
      }).then((canvas) => {

        //!Krishna, 20thJuly'23, quality scales ranges between 0 and 1, 0 being lowest quality 1 being highest quality. (0.1=lowest quality, 0.5=medium quality and 1 is full quality);
        const image = { type: 'jpeg', quality: 0.5 };
        const margin = [0.5, 0.5];
        let imgWidth = 8.5;
        let pageHeight: number = 11;
        let innerPageHeight = pageHeight - margin[1] * 2;
        let innerPageWidth = imgWidth - margin[0] * 2;
        let pxFullHeight = canvas.height;
        let pxPageHeight = Math.floor(canvas.width * (pageHeight / imgWidth));
        let nPages = Math.ceil(pxFullHeight / pxPageHeight);
        pageHeight = innerPageHeight;
        let pageCanvas = document.createElement('canvas');
        let pageCtx = pageCanvas.getContext('2d');
        pageCanvas.width = canvas.width;
        pageCanvas.height = pxPageHeight;
        let pdf = new jsPDF('p', 'in', 'a4');
        for (let page = 0; page < nPages; page++) {
          if (page === nPages - 1 && pxFullHeight % pxPageHeight !== 0) {
            pageCanvas.height = pxFullHeight % pxPageHeight;
            pageHeight = (pageCanvas.height * innerPageWidth) / pageCanvas.width;
          }
          let w = pageCanvas.width;
          let h = pageCanvas.height;
          pageCtx.fillStyle = 'white';
          pageCtx.fillRect(0, 0, w, h);
          pageCtx.drawImage(canvas, 5, page * pxPageHeight, w, h, 0, 0, w, h);
          if (page > 0)
            pdf.addPage();
          let imgData = pageCanvas.toDataURL('image/' + image.type, image.quality);
          //!Krishna, 20thJuly'23, Below in addImage function the last parameter is for compression algorithm.
          /*
              Last Parameter of addImage function can take 'FAST', 'NONE', 'MEDIUM' and 'SLOW'
              NONE: It will use no compression algorithm, meaning no compression will be applied.
              FAST: It will use fast but less aggressive compression algorithm. This will reduce the file size of the images and, consequently, the overall size of the resulting PDF
              MEDIUM: This compression level applies a moderately aggressive compression algorithm to the JPEG images. This will further reduce the file size compared to 'FAST' compression, but it may also lead to a slightly more noticeable loss in image quality.
              SLOW: This compression level employs a slow and more sophisticated compression algorithm that aims to achieve the maximum reduction in file size while preserving the image quality as much as possible. Choosing 'SLOW' may result in smaller file sizes, but the compression process will be more time-consuming.

              Of these many options We are choosing FAST, because it suits our requirement of reducing the file size without being aggressive and in time.
          */
          pdf.addImage(imgData, image.type, margin[1], margin[0], innerPageWidth, pageHeight, undefined, 'FAST');

        }
        let pdfFileCreatedBySystem = pdf.output('blob');
        this.combinedPdf.push(pdfFileCreatedBySystem);
        if (this.combinedPdf.length === this.SelectedClaimObject.RadiologyReportInfo.length) {
          this.mergePDFDocuments(this.combinedPdf);
        }
      });
    }

  }

  public MapSequence(): void {
    this.templateReport.forEach(rep => {
      let dob = rep.Lookups.DOB;
      let patGender = rep.Lookups.Gender;
      let patAge = CommonFunctions.GetFormattedAge(dob);
      patAge = patAge.toUpperCase();

      let indicator: string = 'normal';
      if (patAge.includes('Y')) {
        let ageArr = patAge.split('Y');
        let actualAge = Number(ageArr[0]);
        if (actualAge > 16) {
          if (patGender.toLowerCase() == 'male') {
            indicator = 'male';
          } else if (patGender.toLowerCase() == 'female') {
            indicator = 'female';
          } else {

          }
        }
        else {
          indicator = 'child';
        }
      }
      else {
        indicator = 'child';
      }

      if (rep.Columns) {
        rep.Columns = JSON.parse(rep.Columns);
        rep = LabReportVM.AssignControlTypesToComponent(rep);
      }

      rep.Templates.forEach(tmplates => {
        tmplates.TemplateColumns = tmplates.TemplateColumns ? JSON.parse(tmplates.TemplateColumns) : this.defaultColumns;

        tmplates.Tests.forEach(test => {
          if (test.HasNegativeResults) {
            test.ShowNegativeCheckbox = true;
          } else {
            test.ShowNegativeCheckbox = false;
          }
          let componentJson: Array<LabComponentModel> = new Array<LabComponentModel>();
          test.ComponentJSON.forEach(cmp => {
            if (this.showRangeInRangeDescription) {
              if (indicator === 'male') {
                if (cmp.MaleRange && cmp.MaleRange.trim() !== '' && cmp.MaleRange.length && cmp.MaleRange.trim().toLowerCase() !== 'nan-nan') {
                  cmp.RangeDescription = cmp.MaleRange;
                }
              } else if (indicator === 'female') {
                if (cmp.FemaleRange && cmp.FemaleRange.trim() !== '' && cmp.FemaleRange.length && cmp.FemaleRange.trim().toLowerCase() !== 'nan-nan') {
                  cmp.RangeDescription = cmp.FemaleRange;
                }
              } else if (indicator === 'child') {
                if (cmp.ChildRange && cmp.ChildRange.trim() !== '' && cmp.ChildRange.length && cmp.ChildRange.trim().toLowerCase() !== 'nan-nan') {
                  cmp.RangeDescription = cmp.ChildRange;
                }
              }
            }
            if (cmp.DisplaySequence === null) {
              cmp.DisplaySequence = 100;
            }
          });

          test.ComponentJSON.sort(function (a, b) { return a.DisplaySequence - b.DisplaySequence });

          test.Components.forEach(result => {

            if (!result.IsNegativeResult) {
              let seq = test.ComponentJSON.find(obj => obj.ComponentName === result.ComponentName);
              if (seq) {
                result.DisplaySequence = seq.DisplaySequence;
                result.IndentationCount = seq.IndentationCount;
              } else {
                result.IndentationCount = 0;
              }
            } else {
              test.IsNegativeResult = result.IsNegativeResult;
              test.NegativeResultText = result.Remarks;
              if (rep.Templates.length === 1 && rep.Templates[0].Tests.length === 1) {
                rep.Columns.Unit = false;
                rep.Columns.Range = false;
                rep.Columns.Method = false;
                rep.Columns.Remarks = false;
              }
            }
          });
          test.Components.sort(function (a, b) { return a.DisplaySequence - b.DisplaySequence });
        });
      });
    });
  }

  public OpenPreviewDialog(index: number): void {
    const selectedDocument = this.files[index];
    this.fileSrc = this._domSanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(selectedDocument));
    if (selectedDocument.type === ENUM_ValidFileFormats.jpegImage || selectedDocument.type === ENUM_ValidFileFormats.jpgImage) {
      this.showImageFilePreviewPopUp = true;
    }
    else {
      this.showNonImageFilePreviewPopUp = true;
    }

  }
  public CloseFilePreviewPopUp(): void {
    this.showNonImageFilePreviewPopUp = false;
    this.showImageFilePreviewPopUp = false;
  }

  public ProcessAndGenerateDocument(itm: DocumentsToBeAutoGenerated, index: number): void {
    if (itm.isSelected) {
      this.combinedPdf = new Array<any>();
      this.generatingDocumentHold = true;
      if (this.documentsToBeAutoGenerated[index].docCode === "STICKER") {
        itm.disabled = true;
        this.documentCode = "Opd-Sticker";
        this.docCodeToCompare = "STICKER"
        this.ProcessAndGenerateClaimForOpdSticker();
      }
      else if (this.documentsToBeAutoGenerated[index].docCode === "BIL-INV") {
        itm.disabled = true;
        this.documentCode = "Service-Invoices";
        this.docCodeToCompare = "BIL-INV"
        this.ProcessAndGenerateClaimForBillingInvoices();
      } else if (this.documentsToBeAutoGenerated[index].docCode === "LAB-REPORT") {
        itm.disabled = true;
        this.documentCode = "Lab";
        this.docCodeToCompare = "LAB-REPORT"
        this.ProcessAndGenerateClaimForLabReport();
      } else if (this.documentsToBeAutoGenerated[index].docCode === "RAD-REPORT") {
        itm.disabled = true;
        this.documentCode = "RAD";
        this.docCodeToCompare = "RAD-REPORT";
        this.ProcessAndGenerateClaimForRadiologyReport();
      } else if (this.documentsToBeAutoGenerated[index].docCode === "PHRM-INV") {
        itm.disabled = true;
        this.documentCode = "Product-Invoices";
        this.docCodeToCompare = "PHRM-INV";
        this.ProcessAndGenerateClaimForPharmacyInvoices();
      }
    }
  }

  public HandleConfirm(): void {
    this.loading = true;
    this.isSubmitClicked = true;
    this.SubmitClaim();
  }

  public HandleCancel(): void {
    this.loading = false;
  }

  private PrepareSchemeTypeSubProductArray() {
    this.ClaimRoot = new ClaimRoot();
    let arrayOfSSFSchemeSubProduct = Object.keys(ENUM_SSFSchemeTypeSubProduct).map((name) => {
      return {
        name,
        value: ENUM_SSFSchemeTypeSubProduct[name as keyof typeof ENUM_SSFSchemeTypeSubProduct],
      };
    });

    arrayOfSSFSchemeSubProduct = arrayOfSSFSchemeSubProduct.filter(a => isNaN(+(a.name)) === true);
    return arrayOfSSFSchemeSubProduct;
  }

  OpenClaimBooking(patientInfo: PatientWiseSSFClaimList) {
    let arrayOfSSFSchemeSubProduct = this.PrepareSchemeTypeSubProductArray();
    this.SchemeTypeSubProduct = arrayOfSSFSchemeSubProduct;
    let index = this.PatientWiseClaimList.findIndex(a => a.PatientId === patientInfo.PatientId && a.ClaimCode === patientInfo.ClaimCode);
    if (index === this.selectedIndex && (this.SelectedClaimObject.BillingInvoiceItems.length > 0 || this.SelectedClaimObject.PhrmInvoiceItems.length > 0)) {
      this.Invoices = _.cloneDeep(this.PatientWiseClaimList[index].InvoiceList);
      const latestClaimCode = this.PatientWiseClaimList[index].ClaimCode;
      this.SelectedPatient.Patient = this.PatientWiseClaimList[index].PatientName;
      this.SelectedPatient.PatientId = this.PatientWiseClaimList[index].PatientId;
      this.SelectedPatient.HospitalNo = this.SelectedPatientHospitalNo;
      this.SelectedPatient.LatestClaimCode = this.PatientWiseClaimList[index].ClaimCode;
      this.SelectedPatient.PolicyNo = this.PatientWiseClaimList[index].PolicyNo;
      this.SelectedPatient.PolicyHolderUUID = this.SelectedPatientUUID;
      // const selectedPatientsInvoiceReturns = this.SsfInvoiceReturns.filter(a => a.PatientId === this.SelectedPatient.PatientId && a.ClaimCode === this.SelectedPatient.LatestClaimCode);
      // this.SelectedPatientsInvoiceReturns = selectedPatientsInvoiceReturns;
      // this.Invoices.forEach(a => {
      //   if (a.InvoiceNoFormatted.substring(0, 2) === "BL") {
      //     a.ModuleName = "Billing";
      //   } else {
      //     a.ModuleName = "Pharmacy";
      //   }
      // });

      // this.SelectedPatientsInvoiceReturns.forEach(ret => {
      //   let inv = new SSFClaimList();
      //   inv.BillingTransactionId = ret.ReturnId;
      //   inv.InvoiceNoFormatted = ret.CreditNoteNumberFormatted;
      //   inv.InvoiceTotalAmount = -ret.TotalAmount; //Keep it negative here, SSF takes return as negative values so that they can subtract later with TotalAmount
      //   inv.ModuleName = ret.ModuleName;
      //   this.Invoices.push(inv);
      // });
      //this.AssignInvoiceAndInvoiceReturnsInSingleObject();
      this.GetClaimBookingDetails(latestClaimCode, "BookClaim");
    } else {
      this.ShowClaimBooking = false;
    }

  }
  private GetClaimBookingDetails(latestClaimCode: number, requestingFrom: string) {
    this.visitBlService.GetClaimBookingDetails(latestClaimCode).subscribe(res => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        console.log(res.Results);
        let invoices = res.Results;
        if (invoices !== null && invoices.length > 0) {
          this.MapInvoicesForClaimBooking(invoices, requestingFrom);
        } else {
          this.MapInvoicesForClaimBooking(null, requestingFrom);
        }
      }
    }, err => {
      console.log(err);
    });
  }

  MapInvoicesForClaimBooking(invoices, requestingFrom: string) {
    if (invoices) {
      this.AssignInvoiceAndInvoiceReturnsInSingleObject();
      this.Invoices.forEach(a => {
        const booking = invoices.find(b => b.BillingInvoiceNo === a.InvoiceNoFormatted || b.PharmacyInvoiceNo === a.InvoiceNoFormatted)
        if (booking && booking.BookingStatus) {
          a.BookingStatus = booking.BookingStatus ? ENUM_SSF_BookingStatus.Booked : ENUM_SSF_BookingStatus.NotBooked;
        } else {
          a.BookingStatus = ENUM_SSF_BookingStatus.NotBooked;//"Not Booked";
        }
      });
      this.CalculateBookingSummary(requestingFrom);
    } else {
      this.Invoices.forEach(a => {
        a.BookingStatus = ENUM_SSF_BookingStatus.NotBooked;//"Not Booked";
      });
      this.CalculateBookingSummary(requestingFrom);
    }
  }

  CalculateBookingSummary(requestingFrom: string) {
    this.TotalInvoiceAmountForClaim = this.AlreadyBookedInvoiceAmount = this.RemainingInvoiceAmountToBook = 0;
    this.TotalReturnAmountForClaim = this.AlreadyBookedReturnAmount = this.RemainingReturnAmountToBook = 0;

    this.Invoices.forEach(book => {
      if (book.InvoiceTotalAmount > 0) {
        this.TotalInvoiceAmountForClaim += book.InvoiceTotalAmount;
      } else {
        this.TotalReturnAmountForClaim += -(book.InvoiceTotalAmount);
      }

      if (book.BookingStatus === ENUM_SSF_BookingStatus.Booked && book.InvoiceTotalAmount > 0) {
        this.AlreadyBookedInvoiceAmount += book.InvoiceTotalAmount;
      }

      if (book.BookingStatus === ENUM_SSF_BookingStatus.Booked && book.InvoiceTotalAmount < 0) {
        this.AlreadyBookedReturnAmount += -(book.InvoiceTotalAmount);
      }
    });

    this.RemainingInvoiceAmountToBook = this.TotalInvoiceAmountForClaim - this.AlreadyBookedInvoiceAmount;
    this.RemainingInvoiceAmountToBook = CommonFunctions.parseAmount(this.RemainingInvoiceAmountToBook, 3);
    this.TotalInvoiceAmountForClaim = CommonFunctions.parseAmount(this.TotalInvoiceAmountForClaim, 3);
    this.AlreadyBookedInvoiceAmount = CommonFunctions.parseAmount(this.AlreadyBookedInvoiceAmount, 3);

    this.RemainingReturnAmountToBook = this.TotalReturnAmountForClaim - this.AlreadyBookedReturnAmount;
    this.RemainingReturnAmountToBook = CommonFunctions.parseAmount(this.RemainingReturnAmountToBook, 3);
    this.TotalReturnAmountForClaim = CommonFunctions.parseAmount(this.TotalReturnAmountForClaim, 3);
    this.AlreadyBookedReturnAmount = CommonFunctions.parseAmount(this.AlreadyBookedReturnAmount, 3);

    if (requestingFrom === "BookClaim") {
      this.ShowClaimBooking = true;
    } else {
      if (this.RemainingInvoiceAmountToBook < 1 && this.RemainingReturnAmountToBook < 1) {
        this.ShowFileUploadPopUp = true;
      } else {
        this.msgBox.showMessage(ENUM_MessageBox_Status.Warning, [`This claim is not booked properly, Please book before initiating Claim Process`]);
      }
    }

  }

  public selectSSFSchemeTypeSubProductForClaimBooking($event) {
    if ($event) {
      this.SubProductForClaimBooking = +$event.target.value;
    }
  }

  public BookClaim(data) {
    if (data) {
      const claimBookingObj = this.PrepareClaimBookingObject(data);
      if (claimBookingObj && (claimBookingObj.BookedAmount > 0 || claimBookingObj.BookedAmount < 0)) {
        this.bookClaimClicked = true;
        this.visitBlService.BookClaim(claimBookingObj).finally(() => { this.bookClaimClicked = false; }).subscribe(res => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.GetClaimBookingDetails(claimBookingObj.LatestClaimCode, "BookClaim");
            this.msgBox.showMessage(ENUM_MessageBox_Status.Success, ["Claim Booked Successfully!"]);
          } else {
            console.log(res.ErrorMessage);
            this.msgBox.showMessage(ENUM_MessageBox_Status.Failed, [`Claim Booking Failed:<br> ${res.ErrorMessage}`]);
          }
        }, err => {
          console.log(err);
        });
      } else {
        this.msgBox.showMessage(ENUM_MessageBox_Status.Notice, ["All the Invoices Amount is booked!"]);
      }
    } else {
      this.msgBox.showMessage(ENUM_MessageBox_Status.Error, ["Something went wrong!"]);
    }

  }

  PrepareClaimBookingObject(data): ClaimBookingRoot_DTO {
    let claimBooking = new ClaimBookingRoot_DTO();
    claimBooking.BookedAmount = data.InvoiceTotalAmount;
    claimBooking.HospitalNo = this.SelectedPatient.HospitalNo;
    claimBooking.Patient = this.SelectedPatient.PolicyHolderUUID;
    claimBooking.PatientId = this.SelectedPatient.PatientId;
    claimBooking.PolicyNo = this.SelectedPatient.PolicyNo;
    claimBooking.LatestClaimCode = this.SelectedPatient.LatestClaimCode;
    claimBooking.IsAccidentCase = this.IsAccidentalClaim;
    claimBooking.SubProduct = this.SubProductForClaimBooking;
    if (data.InvoiceNoFormatted.substring(0, 2) === "BL") {
      claimBooking.BillingInvoiceNo = data.InvoiceNoFormatted;
    } else if (data.InvoiceNoFormatted.substring(0, 3) === "CRN") {
      claimBooking.BillingInvoiceNo = data.InvoiceNoFormatted;
    }
    else {
      claimBooking.PharmacyInvoiceNo = data.InvoiceNoFormatted;
    }
    return claimBooking;
  }

}

export class DocumentsToBeAutoGenerated {
  public id: number = 0;
  public documentName: string = "";
  public docCode: string = "";
  public isSelected: boolean = false;
  public disabled: boolean = false;
  public isDocumentGenerated: boolean = false;
  public cannotGenerateDocument: boolean = false;
}
