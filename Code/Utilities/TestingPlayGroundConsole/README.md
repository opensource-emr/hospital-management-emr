## Project/File: DanpheEMR.TestingPlayGroundConsole
### Created: 20Jan'23/Sud/Krishna
### Description: 
   * Why:  Since, Implementing  the actual Unit Testing frameworks (eg: NUnit, XUnit) is not feasible in 
            DanpheEMR(Classic) for timebeing. 
         We needed some library to achieve the UnitTesting of calculation & other functions with realistic test data.
   * What:
      *  This library contains Testing classes where we can Add the Actual functions from Different Modules.
       Also we can create Mock-Data and test different scenarios.
       After successfully testing in here, we can simply Copy-Paste that function into Actual impelementation (DanpheEMR libraries).

      * We're referring the DanpheEMR.ServerModels so that we can create mock data using our Actual Models.
      *  This is a Console APP, so it can run independent and is very very lightweight than the DanpheEMR (WebProject) itself.

   * How:
     * TestClasses: TestClasses contains the actual Testing Logic to test any Logic or Functions of DanpheEMR recreating 
                 those functions as TestFunctions.
     * TestFunctions: TestFunctions will contain the actual Logic from the DanpheEMR libraries.s
     * MockDataProviders: MockDataProviders contains actual test data referring DanpheEMR.ServerModel which provides test data to * TestFunctions
     * TestRunner:  Main Function (in Program.cs) can be used to run the Tests in All TestClasses
     
     * Example of Folder Structure:

        ```
        ├── Modules
        │   ├── ADT
        │   │   ├── TestClasses
        │   │   ├── Models
        │   │   ├── MockDataProviders

        ```

<span style="color:red;font-weight:bold;"> Note: </span> 
<span style="color:blue"> This framework doesn't give Pass/Fail status. Rather we have to check manually by running the required functions.</span>     