import { Injectable } from "@angular/core";
import * as moment from "moment";
import { Patient } from "../../patients/shared/patient.model";
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";

@Injectable()

export class MaternityService {
  public patientData:Patient= new Patient();
  public TypeOfDelivery: Array<TypeOfDeliveryModel> = [
    {
      Id: 1,
      Type: "Normal/Spontaneous"
    },
    {
      Id: 2,
      Type: "Vacuum"
    },
    {
      Id: 3,
      Type: "Forceps"
    },
    {
      Id: 4,
      Type: "C-Section"
    }
  ]

  public Complication: Array<ComplicationModel> = [
    {
      Id: 1,
      ComplicationType: "Ectopic Pregnancy"
    },
    {
      Id: 2,
      ComplicationType: "Abortion Complications"
    },
    {
      Id: 3,
      ComplicationType: "Pregnancy induced hypertension"
    },
    {
      Id: 4,
      ComplicationType: "Severe/Pre-eclampsia"
    },
    {
      Id: 5,
      ComplicationType: "Eclampsia"
    },
    {
      Id: 6,
      ComplicationType: "Hyperemesis"
    },
    {
      Id: 7,
      ComplicationType: "Grivadarum"
    },
    {
      Id: 8,
      ComplicationType: "Antepartum haemorrhage"
    },
    {
      Id: 9,
      ComplicationType: "Prolonged Labour"
    },
    {
      Id: 10,
      ComplicationType: "Obstructed Labor"
    },
    {
      Id: 11,
      ComplicationType: "Ruptured uterus"
    },
    {
      Id: 12,
      ComplicationType: "Postpartum Haemorrhage"
    },
    {
      Id: 13,
      ComplicationType: "Retained placenta"
    },
    {
      Id: 14,
      ComplicationType: "Pueperal sepsis"
    },
    {
      Id: 15,
      ComplicationType: "Others"
    }
  ]

  constructor(public npCalendarService: NepaliCalendarService) { }
  public CalculateDOB(age: number, ageUnit: string) {
    var curDate = new Date();
    if ((age || age == 0) && ageUnit) {
      if (ageUnit == 'Y') {
        return moment({ months: curDate.getMonth(), days: curDate.getDate() }).subtract(age, 'year').format("YYYY-MM-DD");
      }
      else if (ageUnit == 'M') {
        return moment({ days: curDate.getDate() }).subtract(age, 'months').format("YYYY-MM-DD");
      }
      else if (ageUnit == 'D') {
        return moment().subtract(age, 'days').format("YYYY-MM-DD");
      }
    }
  }

  public SeperateAgeAndUnit(age: string): { Age: string, Unit: string } {
    if (age) {
      var length: number = age.length;
      if (length >= 0) {
        return {
          Age: age.slice(0, length - 1), Unit: age.slice(length - 1, length)
        }
      }
    }
  }

  public SetPatientForPayment(data:Patient){
    this.patientData = data;
  }

  public GetPatientForPayment() {
    return this.patientData;
  }
}

export class TypeOfDeliveryModel {
  Id: number = 0;
  Type: string = null;
}

export class ComplicationModel{
  Id: number = 0;
  ComplicationType: string = null;
}