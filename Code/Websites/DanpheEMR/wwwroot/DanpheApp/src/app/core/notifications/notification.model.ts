
export class NotificationViewModel {
    public NotificationId: number = 0;
    public Notification_ModuleName: string = null;
    public Notification_Title: string = null;
    public Notification_Details: string = null;
    public RecipientId: number = 0;
    public ParentTableName: string = null;
    public NotificationParentId: number = 0;
    public IsRead: boolean = false;
    public ReadBy: string = null;
    public CreatedOn: string = null;
    public IsArchived: boolean = false;
    public IsSelected: boolean = false;
    public RecipientType: string = null;
    public Sub_ModuleName: string = null;
    //public IsTouched: boolean = false;
}