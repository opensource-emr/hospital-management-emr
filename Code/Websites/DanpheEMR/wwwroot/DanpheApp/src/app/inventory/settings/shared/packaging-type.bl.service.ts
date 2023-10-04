import { Role } from "../../../security/shared/role.model";
import { User } from "../../../security/shared/user.model";
import { RolePermissionMap } from "../../../security/shared/role-permission-map.model";
import { UserRoleMap } from "../../../security/shared/user-role-map.model";
import { Injectable, Directive } from '@angular/core';
import { PackagingTypeModel } from "../shared/packaging-type.model";
import { PackagingTypeDLService } from '../shared/packaging-type.dl.service'

import * as moment from 'moment/moment';
import * as _ from 'lodash';
@Injectable()
export class PackagingTypeBLService {

    constructor(public packagingtypeDLService: PackagingTypeDLService) {
    }

    //Get
    public GetPackagingTypeList() {
        return this.packagingtypeDLService.GetPackagingTypeList()
            .map(res => { return res });
    }
    public GetPackagingType() {
        return this.packagingtypeDLService.GetPackagingType()
            .map(res => { return res });
    }


    //Post
    public AddPackagingType(CurrentPackagingType: PackagingTypeModel) {
        //omiting the appointmentvalidator during post because it causes cyclic error during serialization in server side.
        var temp = _.omit(CurrentPackagingType, ['PackagingTypeValidator']);
        return this.packagingtypeDLService.PostPackagingType(temp)
            .map(res => { return res });
    }

    //Put

    public UpdatePackagingType(vendor: PackagingTypeModel) {
        //to fix serializaiton problem in server side
        if (vendor.CreatedOn)
            vendor.CreatedOn = moment(vendor.CreatedOn).format('YYYY-MM-DD HH:mm');

        var temp = _.omit(vendor, ['PackagingTypeValidator']);
        return this.packagingtypeDLService.PutPackagingType(temp)
            .map(res => { return res });
    }

}