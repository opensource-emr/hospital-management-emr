import { Injectable, Directive } from '@angular/core';
import { Appointment } from "../shared/appointment.model";
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
}