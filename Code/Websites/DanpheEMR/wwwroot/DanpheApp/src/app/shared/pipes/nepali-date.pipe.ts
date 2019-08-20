import { Pipe, PipeTransform } from '@angular/core';
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";

@Pipe({
    name: 'nepaliDate'
})
export class NepaliDatePipe implements PipeTransform {

    constructor(public nepaliCalendarServ: NepaliCalendarService) { }

    transform(value: any, actionName: string, actionValue: string): string {
        if (value) {
            let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(value);
            return npDate + " BS";
        }
        else if (actionName == "format") {
            return this.nepaliCalendarServ.ConvertEngToNepaliFormatted(value, actionValue);
        }
        else {
            return "";
        }
    }

}
