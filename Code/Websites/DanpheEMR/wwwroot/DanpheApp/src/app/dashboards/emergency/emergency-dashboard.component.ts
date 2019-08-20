import { Component } from '@angular/core'
import { DLService } from '../../shared/dl.service';
import * as moment from 'moment/moment';

@Component({
    templateUrl: "./emergency-dashboard.html"
})

export class EmergencyDashboardComponent {
    public selectedDate: string = null;
    public stats :any="";   //= new Object();

    constructor(public dlService: DLService) {
        this.selectedDate = moment().format('YYYY-MM-DD');
        this.LoadERDashboard();
    }


    public LoadERDashboard() {
        if (this.selectedDate) {
            this.dlService.Read("/Reporting/ERDashboard")
                .map(res => res)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        let dashboardStats = JSON.parse(res.Results.JsonData);        
                        this.stats = dashboardStats.LabelData[0];
                    } else {
                        console.log("---some error occured----");
                        console.log(res.ErrorMessage);
                    }

                },
                    err => {
                        alert(err.ErrorMessage);

                    });
        }

    }   
}