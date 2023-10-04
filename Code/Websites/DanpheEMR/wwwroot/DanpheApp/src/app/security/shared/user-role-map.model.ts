
export class UserRoleMap {
    public UserRoleMapId : number = 0;
    public UserId : number = null;
    public RoleId: number = null;
    public StartDate: string = null;
    public EndDate: string = null;
    public IsActive: boolean = true;

    public CreatedBy: number = null;
    public ModifiedBy: number = null;

    public CreatedOn: string = null;
    public ModifiedOn: string = null;

    //only to display in UI
    public RoleName: string = null;
    public IsSelected: boolean = false;
    
}
