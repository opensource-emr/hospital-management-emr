import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { PatientsBLService } from '../../shared/patients.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CommonFunctions } from '../../../shared/common.functions';
import { CoreService } from "../../../core/shared/core.service";
import { Patient } from "../../../patients/shared/patient.model";
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { HttpClient } from '@angular/common/http';
import html2canvas from 'html2canvas';
import { DomSanitizer } from '@angular/platform-browser';
import { HealthCard } from '../../shared/health-card.model';
import { SecurityService } from '../../../security/shared/security.service';

@Component({
  selector: "hams-health-card",
  templateUrl: "./hams-healthCard.html"
})

export class HamsPatientHealthCardComponent implements OnInit {

  @Input() showCard: boolean = false;

  @Input("selectedPat")
  public selectedPat: any;

  public patientQRCodeInfo: string = "";
  public showQrCode: boolean = false;
  public profilePic: any = null;
  public patHealthCardStatus: any = null;
  public curHealthCard: HealthCard = new HealthCard();
  public showAdditionalInfo: boolean = false;
  public postHealthCard: boolean = false;

  public hospitalShortName: string = "";
  public hospLogoFolderPath: string = "../../../themes/theme-default/images/health-card/hosp-logo/";
  public hospBgFolderPath: string = "../../../themes/theme-default/images/health-card/hosp-background/";

  public imgLogoSrcPath: string = "";
  public hospBgSrcPath: string = "";
  public hcTextFields = { front_Header: "", back_PropertyOf: "", back_HospName: "", back_addressInfo: "", back_contactInfo: "", back_emailInfo: "", back_websiteInfo: "" };



  constructor(
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public securityService: SecurityService,
    public http: HttpClient,
    public _sanitizer: DomSanitizer) {

    this.InitializeHospitalSettings();


  }

  InitializeHospitalSettings() {
    let hospNamePararam = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "HospitalName");
    if (hospNamePararam) {
      //shortname comes in this format: "HAMS" or "MNK", "MMH", and so on. 
      this.hospitalShortName = hospNamePararam.ParameterValue.toLowerCase();
      //Naming format for our logo is: hospshortname-logo.png  inside above folder.
      //final path format example: ../images/health-card/hospital-logo.PNG, ../images/health-card/mmh-logo.PNG  and so on. 
      this.imgLogoSrcPath = this.hospLogoFolderPath + this.hospitalShortName + "-logo.PNG";
      //hams-hospital-bg.jpg
      this.hospBgSrcPath = this.hospBgFolderPath + this.hospitalShortName + "-hospital-bg.jpg";

    }


