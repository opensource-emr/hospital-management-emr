using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.Services.ProcessConfirmation.DTO;

namespace DanpheEMR.Services.ProcessConfirmation
{
    public interface IProcessConfirmationService
    {
        object ConfirmProcess(ProcessConfirmationUserCredentials_DTO processConfirmationUserCredentials);
    }
}
