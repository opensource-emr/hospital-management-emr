using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.AccTransfer;
using DanpheEMR.Core;
using DanpheEMR.ServerModel;

namespace DanpheEMR.AccTransfer
{
   public class Program
    {
        static void Main(string[] args)
        {
            //if (TransferToACC.EnabledData())
            //{
            //    Console.WriteLine("transfer to acc in progress..");
            //    TransferToACC obj = new TransferToACC();
            //    var post = TransferToACC.PostData(1); //inventory transfer
            //    Program.ShowMessage((post == 0) ? "0 Records of inventory transfer" : "inventory " + post + " records transferrd successfully");
            //    Console.WriteLine("Billing records transfer to acc in progress..");
            //    var Billingpost = TransferToACC.PostData(2); //billing transfer
            //    Program.ShowMessage((Billingpost == 0) ? " 0 Records of billing transfer" : "Billing " + Billingpost + " records transferrd successfully");
            //    Console.WriteLine("Pharmacy records transfer to acc in progress..");
            //    var Pharmacypost = TransferToACC.PostData(3); //pharmacy transfer
            //    Program.ShowMessage((Pharmacypost == 0) ? "0 Records of pharmacy transfer" : "Pharmacy " + Pharmacypost + " records transferrd successfully");

            //    if (post >= 0 && Pharmacypost >= 0 && Billingpost >= 0)
            //        Console.WriteLine("transferred successfully");
            //    else
            //        Console.WriteLine("transfer failed");

            //}else
            //{
            //    Console.WriteLine("Automatic transfer not allowed!! Please contact administrator to enable Automatic Accounting Transfer...");
            //}
             
        }
        public static void ShowMessage(string  message)
        {
            Console.WriteLine(message);
        }
      
     
    }
}
