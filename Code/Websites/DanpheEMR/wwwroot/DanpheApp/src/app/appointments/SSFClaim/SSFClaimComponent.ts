import { HttpClient } from "@angular/common/http";
import { ChangeDetectorRef, Component, Injector } from "@angular/core";
import { Router } from "@angular/router";
import html2canvas from "html2canvas";
import * as jsPDF from "jspdf";
import * as moment from "moment";
import { BillingBLService } from "../../billing/shared/billing.bl.service";
import { BillingService } from "../../billing/shared/billing.service";
import { PatientWiseSSFClaimList, SSFBil_VM, SSFClaimList, SSF_InvoiceInfoVM, SSF_InvoiceItems } from "../../billing/shared/invoice-print-vms";
import { CoreService } from "../../core/shared/core.service";
import { Category, ClaimBillablePeriod, ClaimCategory, ClaimCoding, ClaimDiagnosis, ClaimDiagnosisCodeableConcept, ClaimEnterer, ClaimExtension, ClaimFacility, ClaimItem, ClaimPatient, ClaimProductOrService, ClaimProvider, ClaimQuantity, ClaimRoot, ClaimSupportingInfo, ClaimTotal, ClaimType, ClaimUnitPrice, Coding, SSFClaimResponseInfo, SSFSchemeTypeSubProduct, ValueAttachement } from "../../insurance/ssf/shared/SSF-Models";
import { PatientService } from "../../patients/shared/patient.service";
import { GeneralFieldLabels } from "../../shared/DTOs/general-field-label.dto";
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { CommonFunctions } from "../../shared/common.functions";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { RouteFromService } from "../../shared/routefrom.service";
import { ENUM_ClaimCategory, ENUM_ClaimExtensionUrl, ENUM_ClaimResourceType, ENUM_DanpheHTTPResponses, ENUM_DefaultICDCode, ENUM_FileSizeUnits, ENUM_ICDCoding, ENUM_MessageBox_Status, ENUM_SSFSchemeTypeSubProduct, ENUM_ValidFileFormats } from "../../shared/shared-enums";
import { VisitBLService } from "../shared/visit.bl.service";

@Component({
  templateUrl: "./SSFClaimComponent.html"
})


export class SSFClaimComponent {

  public ShowBill: boolean = false;
  public finalAge: string = null;
  public localDateTime: string;
  public ipdNumber: string = null;
  public isInsurance: boolean = false;

  public taxLabel: string;
  //public currencyUnit: string;
  public patientQRCodeInfo: string = "";

  public Invoice_Label: string = "INVOICE";//sud:19Nov'19--we're getting this value from Parameter since different hospital needed it differently.
  public EnableCreditNote: boolean;
  public ShowProviderName: boolean;

  public CreditInvoiceDisplaySettings = { ShowPatAmtForCrOrganization: false, PatAmtValue: "0.00", ValidCrOrgNameList: ["Nepal Govt Dialysis"] };
  public QueueNoSetting = { "ShowInInvoice": false, "ShowInSticker": false };