    let hcTextParams = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "HealthCardTextFieldsInfo");
    if (hcTextParams) {

      let hcTxtParamValue = hcTextParams.ParameterValue;
      let hcTxtJson = JSON.parse(hcTxtParamValue);
      //start: sud: 12Jul'19--below fields are set in database-- Pl's don't change anything..
      this.hcTextFields.front_Header = hcTxtJson["front-header"];
      this.hcTextFields.back_PropertyOf = hcTxtJson["back-property-of"];
      this.hcTextFields.back_HospName = hcTxtJson["back-hospital-name"];
      this.hcTextFields.back_addressInfo = hcTxtJson["back-hospital-addressinfo"];
      this.hcTextFields.back_contactInfo = hcTxtJson["back-hospital-contactinfo"];
      this.hcTextFields.back_emailInfo = hcTxtJson["back-hospital-emailinfo"];
      this.hcTextFields.back_websiteInfo = hcTxtJson["back-hospital-websiteinfo"];
      //end: sud: 12Jul'19--below fields are set in database-- Pl's don't change anything.. 

    }

  }

  ngOnInit() {
    let patInfo = this.selectedPat;
    //Create an specific format for QR-Value. 
    //current format:   
    //PatientName: XYZ
    //Hospital No : XYZ
    //Age/Sex: XYZ
    //Contact No: XYZ
    //Address: XYZ
    this.patientQRCodeInfo = `Name: ` + this.selectedPat.ShortName + `
Hospital No: `+ '[' + this.selectedPat.PatientCode + ']';
    //this.patientQRCodeInfo = "Hospital No.: MNK154255, Allergy: Cfskushdfaj, Address: samakhusi 11, kathmandu";
    this.showQrCode = true;

    if (this.selectedPat.PatientId) {
      this.LoadProfilePic();
      this.LoadHealthCardStatus();
    }
  }

  Close() {
    this.showCard = false;
  }

  LoadProfilePic() {
    this.http.get<any>("/api/patient?reqType=profile-pic&patientId=" + this.selectedPat.PatientId)
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        console.log(res);
        let fileInfo = res.Results;
        if (fileInfo) {
          this.profilePic = fileInfo.FileBase64String;
        }
      });
  }

  print() {
    //If patient card was already printed, we've to give an warning whether or not user wants to print that again.
    //also if User wants to print a Card for Unpaid Bill then also we've to give warning..
    let printAgain: boolean = true;//default value is true.
    if (this.patHealthCardStatus && this.patHealthCardStatus.IsPrinted) {
      let msg_alreadyPrinted = "NOTE ! Health card for this patient is already printed on " + moment(this.patHealthCardStatus.PrintedOn).format('YYYY-MM-DD');
      msg_alreadyPrinted += "  Do you want to print again ?";
      printAgain = window.confirm(msg_alreadyPrinted);
    }
    else if (this.patHealthCardStatus && this.patHealthCardStatus.BillStatus != 'paid') {
      let msg_unpaid = "NOTE ! Payment is not made for Health Card. Do you want to print anyway ?";
      printAgain = window.confirm(msg_unpaid);
    }

    //if user has selected on YES on confirmation window, then go ahead and print again..
    if (printAgain) {
      this.PostHealthCardInfoToDB();

      //below code gets content of html into a canvas (using: html2canvas) and appends to a existing div id="idPrint"
      //Check in html for actual placement of these elements.

      html2canvas(document.querySelector("#frontSide")).then(canvas => {
        document.getElementById("frontSide").style.display = 'block';
        var image = canvas.toDataURL("image/png");
        var elem = document.createElement("img");
        elem.setAttribute("src", image);
        elem.setAttribute("alt", "IdPrint of  Patient");
        elem.setAttribute('style', 'filter:brightness(150%)');
        //append 
        document.getElementById("idPrint").appendChild(elem);
        this.printImage();
      });


    }



  }

  public printImage() {
    let popupWinindow;
    var printContents = document.getElementById("idPrint").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanpheStyle.css" /><style>@media print { @page { size: 270mm 150mm; margin-bottom: -75mm; } }</style></head><body  onload="window.print()">' + printContents + '</body></html>');
    popupWinindow.document.close();
    this.showCard = false;
    document.getElementById("frontSide").style.display = "none";
  }



  //Anish: 8 Dec, 2018
  //Used if we want to print all the frontside of the Card from our system
  public printWholeFrontSide() {
    //If patient card was already printed, we've to give an warning whether or not user wants to print that again.
    //also if User wants to print a Card for Unpaid Bill then also we've to give warning..
    let printAgain: boolean = true;//default value is true.
    if (this.patHealthCardStatus && this.patHealthCardStatus.IsPrinted) {
      let msg_alreadyPrinted = "NOTE ! Health card for this patient is already printed on " + moment(this.patHealthCardStatus.PrintedOn).format('YYYY-MM-DD');
      msg_alreadyPrinted += "  Do you want to print again ?";
      printAgain = window.confirm(msg_alreadyPrinted);
    }
    else if (this.patHealthCardStatus && this.patHealthCardStatus.BillStatus != 'paid') {
      let msg_unpaid = "NOTE ! Payment is not made for Health Card. Do you want to print anyway ?";
      printAgain = window.confirm(msg_unpaid);
    }

    //if user has selected on YES on confirmation window, then go ahead and print again..
    if (printAgain) {
      this.PostHealthCardInfoToDB();

      //below code gets content of html into a canvas (using: html2canvas) and appends to a existing div id="idPrint"
      //Check in html for actual placement of these elements.
      let popupWinindow;
      var printContents = document.getElementById("cardFrontside").innerHTML;
      popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
      popupWinindow.document.open();
      popupWinindow.document.write(`<html><head><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanpheStyle.css" />`
        + `<link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanphePrintStyle.css" />`
        + `<style>@media print { @page { size: 258mm 162.29mm; padding: 0; margin: 0; color: #fff; } } .sngl-row{padding: 15px 0px;} .allwith-bg {font-size: 40px; line-height: 30px;color: #000;white-space: nowrap;} .parm-nam{color: #000;} .card-background{position: relative !important; overflow:hidden;}</style>`
        + `</head><body style="margin: 0 !important;"  onload="window.print()">`
        + printContents
        + `</body></html>`);
      popupWinindow.document.close();
      this.showCard = false;
      document.getElementById("frontSide").style.display = "none";

    }



  }


  //sud: 19Aug'18
  //public brightnessRange: string = "200%";
  //getfilters() {
  //    let filters = this._sanitizer.bypassSecurityTrustStyle('brightness(' + this.brightnessRange + ')');
  //    return filters;
  //}

  PostHealthCardInfoToDB() {
    if (this.postHealthCard) {
      this.AssignHealthCardInfo();
      let data = JSON.stringify(this.curHealthCard);
      this.http.post<any>("/api/Patient?reqType=postHealthCard", data)
        .map(res => res)
        .subscribe(res => {
          if (res.Status == "OK") {
            //this.msgBoxServ.showMessage('Success', ["Successfully Added HealthCard Details."])
          }
          else {
            //
            console.log(res.ErrorMessage);
          }
        });
    }

  }

  AssignHealthCardInfo() {
    this.curHealthCard.PatientId = this.selectedPat.PatientId;
    this.curHealthCard.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    this.curHealthCard.BillingDate = this.patHealthCardStatus != null ? this.patHealthCardStatus.BillingDate : "";
    let jsonObj = {
      PatientCode: this.selectedPat.PatientCode,
      ShortName: this.selectedPat.ShortName,
      Gender: this.selectedPat.Gender,
      DateOfBirth: this.selectedPat.DateOfBirth,
      PhoneNumber: this.selectedPat.PhoneNumber,
      BloodGroup: this.selectedPat.BloodGroup,
      CreatedOn: this.selectedPat.CreatedOn
    };
    this.curHealthCard.InfoOnCardJSON = JSON.stringify(jsonObj);
  }

  LoadHealthCardStatus() {
    this.http.get<any>("/api/Patient?reqType=loadHealthCardStatus&patientId=" + this.selectedPat.PatientId)
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results != null) {
          this.patHealthCardStatus = res.Results;
          this.showAdditionalInfo = true;
          this.postHealthCard = this.patHealthCardStatus.IsPrinted ? false : true;
        }
        else if (res.Status == "OK" && res.Results == null) {
        }
      });
  }
}
