using DanpheEMR.TestingPlayGroundConsole.TestingClasses;
using System;

namespace DanpheEMR.TestingPlayGroundConsole
{
    class Program
    {
        

        static void Main(string[] args)
        {
            Console.WriteLine("Please note that: This framework doesn't give Pass/Fail status. Rather we have to check manually by running the required functions.");

            Console.WriteLine("Running ADT Tests");
            AdtBedCalculations.RunTests();
            Console.WriteLine("ADT Tests.. completed..");
            Console.ReadKey();
        }




    }
}
