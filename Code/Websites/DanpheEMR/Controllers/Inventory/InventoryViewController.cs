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
    public class InventoryViewController : Controller
    {
        private readonly string config = null;
        public InventoryViewController(IOptions<MyConfiguration> _config)
        {
            config = _config.Value.Connectionstring;
        }

        //Getview check valid routes for loggedin user
        //If user donsn't have access to perticular view then simply return content message
        //This Action is reusable code for this one viewController
        //need to implement this Action code from other central place
        public IActionResult GetView(string urlFullPath, string viewPath)
        {
            //Get Valid Route List for logged in user
            List<DanpheRoute> validRouteList = HttpContext.Session.Get<List<DanpheRoute>>("validRouteList");
            if (validRouteList != null || validRouteList.Count> 0)
            {
                List<DanpheRoute> validRoutes = validRouteList.Where(a => a.UrlFullPath == urlFullPath).ToList();
                if (validRoutes != null && validRoutes.Count > 0)
                {
                    //Return view for valid user
                    return View(viewPath);
                }
                else
                {
                    //Return content with message for unauthorized user
                    return Content("<div>Page Not Found</div><router-outlet></router-outlet>");
                }
           }
            else
            {
                //Return content with message for unauthorized user
                return Content("<div>Page Not Found</div><router-outlet></router-outlet>");
            }
        }
        public IActionResult InventoryMain()
        {
            try
            {
                var dal = new DalLayer.MasterDbContext(config);
                ViewData["ConnectionString"] = config;
                return this.GetView("Inventory", "InventoryMain");                              
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult ExternalMain()
        {
            try
            {
                var dal = new DalLayer.MasterDbContext(config);
                ViewData["ConnectionString"] = config;
                return this.GetView("Inventory/ExternalMain", "ExternalMain");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult InternalMain()
        {
            try
            {
                var dal = new DalLayer.MasterDbContext(config);
                ViewData["ConnectionString"] = config;
                return this.GetView("Inventory/InternalMain", "InternalMain");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult StockMain()
        {
            try
            {
                var dal = new DalLayer.MasterDbContext(config);
                ViewData["ConnectionString"] = config;
                return this.GetView("Inventory/StockMain", "StockMain");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PurchaseOrderItems()
        {
            try
            {
                var dal = new DalLayer.MasterDbContext(config);
                ViewData["ConnectionString"] = config;
                return this.GetView("Inventory/ExternalMain/PurchaseOrderItems", "PurchaseOrderItems");              
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PurchaseOrderList()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return this.GetView("Inventory/ExternalMain/PurchaseOrderList", "PurchaseOrderList");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PurchaseOrderDetails()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return this.GetView("Inventory/ExternalMain/PurchaseOrderDetails", "PurchaseOrderDetails");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult GoodsReceiptItems()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return this.GetView("Inventory/ExternalMain/GoodsReceiptItems", "GoodsReceiptItems");              
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult GoodsReceiptList()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return this.GetView("Inventory/ExternalMain/GoodsReceiptList", "GoodsReceiptList");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult GoodsReceiptDetails()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return this.GetView("Inventory/ExternalMain/GoodsReceiptDetails", "GoodsReceiptDetails");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult StockList()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return this.GetView("Inventory/StockMain/StockList", "StockList");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult StockDetails()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return this.GetView("Inventory/StockMain/StockDetails", "StockDetails");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult StockManage()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return this.GetView("Inventory/StockMain/StockManage", "StockManage");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult RequisitionItems()
        {
            try
            {
                var dal = new DalLayer.MasterDbContext(config);
                ViewData["ConnectionString"] = config;
                return this.GetView("Inventory/InternalMain/Requisition", "RequisitionItems");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #region Dispatch Items View
        public IActionResult DispatchItems()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return this.GetView("Inventory/InternalMain/Dispatch", "DispatchItems");                              

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        public IActionResult DispatchAll()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return this.GetView("Inventory/InternalMain/DispatchAll", "DispatchAll");

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
                var dal = new DalLayer.MasterDbContext(config);
                ViewData["ConnectionString"] = config;
                return this.GetView("Inventory/InternalMain/RequisitionList", "RequisitionList");            
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #region Write-Off Items View
        public IActionResult WriteOffItems()
        {
            try
            {
                //Getview return view or page not found content
                //this check User has or not permission for this view         
                //GetView with two parameter 1=> ViewFullPath, 2=> ViewName   
                return this.GetView("Inventory/InternalMain/WriteOffItems", "WriteOffItems");

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

 public IActionResult ReturnToVendorItems()
        {
            try
            {
                var dal = new DalLayer.MasterDbContext(config);

                ViewData["ConnectionString"] = config;
                return View("ReturnToVendorItems");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #region Requisition Items view
        public IActionResult RequisitionDetails()
        {
            try
            {
                return this.GetView("Inventory/InternalMain/RequisitionDetails", "RequisitionDetails");           
            }
            catch (Exception ex) { throw ex; }
        }
        #endregion



    }
}
