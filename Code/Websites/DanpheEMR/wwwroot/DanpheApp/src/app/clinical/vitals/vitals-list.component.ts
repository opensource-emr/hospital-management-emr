// <reference path="../../radiology/imaging/imaging-requisition-list.component.ts" />
import { Component, ChangeDetectorRef, Output, Input, EventEmitter } from "@angular/core";

import { VisitService } from "../../appointments/shared/visit.service";
import { IOAllergyVitalsBLService } from "../shared/io-allergy-vitals.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import * as moment from "moment/moment";

import { Vitals } from "../shared/vitals.model";
import { PatientService } from "../../patients/shared/patient.service";
import { CoreService } from "../../core/shared/core.service";

@Component({
  selector: "vitals-list",
  templateUrl: "../../view/clinical-view/Vitals.html", //"/ClinicalView/Vitals"
})
export class VitalsListComponent {
  public CurrentVital: Vitals = new Vitals();
  public selectedVitals: any;

  public vitals: Vitals = new Vitals();

  public vitalsList: Array<Vitals> = new Array<Vitals>();
  public painData: Array<{ BodyPart: ""; PainScale: 0 }> = [];

  public foot: number = null;
  public inch: number = null;
  //if footInch is selected then 2 input box is displayed.
  public footInchSelected: boolean = false;
  public updateButton: boolean = false;
  public selectedIndex: number = null;
  public loading: boolean = false;
  public showAddVitalBox: boolean = true;
  public painDataList: Array<any> = new Array<any>();
  public date: string = null;
  public hospitalName: string = null;
  public vitalsPrintFormat: string = null;
  public doctorsPanel: Array<any> = [];
  public heightFoot: Array<number> = [];
  public heightMeter: Array<number> = [];
  public heightCm: Array<number> = [];
  public weightkg: Array<number> = [];
  public weightPound: Array<number> = [];
  public degFarenheit: Array<number> = [];
  public degCelsius: Array<number> = [];
  public showAyurvedVitals: boolean = false;

  @Input("returnVitalsList") public returnVitalsList: boolean = false;
  @Output("vitalsEmitter") public vitalsEmitter: EventEmitter<object> = new EventEmitter<object>();

  constructor(
    public visitService: VisitService,
    public ioAllergyVitalsBLService: IOAllergyVitalsBLService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public patientService: PatientService,
    public coreService: CoreService
  ) {    
    this.painData.push({ BodyPart: "", PainScale: null });
    this.date = moment().format("YYYY-MM-DD");
    this.hospitalName = this.coreService.GetHospitalName();
    this.vitalsPrintFormat = this.coreService.GetVitalsPrintFormat();
    this.AssignDoctorsPanel();
    this.showAyurvedVitals = this.coreService.ShowAyurvedVitals();
  }

  ngOnInit() {
    this.GetPatientVitalsList();
  }

  AssignDoctorsPanel() {
    let currProviderName = this.visitService.globalVisit.ProviderName;
    let currProviderId = this.visitService.globalVisit.ProviderId;

    //Gyane Panel. 110(Sunita), 112(Padam), 140(Atit)
    if (
      currProviderName == "Dr. Sunita Pun" ||
      currProviderName == "Dr. Atit Poudel" ||
      currProviderName == "Prof. Dr. Padam Raj Pant"
    ) {
      this.doctorsPanel = [
        "Prof. Dr. Padam Raj Pant",
        "Dr. Sunita Pun",
        "Dr. Atit Poudel",
      ];
    }
    //159 Bhola Rijal , 162 Karishma Pandey
    else if (
      currProviderName == "Dr. Bhola Rijal" ||
      currProviderName == "Dr. Karishma Pandey"
    ) {
      this.doctorsPanel = ["Dr. Bhola Rijal", "Dr. Karishma Pandey"];
    } else {
      this.doctorsPanel = [this.visitService.globalVisit.ProviderName];
    }
  }

  //gets the list of vitals of the selected patient.
  GetPatientVitalsList(): void {
    let patientVisitId = this.visitService.getGlobal().PatientVisitId;
    this.ioAllergyVitalsBLService
      .GetPatientVitalsList(patientVisitId)
      .subscribe(
        (res) => {
          if (res.Status == "OK") {
            this.CallBackGetPatientVitalList(res.Results);
            if (this.returnVitalsList) {
              this.vitalsEmitter.emit({ vitalsList: res.Results});
            }
            this.changeHeight(res.Results);            
          } else {
            this.msgBoxServ.showMessage(
              "failed",
              ["Failed. please check log for details."],
              res.ErrorMessage
            );
          }
        },
        (err) => {
          this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
        }
      );
  }
  //call back funtion for get patient vitals
  CallBackGetPatientVitalList(_vitalsList) {
    //looping through the vitalsList to check if any object contains height unit as inch so that it can be converted to foot inch.
    for (var i = 0; i < _vitalsList.length; i++) {
      if (_vitalsList[i].HeightUnit && _vitalsList[i].HeightUnit == "inch") {
        //incase of footinch we're converting and storing as inch.
        //converting back for displaying in the format foot'inch''
        _vitalsList[
          i
        ].Height = this.ioAllergyVitalsBLService.ConvertInchToFootInch(
          _vitalsList[i].Height
          );
      }
      var jsonData = JSON.parse(_vitalsList[i].BodyPart);
      this.painDataList.push(jsonData);
    }
    this.vitalsList = _vitalsList;
  }

