import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { DailyMuster } from '../../Shared/daily-muster.model';
import { PayrollBLService } from '../../Shared/payroll.bl.service';
import { Router } from '@angular/router';
import { CoreService } from '../../../core/shared/core.service';

@Component({
  selector: 'common-dialog',
  templateUrl: 'edit-attendance.html',
})
export class EditAttendance {
  public Status: any;
  public Attendance: DailyMuster = new DailyMuster();
  constructor(public dialogRef: MatDialogRef<EditAttendance>,
    public payrollBLService: PayrollBLService,
    public router: Router,
    public coreService: CoreService) { }
  public getdata(data: DailyMuster): void {

    var date = data.Date.split("-")
    var obj = {
      Year: parseInt(date[0]),
      Month: parseInt(date[1]),
      Day: parseInt(date[2])
    }

    switch (data.AttStatus) {
      case "P":
        {
          this.Attendance.Day = obj.Day;
          this.Attendance.Month = obj.Month;
          this.Attendance.Year = obj.Year;
          this.Attendance.EmployeeId = data.EmployeeId;
          this.Status = "Present";
        }
        break;
      case "A":
        {
          this.Attendance.Day = obj.Day;
          this.Attendance.Month = obj.Month;
          this.Attendance.Year = obj.Year;
          this.Attendance.EmployeeId = data.EmployeeId;
          this.Status = "Absent";
        }
        break;
      case "":
        {
          this.Attendance.Day = obj.Day;
          this.Attendance.Month = obj.Month;
          this.Attendance.Year = obj.Year;
          this.Attendance.EmployeeId = data.EmployeeId;
          this.Attendance.HoursInDay = 8;
          let DefaultOfficeTime = JSON.parse(this.coreService.Parameters.find(p => p.ParameterGroupName == "Payroll"
            && p.ParameterName == "DefaultOfficeTime").ParameterValue);
          this.Attendance.TimeIn = DefaultOfficeTime.TimeIn;
          this.Attendance.TimeOut = DefaultOfficeTime.TimeOut;
          this.Status = ""
        }
        break;
      case "HL":
        {
          this.Attendance.Day = obj.Day;
          this.Attendance.Month = obj.Month;
          this.Attendance.Year = obj.Year;
          this.Attendance.EmployeeId = data.EmployeeId;
          this.Status = "Half Day Leave"
        }
        break;
      default: {
        this.Attendance.Day = obj.Day;
        this.Attendance.Month = obj.Month;
        this.Attendance.Year = obj.Year;
        this.Attendance.EmployeeId = data.EmployeeId;
        this.Status = "OFF"
      }
        break;
    }

  }
  Save() {
    if (this.Attendance.AttStatus == "P") {
      this.Attendance.Present = true;
      this.Attendance.ColorCode = "#008000"
    } else if (this.Attendance.AttStatus == "A") {
      this.Attendance.Present = false;
      this.Attendance.ColorCode = "#ff0000"
    } else if (this.Attendance.AttStatus == "HL") {
      this.Attendance.Present = true;
      this.Attendance.ColorCode = "#ff0000"
    } else if (this.Attendance.AttStatus == "OFF") {
      this.Attendance.Present = false;
      this.Attendance.ColorCode = "#808080"
    } else {
      this.Attendance.Present = false;
      this.Attendance.ColorCode = "#ff0000"
    }
    this.payrollBLService.putChangeAttendance(this.Attendance)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.dialogRef.close(this.Attendance);
         // this.dialogRef.afterClosed();
          this.Attendance = new DailyMuster();
        }
      });

  }

  Close() {
    this.dialogRef.close();
  }

}