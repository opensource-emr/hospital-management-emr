import { Component, OnInit } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { NotificationViewModel } from './notification.model'
import { NotificationBLService } from "./notification.bl.service"
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import { RouteFromService } from "../../shared/routefrom.service";
import * as moment from 'moment/moment';
import { PatientService } from "../../patients/shared/patient.service";
import { VisitService } from '../../appointments/shared/visit.service';
import { CoreService } from "../shared/core.service";
@Component({
    selector: "notification-icon", ///selector to load the Page inside this selector tag 
    templateUrl: "./notification.html",
})

export class NotificationComponent {

    public currtNotification: Array<NotificationViewModel> = new Array<NotificationViewModel>();
    public dropdownOpened: boolean = false;

    public NotificationSettings: any = null;   //{ IsNotificationDisplayEnabled: true, TimeToReloadInSeconds: 60, Push_VisitMessages: true };

    public totalMsgCount: number = 0;
    public archivedMsgCount: number = 0;

    //public reloadFreqInSecond=300;//this is 5 minutes.
    public notificationReloadFrequencyInMs: number = 300*1000;//This reloads in every 300 seconds. i.e: 5 minutes.

    constructor(public http: HttpClient,
        public msgBoxServ: MessageboxService, public notificationblserv: NotificationBLService,
        public patientService: PatientService,
        public CoreService: CoreService,
        public visitService: VisitService,
        public router: Router,
        public routeFromService: RouteFromService) {

    }


    public ticks = 0;  ///varible to see how much call be done 
    public timer; ///timer variable to subscribe or unsubscribe the timer 
    public unReadNotfCount: number = 0;  ///to show the total count to unread message 
    // Subscription object
    public sub: Subscription;

    ngOnInit() {
        this.GetNotificationSettings();
    }

