/*File: messagebox.service.ts
description: to show the messabox(popupmodal) after necessary actions/events
             eg: success, error, alert, notification, warning, etc..
created: 15June'17 Sudarshan
Remarks: try to find a singleton implementation of it, i.e: declare it in AppMain.cshtml, and 
         show/hide it using only this service.
Change History:
------------------------------------------------------------
s.no.     user/date             changes          description/remarks
------------------------------------------------------------
1.     sudarshan/15Jun'17      created             NA
------------------------------------------------------------*/
import { Injectable } from '@angular/core';
import { MessageboxModel } from './messagebox.model';

@Injectable()
export class MessageboxService {



  globalMsgbox: Array<MessageboxModel> = new Array<MessageboxModel>();
  public defaultDisplayTime: number = 7000;//7000milliseconds=7seconds

  //default autoHide=true, for some cases user will have to manually close the messagebox.

  public showMessage(status: string, messageArray: string[], errorLog: string = null, autoHide: boolean = true) {
    var newMsg: MessageboxModel = new MessageboxModel();
    newMsg.message = messageArray;
    newMsg.status = status;
    newMsg.show = true;

    this.globalMsgbox.push(newMsg);

    //log the error if the status is 'failed' or 'error'


    if ((status == "error" || status == "failed") && messageArray && messageArray.length > 0) {
      messageArray.forEach(msg => {
        console.log(msg);
        //wherever it get err mgs it redirect it to /Account/Login 
        if (msg.includes("Unauthorized")) {
          window.location.href = "/Account/Login";

        }
      });
      if (errorLog) {
        console.log(errorLog);
      }

    }
    //automatically hide after certain time.
    if (autoHide) {
      setTimeout(function () {
        newMsg.show = false;
      }.bind(this), this.defaultDisplayTime);
    }


  }


  public hide(indx: number) {
    this.globalMsgbox[indx].show = false;
    this.globalMsgbox.splice(indx, 1);
    this.globalMsgbox.slice();
  }
}
