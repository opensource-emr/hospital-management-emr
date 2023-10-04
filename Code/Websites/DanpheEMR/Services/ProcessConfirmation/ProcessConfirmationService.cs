using DanpheEMR.Security;
using DanpheEMR.Services.ProcessConfirmation.DTO;
using System;

namespace DanpheEMR.Services.ProcessConfirmation
{
    public class ProcessConfirmationService : IProcessConfirmationService
    {
        public object ConfirmProcess(ProcessConfirmationUserCredentials_DTO processConfirmationUserCredentials)
        {
            //Check if input from client is valid or not.
            if (processConfirmationUserCredentials == null)
            {
                throw new ArgumentNullException("Could not Confirm Process");
            }

            //Check if User credential provided is of validUser. 
            RbacUser validUser = RBAC.GetUser(processConfirmationUserCredentials.Username, processConfirmationUserCredentials.Password);
            if (validUser == null || validUser.IsActive == false)
            {
                throw new Exception("User is not valid");
            }

            //Check if user has permission to confirm this process.
            var isValid = RBAC.UserHasPermission(validUser.UserId, processConfirmationUserCredentials.PermissionName);

            return isValid;
        }
    }
}
