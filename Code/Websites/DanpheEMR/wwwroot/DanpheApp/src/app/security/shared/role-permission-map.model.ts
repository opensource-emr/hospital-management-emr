
export class RolePermissionMap {
  public RolePermissionMapId: number = 0;
  public RoleId: number = null;
  public PermissionId: number = null;
  public IsActive: boolean = true;

  public CreatedBy: number = null;
  public ModifiedBy: number = null;

  public CreatedOn: string = null;
  public ModifiedOn: string = null;

  public IsSelected: boolean = false;

  //just to show in the UI
  public PermissionName: string = null;

  public ApplicationId: number = null;//for client side only


}
