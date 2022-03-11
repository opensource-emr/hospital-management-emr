using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.ViewModel.Pharmacy;
using DanpheEMR.DalLayer;
using DanpheEMR.Core.Configuration;
using Microsoft.Extensions.Options;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using Microsoft.AspNetCore.Mvc;

namespace DanpheEMR.Controllers.Pharmacy.Credit
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class PharmacyCreditController: Controller
    {
        public PharmacyDbContext phrmDbContext;

        private readonly string connString = null;
        public PharmacyCreditController(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            phrmDbContext = new PharmacyDbContext(connString);
        }
        [HttpGet("~/api/GetPatCrDetail/{id}/{visitId}/{fromDate}/{toDate}")]
        public CreditSaleViewModel GetPatCreditDetails(int id, int? visitId, DateTime? fromDate, DateTime? toDate)
        {
            CreditSaleViewModel creditSale = new CreditSaleViewModel();
          //send current patient record of credit
            try
            {
                //sud:9Oct'21--Applying WhereClause before Doing ToList() so that we filter the data in SQL itself rather than bringing all data to C# and filtering..
                IEnumerable<PHRMInvoiceTransactionItemsModel> TotalItems = phrmDbContext.PHRMInvoiceTransactionItems.Where(a => a.PatientId == id && a.InvoiceId == null).ToList();
                decimal TotalCreditAmount = TotalItems.Sum(s => s.TotalAmount).Value;

                //map credit value to ViewModel
                if (TotalItems.Count() == 0)
                {
                    creditSale.Status = "There is no such patient admitted.";
                    return creditSale;
                }
                else
                {
                    creditSale.Status = "OK";
                    creditSale.PatientId = id;
                    creditSale.TotalAmount = TotalCreditAmount;
                    creditSale.InvoiceItems = TotalItems;
                    return creditSale;
                }
                
            }
            catch(Exception)
            {
                creditSale.Status = "Failed";
                return creditSale;
            }
            
        }
    }
}
