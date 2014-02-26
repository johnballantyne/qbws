"use strict";

var http = require('http');
var soap = require('soap');
var color = require('colors');
var fs = require('fs');

var myService = {
    QBWebConnectorSvc: {
        QBWebConnectorSvcSoap: {
            serverVersion: function() {
                var v = "node-qbwc v0.0.0.1";
                serviceLog(("Server Version: " + v).green);
                return {
                    serverVersionResult: v
                };
            },
            clientVersion: function(args) {
                serviceLog(("Client Version: " + args.strVersion).green);
                return {
                    clientVersionResult: {}
                };
            },
            authenticate: function(args) {
                console.log("authenticate Stub".green);
                console.log(args);
                return {
                    authenticateResult: { string: ["fakesessionid", {}] }
                };
            },
            sendRequestXML: function(args) {
                /*
                qbXMLCountry: "US"
                qbXMLMajorVers: 11
                qbXMLMinorVers: 0
                strCompanyFileName: "C:\Documents and Settings\All Users\Documents\Intuit\QuickBooks\Sample Company Files\QuickBooks 2012\sample_wholesale-distribution business.QBW"
                strHCPResponse: "<?xml version="1.0" ?>↵<QBXML>↵<QBXMLMsgsRs>↵<HostQueryRs requestID="0" statusCode="0" statusSeverity="Info" statusMessage="Status OK">↵<HostRet>↵<ProductName>QuickBooks: Premier Manufacturing and Wholesale Edition 2012</ProductName>↵<MajorVersion>22</MajorVersion>↵<MinorVersion>0</MinorVersion>↵<Country>US</Country>↵<SupportedQBXMLVersion>1.0</SupportedQBXMLVersion>↵<SupportedQBXMLVersion>1.1</SupportedQBXMLVersion>↵<SupportedQBXMLVersion>2.0</SupportedQBXMLVersion>↵<SupportedQBXMLVersion>2.1</SupportedQBXMLVersion>↵<SupportedQBXMLVersion>3.0</SupportedQBXMLVersion>↵<SupportedQBXMLVersion>4.0</SupportedQBXMLVersion>↵<SupportedQBXMLVersion>4.1</SupportedQBXMLVersion>↵<SupportedQBXMLVersion>5.0</SupportedQBXMLVersion>↵<SupportedQBXMLVersion>6.0</SupportedQBXMLVersion>↵<SupportedQBXMLVersion>7.0</SupportedQBXMLVersion>↵<SupportedQBXMLVersion>8.0</SupportedQBXMLVersion>↵<SupportedQBXMLVersion>9.0</SupportedQBXMLVersion>↵<SupportedQBXMLVersion>10.0</SupportedQBXMLVersion>↵<SupportedQBXMLVersion>11.0</SupportedQBXMLVersion>↵<IsAutomaticLogin>false</IsAutomaticLogin>↵<QBFileMode>SingleUser</QBFileMode>↵</HostRet>↵</HostQueryRs>↵<CompanyQueryRs requestID="1" statusCode="0" statusSeverity="Info" statusMessage="Status OK">↵<CompanyRet>↵<IsSampleCompany>true</IsSampleCompany>↵<CompanyName>Wholesale/Distributor Sample File</CompanyName>↵<LegalCompanyName>Your Company Name Goes here</LegalCompanyName>↵<Address>↵<Addr1>110 Sampson Way</Addr1>↵<City>Middlefield</City>↵<State>CA</State>↵<PostalCode>94471</PostalCode>↵<Country>US</Country>↵</Address>↵<AddressBlock>↵<Addr1>110 Sampson Way</Addr1>↵<Addr2>Middlefield, CA  94471</Addr2>↵</AddressBlock>↵<LegalAddress>↵<Addr1>110 Sampson Way</Addr1>↵<City>Middlefield</City>↵<State>CA</State>↵<PostalCode>94471</PostalCode>↵<Country>US</Country>↵</LegalAddress>↵<CompanyAddressForCustomer>↵<Addr1>110 Sampson Way</Addr1>↵<City>Palo Alto</City>↵<State>CA</State>↵<PostalCode>94521</PostalCode>↵</CompanyAddressForCustomer>↵<CompanyAddressBlockForCustomer>↵<Addr1>110 Sampson Way</Addr1>↵<Addr2>Palo Alto, CA  94521</Addr2>↵</CompanyAddressBlockForCustomer>↵<Phone>650-555-1212</Phone>↵<Fax>650-555-1313</Fax>↵<Email>info@samplecompany.com</Email>↵<CompanyWebSite>www.samplecompany.com</CompanyWebSite>↵<FirstMonthFiscalYear>January</FirstMonthFiscalYear>↵<FirstMonthIncomeTaxYear>January</FirstMonthIncomeTaxYear>↵<CompanyType>WholesaleDistributionandSales</CompanyType>↵<EIN>55-5555555</EIN>↵<TaxForm>Form1040</TaxForm>↵<SubscribedServices>↵<Service>↵<Name>QuickBooks Online Banking</Name>↵<Domain>banking.qb</Domain>↵<ServiceStatus>Never</ServiceStatus>↵</Service>↵<Service>↵<Name>QuickBooks Online Billing</Name>↵<Domain>billing.qb</Domain>↵<ServiceStatus>Never</ServiceStatus>↵</Service>↵<Service>↵<Name>QuickBooks Online Billing Level 1 Service</Name>↵<Domain>qbob1.qbn</Domain>↵<ServiceStatus>Never</ServiceStatus>↵</Service>↵<Service>↵<Name>QuickBooks Online Billing Level 2 Service</Name>↵<Domain>qbob2.qbn</Domain>↵<ServiceStatus>Never</ServiceStatus>↵</Service>↵<Service>↵<Name>QuickBooks Online Billing Payment Service</Name>↵<Domain>qbobpay.qbn</Domain>↵<ServiceStatus>Never</ServiceStatus>↵</Service>↵<Service>↵<Name>QuickBooks Bill Payment</Name>↵<Domain>billpay.qb</Domain>↵<ServiceStatus>Never</ServiceStatus>↵</Service>↵<Service>↵<Name>QuickBooks Online Billing Paper Mailing Service</Name>↵<Domain>qbobpaper.qbn</Domain>↵<ServiceStatus>Never</ServiceStatus>↵</Service>↵<Service>↵<Name>QuickBooks Payroll Service</Name>↵<Domain>payroll.qb</Domain>↵<ServiceStatus>Active</ServiceStatus>↵</Service>↵<Service>↵<Name>QuickBooks Basic Payroll Service</Name>↵<Domain>payrollbsc.qb</Domain>↵<ServiceStatus>Never</ServiceStatus>↵</Service>↵<Service>↵<Name>QuickBooks Basic Disk Payroll Service</Name>↵<Domain>payrollbscdisk.qb</Domain>↵<ServiceStatus>Never</ServiceStatus>↵</Service>↵<Service>↵<Name>QuickBooks Deluxe Payroll Service</Name>↵<Domain>payrolldlx.qb</Domain>↵<ServiceStatus>Never</ServiceStatus>↵</Service>↵<Service>↵<Name>QuickBooks Premier Payroll Service</Name>↵<Domain>payrollprm.qb</Domain>↵<ServiceStatus>Never</ServiceStatus>↵</Service>↵<Service>↵<Name>Basic Plus Federal</Name>↵<Domain>basic_plus_fed.qb</Domain>↵<ServiceStatus>Never</ServiceStatus>↵</Service>↵<Service>↵<Name>Basic Plus Federal and State</Name>↵<Domain>basic_plus_fed_state.qb</Domain>↵<ServiceStatus>Never</ServiceStatus>↵</Service>↵<Service>↵<Name>Basic Plus Direct Deposit</Name>↵<Domain>basic_plus_dd.qb</Domain>↵<ServiceStatus>Never</ServiceStatus>↵</Service>↵<Service>↵<Name>Merchant Account Service</Name>↵<Domain>mas.qbn</Domain>↵<ServiceStatus>Never</ServiceStatus>↵</Service>↵</SubscribedServices>↵<AccountantCopy>↵<AccountantCopyExists>false</AccountantCopyExists>↵</AccountantCopy>↵<DataExtRet>↵<OwnerID>{87EDAAF8-637E-4203-867F-4BA79C2F8998}</OwnerID>↵<DataExtName>AppLock</DataExtName>↵<DataExtType>STR255TYPE</DataExtType>↵<DataExtValue>LOCKED:FLAMESCA-9A420E:635289565906618390</DataExtValue>↵</DataExtRet>↵<DataExtRet>↵<OwnerID>{87EDAAF8-637E-4203-867F-4BA79C2F8998}</OwnerID>↵<DataExtName>FileID</DataExtName>↵<DataExtType>STR255TYPE</DataExtType>↵<DataExtValue>{CA1C3EB8-1B61-4747-A743-8D5B438B83AC}</DataExtValue>↵</DataExtRet>↵</CompanyRet>↵</CompanyQueryRs>↵<PreferencesQueryRs requestID="2" statusCode="0" statusSeverity="Info" statusMessage="Status OK">↵<PreferencesRet>↵<AccountingPreferences>↵<IsUsingAccountNumbers>false</IsUsingAccountNumbers>↵<IsRequiringAccounts>true</IsRequiringAccounts>↵<IsUsingClassTracking>true</IsUsingClassTracking>↵<IsUsingAuditTrail>true</IsUsingAuditTrail>↵<IsAssigningJournalEntryNumbers>true</IsAssigningJournalEntryNumbers>↵<ClosingDate>2016-11-30</ClosingDate>↵</AccountingPreferences>↵<FinanceChargePreferences>↵<AnnualInterestRate>18.00</AnnualInterestRate>↵<MinFinanceCharge>1.00</MinFinanceCharge>↵<GracePeriod>30</GracePeriod>↵<FinanceChargeAccountRef>↵<ListID>540000-994887102</ListID>↵<FullName>Other Income:Interest Income</FullName>↵</FinanceChargeAccountRef>↵<IsAssessingForOverdueCharges>true</IsAssessingForOverdueCharges>↵<CalculateChargesFrom>DueDate</CalculateChargesFrom>↵<IsMarkedToBePrinted>true</IsMarkedToBePrinted>↵</FinanceChargePreferences>↵<JobsAndEstimatesPreferences>↵<IsUsingEstimates>true</IsUsingEstimates>↵<IsUsingProgressInvoicing>true</IsUsingProgressInvoicing>↵<IsPrintingItemsWithZeroAmounts>true</IsPrintingItemsWithZeroAmounts>↵</JobsAndEstimatesPreferences>↵<MultiCurrencyPreferences>↵<IsMultiCurrencyOn>false</IsMultiCurrencyOn>↵</MultiCurrencyPreferences>↵<MultiLocationInventoryPreferences>↵<IsMultiLocationInventoryAvailable>false</IsMultiLocationInventoryAvailable>↵<IsMultiLocationInventoryEnabled>false</IsMultiLocationInventoryEnabled>↵</MultiLocationInventoryPreferences>↵<PurchasesAndVendorsPreferences>↵<IsUsingInventory>true</IsUsingInventory>↵<DaysBillsAreDue>30</DaysBillsAreDue>↵<IsAutomaticallyUsingDiscounts>false</IsAutomaticallyUsingDiscounts>↵<DefaultDiscountAccountRef>↵<ListID>290001-995410220</ListID>↵<FullName>Other Income:Early Payment Discounts</FullName>↵</DefaultDiscountAccountRef>↵</PurchasesAndVendorsPreferences>↵<ReportsPreferences>↵<AgingReportBasis>AgeFromDueDate</AgingReportBasis>↵<SummaryReportBasis>Accrual</SummaryReportBasis>↵</ReportsPreferences>↵<SalesAndCustomersPreferences>↵<DefaultMarkup>100.00</DefaultMarkup>↵<IsTrackingReimbursedExpensesAsIncome>false</IsTrackingReimbursedExpensesAsIncome>↵<IsAutoApplyingPayments>true</IsAutoApplyingPayments>↵<PriceLevels>↵<IsUsingPriceLevels>true</IsUsingPriceLevels>↵<IsRoundingSalesPriceUp>true</IsRoundingSalesPriceUp>↵</PriceLevels>↵</SalesAndCustomersPreferences>↵<TimeTrackingPreferences>↵<FirstDayOfWeek>Monday</FirstDayOfWeek>↵</TimeTrackingPreferences>↵<CurrentAppAccessRights>↵<IsAutomaticLoginAllowed>true</IsAutomaticLoginAllowed>↵<AutomaticLoginUserName>Admin</AutomaticLoginUserName>↵<IsPersonalDataAccessAllowed>false</IsPersonalDataAccessAllowed>↵</CurrentAppAccessRights>↵<ItemsAndInventoryPreferences>↵<EnhancedInventoryReceivingEnabled>false</EnhancedInventoryReceivingEnabled>↵<IsTrackingSerialOrLotNumber>None</IsTrackingSerialOrLotNumber>↵<FIFOEnabled>false</FIFOEnabled>↵</ItemsAndInventoryPreferences>↵</PreferencesRet>↵</PreferencesQueryRs>↵</QBXMLMsgsRs>↵</QBXML>"
                ticket: "15c9ce293bd3f41b761c21635b14fa06"
                */
                var qbXMLCountry = args.qbXMLCountry,
                qbXMLMajorVers = args.qbXMLMajorVers,
                qbXMLMinorVers = args.qbXMLMinorVers,
                strCompanyFileName = args.strCompanyFileName,
                strHCPResponse = args.strHCPResponse,
                ticket = args.ticket;
                
                console.log(("sendRequestXML Stub " + args).yellow);
            },
            closeConnection: function() {
                console.log("closeConnection Stub".green);
            },
            connectionError: function() {
                console.log("connectionError Stub".red);
            },
            getInteractiveURL: function() {
                console.log("getInteractiveURL Stub".yellow);
            },
            getLastError: function() {
                console.log("getLastError Stub".yellow);
            },
            interactiveDone: function() {
                console.log("interactiveDone Stub".yellow);
            },
            interactiveRejected: function() {
                console.log("interactiveRejected Stub".yellow);
            },
            receiveResponseXML: function() {
                console.log("receiveResponseXML Stub".yellow);
            }
        }
    }
};

var xml = fs.readFileSync('myservice.wsdl', 'utf8'),
server = http.createServer(function(request,response) {
    response.end("404: Not Found: " + request.url);
});

server.listen(8000);
var soapServer = soap.listen(server, '/wsdl', myService, xml);

soapServer.log = function(type, data) {
    serviceLog((type + ": ").cyan + data);
};

var serviceLog = function(data) {
    var consoleLogging = true;
    if (consoleLogging) {
        console.log(data);
    }
    
    fs.appendFile("log.log", data.stripColors + "\n", function(err) {
        if(err) {
            console.log(err);
        }
    }); 
};