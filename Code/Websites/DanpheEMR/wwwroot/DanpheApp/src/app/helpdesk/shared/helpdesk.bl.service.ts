import { Injectable, Directive } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HelpDeskDLService } from './helpdesk.dl.service';
import * as _ from 'lodash';
@Injectable()
export class HelpDeskBLService {
    constructor(public router: Router, public helpdeskDLService: HelpDeskDLService ) {
    }
    public LoadBedInfo() {
        status = "new";
        return this.helpdeskDLService.GetBedinfo(status)
            .map(res => res);
    }
    public LoadEmployeeInfo() {
        status = "new";
        return this.helpdeskDLService.GetEmployeeinfo(status)
            .map(res => res);
    }
    public LoadWardInfo() {
        status = "new";
        return this.helpdeskDLService.GetWardinfo(status)
            .map(res => res);
    }
}