  //change given height, weight and temperature to other units
  changeHeight(data) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].HeightUnit == "cm") {
        this.heightFoot.push(data[i].Height / 30.48);
        this.heightMeter.push(data[i].Height / 100);
        this.heightCm.push(data[i].Height);
      } else if (data[i].HeightUnit == "inch") {
        this.heightFoot.push(data[i].Height);
        this.heightMeter.push(data[i].Height / 3.281);
        this.heightCm.push(data[i].Height * 2.54);
      } else if (data[i].HeightUnit == "meter") {
        this.heightFoot.push(data[i].Height * 3.281);
        this.heightMeter.push(data[i].Height);
        this.heightCm.push(data[i].Height * 100);
      }      
    }

    for (var i = 0; i < data.length; i++) {
      if (data[i].WeightUnit == "kg") {
        this.weightPound.push(data[i].Weight * 2.205);
        this.weightkg.push(data[i].Weight);
      }
      if (data[i].WeightUnit == "lbs") {
        this.weightkg.push(data[i].Weight / 2.205);
        this.weightPound.push(data[i].Weight);
      }
    }

    for (var i = 0; i < data.length; i++) {
      if (data[i].TemperatureUnit == "F") {
        this.degFarenheit.push(data[i].Temperature);
        this.degCelsius.push((data[i].Temperature - 32) *(5/9));
      } if (data[i].TemperatureUnit == "C") {
        this.degFarenheit.push((data[i].Temperature)* (9/5) + 32);
        this.degCelsius.push(data[i].Temperature);
      }
    }
  }

  //enables the update button and assigns the selected vitals object to the CurrentVital object.
  public Edit(selectedVitals, selIndex: number) {
    this.selectedVitals = null;
    this.selectedIndex = selIndex;
    this.showAddVitalBox = false;
    this.changeDetector.detectChanges();
    this.selectedVitals = selectedVitals;

    if (!this.selectedVitals.TemperatureUnit) {
      this.selectedVitals.TemperatureUnit = "F";
    }
    if (!this.selectedVitals.HeightUnit) {
      this.selectedVitals.HeightUnit = "cm";
    }
    if (!this.selectedVitals.WeightUnit) {
      this.selectedVitals.WeightUnit = "kg";
    }

    this.showAddVitalBox = true;
  }

  Print(selectedVital) {
    this.vitals = null;
    //this.changeDetector.detectChanges();
    this.vitals = selectedVital;

    if (this.vitals.BodyPart) {
      var painDetail = JSON.parse(this.vitals.BodyPart);
      if (painDetail) {
        this.vitals.PainScale = painDetail[0].PainScale;
      }
    }
    this.changeDetector.detectChanges();
    this.showPrintScreen();
  }

  showPrintScreen() {
    let popupWinindow;
    var printContents = document.getElementById("vitalsPrintpage").innerHTML;
    popupWinindow = window.open(
      "",
      "_blank",
      "width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no"
    );
    popupWinindow.document.open();
    popupWinindow.document.write(
      '<html><head><link href="../../assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" /><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' +
        printContents +
        "</body></html>"
    );
    popupWinindow.document.close();
  }

  AddVitalBox() {
    this.showAddVitalBox = false;
    this.selectedVitals = null;
    this.changeDetector.detectChanges();
    this.showAddVitalBox = true;
  }

  CallBackAdd($event) {
    if ($event.submit) {
      if (this.selectedIndex || this.selectedIndex == 0) {
        if ($event.vitals.HeightUnit == "inch") {
          //incase of footinch we're converting and storing as inch.
          //converting back for displaying in the format foot'inch''
          $event.vitals.HeightUnit == "footinch";
          $event.vitals.Height = this.ioAllergyVitalsBLService.ConvertInchToFootInch(
            $event.vitals.Height
          );
        }
        if (this.selectedIndex != null) {
          this.vitalsList.splice(this.selectedIndex, 1);
          this.vitalsList.splice(this.selectedIndex, 0, $event.vitals);
          this.vitalsList.slice();
        }

        var pData = JSON.parse($event.vitals.BodyPart);

        if (pData) {
          this.painDataList.splice(this.selectedIndex, 1);
          this.painDataList.splice(this.selectedIndex, 0, pData);
          this.painDataList.slice();
        }

        this.CurrentVital.BodyPart = JSON.stringify(pData);

        this.selectedIndex = null;
      } else {
        var jsonData = JSON.parse($event.vitals.BodyPart);
        this.painDataList.push(jsonData);
        if ($event.vitals.HeightUnit == "inch") {
          //incase of footinch we're converting and storing as inch.
          //converting back for displaying in the format foot'inch''
          $event.vitals.Height = this.ioAllergyVitalsBLService.ConvertInchToFootInch(
            $event.vitals.Height
          );
        }
        if (this.returnVitalsList) {
          let arr = [];
          arr.push($event.vitals);
          this.vitalsEmitter.emit({ vitalsList: arr });;
        }
        this.vitalsList.push($event.vitals);
        this.changeHeight(this.vitalsList);
        this.selectedIndex = null;
      }
    } else {
      this.showAddVitalBox = false;
    }
  }
}
