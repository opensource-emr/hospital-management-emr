import { Role } from "../../../security/shared/role.model";
import { User } from "../../../security/shared/user.model";
import { RolePermissionMap } from "../../../security/shared/role-permission-map.model";
import { UserRoleMap } from "../../../security/shared/user-role-map.model";
import { Injectable, Directive } from '@angular/core';
import { UnitOfMeasurementModel } from "../shared/unit-of-measurement.model";
import { UnitOfMeasurementDLService } from '../shared/unit-of-measurement.dl.service'

import * as moment from 'moment/moment';
import * as _ from 'lodash';
@Injectable()
export class UnitOfMeasurementBLService {

    constructor(public unitofmeasurementDLService: UnitOfMeasurementDLService) {
    }

    //Get
    public GetUnitOfMeasurementList() {
        return this.unitofmeasurementDLService.GetUnitOfMeasurementList()
            .map(res => { return res });
    }
    public GetUnitOfMeasurement() {
        return this.unitofmeasurementDLService.GetUnitOfMeasurement()
            .map(res => { return res });
    }


    //Post
    public AddUnitOfMeasurement(CurrentUnitOfMeasurement: UnitOfMeasurementModel) {

        var temp = _.omit(CurrentUnitOfMeasurement, ['UnitOfMeasurementValidator']);
        return this.unitofmeasurementDLService.PostUnitOfMeasurement(temp)
            .map(res => { return res });
    }

    //Put

    public UpdateUnitOfMeasurement(unitofmeasurement: UnitOfMeasurementModel) {
        //to fix serializaiton problem in server side
        if (unitofmeasurement.CreatedOn)
            unitofmeasurement.CreatedOn = moment(unitofmeasurement.CreatedOn).format('YYYY-MM-DD HH:mm');

        var temp = _.omit(unitofmeasurement, ['UnitOfMeasurementValidator']);
        return this.unitofmeasurementDLService.PutUnitOfMeasurement(temp)
            .map(res => { return res });
    }

}