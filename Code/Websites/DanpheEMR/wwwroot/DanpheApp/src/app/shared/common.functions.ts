import * as moment from 'moment/moment';
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { NepaliCalendarService } from './calendar/np/nepali-calendar.service';
import { CoreService } from "../core/shared/core.service";


//common functions are groupped in this class. 
//all functions should be static and shouldn't require to instantiate or injected.
export class CommonFunctions {
    constructor(public npCalendarService: NepaliCalendarService,
        public CoreService: CoreService) {

    }
    //format's the age according to our requirement.
    //sample output formats: 21 D/F, 3 Y/M, 19 M/M, 24 Y/F, etc..
    //logic: show days(D) for less than month, months(M) for less than 3 Years.
    //       show years (Y) for above 3 years.
    // take the lower bound if month or year is not completed yet. ( don't show two date names eg: 1 M 23 D , 4Y 3M,.. ) 
    //notable cases: i. 59 days will still remain to be 1 M ii. 3yr-365days will be: 3 Y 
    public getcheckouttimeparameter(): string {
        let checkouttimeparameter = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "CheckoutTime");
        return checkouttimeparameter.ParameterValue;
    }

    static GetFormattedAge(dateOfBirth): string {
        let currentDate = moment().format('YYYY-MM-DD');
        let years = moment(currentDate).diff(moment(dateOfBirth).format('YYYY-MM-DD'), 'years');
        let totMonths = moment(currentDate).diff(moment(dateOfBirth).format('YYYY-MM-DD'), 'months');
        let totDays = moment(currentDate).diff(moment(dateOfBirth).format('YYYY-MM-DD'), 'days');
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

    //return format: 3 Y/M, 19 M/M, 24 Y/F, etc.. check above function 'GetFormattedAge' for age format . 
    static GetFormattedAgeSex(dateOfBirth: string, gender: string) {
        let age = CommonFunctions.GetFormattedAge(dateOfBirth);
        let ageSex = age + "/" + gender.charAt(0).toUpperCase();
        return ageSex;
    }
    static GetFormattedSex(gender: string) {
        return gender.charAt(0).toUpperCase();
    }
    static GetFullName(firstName: string, middleName: string, lastName: string): string {
        if (middleName)
            return firstName + " " + middleName + " " + lastName;
        else
            return firstName + " " + lastName;
    }

    //Return proper floating number with 2 fraction number
    static parseAmount(inputVal): any {
        if (inputVal) {
            let z = isNaN(inputVal) ? 0 : ((inputVal - Math.floor(inputVal)) != 0) ? inputVal.toFixed(2) : inputVal.toFixed();
            //changed > 0.9 to 0.98 to accomodate minimal difference in calculation.
            //earlier we were rounding off 0.9 to 1, now we're rounding off >0.985 to 1.. 
            //this gives us better precision..
            if ((z - Math.floor(z)) > 0.98) { z = inputVal.toFixed() }
            return parseFloat(z);
        } else { return 0; }
    }
    //Return proper floating number with 2 fraction number
    static parsePhrmAmount(inputVal): any {
        if (inputVal) {
            let z = isNaN(inputVal) ? 0 : ((inputVal - Math.floor(inputVal)) != 0) ? inputVal.toFixed(3) : inputVal.toFixed();
            //changed > 0.9 to 0.98 to accomodate minimal difference in calculation.
            //earlier we were rounding off 0.9 to 1, now we're rounding off >0.985 to 1.. 
            //this gives us better precision..
            if ((z - Math.floor(z)) > 0.998) { z = inputVal.toFixed() }
            return parseFloat(z);
        } else { return 0; }
    }
    //this is to parse final amount of pharmacy sale ang purchase
    static parseFinalAmount(inputVal): any {
        if (inputVal) {
            let z = isNaN(inputVal) ? 0 : ((inputVal - Math.floor(inputVal)) != 0) ? inputVal.toFixed(0) : inputVal.toFixed();
            //changed > 0.9 to 0.98 to accomodate minimal difference in calculation.
            //earlier we were rounding off 0.9 to 1, now we're rounding off >0.985 to 1.. 
            //this gives us better precision..
            if ((z - Math.floor(z)) > 0.9) { z = inputVal.toFixed() }
            return parseFloat(z);
        } else { return 0; }
    }
    //Logic for calculation (HAMS)
    //Day count is updated at 00:00.
    //default Checkout Time is 12:00 noon. (it's parameterized)
    //If checkout Time is > 12:00 noon, increment day count by 1.
    //No hourly charge.

    //Scenario 1 (Checkout after checkout time i.e 12:00 noon)
    //Admit: 2019-01-14 11: 00 PM
    //Discharge: 2019-01-15 02: 00 PM
    //Total Days: 2 days

    //Scenario 2 (Checkout before checkout time i.e 12:00 noon)
    //Discharge: 2019-01-15 11: 59 AM
    //Total Days: 1 day
    static calculateADTBedDuration(inDate, ipCheckoutDate, checkouttimeparameter = "00:00"): { days: number, hours: number, checkouttimeparameter: string } {

        let checkoutDate = ipCheckoutDate;//copying parameter value into local variable.
        //first separate hour and minute from checkoutTimeParameter.
        let chkOutTimeValues: Array<string> = checkouttimeparameter.split(':');//checkouttime paramter comes in HH:mm string format. eg: 13:00
        //expected format of chkOutTimeValues = ["13","00"] -- 0th index is hours and 1st index minutes.
        let chkOutHour = parseInt(chkOutTimeValues[0]);//hour value comes in 0th index.
        let chkOutMinute = chkOutTimeValues.length>1 ? parseInt(chkOutTimeValues[1]) : 0;//minute value  comes in 2nd position if not default 0 minute.

        if (!checkoutDate)
            checkoutDate = moment(new Date);

        //Checking empty value for minute
       // checkoutDate= moment(checkoutDate).minute() != 0 ? (moment(checkoutDate).minute()) : (moment(chkOutMinute).minute());

        //checkout time is 12 noon. adding 15 minutes margin time
        //if (moment(checkoutDate).hour() >= checkouttimeparameter && moment(checkoutDate).minute() > checkouttimeparameter) {
        if ((moment(checkoutDate).hour() > chkOutHour) || (moment(checkoutDate).hour() == chkOutHour && moment(checkoutDate).minute() > chkOutMinute))
        {
            //sud: when checkouttimeparameter is only in hours then we have to take greater than or equals as new day.
            checkoutDate = moment(checkoutDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm');
        }
        else {
            checkoutDate = moment(checkoutDate).subtract(1, 'days').set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm');
        }
        //start calculation from start of the day i.e end of the previous day.
        var checkinDate = moment(inDate).subtract(1, 'days').set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm');

        //var duration = moment.duration(moment(checkoutDate).diff(moment(checkinDate)));
        //var totalDays = duration.days() + (duration.months() * moment(inDate, 'YYYY-MM').daysInMonth());

        //sud: 10Apr'19 -- above logic is incorrect if patient stays for more than a month.
        var totalDays = moment(checkoutDate).diff(moment(checkinDate),'days');

        return { days: totalDays, hours: 0, checkouttimeparameter };
    }

    //parameterize this logic ASAP.
    //Logic for calculation (Manakamana) 
    //- After 12PM, 2nd day starts,
    //- If hour is >12 = day 1,
    //- else hour wise billing.
    // Example: Indate : 2017-08-05 15:50 OutDate: 2017-08-07 12:00 = No of Days = 1
    //        : Indate : 2017-08-05 15:50 OutDate: 2017-08-07 15:00 = No of Days = 1 + 3hours
    //static calculateADTBedDuration(inDate, outDate): { days: number, hours: number } {
    //    if (!outDate)
    //        outDate = moment(new Date).format('YYYY-MM-DD HH:mm');

    //    var durationDays = moment.duration(moment(outDate).diff(moment(inDate)));
    //    var hours = durationDays.hours() + (durationDays.minutes() > 30 ? 1 : 0);

    //    //if days is more than 0 then calculation of 2nd day should start from 12:00PM;
    //    if (durationDays.days() > 0 || hours > 12 || durationDays.months() > 0) {
    //        var endDateTime = moment(moment(outDate).format('YYYY-MM-DD') + ' ' + '12:00');

    //        durationDays = moment.duration(moment(endDateTime).diff(moment(inDate)));
    //        //calculate number of hours after 12:00PM
    //        var durationHrMins = moment.duration(moment(outDate).diff(moment(endDateTime)));
    //        hours = durationHrMins.hours() + (durationHrMins.minutes() >= 30 ? 1 : 0);
    //    }
    //    var days = durationDays.days() + (durationDays.hours() > 12 ? 1 : 0) + (durationDays.months() * moment(inDate, 'YYYY-MM').daysInMonth());
    //    return { days: days, hours: hours > 0 ? hours : 0 };
    //}


    static findDateTimeDifference(date1, date2): number {
        return moment(date1).diff(moment(date2));

    }

    //sud: 17Sept:  <Extend this function for other special characters if required>
    //this functions encodes the request string so that it is understood by HTTP.
    //for eg: plus '+' character is replaced by '%2B'
    static EncodeRequestDataString(inputString: string): string {
        let retString = null;
        if (inputString) {
            //uses regegular expression to replace + with %2B. Normal string.replace was working only for first occurance.
            retString = inputString.replace(/\+/g, "%2B");
        }
        return retString;
    }

    static GetUniqueItemsFromArray(inputArr: any[]) {
        //var items = [4, 5, 4, 6, 3, 4, 5, 2, 23, 1, 4, 4, 4]
        //below code works only for es6, we might need other solution.
        var uniqueItems = Array.from(new Set(inputArr));
        return uniqueItems;
    }

    static HasDuplicatesInArray(inputArr: any[]) {
        //if unique size of unique array is not equals to input array then it most have duplicate values.
        return (new Set(inputArr)).size !== inputArr.length;

    }

    //concatenate samplecode for pending lab results GRID eg: 171214-1
    //ashim: 09Sep2018 : Sample Code formatting is done in controller.
    //static ConcatenateSampleCode(date, sampleCode) {
    //    let sampleDate = moment(date).format('YYMMDD');
    //    let newsamplecode = sampleDate + "-" + sampleCode;
    //    return newsamplecode
    //}

    //this function will give array of dates between two given dates with day filter option
    static getDateArrayFiltered(obj) {
        var start = obj.startDate.clone();
        var end = obj.endDate.clone();
        var res = [];
        while (start.isBefore(end)) {
            var day = start.format('dddd').toLowerCase();
            if (obj[day]) {
                let object = new Object();
                object["date"] = start.format('YYYY-MM-DD');
                object["day"] = start.format('dddd');
                object["shortDay"] = start.format('ddd');
                res.push(object);
            }
            start.add(1, 'd');
        }
        return res;
    }

    //this function will give array of dates between two given dates without day filter option
    static getDateArray(obj) {
        var start = obj.startDate.clone();
        var end = obj.endDate.clone();
        var res = [];
        while (start.isBefore(end)) {
            let object = new Object();
            object["date"] = start.format('YYYY-MM-DD');
            object["day"] = start.format('dddd');
            object["shortDay"] = start.format('ddd');
            res.push(object);
            start.add(1, 'd');
        }
        return res;
    }
    //common function for convert English to Nepali date 
    //public static ConvertEngToNepDate(engDate) {
    //  let npDate=  this.npCalendarService.ConvertEngToNepDate(engDate);
    //    return npDate;
    //}
    //public ConvertNepToEngDate(nepaliDate): string {
    //    return null;
    //}

    //public GetNepMonthLastDay(nepaliMonthName): string {
    //    return null;
    //}
    //this function returns the string with its first letter capital (eg: ramAvtar jangid -> RamAvtar jangid)
    static CapitalizeFirstLetter(str: string) {
        let text = "";
        if (str && str.length) {
            text = str.charAt(0).toUpperCase() + str.slice(1);
        }
        return text;
    }
    //sud: 29Jun'18--Returns text in between matching delimiters.
    //use regularexpression matching later on.
    static GetTextBetnDelimiters(ipString: string, delimiter1, delimiter2): string {
        //start and end will be same if only one is passed
        let startDelimiter = delimiter1;
        let endDelimiter = delimiter2 ? delimiter2 : delimiter1;
        let matchingText = null;
        let firstIndex = ipString.indexOf(startDelimiter);
        let lastIndex = ipString.lastIndexOf(endDelimiter);
        let len = lastIndex - firstIndex - 1;
        matchingText = ipString.substr(firstIndex + 1, len);
        return matchingText;
    }
    //this function makes client side Html table to excel file send all details and download excel file
    static ConvertHTMLTableToExcel(table: any, fromDate: string, toDate: string, SheetName: string, TableHeading: string, FileName: string) {
        try {
            if (table) {
                let workSheetName = (SheetName.length > 0) ? SheetName : 'Sheet';
                let PrintDate = '<b>Created Date:' + moment().format('YYYY-MM-DD') + '</b><br />'

                let dateRange = (fromDate.length > 0 && toDate.length > 0) ? '<b>Date Range:' + fromDate + ' To ' + toDate + '</b><br />' : '';

                let Heading = '<h3>' + TableHeading + '</h3>';
                let filename = (FileName.length > 0) ? FileName : 'Exported_Excel_File';
                filename = filename + '_' + moment().format('YYYYMMMDDhhss') + '.xls';

                let uri = 'data:application/vnd.ms-excel;base64,'
                    , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{PrintDate}{DateRange}{Heading}{table}</table></body></html>'
                    , base64 = function (s) { return window.btoa(decodeURIComponent(encodeURIComponent(s))) }
                    , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
                if (!table.nodeType) table = document.getElementById(table)
                var ctx = { worksheet: name || workSheetName, table: table.innerHTML, PrintDate: PrintDate, DateRange: dateRange, Heading: Heading }
                //return window.location.href = uri + base64(format(template, ctx))             
                var link = document.createElement('a');
                link.href = uri + base64(format(template, ctx));
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (ex) {
            console.log(ex);
        }
    }
    //NBB-09-dec 2018 
    //this function gets json result data and grid column 
    //and return grand total table with as per grid display column header
    //if column name not matche then it's result grand total table with dtabase table column names
    static GrandTotalTable(data, gridColList: any[]) {
        try {
            var grandTotalRow = {};
            var col = gridColList;
            if (data.length > 0) {
                var allkeys = Object.keys(data[0]);
                allkeys.forEach(colName => {
                    var colVal = data.map(a => a[colName]);
                    var Grandtotal = 0;
                    for (var i = 0; i < colVal.length; i++) {
                        if (!isNaN(colVal[i])) {  //if it's number then add or don't add it into grandtotal
                            Grandtotal += Number(colVal[i]);
                        }
                    }
                    grandTotalRow[colName] = Grandtotal;
                });
                data.push(grandTotalRow);

                var table = document.createElement("table");

                // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

                var tr = table.insertRow(-1);                   // TABLE ROW.

                for (var i = 0; i < allkeys.length; i++) {
                    var th = document.createElement("th");      // TABLE HEADER.
                    th.setAttribute("style", "font-weight:bold; ");
                    th.innerHTML = CommonFunctions.GetKeyName(allkeys[i], gridColList);// allkeys[i];
                    tr.appendChild(th);
                }

                var lastIndex = data.length - 1;
                tr = table.insertRow(-1);
                for (var j = 0; j < allkeys.length; j++) {
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerHTML = data[lastIndex][allkeys[j]];
                }
                table.setAttribute("class", "table table-striped table-hover table-responsive");
                var newdiv = document.createElement("div");
                newdiv.setAttribute("class", "table-responsive");
                newdiv.appendChild(table);
                return newdiv;
                // document.body.appendChild(newdiv);
            }
        } catch (exception) {
            console.log(exception);
        }
    }
    static GetKeyName(dbColName, gridColNameList) {
        try {
            if (gridColNameList) {
                var flag = false;
                for (var i = 0; i < gridColNameList.length; i++) {
                    if (gridColNameList[i].field === dbColName) {
                        var regX = /(<([^>]+)>)/ig;
                        var html = gridColNameList[i].headerName;
                        return html.replace(regX, "");
                    }
                }
                return dbColName;
            } else {
                return dbColName;
            }
        } catch (exception) {
            console.log(exception);
        }
    }
    //this functrion get json data and return grandtotal json data
    static getGrandTotalData(data) {
        try {
            var grandTotalRow = {};
            var res: Array<any> = [];
            if (data.length > 0) {
                var allkeys = Object.keys(data[0]);
                allkeys.forEach(colName => {
                    var colVal = data.map(a => a[colName]);
                    var Grandtotal = 0;
                    for (var i = 0; i < colVal.length; i++) {
                        if (!isNaN(colVal[i])) {
                            Grandtotal += Number(colVal[i]);
                        }
                    }
                    grandTotalRow[colName] = Grandtotal;
                });
                res.push(grandTotalRow);
                return res;
            }
        } catch (exception) {
            console.log(exception);
        }
    }
}
