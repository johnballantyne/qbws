var http = require('http');
var soap = require('soap');
var chalk = require('chalk');
var fs = require('fs');
var builder = require('xmlbuilder');
var uuid = require('node-uuid');

var qbws,
    server,
    counter = null,
    connectionErrCounter = null;

function buildRequest() {
    // TODO: is 'pretty' false by default? Probably.
    var req = [],
        strRequestXML,
        inputXMLDoc;

    // CustomerQuery
    inputXMLDoc = builder.create('QBXML', { version: '1.0' })
              .instruction('qbxml', 'version="4.0"')
              .ele('QBXMLMsgsRq', { 'onError': 'stopOnError' })
                  .ele('CustomerQueryRq', { 'requestID': '1' })
                      .ele('MaxReturned')
                          .text('1');
    strRequestXML = inputXMLDoc.end({ 'pretty': false });
    req.push(strRequestXML);

    // clean up
    strRequestXML = "";
    inputXMLDoc = null;

    // InvoiceQuery
    inputXMLDoc = builder.create('QBXML', { version: '1.0' })
              .instruction('qbxml', 'version="4.0"')
              .ele('QBXMLMsgsRq', { 'onError': 'stopOnError' })
                  .ele('InvoiceQueryRq', { 'requestID': '2' })
                      .ele('MaxReturned')
                          .text('1');
    strRequestXML = inputXMLDoc.end({ 'pretty': false });
    req.push(strRequestXML);

    // clean up
    strRequestXML = "";
    inputXMLDoc = null;

    // BillQuery
    inputXMLDoc = builder.create('QBXML', { version: '1.0' })
              .instruction('qbxml', 'version="4.0"')
              .ele('QBXMLMsgsRq', { 'onError': 'stopOnError' })
                  .ele('BillQueryRq', { 'requestID': '3' })
                      .ele('MaxReturned')
                          .text('1');
    strRequestXML = inputXMLDoc.end({ 'pretty': false });
    req.push(strRequestXML);

    return req;
}

function parseForVersion(input) {
    // This method is created just to parse the first two version components
    // out of the standard four component version number:
    // <Major>.<Minor>.<Release>.<Build>
    //
    // As long as you get the version in right format, you could use
    // any algorithm here.
    var major = '',
        minor = '',
        version = /^(\d+)\.(\d+)(\.\w+){0,2}$/,
        versionMatch;

    versionMatch = version.exec(input.toString());

    if (versionMatch !== null) {
        major = versionMatch[1];
        minor = versionMatch[2];

        return major + "." + minor;
    } else {
        return input;
    }
}

function serviceLog(data) {
    // TODO: Put the log file somewhere else
    var consoleLogging = true;
    if (consoleLogging) {
        console.log(data);
    }

    fs.appendFile('log.log', chalk.stripColor(data) + '\n', function callback(err) {
        if (err) {
            console.log(err);
        }
    });
}

function announceMethod(name, params) {
    var arg,
        argType;

    serviceLog(chalk.green('WebMethod: ' + name +
                '() has been called by QBWebConnector'));

    // TODO: dedicated method for Object...length
    if (Object.getOwnPropertyNames(params).length) {
        serviceLog('    Parameters received:');
        for (arg in params) {
            if (params.hasOwnProperty(arg)) {
                // TODO: Truncate long value
                argType = typeof params[arg];
                // TODO: DRY this up
                if (argType === 'object') {
                    serviceLog('        ' + argType + ' ' + arg + ' = ' +
                               JSON.stringify(params[arg], null, 2));
                } else {
                    serviceLog('        ' + argType + ' ' + arg + ' = ' +
                               params[arg]);
                }
            }
        }
    } else {
        serviceLog('    No parameters received.');
    }
}

qbws = {
    QBWebConnectorSvc: {
        QBWebConnectorSvcSoap: {}
    }
};


// WebMethod - serverVersion()
// To enable web service with its version number returned back to QBWC
//
// OUT:
// string
// Possible values:
// Version string representing server version
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.serverVersion =
function (args) {
    var retVal = '0.1.10';

    announceMethod('serverVersion', args);
    serviceLog('    No parameters required.');
    serviceLog('    Returned: ' + retVal);

    return {
        serverVersionResult: { string: retVal }
    };
};

