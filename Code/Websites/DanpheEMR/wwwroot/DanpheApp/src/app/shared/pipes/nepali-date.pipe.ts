import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment/moment';
import { CoreService } from '../../core/shared/core.service';
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";

@Pipe({
  name: 'nepaliDate'
})
export class NepaliDatePipe implements PipeTransform {
  private EnableEnglishCalendarOnly: boolean = false;

  constructor(public nepaliCalendarServ: NepaliCalendarService, private _coreService: CoreService) {
    this.GetCalendarParameter();
  }
  GetCalendarParameter(): void {
    const param = this._coreService.Parameters.find(p => p.ParameterGroupName === "Common" && p.ParameterName === "EnableEnglishCalendarOnly");
    if (param && param.ParameterValue) {
      const paramValue = JSON.parse(param.ParameterValue);
      this.EnableEnglishCalendarOnly = paramValue;
    }
  }
  transform(value: any, actionName: string, actionValue: string): string {
    //! Krishna, 26thSept'23, Return empty string straight away, if EnglishCalendarOnly is enabled. else perform other logic
    if (this.EnableEnglishCalendarOnly) {
      return "";
    }
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
        // return npDate;
        return `(${npDate})`;
      }
      else {
        let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(value);
        // return npDate + " BS";
        return `(${npDate} BS)`;
      }
    }
    else if (actionName == "format") {
      //return this.nepaliCalendarServ.ConvertEngToNepaliFormatted(value, actionValue);
      let npDate = this.nepaliCalendarServ.ConvertEngToNepaliFormatted(value, actionValue);
      return `(${npDate})`;
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
