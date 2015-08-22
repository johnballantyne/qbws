var http = require('http');
var soap = require('soap');
var color = require('colors');
var fs = require('fs');

var counter = null;

var myService = {
    QBWebConnectorSvc: {
        QBWebConnectorSvcSoap: {
            serverVersion: function() {
                var serverVersion = 'node-qbwc v0.0.1';

                serviceLog(('WebMethod: serverVersion() has been called by QBWebconnector').green);
                serviceLog('    No parameters required.');
                serviceLog('    Returned: ' + serverVersion);

                return {
                    serverVersionResult: { string: serverVersion } 
                };
            },
            clientVersion: function(args) {
                var strVersion = args.strVersion,
                    recommendedVersion = '2.0.1.30',
                    supportedMinVersion = '1.0',
                    retVal = '';

                serviceLog(('WebMethod: clientVersion() has been called by QBWebConnector').green);
                serviceLog('    Parameters received:');
                serviceLog('        string strVersion = ' + strVersion);
                serviceLog('    QBWebConnector Version = ' + strVersion);
                serviceLog('    Recommended Version = ' + recommendedVersion);
                serviceLog('    Supported Minimum Version = ' + supportedMinVersion);

                // This is a pretty weak version check and should probably be made more robust
                if (strVersion < recommendedVersion) {
                    retVal = 'W:We recommend that you upgrade your QBWebConnector';
                } else if  (strVersion < supportedMinVersion) {
                    retVal = 'E:You need to upgrade your QBWebConnector';
                }

                serviceLog('    Return values:');
                serviceLog('        string retVal = ' + retVal);

                return {
                    clientVersionResult: { string: retVal }
                };
            },
            authenticate: function(args) {
                var authReturn = [],
                    pwd;

                serviceLog(('WebMethod: authenticate() has been called by QBWebConnector').green);
                serviceLog('    Parameters received:');
                serviceLog('        string strUserName = ' + args.strUserName);
                serviceLog('        string strPassword = ' + args.strPassword);

                // TODO: Make the following comment true (implement random GUID)
                // Code below uses a random GUID to use as a session ticket
                // An example of a GUID is {85B41BEE-5CD9-427a-A61B-83964F1EB426}
                authReturn[0] = '{85B41BEE-5CD9-427a-A61B-83964F1EB426}';

                // For simplicity of sample, a hardcoded username/password is used.
                // In real world, you should handle authentication in using a standard way. 
                // For example, you could validate the username/password against an LDAP 
                // or a directory server
                pwd = 'password';
                serviceLog('    Password locally stored = ' + pwd);

                if ((args.strUserName.trim() === 'username') && (args.strPassword.trim() === pwd)) {
                    // An empty string for authReturn[1] means asking QBWebConnector 
                    // to connect to the company file that is currently opened in QB
                    authReturn[1] = 'C:\\Users\\Public\\Documents\\Intuit\\QuickBooks\\Sample Company Files\\QuickBooks 2014\\sample_wholesale-distribution business.qbw';
                } else {
                    authReturn[1] = 'nvu';
                }
                // You could also return 'none' to indicate there is no work to do
                // or a company filename in the format C:\full\path\to\company.qbw
                // based on your program logic and requirements.

                serviceLog('    Return values: ');
                serviceLog('        string[] authReturn[0] = ' + authReturn[0]);
                serviceLog('        string[] authReturn[1] = ' + authReturn[1]);

                return {
                    authenticateResult: { string: [authReturn[0], authReturn[1]] }
                };
            },
            sendRequestXML: function(args) {
                var ticket = args.ticket,
                    strHCPResponse = args.strHCPResponse,
                    strCompanyFileName = args.strCompanyFileName,
                    qbXMLCountry = args.qbXMLCountry,
                    qbXMLMajorVers = args.qbXMLMajorVers,
                    qbXMLMinorVers = args.qbXMLMinorVers,
                    req = [],
                    total,
                    request = '';

                if (counter === null) {
                    counter = 0;
                }

                serviceLog(('WebMethod: sendRequestXML() has been called by QBWebConnector').green);
                serviceLog('    Paremeters received:');
                serviceLog('        string ticket = ' + ticket);
                serviceLog('        string strHCPResponse = ' + strHCPResponse);
                serviceLog('        string strCompanyFileName = ' + strCompanyFileName);
                serviceLog('        string qbXMLCountry = ' + qbXMLCountry);
                serviceLog('        string qbXMLMajorVers = ' + qbXMLMajorVers);
                serviceLog('        string qbXMLMinorVers = ' + qbXMLMinorVers);

                req = buildRequest();
                total = req.length;

                if (counter < total) {
                    request = req[counter];
                    serviceLog('    Sending request no = ' + (counter + 1));
                    counter = counter + 1;
                } else {
                    counter = 0;
                    request = '';
                }
                        
                return {
                    sendRequestXMLResult: { string: request }
                };
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

var xml = fs.readFileSync('./lib/qbws.wsdl', 'utf8'),
server = http.createServer(function(request,response) {
    response.end('404: Not Found: ' + request.url);
});

var serviceLog = function(data) {
    var consoleLogging = true;
    if (consoleLogging) {
        console.log(data);
    }
    
    fs.appendFile('log.log', data.stripColors + '\n', function(err) {
        if(err) {
            console.log(err);
        }
    }); 
};

module.exports.run = function() {
    console.log(__dirname);
    server.listen(8000);
    var soapServer = soap.listen(server, '/wsdl', myService, xml);

    soapServer.log = function(type, data) {
        serviceLog((type + ': ').cyan + data);
    };
};
