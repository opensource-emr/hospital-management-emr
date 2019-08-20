using System;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{
    public class WardSupplyViewController : Controller
    {
       
        public IActionResult WardSupplyMain()
        {
            try
            {
                return View("~/Views/WardSupplyView/WardSupplyMain.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //[DanpheViewFilter("wardsupply-requisition-view")]
        public IActionResult Requisition()
        {
            try
            {
                return View("~/Views/WardSupplyView/Requisition.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //[DanpheViewFilter("wardsupply-stock-view")]
        public IActionResult Stock()
        {
            try
            {
                return View("~/Views/WardSupplyView/Stock.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //[DanpheViewFilter("wardsupply-consumption-view")]
        public IActionResult Consumption()
        {
            try
            {
                return View("~/Views/WardSupplyView/Consumption.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        //[DanpheViewFilter("wardsupply-consumption-List-view")]
        public IActionResult ConsumptionList()
        {
            try
            {
                return View("~/Views/WardSupplyView/ConsumptionList.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


    }
}