    tickerFunc(tick) {
        this.notificationblserv.GetNotification()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.CallBackNotificationSuccess(res.Results);
                }
                else {
                    console.log("Some error occured in notification module. Error details: " + res.ErrorMessage);
                    //this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                }
            },
                err => {
                    console.log("Some error occured in notification module. Error details: " + err);
                    //this.msgBoxServ.showMessage("error", [err]);
                });

        this.ticks = tick

    }


    CallBackNotificationSuccess(notificList: Array<NotificationViewModel>) {

        let newMsgCount = notificList.length;
        //play the audio only if new alerts count is more than older ones.
        //Reload the notification list only if there are new messages.. 
        if (this.totalMsgCount != newMsgCount) {

            if (this.totalMsgCount != 0) {
                this.dropdownOpened = false;
                this.PlayAlertAudio();
            }

            this.currtNotification = notificList;
        }


        this.totalMsgCount = newMsgCount;
        this.unReadNotfCount = this.currtNotification.filter(n => n.IsRead == false).length;
    }

    //loads and plays a pre-defined audio.
    PlayAlertAudio() {
        try {
            let audio = new Audio();
            //change the audio source here. 
            //audio.src = "/themes/danphe-appointment-sound.m4a";

            audio.src = "/themes/text_notification.mp3";
            audio.load();
            audio.play();
        }
        catch (ex) {
            console.log("Error: notification audio couldn't be played." + ex.ErrorMessage);
        }
    }

    ngOnDestroy() {
        // unsubscribe here
        this.sub.unsubscribe();
    }

    NotificationOnClick(currtNotification: NotificationViewModel) {
        currtNotification.IsSelected = true;
        this.MarkAsRead([currtNotification]);

        if (currtNotification.Notification_ModuleName == "Visits_Module" && currtNotification.Sub_ModuleName == "Appointment") {
            this.GetNotificationVisitDetail(currtNotification.NotificationId);
        }
        //write if we need to redirect to some other page here.
        else if (currtNotification.Notification_ModuleName == "Labs_Module" && currtNotification.Sub_ModuleName == "Lab-SampleCollection") {
            this.router.navigate(['/Lab/Requisition']);
        }
        else if (currtNotification.Notification_ModuleName == "Labs_Module" && currtNotification.Sub_ModuleName == "Lab-AddResult") {
            this.router.navigate(['/Lab/ListPatientReport']);
        }
        else if (currtNotification.Notification_ModuleName == "Emergency" && currtNotification.Sub_ModuleName == "Emergency") {
            //return true;
        }
        else if (currtNotification.Notification_ModuleName == "Inventory_Module" && currtNotification.Sub_ModuleName == "PR_Verification") {
            this.router.navigate(['/Verification/PurchaseRequest']);
        }

    }

    GetNotificationVisitDetail(noitificationId: number) {
        this.notificationblserv.GetNotificationVisitDetail(noitificationId)
            .subscribe(
                res => {
                    if (res.Status == "OK") {

                        //Ashim: 5thApril2018 - workaround since feature is not available in Angular 4
                        //should use onSameUrlNavigation feature once upgraded to Angular 5
                        this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
                            this.patientService.getGlobal().PatientId = res.Results.PatientId;
                            this.visitService.getGlobal().PatientId = res.Results.PatientId;
                            this.visitService.getGlobal().PatientVisitId = res.Results.PatientVisitId;
                            this.visitService.getGlobal().ProviderId = res.Results.ProviderId;
                            this.router.navigate(["/Doctors/PatientOverviewMain/PatientOverview"])
                        });

                    }
                    else {
                        console.log("Some error occured in notification module. Error details: " + res.ErrorMessage);
                        this.msgBoxServ.showMessage("failed", ["Cannot Get Notification Detail."]);
                    }
                });
    }

    MarkAsReadButtonClick() {
        let selMessages = this.currtNotification.filter(n => n.IsSelected);
        this.MarkAsRead(selMessages);
    }

    MarkAsRead(messageList: Array<NotificationViewModel>) {
        this.notificationblserv.MarkNotificationAsRead(messageList)
            .subscribe(res => {
                if (res.Status == "OK") {
                    messageList.forEach(a => {
                        this.currtNotification.find(n => n.NotificationId == a.NotificationId).IsRead = true;
                        this.currtNotification.find(o => o.IsSelected).IsSelected = false;
                    });
                    this.unReadNotfCount = this.currtNotification.filter(n => n.IsRead == false).length;

                }
                else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                }
            }, err => {
                this.msgBoxServ.showMessage("error", [err]);
            });
    }




    public checkedNotes = [];
    public showNoteActionsPane: boolean = false;

    NotificationCheckBoxChanged(currNotification: NotificationViewModel) {
        //alert('selected:' + currNotification.IsSelected + '  ' + currNotification.Notification_Details);
        //this.DisplayNotificationActions();

        if (this.currtNotification.filter(n => n.IsSelected).length > 0) {
            this.showNoteActionsPane = true;
        }
        else {
            this.showNoteActionsPane = false;
        }
    }


    ArchiveMessages() {
        let selMessages = this.currtNotification.filter(n => n.IsSelected);
        this.notificationblserv.MarkNotificationAsArchived(selMessages)
            .subscribe(res => {
                if (res.Status == "OK") {
                    selMessages.forEach(a => {
                        this.currtNotification.find(n => n.NotificationId == a.NotificationId).IsArchived = true;
                    });

                    this.currtNotification = this.currtNotification.filter(a => a.IsArchived == false);
                    this.unReadNotfCount = this.currtNotification.filter(n => n.IsRead == false).length;

                    this.archivedMsgCount = selMessages.length;
                    this.totalMsgCount = this.totalMsgCount - this.archivedMsgCount;

                }
                else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                }
            }, err => {
                this.msgBoxServ.showMessage("error", [err]);
            });

    }


    //once the notification dropdown is opened, set all notification's Touched property to True.
    NotificationOpen() {

        //this.currtNotification.forEach(a => {
        //    a.IsTouched = true;
        //});

        this.dropdownOpened = true;

    }

    public GetNotificationSettings() {

        this.timer = Observable.timer(0, this.notificationReloadFrequencyInMs);//Reload after mentioned time interval

        this.sub = this.timer.subscribe(t => this.tickerFunc(t));

        //Parameter didn't load until here, hence commenting below for now until we have a proper solution.
        // var currParameter = this.CoreService.Parameters.find(a => a.ParameterName == "NotificationSettings" && a.ParameterGroupName == "Common");
        // if (currParameter) {
        //     this.NotificationSettings = JSON.parse(currParameter.ParameterValue);

        //     //we are using Timer function of Observable to Call the HTTP with angular timer
        //     //first Zero(0) means when component is loaded the timer is also start that time
        //     //seceond (60000) means after each 1 min timer will subscribe and It Perfrom HttpClient operation
        //     this.timer = Observable.timer(0, (this.NotificationSettings.TimeToReloadInSeconds * 1000));

        //     // subscribing to a observable returns a subscription object
        //     if (this.NotificationSettings.IsNotificationDisplayEnabled) {
        //         this.sub = this.timer.subscribe(t => this.tickerFunc(t));
        //     }

        // }
    }

}
