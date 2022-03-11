import { Injectable } from "@angular/core";
import * as moment from "moment";
import { CoreService } from "../../core/shared/core.service";
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";

@Injectable()
export class VaccinationService {

  constructor(public npCalendarService: NepaliCalendarService, public coreService: CoreService) {

  }

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
        return moment().subtract(age-1, 'days').format("YYYY-MM-DD");
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

  static GetFormattedAge(dateOfBirth): string {
    let currentDate = moment().format('YYYY-MM-DD');
    let years = moment(currentDate).diff(moment(dateOfBirth).format('YYYY-MM-DD'), 'years');
    let totMonths = moment(currentDate).diff(moment(dateOfBirth).format('YYYY-MM-DD'), 'months');
    let totDays = moment(currentDate).diff(moment(dateOfBirth).format('YYYY-MM-DD'), 'days')+1;
    //show years if it's above 1.
    if (years >= 1) {
      return years.toString() + ' Y';
    }
    //show days for less than 1 month. 
    else if (totMonths < 1) {
      if (Number(totDays) == 0)
        totDays = 1;
      return totDays.toString() + ' D';
    }
    //else show only months for 1 to 35 months (other cases are checked in above conditions).
    else {
      return totMonths.toString() + ' M';
    }

  }
  
}
