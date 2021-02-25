import { Pipe, PipeTransform } from '@angular/core';
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";

@Pipe({
  name: 'nepaliDate'
})
export class NepaliDatePipe implements PipeTransform {

  constructor(public nepaliCalendarServ: NepaliCalendarService) { }

  transform(value: any, actionName: string, actionValue: string): string {
      if (value) {
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
