import { Injectable, Directive } from '@angular/core';
import { EmployeeDLService } from './employee.dl.service'
import { Employee } from './employee.model'
import { ChangePasswordModel } from './change-password.model'
import { EmployeeProfile } from './../shared/employee-profile.model';
import * as _ from 'lodash';

//Note: mapping is done here by blservice, component will only do the .subscribe().
@Injectable()
export class EmployeeBLService {

    //we-re gradually moving business logic from component to BLServices
    public userProfileInfo: EmployeeProfile = new EmployeeProfile();

    constructor(
        public employeeDLService: EmployeeDLService,
       ) {

    }


    public UpdateCurrentPassword(currentPassModel: ChangePasswordModel) {
        
        var temp = _.omit(currentPassModel, ['ChangePasswordValidator']);
        return this.employeeDLService.PutNewPassword(temp)
            .map(res => { return res });
    }

   
    
    
   

}
