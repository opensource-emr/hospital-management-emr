import { AttendanceDailyTimeRecord } from "./Payroll-attendance-daily-time-record.model";

export class PayrollService {



/* here is logic to import csv data to database table */

    isCSVFile(file: any) {

        return file.name.endsWith(".csv");

    }
    getHeaderArray(csvRecordsArr: any) {
        let headers = csvRecordsArr[0].split(',');
        let headerArray = [];
        for (let j = 0; j < headers.length; j++) {
            headerArray.push(headers[j]);
        }
        return headerArray;
    }
    getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
        var dataArr = [];
        for (let i = 1; i < csvRecordsArray.length; i++) {
            let data = csvRecordsArray[i].split(',');

            if (data.length == headerLength) {
                var csvRecord: AttendanceDailyTimeRecord = new AttendanceDailyTimeRecord();
                csvRecord.EmployeeId = data[0].trim();
                csvRecord.EmployeeName = data[1].trim();
                csvRecord.RecordDateTime = data[2].trim();
                dataArr.push(csvRecord);
            }
        }
        return dataArr;
    }


}