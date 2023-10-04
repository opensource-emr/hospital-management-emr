import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment/moment';
import { CommonFunctions } from '../common.functions';

@Pipe({
    name: 'DanpheDateTime'
})
export class DanpheDateTime {
    ///USAGE EXAMPLE: in below example 'createdOn' is datetime property of any module.
    // createdOn | DanpheDateTime:'age' 
    // createdOn | DanpheDateTime:'format':'YYYY-MM-DD'
    //add other examples later on..

    //actionname like: format or diff (for date difference with today)
    transform(value: string, actionName: string, actionValue: string): string {
        if (value) {
            if (actionName == "format") {
                return moment(value).format(actionValue);
            }
            else if (actionName == "age") {
                return CommonFunctions.GetFormattedAge(value);
            }
            else if (actionName == "datename") {
                let currDate = moment().format('YYYY-MM-DD');
                let diff = moment(currDate).diff(moment(value).format('YYYY-MM-DD'), 'days').toString();

                if (parseInt(diff) == 0) {
                    return "today";
                }
                else if (parseInt(diff) == 1) {
                    return "yesterday";
                }
                else {
                    return moment(value).format(actionValue);
                }

            }
            else if (actionName == "timename") {
                let currDate = moment();
                let diff = moment(currDate).diff(moment(value).format('YYYY-MM-DD'), 'days').toString();


                let totDays = moment(currDate).diff(moment(value), 'days');
                let totHrs = moment(currDate).diff(moment(value), 'hours');
                let totMins = moment(currDate).diff(moment(value), 'minutes');
                //show years if it's above 3.
                if (totDays > 0) {
                    return totDays.toString() + ' days ago';
                }
                //show days for less than 1 month. 
                else if (totHrs > 0) {
                    return totHrs.toString() + ' hrs ago';
                }
                else if (totMins > 3) {
                    return totMins.toString() + ' mins ago';
                }
                else if (totMins <= 3 && totMins > -1) {
                    return 'just now';
                }
                //else {
                //    return 'future date';
                //}


            }

            else if (actionName == "diff") {
                if (actionValue == "year") {
                    let currDate = moment().format('YYYY-MM-DD');
                    //adding 1 to the year to avoid 0, but this would be incorrect for patients more than 2-3 years old.
                    //check for another option..--sudarshan 28feb'17
                    return (moment(currDate).diff(moment(value).format('YYYY-MM-DD'), 'year') + 1).toString();
                }
                else if (actionValue == "month") {
                    let currDate = moment().format('YYYY-MM-DD');
                    return moment(currDate).diff(moment(value).format('YYYY-MM-DD'), 'month').toString();
                }
                else if (actionValue == "day") {
                    let currDate = moment().format('YYYY-MM-DD');
                    return moment(currDate).diff(moment(value).format('YYYY-MM-DD'), 'days').toString();
                }

            }
            //added: ashim : 25Aug2018 : VisitTime was not formatted with only format pipe.
            else if (actionName == "format-time") {
                return moment(value, "hhmm").format('hh:mm A');
            }
        }
        else {
            return "";
        }
    }
} 