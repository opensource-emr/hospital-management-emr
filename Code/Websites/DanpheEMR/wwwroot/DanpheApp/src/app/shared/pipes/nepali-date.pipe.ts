import { Pipe, PipeTransform } from '@angular/core';
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import * as moment from 'moment/moment';

@Pipe({
  name: 'nepaliDate'
})
export class NepaliDatePipe implements PipeTransform {

  constructor(public nepaliCalendarServ: NepaliCalendarService) { }

  transform(value: any, actionName: string, actionValue: string): string {
    if (value) {
       
      //Sud/Krishna:8Feb'23-- If the input datevalue can't be parsed by Moment function then return Invalid right away.
      let dateValue = moment(value).toObject();
      if (isNaN(dateValue.date)) {
        return "Invalid Date";
      }

      //let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(value);
      //return npDate + " BS";
      if (actionName == "format") {
        let npDate = this.nepaliCalendarServ.ConvertEngToNepaliFormatted(value, actionValue);
        return npDate;
      }
      else {
        let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(value);
        return npDate + " BS";
      }
    }
    else if (actionName == "format") {
      return this.nepaliCalendarServ.ConvertEngToNepaliFormatted(value, actionValue);
    }
    else {
      return "";
    }
  }


  //transform(value: any, actionName: string, actionValue: string): string {
  //  if (value) {
  //    if (actionName == "format") {
  //      let npDate = this.nepaliCalendarServ.ConvertEngToNepaliFormatted(value, actionValue);
  //      return npDate;
  //    }
  //    else {
  //      let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(value);
  //      return npDate + " BS";
  //    }

  //  }
  //  else if (actionName == "format") {
  //    return this.nepaliCalendarServ.ConvertEngToNepaliFormatted(value, actionValue);
  //  }
  //  else {
  //    return "";
  //  }
  //}

}
