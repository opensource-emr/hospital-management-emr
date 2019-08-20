
import { Component } from "@angular/core"
import { Input } from "@angular/core"
import { CoreService } from "../../core/shared/core.service"

@Component({
    selector: "customer-header",
    templateUrl: "./customer-header.html"
})

export class CustomerHeaderComponent {
    constructor(public coreService: CoreService) {
        this.GetCustomerHeaderParameter();
        //this.GetCustomerHeaderLocalParameter();
    }

    public hospitalName: string = null;
    public address: string = null;
    public email: string = null;
    public tel: string = null;
    public pan: string = null;
    public localhospitalName: string = null;
    public localaddress: string = null;
    public localemail: string = null;
    public localtel: string = null;
    //This is header title parameter provide from user page where this header wants
    @Input("header-title")
    public title: string = null;

    //Get customer Header Parameter from Core Service (Database) assign to local variable
    GetCustomerHeaderParameter() {
        try {
            let headerInfo = JSON.parse(this.coreService.Parameters.filter(a => a.ParameterName == 'CustomerHeader')[0]["ParameterValue"]);                                       
            this.hospitalName = headerInfo.hospitalName;
            this.address = headerInfo.address;
            this.email = headerInfo.email;
            this.tel = headerInfo.tel;
            this.pan = headerInfo.pan;
        } catch (ex) {

        }

    }


    //Get customer Header Parameter from Core Service (Database) assign to local variable
    //GetCustomerHeaderLocalParameter() {
    //    try {
    //        let devheaderInfo = JSON.parse(this.coreService.Parameters.filter(a => a.ParameterName == 'CustomerHeaderLocal')[0]["ParameterValue"]);
    //        this.localhospitalName = devheaderInfo.hospitalName;
    //        this.localaddress = devheaderInfo.address;
    //        this.localemail = devheaderInfo.email;
    //        this.localtel = devheaderInfo.tel;
    //        this.pan = devheaderInfo.pan;
    //    } catch (ex) {

    //    }

    //}
}