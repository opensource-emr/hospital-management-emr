import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders} from '@angular/common/http';
import * as _ from 'lodash';

@Injectable()
export class NotificationDLService {
	public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
    constructor(public http: HttpClient) {
    }
    //get notification
    public GetNotification() {
        return this.http.get<any>("/api/Notification/UserNotifications")
    }
    //get-notification-visitdetail
    public GetNotificationVisitDetail(notificationId: number) {
        return this.http.get<any>("/api/Notification/VisitNotificaionDetail?notificationId=" + notificationId);
    }
    //update notification
    public PutNotificationIsRead(messageString: string) {
        let data = messageString;
        return this.http.put<any>("/api/Notification/MarkAsRead", data)
    }

    //update notification
    public PutNotificationIsArchived(messageString: string) {
        let data = messageString;
        return this.http.put<any>("/api/Notification/Archive", data)
    }



}
