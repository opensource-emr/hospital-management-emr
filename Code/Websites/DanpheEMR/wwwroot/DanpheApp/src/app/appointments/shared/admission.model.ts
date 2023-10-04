export class Admission123_RemoveIt {
    public _AdmittingDoctor: string = "";
    public _AdmissionNotes: string = "";
    public _AdmissionOrders: string = "";
    public _DischargeDate: string = "";
    public _AdmissionDate: string = "";


    constructor() {
    }
    //<---------------AdmittingDoctor ------------->
    get AdmittingDoctor(): string {
        return this._AdmittingDoctor;
    }
    set AdmittingDoctor(_admittingdoctor: string) {

        this._AdmittingDoctor = _admittingdoctor;
    }//<---------------AdmissionNotes------------->
    get AdmissionNotes(): string {
        return this._AdmissionNotes;
    }
    set AdmissionNotes(_admissionnotes: string) {

        this._AdmissionNotes = _admissionnotes;
    }

    //<---------------DischargeDate------------->
    get DischargeDate(): string {
        return this._DischargeDate;
    }
    set DischargeDate(_dischargedate: string) {

        this._DischargeDate = _dischargedate;
   
    }
    //<---------------AdmissionDate------------->
    get AdmissionDate(): string {
        return this._AdmissionDate;
    }
    set AdmissionDate(_admissiondate: string) {

        this._AdmissionDate = _admissiondate;
    }
    //<---------------AdmissionOrders ------------->
    get AdmissionOrders(): string {
        return this._AdmissionOrders;
    }
    set AdmissionOrders(_admissionorders: string) {

        this._AdmissionOrders = _admissionorders;
    }

}