import * as moment from 'moment/moment';
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { NepaliCalendarService } from './calendar/np/nepali-calendar.service';
import { CoreService } from "../core/shared/core.service";
import { PrinterSettingsModel } from '../settings-new/printers/printer-settings.model';
import { Router } from '@angular/router';
import { SecurityService } from '../security/shared/security.service';
import { ENUM_ACC_ReportStaticName } from './shared-enums';
import { AccountingService } from '../accounting/shared/accounting.service';
import {Base64} from 'js-base64';


//common functions are groupped in this class. 
//all functions should be static and shouldn't require to instantiate or injected.
export class CommonFunctions {
  constructor(public npCalendarService: NepaliCalendarService,
    public CoreService: CoreService,
    public router: Router,
    public securityService: SecurityService,
    public accService:AccountingService) {

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
  static GetFormattedAgeforSticker(dateOfBirth, agewithageunit): string {
    let ageunit = agewithageunit.slice(agewithageunit.length - 1);
    let currentDate = moment().format('YYYY-MM-DD');
    let years = moment(currentDate).diff(moment(dateOfBirth).format('YYYY-MM-DD'), 'years');
    let totMonths = moment(currentDate).diff(moment(dateOfBirth).format('YYYY-MM-DD'), 'months');
    let totDays = moment(currentDate).diff(moment(dateOfBirth).format('YYYY-MM-DD'), 'days');
    //show years if it's above 1.
    if (years >= 1 && ageunit == "Y") {
      return years.toString() + ' Y';
    }
    else if (ageunit == 'M') {
      return totMonths.toString() + 'M';
    }
    //show days for less than 1 month. 
    else if (ageunit == "D") {
      if (Number(totDays) == 0)
        totDays = 1;
      return totDays.toString() + 'D';
    }
    //else show only months for 1 to 35 months (other cases are checked in above conditions).
    else {
      return years.toString() + ' Y';
    }

  }
  //return format: 3 Y/M, 19 M/M, 24 Y/F, etc.. check above function 'GetFormattedAge' for age format . 
  static GetFormattedAgeSex(dateOfBirth: string, gender: string) {
    if (dateOfBirth && dateOfBirth.trim() && dateOfBirth.trim().length > 0) {
      let age = CommonFunctions.GetFormattedAge(dateOfBirth);
      let ageSex = age + "/" + gender.charAt(0).toUpperCase();
      return ageSex;
    }
    return "";
  }
  static GetFormattedAgeSexforSticker(dateOfBirth: string, gender: string, agewithageunit) {
    let age = CommonFunctions.GetFormattedAgeforSticker(dateOfBirth, agewithageunit);
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
  static parseAmount(inputVal, decimalUpto: number = 2): any {
    if (inputVal) {
      let z = isNaN(inputVal) ? 0 : ((inputVal - Math.floor(inputVal)) != 0) ? inputVal.toFixed(decimalUpto) : inputVal.toFixed();
      //changed > 0.9 to 0.98 to accomodate minimal difference in calculation.
      //earlier we were rounding off 0.9 to 1, now we're rounding off >0.985 to 1.. 
      //this gives us better precision..
      var refVal = '0.'+'9'.repeat(decimalUpto-1) + '8';
      if ((z - Math.floor(z)) > (+refVal)) { z = inputVal.toFixed() }
      return parseFloat(z);
    } else { return 0; }
  }

  static parseDecimal(inputVal): any {
    if (inputVal) {
      let z = isNaN(inputVal) ? 0 : ((inputVal - Math.floor(inputVal)) != 0) ? inputVal.toFixed(4) : inputVal.toFixed();
      if ((z - Math.floor(z)) > 0.9998) { z = inputVal.toFixed() }
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
  static calculateADTBedDuration(inDate, ipCheckoutDate, checkouttimeparameter): { days: number, hours: number, checkouttimeparameter: string } { //checkouttimeparameter = "00:00"

    let checkoutDate = ipCheckoutDate;//copying parameter value into local variable.
    //first separate hour and minute from checkoutTimeParameter.
    let chkOutTimeValues: Array<string> = checkouttimeparameter.split(":");//checkouttime paramter comes in HH:mm string format. eg: 13:00
    //expected format of chkOutTimeValues = ["13","00"] -- 0th index is hours and 1st index minutes.
    let chkOutHour = parseInt(chkOutTimeValues[0]);//hour value comes in 0th index.
    let chkOutMinute = chkOutTimeValues.length > 1 ? parseInt(chkOutTimeValues[1]) : 0;//minute value  comes in 2nd position if not default 0 minute.

    if (!checkoutDate)
      checkoutDate = moment(new Date);

    //Checking empty value for minute
    // checkoutDate= moment(checkoutDate).minute() != 0 ? (moment(checkoutDate).minute()) : (moment(chkOutMinute).minute());

    //checkout time is 12 noon. adding 15 minutes margin time
    //if (moment(checkoutDate).hour() >= checkouttimeparameter && moment(checkoutDate).minute() > checkouttimeparameter) {
    if ((moment(checkoutDate).hour() > chkOutHour) || (moment(checkoutDate).hour() == chkOutHour && moment(checkoutDate).minute() > chkOutMinute)) {
      //sud: when checkouttimeparameter is only in hours then we have to take greater than or equals as new day.
      checkoutDate = moment(checkoutDate).set({ hour: chkOutHour, minute: chkOutMinute, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm');
    }
    else {
      checkoutDate = moment(checkoutDate).subtract(1, 'days').set({ hour: chkOutHour, minute: chkOutMinute, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm');
    }
    //start calculation from start of the day i.e end of the previous day.
    var checkinDate = moment(inDate).subtract(1, 'days').set({ hour: chkOutHour, minute: chkOutMinute, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm');

    //var duration = moment.duration(moment(checkoutDate).diff(moment(checkinDate)));
    //var totalDays = duration.days() + (duration.months() * moment(inDate, 'YYYY-MM').daysInMonth());

    //sud: 10Apr'19 -- above logic is incorrect if patient stays for more than a month.
    var totalDays = moment(checkoutDate).diff(moment(checkinDate), 'days');

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
        let fromDateNp: any;
        let toDateNp = '';
        if (fromDate.length > 0 && toDate.length > 0) {
          fromDateNp = NepaliCalendarService.ConvertEngToNepaliFormatted_static(fromDate, '');
          toDateNp = NepaliCalendarService.ConvertEngToNepaliFormatted_static(toDate, '');
        }
        let dateRange = (fromDate.length > 0 && toDate.length > 0) ? '<b>Date Range:(AD)' + fromDate + ' To ' + toDate + '</b><br /><b>Date Range: (BS)' + fromDateNp + ' To ' + toDateNp + '</b><br/>' : '';

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

  //Sort any array of objects by the provided KeyName.
  //Reusable-Function. Can be called from any class as necessary. <Sundeep:27Nov'19>
  public static SortArrayOfObjects(arrToSort: Array<any>, keyName: string) {
    if (arrToSort && arrToSort.length > 0 && keyName) {
      arrToSort.sort((n1, n2) => {
        if (n1[keyName] > n2[keyName]) {
          return 1;
        }
        if (n1[keyName] < n2[keyName]) {
          return -1;
        }
        return 0;
      });
    }
  }


  //Sort any array of string (CASE-INSENSITIVE)
  // simple  array.sort() doesn't work because of case-sensitivity.
  //Reusable-Function. Can be called from any class as necessary. <Sundeep:27Nov'19>
  public static SortArrayOfString(arrToSort: Array<string>) {
    if (arrToSort && arrToSort.length > 0) {
      //arrToSort.sort();//this doesn't work as expected.
      arrToSort.sort((n1, n2) => {
        //to handle null case, since it'll crash in tolowercase conversion.
        if (!n1 || !n2) {
          return 0;
        }

        if (n1.toLowerCase() > n2.toLowerCase()) {
          return 1;
        }
        if (n1.toLowerCase() < n2.toLowerCase()) {
          return -1;
        }
        return 0;
      });
    }

  }


  //Sud: 12Apr'21--To convert Amounts/Currencies etc in words. eg:  10 => TEN, 146=> One Hundred Forty Six, etc..
  //TextTransform options: 'lowercase','uppercase'  
  //To Do 1: Call the same function from NumberInWordsPipe
  //To Do 2: Implement the localization for in-words. eg:100,000 in nepal is called as One Lakhs but as One Hundred Thousand in Other countries and so on.
  //To Do 3: Implement 'capitalize' option in text transform.
  public static GetNumberInWords(ipNumber, textTransform: string = "uppercase") {

    var th = ['', 'thousand', 'million', 'billion', 'trillion'];
    var dg = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    var tn = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    var tw = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    var inWordStr = toWords(ipNumber);
    inWordStr += " ONLY";

    if (textTransform == "uppercase") {
      inWordStr = inWordStr.toUpperCase();
    }
    else if (textTransform == "lowercase") {
      inWordStr = inWordStr.toLowerCase();
    }
    return inWordStr;

    function toWords(s) {
      s = s.toString();
      s = s.replace(/[\, ]/g, '');
      if (s != parseFloat(s)) return 'not a number';
      let x: number = s.indexOf('.');
      if (x == -1) x = s.length;
      if (x > 15) return 'too big';
      var n = s.split('');
      var str = '';
      var sk = 0;
      for (var i = 0; i < x; i++) {
        //Ajay19Feb'19 for less negative values getting minus
        if (n[i] == '-') {
          str += 'minus ';
        } else {
          if ((x - i) % 3 == 2) {
            if (n[i] == '1') {
              str += tn[Number(n[i + 1])] + ' ';
              i++;
              sk = 1;
            }
            else if (n[i] != 0) {
              str += tw[n[i] - 2] + ' ';
              sk = 1;
            }
          }
          else if (n[i] != 0) {
            str += dg[n[i]] + ' ';
            if ((x - i) % 3 == 0) str += 'hundred ';
            sk = 1;
          }


          if ((x - i) % 3 == 1) {
            if (sk) str += th[(x - i - 1) / 3] + ' ';
            sk = 0;
          }
        }
      }

      if (x != s.length) {
        var y = s.length;
        str += 'point ';
        for (var i = x + 1; i < y; i++) str += dg[n[i]] + ' ';

      }
      //ajay 30jan'19 removed point zero zero at the end of string
      if (str.endsWith('point zero zero ')) {
        str = str.replace('point zero zero ', ' ');
      }
      return str.replace(/\s+/g, ' ');
    }

  }

  public static GetSpaceRepeat(nTimes: number) {
    let space1 = ' ';
    return space1.repeat(nTimes);
  }

  public static GetNewLineRepeat(nTimes: number) {
    let nline = '\n';
    return nline.repeat(nTimes);
  }

  public static GetTextCenterAligned(text: string, fullColLength: number) {
    if (text && text.trim().length) {
      let textLen = text.trim().length;
      let mid = Math.floor(textLen / 2);
      let retData = this.GetSpaceRepeat(Math.floor(fullColLength / 2) - mid - 1);
      retData += text + '\n';
      return retData;
    }
    return '\n';
  }

  public static GetTextCenterAligned_Sm(text: string, fullColLength: number) {
    if (text && text.trim().length) {
      let textLen = text.trim().length;
      let mid = Math.floor(textLen / 2);
      let retData = ''
      if (Math.floor(fullColLength / 2) - mid - 1 > 0) {
        retData = this.GetSpaceRepeat(Math.floor(fullColLength / 2) - mid - 1);
      }
      if (textLen > fullColLength) {
        let preString = text.substring(0, text.length / 2 - 1)
        let postString = text.substring(text.length / 2, text.length)
        retData += this.GetTextCenterAligned_Sm(preString, fullColLength) + '\n';
        retData += this.GetTextCenterAligned_Sm(postString, fullColLength);
      }
      else {
        retData += text;
      }
      retData;
      return retData;
    }
    return '\n';
  }

  public static GetTextFIlledToALength(text: string, totalLength: number) {
    let strLen = text.trim().length;
    let space1 = ' ';
    let retText = '';
    if (totalLength >= strLen) {
      retText = text + space1.repeat(totalLength - strLen);
    } else {
      retText = text.substring(0, totalLength - 1) + '\n' + text.substring(totalLength - 1) + this.GetSpaceRepeat(totalLength - (strLen - totalLength));
    }
    return retText;
  }
  public static GetTextFIlledToALength_Sm(text: string, totalLength: number) {
    let strLen = text.trim().length;
    let space1 = ' ';
    let retText = '';
    if (totalLength >= strLen) {
      retText = text + space1.repeat(totalLength - strLen);
    } else {
      retText = text.substring(0, totalLength - 1) + '\n' + text.substring(totalLength - 1) + this.GetSpaceRepeat(totalLength - (strLen - totalLength));
    }
    return retText;
  }
  public static GetTextFilledToALength_SpaceBetween_Sm(leftText: string, rightText: string, totalLength) {
    let retText = '';
    retText += leftText;
    retText += this.GetSpaceRepeat(totalLength - leftText.length - rightText.length);
    retText += rightText;
    return retText;
  }
  public static GetTextFIlledToALengthWithLeftMargin_Sm(text: string, totalLength: number, leftMarginLength: number) {
    let strLen = text.trim().length;
    let space1 = ' ';
    let retText = '';
    if (totalLength >= strLen) {
      retText = this.GetSpaceRepeat(leftMarginLength) + text + space1.repeat(totalLength - strLen);
    } else {
      var noOfLinesToBePrinted = Math.ceil(strLen / totalLength);
      for (var i = 0; i < noOfLinesToBePrinted; i++) {
        if (i < noOfLinesToBePrinted - 1)
          retText += text.substring((totalLength * i), (totalLength * (i + 1))) + "\n" + this.GetSpaceRepeat(leftMarginLength);
        else
          retText += text.substring((totalLength * i), strLen + 1) + this.GetSpaceRepeat(totalLength - (strLen - (totalLength * i) - 1))
      }
    }
    return retText;
  }
  public static GetPHRMTextFIlledToALengthForParticulars(text: string, totalLength: number, leftMarginLength: number) {
    let strLen = text.trim().length;
    let space1 = ' ';
    let retText = '';
    if (totalLength >= strLen) {
      retText = text + space1.repeat(totalLength - strLen);
    } else {
      var noOfLinesToBePrinted = Math.ceil(strLen / totalLength);
      for (var i = 0; i < noOfLinesToBePrinted; i++) {
        if (i < noOfLinesToBePrinted - 1)
          retText += text.substring((totalLength * i), (totalLength * (i + 1))) + "\n" + this.GetSpaceRepeat(leftMarginLength);
        else
          retText += text.substring((totalLength * i), strLen + 1) + this.GetSpaceRepeat(totalLength - (strLen - (totalLength * i) - 1))
      }
    }
    return retText;
  }

  public static GetHorizontalLineOfLength(nTimes: number) {
    let sp = '-';
    return sp.repeat(nTimes);
  }

  public static GetEpsonHexCommandForNumber(num: number) {
    return String.fromCharCode(num);
  }




  //since invoice and sticker has different margin settings, we're parameterizing that with printouttype.
  //possible values for printouttypes are 'billing-invoice','reg-sticker','phrm-invoice'
  public static GetEpsonPrintDataForPage(data: any, mh: number, ml: number, modelName: string = "LQ-310", printOutType: string = "billing-invoice") {
    let mhData = String.fromCharCode(mh);
    let mlData = String.fromCharCode(ml);

    if (modelName.trim() == "") {
      modelName = "LQ-310";
    }

    if (printOutType == "billing-invoice") {
      //below is for Billing-Invoice's Font size..  10 CharacterPerInch
      if (modelName == "LX-310") {
        return [
          '\x1B' + '\x40',
          '\x1B' + '\x33' + '\x1B', //ESC 3  set LineSpacing
          '\x1B' + '\x43' + '\x2A', //ESC C  set pagelength in Line
          data,
          '\x0C'];
      } else {
        return [
          '\x1B' + '\x40',
          '\x1B' + '\x28' + '\x55' + '\x01' + '\x00' + '\x0A',//Set Unit>  'ESC ( U nL nH m'
          '\x1B' + '\x28' + '\x43' + '\x02' + '\x00' + mlData + mhData, //'ESC ( C nL nH mL mH'  set page length in defined unit
          data,
          '\x0C'];
      }
    }
    else if (printOutType == 'phrm-invoice') {
      if (modelName == "LX-310") {
        return [
          '\x1B' + '\x40',
          '\x1B' + '\x33' + '\x1B', //ESC 3  set LineSpacing
          '\x1B' + '\x43' + '\x2A', //ESC C  set pagelength in Line
          data,
          '\x0C'];
      }
      else {
        //below is for Pharmacy-Invoice's Font size..  15 CharacterPerInch (CPI)
        return [
          '\x1B' + '\x40',
          '\x1B' + '\x28' + '\x55' + '\x01' + '\x00' + '\x0A',//Set Unit>  'ESC ( U nL nH m'
          '\x1B' + '\x67',  //'ESC M'   => Change Font size 15-CPI
          '\x1B' + '\x28' + '\x43' + '\x02' + '\x00' + mlData + mhData, //'ESC ( C nL nH mL mH'  set page length in defined unit
          data,
          '\x0C'];
      }
    }
    else if (printOutType == "reg-sticker") {
      if (modelName == "LX-310") {
        return [
          '\x1B' + '\x40',
          '\x1B' + '\x6C' + '\x00',
          '\x1B' + '\x4D',
          '\x1B' + '\x33' + '\x1B', //ESC 3  set LineSpacing
          '\x1B' + '\x43' + '\x0C', //ESC C  set pagelength in Line
          data,
          '\x0C'];
      }
      else {
        //for 12CPI - 5Characters left margin - Paper size: 3.8cm = 1.49606 inch, mH=2, mL=25
        return [
          '\x1B' + '\x40',
          '\x1B' + '\x28' + '\x55' + '\x01' + '\x00' + '\x0A',   //Set Unit>  'ESC ( U nL nH m'
          '\x1B' + '\x4D',  //'ESC M'   => Select 10.5-point, 12-CPI
          '\x1B' + '\x6C' + '\x05',//'ESC l 5' => 5 character margin on the left.
          '\x1B' + '\x28' + '\x63' + '\x01' + '\x00' + '\x00' + '\x00' + '\x00' + '\x00', //'ESC ( c nL nH tL tH bL bH' command    //set page format
          '\x1B' + '\x28' + '\x43' + '\x02' + '\x00' + mlData + mhData, //'ESC ( C nL nH mL mH'  set page length in defined unit
          data,
          '\x0C'];
      }
    }

  }

  public static GetReceiptDotMatrixPrintDataForPage(data: any, settings: PrinterSettingsModel) {

    if (settings.FooterGap_Lines) {
      let nline = '\n';
      let footerGap = nline.repeat(settings.FooterGap_Lines);
      data = data + footerGap;
    }

    return [data]

  }



  //below function is moved to CoreService since we're unable to call static function from view (html)
  // //function to focus and select. 
  // //We need to pass the targetId and waitTime in milliseconds before focus jumps into the given html control.
  // //Internally we decide whether to select the content or not. 
  // public static FocusAndSelectInput(targetId: string, waitTimeInMs: number = 100) {
  //   let timer = window.setTimeout(function () {
  //     let htmlObject: any = document.getElementById(targetId);
  //     if (htmlObject) {
  //       htmlObject.focus();
  //       let elemType = htmlObject.type;
  //       //content selection is applied for below content types. Not applicable For other only focus is applied.
  //       if (elemType == "text"|| elemType == "number" || elemType == "tel"  || elemType == "password") {
  //         htmlObject.select();
  //       }
  //     }
  //     clearTimeout(timer);
  //   }, waitTimeInMs);
  // }

  // public getHeaderDetailOfTableExportForBillingReport(){
  //   let tableExportSetting = this.CoreService.Parameters.find(p => p.ParameterGroupName == "BillingReport" && p.ParameterName == "TableExportSetting");
  //   if(tableExportSetting){
  //     var settings = JSON.parse(tableExportSetting.ParameterValue);
  //   }
  //   if(settings){
  //     var paramData = null;
  //     switch(this.router.url){
  //       case "Reports/BillingMain/PatientCensusReport":{
  //         paramData = settings["PatientCensusReport"];
  //         break;
  //       }
  //     }
  //   }
  // }
  //this function makes client side Html table to excel file send all details and download excel file
  static ConvertHTMLTableToExcelForBilling(table: any, fromDate: string, toDate: string, SheetName: string, TableHeading: string, FileName: string, hospitalName: string, hospitalAddress: string, phoneNumber: any, showHeader: boolean, showDateRange: boolean) {
    try {
      if (table) {
        //gets tables wrapped by a div.
        var _div = document.getElementById(table).getElementsByTagName("table");
        var colCount = [];

        //pushes the number of columns of multiple table into colCount array.
        for (let i = 0; i < _div.length; i++) {
          var col = _div[i].rows[1].cells.length;
          colCount.push(col);
        }

        //get the maximum element from the colCount array.
        var maxCol = colCount.reduce(function (a, b) {
          return Math.max(a, b);
        }, 0);

        //define colspan for td.
        var span = "colspan= " + Math.trunc(maxCol / 3);

        var phone;
        if (phoneNumber != null) {
          phone = '<tr><td ' + span + '></td><td colspan="4" style="text-align:center;font-size:medium;"><strong> Phone:' + phoneNumber + '</strong></td><td ' + span + '></td></tr><br>';
        } else {
          phone = "";
        }

        var hospName;
        var address;
        if (showHeader == true) {
          hospName = '<tr><td ' + span + '></td><td colspan="4" style="text-align:center;font-size:medium;"><strong>' + hospitalName + '</strong></td><td ' + span + '></td></tr><br>';
          address = '<tr><td ' + span + '></td><td colspan="4" style="text-align:center;font-size:medium;"><strong>' + hospitalAddress + '</strong></td><td ' + span + '></tr><br>';
        } else {
          hospName = "";
          address = "";
        }
        let workSheetName = (SheetName.length > 0) ? SheetName : 'Sheet';
        let fromDateNp: any;
        let toDateNp = '';
        if (fromDate.length > 0 && toDate.length > 0) {
          fromDateNp = NepaliCalendarService.ConvertEngToNepaliFormatted_static(fromDate, '');
          toDateNp = NepaliCalendarService.ConvertEngToNepaliFormatted_static(toDate, '');
        }

        //let Heading = '<tr><td></td><td></td><td></td><td></td><td colspan="4" style="text-align:center;font-size:medium;"><h>' + TableHeading + '</h></td><td></td><td></td><td></td><td></td><td></td></tr>';
        let Heading = '<tr><td ' + span + '></td><td colspan="4" style="text-align:center;font-size:medium;"><h>' + TableHeading + '</h></td><td ' + span + '></td></tr>';
        var dateRange;
        if (showDateRange == true) {
          dateRange = (fromDate.length > 0 && toDate.length > 0) ? '<tr><td></td><td><b>Date Range:(AD)' + fromDate + ' To ' + toDate + '</b></td></tr><br /><tr><td></td><td><b>Date Range: (BS)' + fromDateNp + ' To ' + toDateNp + '</b></td></tr><br/>' : '';

        } else {
          dateRange = "";
        }
        let PrintDate = '<tr><td></td><td><b>Created Date:' + moment().format('YYYY-MM-DD') + '</b></td></tr><br />'

        let filename = (FileName.length > 0) ? FileName : 'Exported_Excel_File';
        filename = filename + '_' + moment().format('YYYYMMMDDhhss') + '.xls';

        let uri = 'data:application/vnd.ms-excel;base64,'
          , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table><tr>{hospitalName}{hospitalAddress}{phone}{Heading}{DateRange}{PrintDate}</tr>{table}</table></body></html>'
          //, base64 = function (s) { return window.btoa(decodeURIComponent(encodeURIComponent(s))) }
          , base64 = function (s) { return Base64.toBase64(decodeURIComponent(encodeURIComponent(s))) } //Base64 is coming from 'js-base64' package..
          , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
        if (!table.nodeType) table = document.getElementById(table)
        var ctx = { worksheet: name || workSheetName, table: table.innerHTML, PrintDate: PrintDate, hospitalName: hospName, hospitalAddress: address, phone: phone, DateRange: dateRange, Heading: Heading }
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

  // TO export Medical Record's Reports To Excel
  static ConvertHTMLTableToExcelForMedicalRecord(table: any, dateRange: string, SheetName: string, TableHeading: string, FileName: string, hospitalName: string, hospitalAddress: string, phoneNumber: any) {
    try {
      if (table) {
        var _div = document.getElementById(table).getElementsByTagName("table");
        var colCount = [];

        for (let i = 0; i < _div.length; i++) {
          var col = _div[i].rows[1].cells.length;
          colCount.push(col);
        }
        var maxCol = colCount.reduce(function (a, b) {
          return Math.max(a, b);
        }, 0);

        var span = "colspan= " + Math.trunc(maxCol / 3);

        var phone;
        if (phoneNumber != null) {
          phone = '<tr><td ' + span + '></td><td colspan="5" style="text-align:center;font-size:medium;"> Phone:' + phoneNumber + '</td><td ' + span + '></td></tr><br>';
        } else {
          phone = "";
        }

        var hospName;
        var address;
        hospName = '<tr><td ' + span + '></td><td colspan="5" style="text-align:center;font-size:medium;"><strong>' + hospitalName + '</strong></td><td ' + span + '></td></tr><br>';
        address = '<tr><td ' + span + '></td><td colspan="5" style="text-align:center;font-size:medium;"><strong>' + hospitalAddress + '</strong></td><td ' + span + '></tr><br>';
        let workSheetName = (SheetName.length > 0) ? SheetName : 'Sheet';
        
        var Heading;
        if (TableHeading) {
           Heading = '<tr><td ' + span + '></td><td colspan="5" style="text-align:center;font-size:medium;"><h>' + TableHeading + '</h></td><td ' + span + '></td></tr>';
        }
  
        let filename = (FileName.length > 0) ? FileName : 'Exported_Excel_File';
        filename = filename + '_' + moment().format('YYYYMMMDDhhss') + '.xls';

        let uri = 'data:application/vnd.ms-excel;base64,'
          , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table><tr>{hospitalName}{hospitalAddress}{phone}{Heading}{DateRange}</tr>{table}</table></body></html>'
          , base64 = function (s) { return window.btoa(decodeURIComponent(encodeURIComponent(s))) }
          , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
        if (!table.nodeType) table = document.getElementById(table)
        var ctx = { worksheet: workSheetName, hospitalName: hospName, table: table.innerHTML, hospitalAddress: address, phone: phone, DateRange: dateRange, Heading: Heading }
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

  static ConvertHTMLMultipleTableToExcelForMR(table: any, fromDate: string, toDate: string, SheetName: string, ExportedBy: string, TableHeading: string, FileName: string, hospitalName: string, hospitalAddress: string, phoneNumber: any) {
    try {
      if (table) {

          var _div = document.getElementById(table).getElementsByTagName("table");
          var colCount = [];
  
          // for (let i = 0; i < _div.length; i++) {
          //   var col = _div[i].rows[1].cells.length;
          //   document.write("<TH></TH>");
          //   colCount.push(col);
          // }
  
          var span = "colspan= " + Math.trunc(_div.length / 3);
  
          var phone;
          if (phoneNumber != null) {
            phone = '<tr><td ' + span + '></td><td colspan="4" style="text-align:center;font-size:medium;"> Phone:' + phoneNumber + '</td><td ' + span + '></td></tr><br>';
          } else {
            phone = "";
          }
  
          var hospName;
          var address;
          hospName = '<tr><td ' + span + '></td><td colspan="4" style="text-align:center;font-size:medium;"><strong>' + hospitalName + '</strong></td><td ' + span + '></td></tr><br>';
          address = '<tr><td ' + span + '></td><td colspan="4" style="text-align:center;font-size:medium;"><strong>' + hospitalAddress + '</strong></td><td ' + span + '></tr><br>';
          let workSheetName = (SheetName.length > 0) ? SheetName : 'Sheet';
          let fromDateNpl: any;
          let toDateNpl = '';
          if (fromDate.length > 0 && toDate.length > 0) {
            fromDateNpl = NepaliCalendarService.ConvertEngToNepaliFormatted_static(fromDate, '');
            toDateNpl = NepaliCalendarService.ConvertEngToNepaliFormatted_static(toDate, '');
          }
  
          let Heading = '<tr><td ' + span + '></td><td colspan="4" style="text-align:center;font-size:medium;"><h>' + TableHeading + '</h></td><td ' + span + '></td></tr>';
          var dateRange;
          
  
  
            dateRange = (fromDate.length > 0 && toDate.length > 0) ? '<tr><td></td><td><b>Date Range:(BS)' + fromDateNpl + ' To ' + toDateNpl + '</b></td><td></td><td></td><td></td>  <td></td><td ><b> Exported Date:' + moment().format('YYYY-MM-DD') + ' <td></td><td></td><td></td><td><b> Exported By:' + ExportedBy + '</b></td></tr>' : '';
           
         // let PrintDate = '<tr><td></td><td><b>Created Date:' + moment().format('YYYY-MM-DD') + '</b></td></tr><br />'
  
          let filename = (FileName.length > 0) ? FileName : 'Exported_Excel_File';
          filename = filename + '_' + moment().format('YYYYMMMDDhhss') + '.xls';
         

        let uri = 'data:application/vnd.ms-excel;base64,'
          , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table><tr>{hospitalName}{hospitalAddress}{phone}{Heading}{DateRange}</tr>{table}</table></body></html>'
          , base64 = function (s) { return window.btoa(decodeURIComponent(encodeURIComponent(s))) }
          , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
        if (!table.nodeType) table = document.getElementById(table)
   var ctx = { worksheet: workSheetName, table: table.innerHTML, hospitalName: hospName, hospitalAddress: address, phone: phone, DateRange: dateRange, Heading: Heading } 
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
  static ConvertHTMLTableToExcelForAccounting(table: any,  SheetName: string,date:string, TableHeading: string, filename: string,hospitalName:string,hospitalAddress:string, printByMessage:string,showPrintBy:boolean, showHeader:boolean, showDateRange: boolean, printBy:string,ShowFooter:boolean,  Footer:string  ) {
    try {
      var printDate = moment().format("YYYY-MM-DD HH:mm");
      if (table) {
        //gets tables wrapped by a div.
        var _div = document.getElementById(table).getElementsByTagName("table");
        var colCount = [];

        //pushes the number of columns of multiple table into colCount array.
        for (let i = 0; i < _div.length; i++) {
          var col = _div[i].rows[1].cells.length;
          colCount.push(col);
        }

        //get the maximum element from the colCount array.
        var maxCol = colCount.reduce(function (a, b) {
          return Math.max(a, b);
        }, 0);

        //define colspan for td.
        var span = "colspan= " + Math.trunc(maxCol / 3);
        var hospName;
        var address;
        if (showHeader == true) {
        
          var Header = `<tr><td></td><td></td><td colspan="4" style="text-align:center;font-size:large;"><strong>${hospitalName}</strong></td></tr><br/>
          <tr> <td></td><td></td><td colspan="4" style="text-align:center;font-size:small;"><strong>${hospitalAddress}</strong></td></tr><br/>
          <tr> <td></td><td></td><td colspan="4" style="text-align:center;font-size:small;width:600px;"><strong>${TableHeading}</strong></td></tr><br/>
          <tr> <td style="text-align:center;"><strong>${date}</strong></td><td></td><td></td><td></td><td></td><td style="text-align:center;"><strong>${printByMessage}${printBy}</strong></td><td><strong>Exported On: ${printDate}</strong></td></tr><br>`
          
        }
        else {
          // hospName = "";
          // address = "";
          if (date == "") { //if showdate date is false
            Header = `<tr> <td style="text-align:center;"><strong> ${printByMessage} ${printBy} </strong></td><td><strong>Exported On: ${printDate}</strong></td></tr>`;
          }
          else if (printBy == "") { // if  printby is false. 
            Header = `<tr> <td style="text-align:center;"><strong>${date}</strong></td><td><strong>Exported On: ${printDate}</strong></td></tr>`;
          }
          else { //if both are true
            Header = `<tr> <td style="text-align:center;"><strong>${date}</strong></td><td></td><td></td><td></td><td style="text-align:center;"><strong>${printByMessage}${printBy}</strong></td><td><strong>Exported On: ${printDate}</strong></td></tr><br>`;
          }
        }
        let workSheetName = (SheetName.length > 0) ? SheetName : 'Sheet';
        // let fromDateNp: any;
        // let toDateNp = '';
        // if (fromDate.length > 0 && toDate.length > 0) {
        //   fromDateNp = NepaliCalendarService.ConvertEngToNepaliFormatted_static(fromDate, '');
        //   toDateNp = NepaliCalendarService.ConvertEngToNepaliFormatted_static(toDate, '');
        // }
        //let Heading = '<tr><td ' + span + '></td><td colspan="4" style="text-align:center;font-size:medium;"><h>' + TableHeading + '</h></td><td ' + span + '></td></tr>';
        // var dateRange;
        // if (showDateRange == true) {
        //  // dateRange = (fromDate.length > 0 && toDate.length > 0) ? '<tr><td><b>Date Range:(AD)' + fromDate + ' To ' + toDate + '</b></td></tr><br /><tr><td><b>Date Range: (BS)' + fromDateNp + ' To ' + toDateNp + '</b></td></tr><br/>' : '';
        //   dateRange = '<tr><td><b>Date Range:(AD)' + date + '</b></td></tr><<br/>' ;
        // } else {
        //   dateRange = "";
        // }
        // if(showPrintBy == true){
        //   printByMessage = '<tr><td></td><td></td><td style="text-align:right;"><strong> '+printByMessage+'' +printBy+' </strong></b></td></tr><br /><tr><td></td><td></td><td style="text-align:right;"><b>Exported On:' + printDate + '</b></td></tr><br/>';
          
        // }
        // else{
        //   printByMessage = null;
        // }
        if(ShowFooter == true){
          Footer = "";
        }else{
          Footer = null;
        }
        let uri = 'data:application/vnd.ms-excel;base64,'
          , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table><tr>{Header}</tr>{table}</table></body></html>'
          , base64 = function (s) { return window.btoa(decodeURIComponent(encodeURIComponent(s))) }
          , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
        if (!table.nodeType) table = document.getElementById(table)
        var ctx = { worksheet: name || workSheetName, table: table.innerHTML,Header:Header,footer: Footer }
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
}
