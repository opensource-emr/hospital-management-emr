using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{
    public class SystemAdminViewController : Controller
    {

        //[DanpheViewFilter("systemadmin-view")]
        public IActionResult SystemAdminMain()
        {
            return View("SystemAdminMain");            
        }


        //[DanpheViewFilter("systemadmin-databasebackup-view")]
        public IActionResult DatabaseBackup()
        {
            return View("DatabaseBackup");
        }
        public IActionResult InvoiceDetails()
        {
            return View("InvoiceDetails");
        }

        //[DanpheViewFilter("systemadmin-databasebackup-view")]
        public IActionResult DatabaseAudit()
        {
            return View("DatabaseAudit");
        }

        public IActionResult SalesBookReport()
        {
            return View("SalesBookReport");
        }
        public IActionResult PHRMSalesBookReport()
        {
            return View();
        }
    }
}
