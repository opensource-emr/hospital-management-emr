import { Role } from "../../../security/shared/role.model";
import { User } from "../../../security/shared/user.model";
import { RolePermissionMap } from "../../../security/shared/role-permission-map.model";
import { UserRoleMap } from "../../../security/shared/user-role-map.model";
import { Injectable, Directive } from '@angular/core';
import { AccountHeadModel } from "../shared/account-head.model";
import { AccountHeadDLService } from '../shared/account-head.dl.service';

import * as moment from 'moment/moment';
import * as _ from 'lodash';
@Injectable()
export class AccountHeadBLService {

    constructor(
        public accountheadDLService: AccountHeadDLService) {

    }

    //Get
    public GetAccountHeadList() {
        return this.accountheadDLService.GetAccountHeadList()
            .map(res => { return res });
    }
    public GetAccountHead() {
        return this.accountheadDLService.GetAccountHead()
            .map(res => { return res });
    }


    //Post
    public AddAccountHead(CurrentAccountHead: AccountHeadModel) {
        //omiting the appointmentvalidator during post because it causes cyclic error during serialization in server side.
        var temp = _.omit(CurrentAccountHead, ['AccountHeadValidator']);
        return this.accountheadDLService.PostAccountHead(temp)
            .map(res => { return res });
    }

    //Put

    public UpdateAccountHead(accounthead: AccountHeadModel) {
        //to fix serializaiton problem in server side
        if (accounthead.CreatedOn)
            accounthead.CreatedOn = moment(accounthead.CreatedOn).format('YYYY-MM-DD HH:mm');

        var temp = _.omit(accounthead, ['AccountHeadValidator']);
        return this.accountheadDLService.PutAccountHead(temp)
            .map(res => { return res });
    }

}