// WebMethod - clientVersion()
// To enable web service with QBWC version control
//
// IN:
// string strVersion
//
// OUT:
// string errorOrWarning
// Possible values:
// string retVal
// - NULL or <emptyString> = QBWC will let the web service update
// - "E:<any text>" = popup ERROR dialog with <any text> 
//                  - abort update and force download of new QBWC.
// - "W:<any text>" = popup WARNING dialog with <any text> 
//                  - choice to user, continue update or not.
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.clientVersion =
function (args) {
    var strVersion = args.strVersion,
        recommendedVersion = '2.0.1.30',
        supportedMinVersion = '1.0',
        suppliedVersion,
        retVal = '';

    suppliedVersion = parseForVersion(strVersion);

    announceMethod('clientVersion', args);

    serviceLog('    QBWebConnector Version = ' + strVersion);
    serviceLog('    Recommended Version = ' + recommendedVersion);
    serviceLog('    Supported Minimum Version = ' + supportedMinVersion);
    serviceLog('    Supplied Version = ' + suppliedVersion);

    if (strVersion < recommendedVersion) {
        retVal = 'W:We recommend that you upgrade your QBWebConnector';
    } else if (strVersion < supportedMinVersion) {
        retVal = 'E:You need to upgrade your QBWebConnector';
    }

    serviceLog('    Return values:');
    serviceLog('        string retVal = ' + retVal);

    return {
        clientVersionResult: { string: retVal }
    };
};

