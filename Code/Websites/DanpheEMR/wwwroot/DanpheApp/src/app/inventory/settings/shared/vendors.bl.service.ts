import { Role } from "../../../security/shared/role.model";
import { User } from "../../../security/shared/user.model";
import { RolePermissionMap } from "../../../security/shared/role-permission-map.model";
import { UserRoleMap } from "../../../security/shared/user-role-map.model";
import { Injectable, Directive } from '@angular/core';
import { VendorsModel } from "../shared/vendors.model";
import { VendorsDLService } from '../shared/vendors.dl.service'

import * as moment from 'moment/moment';
import * as _ from 'lodash';
@Injectable()
export class VendorsBLService {

    constructor(public vendorsDLService: VendorsDLService) {
    }

 //Get
    public GetVendorsList() {
        return this.vendorsDLService.GetVendorsList()
            .map(res => { return res });
    }
    public GetVendors() {
        return this.vendorsDLService.GetVendors()
            .map(res => { return res });
    }
    //GetCurrencyCode
    public GetCurrencyCode() {
        return this.vendorsDLService.GetCurrencyCode()
            .map(res => { return res });
    }

    //Post
    public AddVendor(CurrentVendor: VendorsModel) {
        //omiting the appointmentvalidator during post because it causes cyclic error during serialization in server side.
        var temp = _.omit(CurrentVendor, ['VendorsValidator']);
        return this.vendorsDLService.PostVendor(temp)
            .map(res => { return res });
    }

    //Put

    public UpdateVendor(vendor: VendorsModel) {
        //to fix serializaiton problem in server side
        if (vendor.CreatedOn)
            vendor.CreatedOn = moment(vendor.CreatedOn).format('YYYY-MM-DD HH:mm');
       
        var temp = _.omit(vendor, ['VendorsValidator']);
        return this.vendorsDLService.PutVendor(temp)
            .map(res => { return res });
    }

}