using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{
    public class NursingViewController : Controller
    {
        private readonly string conString = null;
        public NursingViewController(IOptions<MyConfiguration> _conString)
        {
            this.conString = _conString.Value.Connectionstring;
        }
       
        //[DanpheViewFilter("nursing-order-view")]
        public IActionResult NursingOrder()
        {
            try
            {
                ViewData["ConnectionString"] = conString;
                return View();
            }
            catch (Exception ex)
            {
                throw ex;
            }            
        }

        //[DanpheViewFilter("nursing-order-list-view")]
        public IActionResult NursingOrderList()
        {
            try
            {

                return View();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //Load Main Nursing view
        public IActionResult Nursing()
        {
            try
            {             
                return View();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult RequisitionList()
        {
            try
            {
                return View("~/Views/NursingView/RequisitionList.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

    }
}
