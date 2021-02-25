import { Role } from "../../security/shared/role.model";


export class StoreVerificationMapModel {
  public StoreVerificationMapId: number;
  public StoreId: number;
  public RoleId: number;
  public MaxVerificationLevel: number;
  public VerificationLevel: number = 1;
  public selectedRole: Role;
  public NewRoleName: string = "";
}