// WebMethod - authenticate()
// To verify username and password for the web connector that is trying to connect
//
// IN:
// string strUserName
// string strPassword
//
// OUT:
// string[] authReturn
// Possible values:
// string[0] = ticket
// string[1]
// - empty string = use current company file
// - "none" = no further request/no further action required
// - "nvu" = not valid user
// - any other string value = use this company file
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.authenticate =
function (args) {
    var authReturn = [],
        pwd;

    announceMethod('authenticate', args);

    // Code below uses a random GUID to use as a session ticket
    // An example of a GUID is {85B41BEE-5CD9-427a-A61B-83964F1EB426}
    authReturn[0] = uuid.v1();

    // For simplicity of sample, a hardcoded username/password is used.
    // In real world, you should handle authentication in using a standard way.
    // For example, you could validate the username/password against an LDAP
    // or a directory server
    // TODO: This shouldn't be hard coded
    pwd = 'password';
    serviceLog('    Password locally stored = ' + pwd);

    if (args.strUserName.trim() === 'username' && args.strPassword.trim() === pwd) {
        // An empty string for authReturn[1] means asking QBWebConnector
        // to connect to the company file that is currently opened in QB
        // TODO: This shouldn't be hard coded
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
};

// WebMethod - sendRequestXML()
//
// IN:
// int qbXMLMajorVers
// int qbXMLMinorVers
// string ticket
// string strHCPResponse
// string strCompanyFileName
// string Country
// int qbXMLMajorVers
// int qbXMLMinorVers
//
// OUT:
// string request
// Possible values:
// - any_string = Request XML for QBWebConnector to process
// - "" = No more request XML
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.sendRequestXML =
function (args) {
    var req = [],
        total,
        request = '';

    if (counter === null) {
        counter = 0;
    }

    announceMethod('sendRequestXML', args);

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
};

// WebMethod - closeConnection()
// At the end of a successful update session, QBWebConnector will call this web method.
//
// IN:
// string ticket
//
// OUT:
// string closeConnection result
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.closeConnection =
function (args) {
    var retVal = null;

    announceMethod('closeConnection', args);

    retVal = 'OK';

    serviceLog('    Return values:');
    serviceLog('        string retVal = ' + retVal);

    return {
        closeConnectionResult: { string: retVal }
    };
};

// WebMethod - connectionError()
// To facilitate capturing of QuickBooks error and notifying it to web services
//
// IN:
// string ticket = A GUID based ticket string to maintain identity of QBWebConnector
// string hresult = An HRESULT value thrown by QuickBooks when trying to make connection
// string message = An error message corresponding to the HRESULT
//
// OUT:
// string retVal
// Possible values:
// - done = no further action required from QBWebConnector
// - any other string value = use this name for company file
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.connectionError =
function (args) {
    var hresult = args.hresult,
        message = args.message,
        retVal = null,
    // 0x80040400 - QuickBooks found an error when parsing the
    //     provided XML text stream.
        QB_ERROR_WHEN_PARSING = '0x80040400',
    // 0x80040401 - Could not access QuickBooks.
        QB_COULDNT_ACCESS_QB = '0x80040401',
    // 0x80040402 - Unexpected error. Check the qbsdklog.txt file for
    //     possible additional information.
        QB_UNEXPECTED_ERROR = '0x80040402';
    // Add more as you need...

    if (connectionErrCounter === null) {
        connectionErrCounter = 0;
    }

    announceMethod('connectionError', args);

    // TODO: Why is the same code repeated thrice? Switch statement instead?
    if (hresult.trim() === QB_ERROR_WHEN_PARSING) {
        serviceLog('    HRESULT = ' + hresult);
        serviceLog('    Message = ' + message);
        retVal = 'DONE';
    } else if (hresult.trim() === QB_COULDNT_ACCESS_QB) {
        serviceLog('    HRESULT = ' + hresult);
        serviceLog('    Message = ' + message);
        retVal = 'DONE';
    } else if (hresult.trim() === QB_UNEXPECTED_ERROR) {
        serviceLog('    HRESULT = ' + hresult);
        serviceLog('    Message = ' + message);
        retVal = 'DONE';
    } else {
        // Depending on various hresults return different value
        if (connectionErrCounter === 0) {
            // Try again with this company file
            serviceLog('    HRESULT = ' + hresult);
            serviceLog('    Message = ' + message);
            serviceLog('    Sending empty company file to try again.');
            retVal = '';
        } else {
            serviceLog('    HRESULT = ' + hresult);
            serviceLog('    Message = ' + message);
            serviceLog('    Sending DONE to stop.');
            retVal = 'DONE';
        }
    }

    serviceLog('    Return values:');
    serviceLog('        string retVal = ' + retVal);
    connectionErrCounter = connectionErrCounter + 1;

    return {
        connectionErrorResult: { string: retVal }
    };

};

// WebMethod - getInteractiveURL()
//
// IN:
// string wcTicket
// string sessionID
//
// OUT:
// URL string
// Possible values:
// URL to a website
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.getInteractiveURL =
function (args) {
    var retVal = '';

    announceMethod('getInteractiveURL', args);

    return {
        getInteractiveURLResult: { string: retVal }
    };
};

// WebMethod - getLastError()
//
// IN:
// string ticket
//
// OUT:
// string retVal
// Possible Values:
// Error message describing last web service error
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.getLastError =
function (args) {
    var errorCode = 0,
        retVal = '';

    announceMethod('getLastError', args);

    if (errorCode === -101) {
        // This is just an example of custom user errors
        retVal = 'QuickBooks was not running!';
    } else {
        retVal = 'Error!';
    }

    serviceLog('    Return values:');
    serviceLog('        string retVal = ' + retVal);

    return {
        getLastErrorResult:  { string: retVal }
    };

};

// WebMethod - interactiveDone()
//
// IN:
// string wcTicket
//
// OUT:
// string
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.interactiveDone =
function (args) {
    var retVal = '';

    announceMethod('interactiveDone', args);

    return {
        interactiveDoneResult: { string: retVal }
    };
};

// WebMethod - interactiveRejected()
//
// IN:
// string wcTicket
// string reason
//
// OUT:
// string
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.interactiveRejected =
function (args) {
    var retVal = '';

    announceMethod('interactiveRejected', args);

    return {
        interactiveRejectedResult: { string: retVal }
    };
};

// WebMethod - receiveResponseXML()
//
// IN:
// string ticket
// string response
// string hresult
// string message
//
// OUT:
// int retVal
// Greater than zero  = There are more request to send
// 100 = Done. no more request to send
// Less than zero  = Custom Error codes
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.receiveResponseXML =
function (args) {
    var response = args.response,
        hresult = args.hresult,
        message = args.message,
        retVal = 0,
        req = [],
        percentage;

    announceMethod('receiveResponseXML', args);

    // TODO: Create method for Object testing and property names length
    if (typeof hresult === 'object' && Object.getOwnPropertyNames(hresult).length !== 0) {
        // If there is an error with response received,
        //     web service could also return a -ve int
        serviceLog('    HRESULT = ' + hresult);
        serviceLog('    Message = ' + message);
        retVal = -101;
    } else {
        serviceLog('    Length of response received = ' + response.length);

        req = buildRequest();
        percentage = counter * 100 / req.length;
        if (percentage >= 100) {
            counter = 0;
        }

        // QVWC throws an error if if the return value contains a decimal
        retVal = percentage.toFixed();
    }

    serviceLog('    Return values: ');
    serviceLog('        Number retVal = ' + retVal);

    return {
        receiveResponseXMLResult: { string: retVal }
    };
};

server = http.createServer(function requestListener(request,response) {
    response.end('404: Not Found: ' + request.url);
});

module.exports.run = function runQBWS() {
    var soapServer,
        xml = fs.readFileSync(__dirname + '/qbws.wsdl', 'utf8');

    console.log(__dirname);
    server.listen(8000);
    soapServer = soap.listen(server, '/wsdl', qbws, xml);

    soapServer.log = function soapServerLog(type, data) {
        serviceLog(type + ': ' + data);
    };
};