  public InvoiceDisplaySettings: any = { ShowHeader: true, ShowQR: true, ShowHospLogo: true, ShowPriceCategory: false };
  public InvoiceFooterNoteSettings: any = { ShowFooter: true, ShowEnglish: true, ShowNepali: false, EnglishText: "Please bring this invoice on your next visit.", NepaliText: "कृपया अर्को पटक आउँदा यो बिल अनिवार्य रुपमा लिएर आउनुहोला ।" };
  public hospitalCode: string = "";
  public isReceiptDetailLoaded: boolean = false;
  public defaultFocusADT: string = null;
  public defaultFocusVisit: string = null;
  public headerDetail: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel; };

  public closePopUpAfterInvoicePrintFromVisit: boolean = true;
  public closePopUpAfterInvoicePrintFromADT: boolean = true;
  public showLabType: boolean = false;
  public labCount: number = 0;
  public showMunicipality: boolean = false;
  public InvoiceItemList: Array<SSF_InvoiceItems> = new Array<SSF_InvoiceItems>();
  public InvoiceInfo: SSF_InvoiceInfoVM = new SSF_InvoiceInfoVM();
  public invoice: SSFBil_VM = new SSFBil_VM();
  public SelectedInvoice: SSFBil_VM = new SSFBil_VM();
  public ClaimRoot: ClaimRoot = new ClaimRoot();
  public SSFClaimReportColumns: any;
  public searchString: string = null;
  public page: number = 1;
  public initialLoad: boolean = true;
  public fromDate: any;
  public toDate: any;
  public FiscalYearId: number = 0;
  public PatientWiseClaimList: Array<PatientWiseSSFClaimList> = new Array<PatientWiseSSFClaimList>();
  public files = Array<File>();
  public ShowFileUploadPopUp: boolean = false;
  public IsClaimProcessed: boolean = false;
  public fileFromUser = Array<File>();
  public pdfCounter: number = 0;
  public loading = false;
  public isSubmitClicked = false;
  public SSFConfiguration: any;
  public areAllFileSizeValid = true;
  public selectedIndex: number = -1;
  public SchemeTypeSubProduct = Array<SSFSchemeTypeSubProduct>();
  public claimExtensionArray = Array<ClaimExtension>();
  public TotalUploadedFiles: number = 0;

  public EnableEnglishCalendarOnly: boolean = false;
  public GeneralFieldLabel = new GeneralFieldLabels();

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
    public visitBlService: VisitBLService) {
    this.GeneralFieldLabel = coreService.GetFieldLabelParameter();
    this.taxLabel = this.billingService.taxLabel;
    //this.currencyUnit = this.billingService.currencyUnit;
    this.SetInvoiceLabelNameFromParam();
    this.GetBillingPackageInvoiceColumnSelection();
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

    let paramValue = this.coreService.Parameters.find(a => a.ParameterName === 'BillingHeader').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);

    let StrParam = this.coreService.Parameters.find(a => a.ParameterGroupName === "Billing" && a.ParameterName === "OPBillingRequestDisplaySettings");
    if (StrParam && StrParam.ParameterValue) {
      let currParam = JSON.parse(StrParam.ParameterValue);
      this.showLabType = currParam.LabType;
    }
    this.labCount = this.coreService.labTypes.length;

    let ssfParams = coreService.Parameters.find(a => a.ParameterGroupName === "SSF" && a.ParameterName === "SSFConfiguration");
    if (ssfParams && ssfParams.ParameterValue) {
      let currParam = JSON.parse(ssfParams.ParameterValue);
      this.SSFConfiguration = currParam;
    }

    this.GeneralFieldLabel = coreService.GetFieldLabelParameter();
  }


  public SetInvoiceLabelNameFromParam() {
    let currParam = this.coreService.Parameters.find(a => a.ParameterGroupName === "Billing" && a.ParameterName === "BillingInvoiceDisplayLabel");
    if (currParam && currParam.ParameterValue) {
      this.Invoice_Label = currParam.ParameterValue;
    }
  }
  public BillingPackageInvoiceColumnSelection: any = null;
  public GetBillingPackageInvoiceColumnSelection() {
    let currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "BillingPackageInvoiceColumnSelection");
    if (currParam && currParam.ParameterValue) {
      this.BillingPackageInvoiceColumnSelection = JSON.parse(currParam.ParameterValue);
    }
  }


  GetLocalDate(engDate: string): string {
    if (this.EnableEnglishCalendarOnly) {
      return null;
    } else {
      let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
      return npDate + " BS";
      //return (${npDate} BS);
    }
  }


  CheckPatientAllInvoice(patientInfo, ind) {
    let index = this.PatientWiseClaimList.findIndex(a => a.PatientId === patientInfo.PatientId && a.ClaimCode === patientInfo.ClaimCode);
    this.PatientWiseClaimList.forEach((a, ind) => {
      if (ind == index) {
        a.InvoiceList.forEach(element => {
          patientInfo.IsSelected ? element.IsSelected = true : element.IsSelected = false;
        });
      }
      else {
        a.IsSelected = false;
        a.InvoiceList.forEach(b => b.IsSelected = false);
      }
    });
    this.SelectedInvoice.PatientInfo = [];
    this.SelectedInvoice.InvoiceInfo = [];
    this.SelectedInvoice.InvoiceItems = [];
    this.SelectedInvoice.PhrmInvoices = [];
    if (this.PatientWiseClaimList[index].IsSelected) {
      let patInfo = this.invoice.PatientInfo.find(a => a.PatientId === patientInfo.PatientId && a.ClaimCode === patientInfo.ClaimCode);
      let invoiceInfo = this.invoice.InvoiceInfo.filter(a => a.PatientId === patientInfo.PatientId && a.ClaimCode === patientInfo.ClaimCode);
      if (patInfo)
        this.SelectedInvoice.PatientInfo.push(patInfo);
      if (invoiceInfo)
        this.SelectedInvoice.InvoiceInfo = invoiceInfo;
      this.SelectedInvoice.InvoiceInfo.forEach(a => {
        let items = this.InvoiceItemList.filter(items => items.BillingTransactionId === a.BillingTransactionId);
        this.SelectedInvoice.InvoiceItems.push(...items);
      });
      this.SelectedInvoice.PhrmInvoices = this.invoice.PhrmInvoices.filter(pItems => pItems.PatientId === patientInfo.PatientId && pItems.ClaimCode === patientInfo.ClaimCode);
      this.selectedIndex = index;
    }

  }

  CheckInvoice(Invoice: SSFClaimList, data: PatientWiseSSFClaimList) {
    let outerIndex = this.PatientWiseClaimList.findIndex(a => a.PatientId === data.PatientId && a.ClaimCode === data.ClaimCode);
    this.PatientWiseClaimList.forEach((a, ind) => {
      if (ind != outerIndex) {
        a.IsSelected = false;
        a.InvoiceList.forEach(b => b.IsSelected = false);
      }
    });
    if (this.SelectedInvoice.InvoiceInfo.length > 0 && this.SelectedInvoice.InvoiceInfo.some(a => a.PatientId != data.PatientId)) {
      this.SelectedInvoice.InvoiceInfo = [];
      this.SelectedInvoice.PatientInfo = [];
    }
    if (Invoice.IsSelected) {
      if (this.SelectedInvoice.PatientInfo.length <= 0) {
        let patInfo = this.invoice.PatientInfo.find(a => a.PatientId == data.PatientId);
        if (patInfo)
          this.SelectedInvoice.PatientInfo.push(patInfo);
      }
      let index = this.SelectedInvoice.InvoiceInfo.findIndex(a => a.InvoiceNumber == Invoice.InvoiceNo);
      if (index >= 0) {
        this.SelectedInvoice.InvoiceInfo.splice(index, 1);
        this.SelectedInvoice.InvoiceItems = this.SelectedInvoice.InvoiceItems.filter(a => a.BillingTransactionId != Invoice.BillingTransactionId);
      }
      else {
        let invoiceInfo = this.invoice.InvoiceInfo.find(a => a.InvoiceNumber == Invoice.InvoiceNo);
        if (invoiceInfo)
          this.SelectedInvoice.InvoiceInfo.push(invoiceInfo);
        let items = this.InvoiceItemList.filter(a => a.BillingTransactionId === invoiceInfo.BillingTransactionId);
        this.SelectedInvoice.InvoiceItems.push(...items);
      }
      this.selectedIndex = outerIndex;
    }
    else {
      let index = this.SelectedInvoice.InvoiceInfo.findIndex(a => a.InvoiceNumber == Invoice.InvoiceNo);
      if (index >= 0) {
        this.SelectedInvoice.InvoiceInfo.splice(index, 1);
        this.SelectedInvoice.InvoiceItems = this.SelectedInvoice.InvoiceItems.filter(a => a.BillingTransactionId != Invoice.BillingTransactionId);
      }
    }
    if (this.PatientWiseClaimList[outerIndex].InvoiceList.every(a => a.IsSelected)) {
      this.PatientWiseClaimList[outerIndex].IsSelected = true;
    } else {
      this.PatientWiseClaimList[outerIndex].IsSelected = false;
    }
  }

  public patientType: string = "inpatient";
  ChangePatientType(event) {
    if (event) {
      this.patientType = event.target.value;
      this.GetSSFInvoiceDetail();
    }
  }

  selectFiles(event: any) {
    if (event) {
      this.fileFromUser = Array.from(event.target.files); //* event.target.files returns File object instead of Array hence need to convert it into array with this method.., Krishna 15thSept'22

      if (this.checkForValidFileFormat(this.fileFromUser)) {
        this.files = [...this.files, ...this.fileFromUser];  //*  merging files array with the files coming from user , Krishna 15thSept'22
        //this.checkForValidFileSizes(this.files);
      }
    }
  }

  checkForValidFileFormat(filesFromUser: Array<File>): Boolean {
    let isValidFile = false;

    const files = Array.from(filesFromUser);
    const validFileFormats = Object.values(ENUM_ValidFileFormats).toString(); //* converting enum values into a string to compare that with the type of file selected by the user, Krishna, 20thSept'22
    for (let item of files) {
      if (validFileFormats.includes(item.type)) {
        isValidFile = true;
      } else {
        isValidFile = false;
        this.msgBox.showMessage("Failed", ["File format is not valid"]);
        break;
      }
    }
    return isValidFile;
  }

  //! Below function can be useful when individual file size validation is required.(We are not implementing this logic for now but keeping it for later)
  // checkForValidFileSizes(filesFromUser: Array<File>): void{
  //   const files = Array.from(filesFromUser);

  //   for(let item of files){
  //     const fileSize = item.size;
  //     const acceptedSize = 200 * 1000;
  //     if(fileSize > acceptedSize){
  //       this.areAllFileSizeValid = false;
  //       this.msgBox.showMessage("Warning", ["Some File sizes are more than 200KB"]);
  //       break;
  //     }else{
  //       this.areAllFileSizeValid = true;
  //     }
  //   }
  // }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = Object.values(ENUM_FileSizeUnits);
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  OpenFileUpload(patientInfo: PatientWiseSSFClaimList) {
    let arrayOfSSFSchemeSubProduct = Object.keys(ENUM_SSFSchemeTypeSubProduct).map((name) => {
      return {
        name,
        value: ENUM_SSFSchemeTypeSubProduct[name as keyof typeof ENUM_SSFSchemeTypeSubProduct],
      };
    });

    arrayOfSSFSchemeSubProduct = arrayOfSSFSchemeSubProduct.filter(a => isNaN(+(a.name)) === true);

    this.SchemeTypeSubProduct = arrayOfSSFSchemeSubProduct;
    let index = this.PatientWiseClaimList.findIndex(a => a.PatientId === patientInfo.PatientId && a.ClaimCode === patientInfo.ClaimCode);
    (index === this.selectedIndex && this.SelectedInvoice.InvoiceItems.length > 0) ? this.ShowFileUploadPopUp = true : this.ShowFileUploadPopUp = false;
  }

  CloseFileUploadPopUp() {
    this.ShowFileUploadPopUp = false;
    this.files = new Array<File>();
    this.IsClaimProcessed = false;
    this.isSubmitClicked = false;
    this.loading = false;
    this.areAllFileSizeValid = true;
    this.ClaimRoot = new ClaimRoot();
  }

  DeleteFile(index: number) {
    this.files.splice(index, 1);
    //this.checkForValidFileSizes(this.files);
  }

  ProcessClaim() {
    this.IsClaimProcessed = false;
    this.loading = true;
    if (this.SelectedInvoice.InvoiceInfo && this.SelectedInvoice.InvoiceInfo.length > 0) {
      this.coreService.loading = true;
      this.ClaimRoot = new ClaimRoot();
      //if current invoice's Organization name is in the list of Valid CreditOrganization list then only show PatientAmount, else hide PatientAmount field.
      if (this.invoice && this.CreditInvoiceDisplaySettings.ShowPatAmtForCrOrganization && this.InvoiceInfo.CreditOrganizationName
        && this.CreditInvoiceDisplaySettings.ValidCrOrgNameList && this.CreditInvoiceDisplaySettings.ValidCrOrgNameList.length > 0
        && this.CreditInvoiceDisplaySettings.ValidCrOrgNameList.filter(orgName => orgName.toLowerCase() === this.InvoiceInfo.CreditOrganizationName.toLowerCase()).length > 0) {
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
      this.invoice.InvoiceItems = this.InvoiceItemList.filter(a => a.BillingTransactionId == this.SelectedInvoice.InvoiceInfo[0].BillingTransactionId);
      this.InvoiceInfo = this.SelectedInvoice.InvoiceInfo[0];
      this.localDateTime = this.GetLocalDate(this.InvoiceInfo.TransactionDate);
      this.finalAge = CommonFunctions.GetFormattedAgeSex(this.SelectedInvoice.PatientInfo[0].DateOfBirth, this.SelectedInvoice.PatientInfo[0].Gender);

      this.isInsurance = this.InvoiceInfo.IsInsuranceBilling;
      this.invoice.InvoiceItems.forEach(a => a.Price = CommonFunctions.parseAmount(a.Price));
      this.ShowBill = true;
      if (this.SelectedInvoice.InvoiceInfo.length == 1) {
        setTimeout(() => {
          this.GeneratePDF();
          this.ShowBill = false;
          this.coreService.loading = false;
          this.IsClaimProcessed = true;
          this.msgBox.showMessage("success", ["Claim Processed. Ready to submit."]);
        }, 500);
      }
      for (let i = 1; i < this.SelectedInvoice.InvoiceInfo.length; i++) {
        setTimeout(() => {
          this.invoice.InvoiceItems = this.InvoiceItemList.filter(a => a.BillingTransactionId == this.SelectedInvoice.InvoiceInfo[i].BillingTransactionId);
          this.InvoiceInfo = this.SelectedInvoice.InvoiceInfo[i];
          this.localDateTime = this.GetLocalDate(this.InvoiceInfo.TransactionDate);
          this.finalAge = CommonFunctions.GetFormattedAgeSex(this.SelectedInvoice.PatientInfo[0].DateOfBirth, this.SelectedInvoice.PatientInfo[0].Gender);

          this.isInsurance = this.InvoiceInfo.IsInsuranceBilling;
          this.invoice.InvoiceItems.forEach(a => a.Price = CommonFunctions.parseAmount(a.Price));
          this.GeneratePDF();
          if (i == this.SelectedInvoice.InvoiceInfo.length - 1) {
            setTimeout(() => {
              this.GeneratePDF();
              this.ShowBill = false;
              this.coreService.loading = false;
              this.IsClaimProcessed = true;
              this.msgBox.showMessage("success", ["Claim Processed. Ready to submit."]);
            }, 500);
          }
        }, (i * 500));
      }

      let claimSupportingInfo = new ClaimSupportingInfo();
      let category = new Category();
      let valueAttachment = new ValueAttachement();
      let coding = new Coding();
      coding.code = 'attachment';
      coding.display = 'Attachment';
      category.coding.push(coding);
      category.text = 'attachment';

      valueAttachment.creation = moment().format('YYYY-MM-DD hh:mm:ss');
      valueAttachment.hash = "";

      //* converting files into binary Array and Adding them as attachment.
      if (this.files && this.files.length) {
        this.TotalUploadedFiles = this.files.length;
        const startingIndex = 0;
        this.GenerateBinaryFromUploadedFile(startingIndex);
      }
    }
    else {
      this.msgBox.showMessage("error", ["Please select at least one Invoice."]);
    }
  }

  //* This is a recursive function, which will call itself until some condition is satisfied i.e the index reaches the last index of files. Krishna, 28thDec'22.
  //* Recursion is needed here in order to create base64 of every files, loop is not a good option here.
  GenerateBinaryFromUploadedFile(index: number): void {
    if (index > (this.TotalUploadedFiles - 1)) {
      return;
    }
    const claimSupportingInfo = new ClaimSupportingInfo();
    const category = new Category();
    const valueAttachment = new ValueAttachement();
    const coding = new Coding();
    coding.code = 'attachment';
    coding.display = 'Attachment';
    category.coding.push(coding);
    category.text = 'attachment';

    valueAttachment.creation = moment().format('YYYY-MM-DD hh:mm:ss');
    valueAttachment.hash = "";
    const file = this.files[index];
    index++;
    valueAttachment.contentType = file.type;
    valueAttachment.title = `${this.SelectedInvoice.PatientInfo[0].ShortName}_${this.SelectedInvoice.PatientInfo[0].PatientId}_${file.name}`;
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

  GetSSFInvoiceDetail() {
    this.visitBlService.GetSSFInvoiceDetail(this.fromDate, this.toDate, this.patientType).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.invoice = res.Results;
        this.InvoiceItemList = this.invoice.InvoiceItems;
        this.PatientWiseClaimList = [];
        this.invoice.PatientInfo.forEach(a => {
          let patInfo = new PatientWiseSSFClaimList();
          patInfo.PatientName = a.ShortName;
          patInfo.Address = a.Address;
          patInfo.PolicyNo = a.PolicyNo;
          patInfo.PatientId = a.PatientId;
          let invoices = [];
          invoices = this.invoice.InvoiceInfo.filter(b => b.PatientId === a.PatientId && b.ClaimCode === a.ClaimCode);
          invoices.forEach(c => {
            let SSfClaim = new SSFClaimList();
            SSfClaim.InvoiceNo = c.InvoiceNumber;
            SSfClaim.InvoiceTotalAmount = c.TotalAmount;
            SSfClaim.Cash = c.ReceivedAmount;
            SSfClaim.Credit = c.BalanceAmount;
            //SSfClaim.ClaimCode = c.ClaimCode;
            SSfClaim.BillingTransactionId = c.BillingTransactionId;
            patInfo.InvoiceList.push(SSfClaim);
          });
          patInfo.ClaimCode = invoices.length > 0 ? invoices[0].ClaimCode : null;
          if (patInfo.ClaimCode) {
            this.PatientWiseClaimList.push(patInfo);
          }
        });
        this.loading = false;
      }
      // this.PopulateBill();
    },
      err => {
        console.log(err);
      });
  }

  ngOnInit() {

  }

  OnFromToDateChange($event) {
    if ($event) {
      this.fromDate = $event.fromDate;
      this.toDate = $event.toDate;
    }
  }

  GeneratePDF() {
    let claimSupportingInfo = new ClaimSupportingInfo();
    let category = new Category();
    let valueAttachment = new ValueAttachement();
    let coding = new Coding();
    coding.code = 'attachment';
    coding.display = 'Attachment';
    category.coding.push(coding);
    category.text = 'attachment';


    let dom = document.getElementById("divBilInvoicePrintPage");
    let domWidth = dom.style.width;
    dom.style.border = "none";
    dom.style.width = "1020px";
    html2canvas(dom, {
      useCORS: true,
      allowTaint: true,
      scrollY: 0
    }).then((canvas) => {
      const image = { type: 'jpeg', quality: 2 };
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
        pdf.addImage(imgData, image.type, margin[1], margin[0], innerPageWidth, pageHeight);
      }

      this.pdfCounter++;
      let pdfFileCreatedBySystem = pdf.output('blob');
      pdfFileCreatedBySystem.name = `${this.SelectedInvoice.PatientInfo[0].ShortName}_${this.SelectedInvoice.PatientInfo[0].PatientId}_invoice_${this.pdfCounter}.pdf`;
      this.files.push(pdfFileCreatedBySystem);

      dom.style.width = domWidth;
      let binary = pdf.output();

      valueAttachment.data = btoa(binary);
      valueAttachment.contentType = ENUM_ValidFileFormats.pdf;
      valueAttachment.creation = moment().format('YYYY-MM-DD hh:mm:ss');
      valueAttachment.hash = "";
      valueAttachment.title = `${this.SelectedInvoice.PatientInfo[0].ShortName}_${this.SelectedInvoice.PatientInfo[0].PatientId}_invoice_${this.pdfCounter}.pdf`;

    });
    claimSupportingInfo.category = category;
    claimSupportingInfo.valueAttachment = valueAttachment;
    this.ClaimRoot.supportingInfo.push(claimSupportingInfo);
  }

  checkTotalSizeOfFiles(filesGenerated: Array<File>): Boolean {
    let isAllowedTotalFileSize = false;
    const files = Array.from(filesGenerated);
    const totalAcceptedFileSize = (5 * 1000000); //* converting 5MB into bytes
    const totalFileSize = files.reduce((acc, curr) => acc + curr.size, 0);
    if (totalFileSize > totalAcceptedFileSize) {
      isAllowedTotalFileSize = false;
      this.msgBox.showMessage("Failed", ["Total File size is greater than 5MB"]);
    } else {
      isAllowedTotalFileSize = true;
    }
    return isAllowedTotalFileSize;
  }

  public LoadCreditInvoiceDisplaySettingsFromParameter() {
    let param = this.coreService.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "CreditInvoiceDisplaySettings");
    if (param) {
      let paramValueStr = param.ParameterValue;
      if (paramValueStr) {
        this.CreditInvoiceDisplaySettings = JSON.parse(paramValueStr);
      }
    }
  }

  SubmitClaim() {
    this.pdfCounter = 0;
    this.isSubmitClicked = true;
    if (this.checkTotalSizeOfFiles(this.files)) {
      this.PrepareClaimRoot();
      console.log(this.ClaimRoot.supportingInfo);
      this.visitBlService.SubmitClaim(this.ClaimRoot).subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.msgBox.showMessage(ENUM_MessageBox_Status.Success, ["SSF Claim Successfully Submitted."]);
          }
          else {
            this.msgBox.showMessage(ENUM_MessageBox_Status.Error, ["Sorry, Unable to Submit Claim."]);
          }
        },
        (err: DanpheHTTPResponse) => {
          this.msgBox.showMessage(ENUM_MessageBox_Status.Error, ["Something went wrong please try again."]);
        },
        () => {
          this.CloseFileUploadPopUp();
          this.GetSSFInvoiceDetail();
        }
      );
    } else {
      this.isSubmitClicked = false;
    }
  }

  selectSSFSchemeTypeSubProduct(event) {
    if (event) {
      let claimExtension = new ClaimExtension();
      claimExtension.url = ENUM_ClaimExtensionUrl.subProduct;
      claimExtension.valueString = +event.target.value;
      this.claimExtensionArray.push(claimExtension);
    }
  }

  PrepareClaimRoot() {
    let claimType = new ClaimType();
    claimType.text = "0";
    this.ClaimRoot.claimType = claimType;

    this.SelectedInvoice.InvoiceInfo = this.SelectedInvoice.InvoiceInfo.sort((a, b) => a.BillingTransactionId - b.BillingTransactionId); //* sorting invoices in ascending order

    let claimBillablePeriod = new ClaimBillablePeriod();
    if (this.SelectedInvoice.PatientInfo[0].Admitted === "1") {
      claimBillablePeriod.start = this.SelectedInvoice.PatientInfo[0].AdmissionDate;
      claimBillablePeriod.end = this.SelectedInvoice.PatientInfo[0].DischargeDate;
    } else {
      claimBillablePeriod.start = this.SelectedInvoice.InvoiceInfo[0].InvoiceDate.toString(); //* get invoiceDate of first invoice.
      claimBillablePeriod.end = this.SelectedInvoice.InvoiceInfo[this.SelectedInvoice.InvoiceInfo.length - 1].InvoiceDate.toString(); //* get invoiceDate of last invoice.
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
    if (this.SelectedInvoice.PatientInfo[0].PolicyHolderEmployerId) {
      claimExtension.url = ENUM_ClaimExtensionUrl.EmployerId;
      claimExtension.valueString = this.SelectedInvoice.PatientInfo[0].PolicyHolderEmployerId;
      this.claimExtensionArray.push(claimExtension);
    }


    claimExtension = new ClaimExtension();
    claimExtension.url = ENUM_ClaimExtensionUrl.schemeType;
    claimExtension.valueString = this.SelectedInvoice.PatientInfo[0].SchemeType;
    this.claimExtensionArray.push(claimExtension);

    claimExtension = new ClaimExtension();
    claimExtension.url = ENUM_ClaimExtensionUrl.Admitted;
    claimExtension.valueString = this.SelectedInvoice.PatientInfo[0].Admitted;
    this.claimExtensionArray.push(claimExtension);

    if (this.SelectedInvoice.PatientInfo[0].Admitted === "1") {
      claimExtension = new ClaimExtension();
      claimExtension.url = ENUM_ClaimExtensionUrl.DischargeType;
      claimExtension.valueString = this.SelectedInvoice.PatientInfo[0].DischargeTypeName;
      this.claimExtensionArray.push(claimExtension);

      claimExtension = new ClaimExtension();
      claimExtension.url = ENUM_ClaimExtensionUrl.DischargeDate;
      claimExtension.valueString = moment(this.SelectedInvoice.PatientInfo[0].DischargeDate).format("DD/MM/YYYY");
      this.claimExtensionArray.push(claimExtension);

      claimExtension = new ClaimExtension();
      claimExtension.url = ENUM_ClaimExtensionUrl.DischargeSummary;
      claimExtension.valueString = this.SelectedInvoice.PatientInfo[0].CaseSummary;
      this.claimExtensionArray.push(claimExtension);
    }

    claimExtension = new ClaimExtension();
    claimExtension.url = ENUM_ClaimExtensionUrl.IsDead;
    claimExtension.valueString = this.SelectedInvoice.PatientInfo[0].IsDead;
    this.claimExtensionArray.push(claimExtension);

    this.ClaimRoot.extension = this.claimExtensionArray;



    let diagnosisArray = new Array<ClaimDiagnosis>();
    let diagnosisDetailsFromServer = JSON.parse(this.SelectedInvoice.PatientInfo[0].Diagnosis);
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
        cType.text = ENUM_ICDCoding.ICD10;
        diagnosis.type.push(cType);
        diagnosisArray.push(diagnosis);
      });
    }
    else {
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
      };
      diagnosisArray.push(diagnosis);
    }
    this.ClaimRoot.diagnosis = diagnosisArray;

    let claimItemArray = new Array<ClaimItem>();
    let selectedInvoiceItems = this.SelectedInvoice.InvoiceItems;
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
        claimItemArray.push(claimItem);
        totalInvoiceItemsAmount += items.TotalAmount;
      });
    }

    let existingSequenceCount = claimItemArray.length;
    if (this.SelectedInvoice.PhrmInvoiceItems && this.SelectedInvoice.PhrmInvoiceItems.length) {
      this.SelectedInvoice.PhrmInvoiceItems.forEach((items, index) => {
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

        claimItemArray.push(claimItem);
        totalInvoiceItemsAmount += (items.UnitPrice * items.Quantity);
      });

    }

    this.ClaimRoot.item = claimItemArray;


    let total = new ClaimTotal();
    total.value = totalInvoiceItemsAmount;
    this.ClaimRoot.total = total;

    let claimingPatient = new ClaimPatient();
    claimingPatient.reference = `Patient/${this.SelectedInvoice.PatientInfo[0].PolicyHolderUID}`;
    this.ClaimRoot.patient = claimingPatient;

    this.ClaimRoot.resourceType = ENUM_ClaimResourceType.ResourceType;

    let claimResponseInfo = new SSFClaimResponseInfo();
    claimResponseInfo.PatientId = this.SelectedInvoice.PatientInfo[0].PatientId;
    claimResponseInfo.PatientCode = this.SelectedInvoice.PatientInfo[0].PatientCode;
    claimResponseInfo.ClaimedDate = moment().format('YYYY-MM-DD hh:mm:ss');
    claimResponseInfo.ClaimCode = this.SelectedInvoice.InvoiceInfo[0].ClaimCode;

    let InvoiceNoList = [];
    if (this.SelectedInvoice.InvoiceInfo && this.SelectedInvoice.InvoiceInfo.length) {
      this.SelectedInvoice.InvoiceInfo.forEach((invoice) => {
        InvoiceNoList.push(invoice.InvoiceNumber);
      });
    }
    claimResponseInfo.InvoiceNoCSV = InvoiceNoList.join(",");
    this.ClaimRoot.claimResponseInfo = claimResponseInfo;
  }

}
