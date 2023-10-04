import { Injectable } from "@angular/core";
import { Patient } from "../../patients/shared/patient.model";

@Injectable()
export class QrService {

    public show: boolean = false;
    public ModuleName: string = "";
    public openScanner: boolean = false;


     public showBilling: boolean = false;
    //public showLabsMain: boolean = false;

    public patientCode: string = null;
    public labSampleCode: string = null;

    public selectedPatient: Patient = null;

    constructor() {

    }
}