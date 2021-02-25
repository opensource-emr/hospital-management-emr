import { Injectable, Directive } from '@angular/core';
import { Appointment } from "../shared/appointment.model";
import { Patient } from '../../patients/shared/patient.model';
import * as moment from 'moment/moment';

@Injectable()
export class AppointmentService {
  globalAppointment: Appointment = new Appointment();
  public CreateNewGlobal(): Appointment {
    this.globalAppointment = new Appointment();
    return this.globalAppointment;
  }
  public getGlobal(): Appointment {
    return this.globalAppointment;
  }

  public GlobalAppointmentPatient: Patient = new Patient();

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
  public CalculateDOB(age: number, ageUnit: string) {
    if ((age || age == 0) && ageUnit) {
      if (ageUnit == 'Y') {
        //Dharam: I removed 1 from the month because ...
        //because the moment was adding 1 to the give value of month..so the output for month was feb
        // i gave 0 to the month ..then it working properly now ....output jan month
        return moment({ months: 0, days: 1 }).subtract(age, 'year').format("YYYY-MM-DD");
      }
      else if (ageUnit == 'M') {
        return moment({ days: 1 }).subtract(age, 'months').format("YYYY-MM-DD");
      }
      else if (ageUnit == 'D') {
        return moment().subtract(age, 'days').format("YYYY-MM-DD");
      }
    }
  }

}
