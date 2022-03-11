import { Injectable, Directive } from '@angular/core';
import { Patient } from "./patient.model";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Guarantor } from "../shared/guarantor.model";

import * as moment from 'moment/moment';
import { NepaliCalendarService } from '../../shared/calendar/np/nepali-calendar.service';
import { InsuranceVM } from '../../billing/shared/patient-billing-context-vm';
@Injectable()
export class PatientService {

  public Insurance: InsuranceVM;
  constructor(public router: Router,
    public npCalendarService: NepaliCalendarService) { }

  globalPatient: Patient = new Patient();
  public CreateNewGlobal(): Patient {
    this.globalPatient = new Patient();
    return this.globalPatient;
  }
  public getGlobal(): Patient {
    return this.globalPatient;
  }
  //sud: 3sept: we've to calculate dob even when age is zero.
  public CalculateDOB(age: number, ageUnit: string) {
    var curDate = new Date();
    if ((age || age == 0) && ageUnit) {
      if (ageUnit == 'Y') {
        //Dharam: I removed 1 from the month because ...
        //because the moment was adding 1 to the give value of month..so the output for month was feb
        // i gave 0 to the month ..then it working properly now ....output jan month

        //return moment({ months: 0, days: 1 }).subtract(age, 'year').format("YYYY-MM-DD");

        //---Pratik: while calculating DOB only changing year not the month and days----Jira story [EMR-656]
        return moment({ months: curDate.getMonth(), days: curDate.getDate() }).subtract(age, 'year').format("YYYY-MM-DD");
      }
      else if (ageUnit == 'M') {
        //return moment({ days: 1 }).subtract(age, 'months').format("YYYY-MM-DD");
        return moment({ days: curDate.getDate() }).subtract(age, 'months').format("YYYY-MM-DD");
      }
      else if (ageUnit == 'D') {
        return moment().subtract(age, 'days').format("YYYY-MM-DD");
      }
    }
  }

  setGlobal(currPatient: Patient) {

    var pat = this.getGlobal();
    // var pat = this.patientService.getGlobal();
    pat.ShortName = currPatient.ShortName;
    pat.PatientId = currPatient.PatientId;
    pat.PatientCode = currPatient.PatientCode;
    pat.EMPI = currPatient.EMPI;
    pat.FirstName = currPatient.FirstName;
    pat.LastName = currPatient.LastName;
    pat.MiddleName = currPatient.MiddleName;
    pat.DateOfBirth = moment(currPatient.DateOfBirth).format('YYYY-MM-DD');
    pat.CountrySubDivisionId = currPatient.CountrySubDivisionId;
    pat.CountrySubDivisionName = currPatient.CountrySubDivisionName;
    pat.WardName = currPatient.WardName;
    pat.BedNo = currPatient.BedNo;
    pat.Gender = currPatient.Gender;
    pat.CountryName = currPatient.CountryName;
    pat.PreviousLastName = currPatient.PreviousLastName;
    pat.Race = currPatient.Race;
    pat.Email = currPatient.Email;
    pat.MaritalStatus = currPatient.MaritalStatus;
    pat.PhoneNumber = currPatient.PhoneNumber;
    pat.EmployerInfo = currPatient.EmployerInfo;
    pat.PhoneAcceptsText = currPatient.PhoneAcceptsText;//change the client side naming: sudarshan 13Dec'16
    pat.IDCardNumber = currPatient.IDCardNumber;
    pat.Occupation = currPatient.Occupation;
    pat.EthnicGroup = currPatient.EthnicGroup;
    pat.BloodGroup = currPatient.BloodGroup;
    pat.Salutation = currPatient.Salutation;
    pat.CountryId = currPatient.CountryId;
    pat.IsDobVerified = currPatient.IsDobVerified;
    pat.Age = currPatient.Age;
    pat.MembershipTypeId = currPatient.MembershipTypeId;
    pat.MembershipTypeName = currPatient.MembershipTypeName;
    pat.MembershipDiscountPercent = currPatient.MembershipDiscountPercent;
    pat.PatientNameLocal = currPatient.PatientNameLocal;
    pat.IsDialysis = currPatient.IsDialysis;
    pat.DialysisCode = currPatient.DialysisCode; //sanjit: for IsDialysis flag to be check
    //mapping array of current object to the global instance...because of one to many relation
    pat.Addresses = currPatient.Addresses;
    pat.Insurances = currPatient.Insurances;
    pat.KinEmergencyContacts = currPatient.KinEmergencyContacts;

    pat.Address = currPatient.Address;
    pat.PANNumber = currPatient.PANNumber;
    pat.Admissions = currPatient.Admissions;
    pat.IsOutdoorPat = currPatient.IsOutdoorPat;
    pat.Allergies = currPatient.Allergies;
    pat.MunicipalityId = currPatient.MunicipalityId;
    pat.MunicipalityName = currPatient.MunicipalityName;
    //guarantor is having a lot of problems.. neet to check them carefully--sudarshan:5May'17
    if (currPatient.Guarantor != null && currPatient.Guarantor.GuarantorName != null) {

      pat.Guarantor = Object.assign(new Guarantor(), currPatient.Guarantor);
      pat.Guarantor.GuarantorDateOfBirth = currPatient.Guarantor.GuarantorDateOfBirth ? moment(currPatient.Guarantor.GuarantorDateOfBirth).format('YYYY-MM-DD') : null;

    }
    else if (currPatient.Guarantor != null && currPatient.Guarantor.GuarantorSelf == true) {
      pat.Guarantor = Object.assign(new Guarantor(), currPatient.Guarantor);
    }
    else {
      pat.Guarantor = new Guarantor();
    }


    pat.WardName = currPatient.WardName;

  }
  //ashim: 22Aug2018
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
  //ashim: 22Aug2018
  GetEnglishFromNepaliDate(nepaliDate) {
    if (nepaliDate) {
      let engDate = this.npCalendarService.ConvertNepToEngDate(nepaliDate);
      return moment(engDate).format("YYYY-MM-DD");;
    }

  }
  //ashim: 22Aug2018
  GetNepaliFromEngDate(engDate) {
    if (engDate) {
      return this.npCalendarService.ConvertEngToNepDate(engDate);
    }
  }
  //ashim: 22Aug2018
  GetDefaultNepaliDOB() {
    return this.npCalendarService.GetTodaysNepDate();
  }

}
