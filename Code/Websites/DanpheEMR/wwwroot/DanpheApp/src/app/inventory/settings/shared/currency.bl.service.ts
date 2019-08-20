import { Role } from "../../../security/shared/role.model";
import { User } from "../../../security/shared/user.model";
import { RolePermissionMap } from "../../../security/shared/role-permission-map.model";
import { UserRoleMap } from "../../../security/shared/user-role-map.model";
import { Injectable, Directive } from '@angular/core';
import { CurrencyModel } from "../shared/currency.model";
import { CurrencyDLService } from '../shared/currency.dl.service'

import * as moment from 'moment/moment';
import * as _ from 'lodash';
@Injectable()
export class CurrencyBLService {

    constructor(public currencyDLService: CurrencyDLService) {
    }

  
    public GetCurrency() {
        return this.currencyDLService.GetCurrencyCode()
            .map(res => { return res });
    }


    //Post
    public AddCurrency(CurrentCurrency: CurrencyModel) {
        //omiting the CurrencyValidator during post because it causes cyclic error during serialization in server side.
        var temp = _.omit(CurrentCurrency, ['CurrencyValidator']);
        return this.currencyDLService.PostCurrency(temp)
            .map(res => { return res });
    }

    //Put

    public UpdateCurrency(currency: CurrencyModel) {
        //to fix serializaiton problem in server side
        if (currency.CreatedOn)
            currency.CreatedOn = moment(currency.CreatedOn).format('YYYY-MM-DD HH:mm');

        var temp = _.omit(currency, ['CurrencyValidator']);
        return this.currencyDLService.PutCurrency(temp)
            .map(res => { return res });
    }

}