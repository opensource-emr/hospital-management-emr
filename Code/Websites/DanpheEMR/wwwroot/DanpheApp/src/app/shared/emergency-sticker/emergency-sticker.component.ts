import { Component, Input, Output, EventEmitter } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { EmergencyStickerVM } from './emergency-sticker.model';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from "../../core/shared/core.service";
import { Subscription } from 'rxjs/Subscription';
import { CommonFunctions } from "../../shared/common.functions";

@Component({
  selector: 'emergency-sticker',
  templateUrl: "./emergency-sticker.html"
})

export class EmergencyStickerComponent {
  public stickerDetail: EmergencyStickerVM = new EmergencyStickerVM();
  @Input("patient-visitId")
  public patientVisitId: number;
  @Output("after-print-action")
  afterPrintAction: EventEmitter<Object> = new EventEmitter<Object>();
  public showSticker: boolean = false;
  loading = false;
  public showServerPrintBtn: boolean = false;
  public showLoading: boolean = false;

  public showQrCode: boolean = false;
  public patientQRCodeInfo: string = "";

  constructor(
    public http: HttpClient,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService) {
    this.showHidePrintButton();
  }

  @Input("showSticker")
  public set value(val: boolean) {
    this.showSticker = val;
    if (this.showSticker && this.patientVisitId) {
      this.GetVisitforStickerPrint(this.patientVisitId);
    }
  }

  GetVisitforStickerPrint(PatientVisitId) {
    this.http.get<any>('/api/Visit?reqType=getVisitInfoforStickerPrint' + '&visitId=' + PatientVisitId)
      .map(res => res)
      .subscribe(res => this.CallBackStickerOnly(res),
        res => this.Error(res));
  }
  CallBackStickerOnly(res) {
    if (res.Status = "OK" && res.Results.length != 0) {
      this.stickerDetail.PatientCode = res.Results[0].PatientCode;
      this.stickerDetail.PatientName = res.Results[0].PatientName;
      this.stickerDetail.CountrySubDivisionName = res.Results[0].District;
      this.stickerDetail.Address = res.Results[0].Address;
      this.stickerDetail.DateOfBirth = res.Results[0].DateOfBrith;
      this.stickerDetail.ProviderName = res.Results[0].DoctorName;
      this.stickerDetail.PhoneNumber = res.Results[0].PhoneNumber;
      this.stickerDetail.User = res.Results[0].User;
      this.stickerDetail.Gender = res.Results[0].Gender;
      this.stickerDetail.VisitDate = moment(res.Results[0].VisitDate).format('YYYY-MM-DD')
      this.stickerDetail.VisitTime = moment(res.Results[0].VisitTime, "hhmm").format('hh:mm A');
      this.stickerDetail.VisitType = res.Results[0].VisitType;
      this.stickerDetail.VisitCode = res.Results[0].VisitCode;

      let ageSex = CommonFunctions.GetFormattedAgeSex(this.stickerDetail.DateOfBirth, this.stickerDetail.Gender);

      this.patientQRCodeInfo = `Name: ` + this.stickerDetail.PatientName + `
      Hospital No: `+ this.stickerDetail.PatientCode + `
      Age/Sex: `+ ageSex + `
      Contact No: `+ this.stickerDetail.PhoneNumber + `
      Address: `+ this.stickerDetail.Address;
      //set this to true only after all values are set.
      this.showQrCode = true;
    }
    else {
      this.showSticker = false;
      this.AfterPrintAction();
      this.msgBoxServ.showMessage("error", ["Sorry!!! not able to get date for emergency-sticker of this patient"]);
    }
  }

  printStickerClient() {

    let popupWinindow;
    var printContents = document.getElementById("EmergencySticker").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    let documentContent = '<html><head>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
    /// documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
    this.AfterPrintAction();
  }
  Close() {
    this.showSticker = false;
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! not able to get for opd- sticker"]);
    console.log(err.ErrorMessage);
  }
  AfterPrintAction() {
    // this is after print action ..and it pass some event to the parent component
    this.afterPrintAction.emit({ showOpdSticker: false });
  }

  //06April2018 print from server
  printStickerServer() {
    let printContents = document.getElementById("EmergencySticker").innerHTML;
    var printableHTML = '<html><head><link rel="stylesheet" type="text/css" href="DanpheStyle.css" />';
    printableHTML += '<meta http-equiv="X-UA-Compatible" content="IE= edge"/></head>';
    printableHTML += '<body>' + printContents + '</body></html>';
    var PrinterName = this.LoadPrinterSetting();
    PrinterName += this.stickerDetail.PatientCode;
    var filePath = this.LoadFileStoragePath();
    this.loading = true;
    this.showLoading = true;
    this.http.post<any>("/api/Billing?reqType=saveHTMLfile&PrinterName=" + PrinterName + "&FilePath=" + filePath, printableHTML)
      .map(res => res).subscribe(res => {
        if (res.Status = "OK") {
          this.timerFunction();
        }
        else {
          this.loading = false;
          this.showLoading = false;
        }
      });

    this.AfterPrintAction();
  }
  //loads Printer Setting from Paramter Table (database) -- ramavtar
  LoadPrinterSetting() {
    let Parameter = this.coreService.Parameters;
    Parameter = Parameter.filter(parms => parms.ParameterName == "DefaultPrinterName");
    let JSONobject = JSON.parse(Parameter[0].ParameterValue);
    let PrinterName = JSONobject.OPDSticker;
    return PrinterName;
  }
  //set button for preview
  showHidePrintButton() {
    let params = this.coreService.Parameters;
    params = params.filter(p => p.ParameterName == "showServerPrintBtn");
    let jsonObj = JSON.parse(params[0].ParameterValue);
    let value = jsonObj.OPDSticker;
    if (value == "true") {
      this.showServerPrintBtn = true;
    }
    else {
      this.showServerPrintBtn = false;
    }
  }
  //load file storage path
  LoadFileStoragePath() {
    let params = this.coreService.Parameters;
    params = params.filter(p => p.ParameterName == "PrintFileLocationPath");
    let path = params[0].ParameterValue;
    return path;
  }
  //timer function
  timerFunction() {
    var timer = Observable.timer(10000);
    var sub: Subscription;
    sub = timer.subscribe(t => {
      this.showLoading = false;
    });
  }
}
