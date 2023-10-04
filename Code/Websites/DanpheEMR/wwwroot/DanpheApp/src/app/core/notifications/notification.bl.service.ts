import { Injectable, Directive } from '@angular/core';
import { NotificationViewModel } from "./notification.model"
import { NotificationDLService } from "./notification.dl.service"
import * as _ from 'lodash';

@Injectable()
export class NotificationBLService {
    constructor(
        public notificationdlserv: NotificationDLService,
    ) {
    }

    //Get Notification 
    public GetNotification() {
        return this.notificationdlserv.GetNotification()
            .map(res => { return res });
    }
    public GetNotificationVisitDetail(notificationId:number) {
        return this.notificationdlserv.GetNotificationVisitDetail(notificationId)
            .map(res => { return res });
    }

    ///updating Notification
    public MarkNotificationAsRead(messageList: Array<NotificationViewModel>) {
        let messageString = JSON.stringify(messageList);
        return this.notificationdlserv.PutNotificationIsRead(messageString)
            .map(res => { return res });
    }

    ///updating Notification
    public MarkNotificationAsArchived(messageList: Array<NotificationViewModel>) {
        let messageString = JSON.stringify(messageList);
        return this.notificationdlserv.PutNotificationIsArchived(messageString)
            .map(res => { return res });
    }



}
