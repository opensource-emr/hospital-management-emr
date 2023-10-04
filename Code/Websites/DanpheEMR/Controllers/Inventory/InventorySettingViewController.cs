using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.Utilities;
// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860


namespace DanpheEMR.Controllers
{
    public class InventorySettingViewController : Controller
    {
        private readonly string config = null;
        public InventorySettingViewController(IOptions<MyConfiguration> _config)
        {
            config = _config.Value.Connectionstring;
        }

        #region Settings Main
        public IActionResult Settings()
        {
            try
            {
                return View("~/Views/InventoryView/Settings/SettingsMain.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        #endregion

    }
}
