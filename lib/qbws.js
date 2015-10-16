var http = require('http');
var soap = require('soap');
var chalk = require('chalk');
var fs = require('fs');
var builder = require('xmlbuilder');
var uuid = require('node-uuid');

var qbws,
    server,
    counter = null,
    connectionErrCounter = null,
    username = 'username',
    password = 'password',
    // Change companyFile to an empty string to use the company file
    //     currently open in Quickbooks
    companyFile = 'C:\\Users\\Public\\Documents\\Intuit\\QuickBooks\\Sample Company Files\\QuickBooks 2014\\sample_wholesale-distribution business.qbw',
    req = [],
    config = {
        'verbosity': 2
    };

/**
 * @function buildWsdl
 *
 * @desc Fetches the wsdl file; address location is changed if set in config.
 *
 * @summary If needed, set `'wsdlAddress'` within config to build a correct
 *   wsdl file. This is likely unecessary if you're not connecting to your web
 *   service with a client other than the QuickBooks Web Connector. The Web
 *   Connector doesn't seem to care if the address location is incorrect, but
 *   connecting using a client created with the soap package does.
 *
 * @param {String} wsdlFileLocation - Optional. Defaults to `'/qbws.wsdl'`.
 *
 * @returns {String} The wsdl file.
 */
function buildWsdl(wsdlFileLocation) {
    var wsdl,
        address = config.wsdlAddress;

    wsdlFileLocation = wsdlFileLocation || '/qbws.wsdl';
    wsdl = fs.readFileSync(__dirname + wsdlFileLocation, 'utf8');

    if (address) {
        wsdl = wsdl.replace(/<soap:address\ +location=".*"\ +\/>/,
                            '<soap:address location="' + address + '" />');
    }

    return wsdl;
}

/**
 * @function buildRequest
 *
 * @desc Returns an array of sample QBXML requests
 *
 * @summary These QBXML requests are hard coded in to provide examples. This
 *   should be replaced with something dynamic.
 *
 * @returns {String|Array} QBXML requests: CustomerQuery, InvoiceQuery and
 *   BillQuery
 */
function buildRequest() {
    // TODO: is 'pretty' false by default? Probably.
        var strRequestXML,
        inputXMLDoc,
        request = [];

    // CustomerQuery
    inputXMLDoc = builder.create('QBXML', { version: '1.0' })
              .instruction('qbxml', 'version="4.0"')
              .ele('QBXMLMsgsRq', { 'onError': 'stopOnError' })
                  .ele('CustomerQueryRq', { 'requestID': '1' })
                      .ele('MaxReturned')
                          .text('1');
    strRequestXML = inputXMLDoc.end({ 'pretty': false });
    request.push(strRequestXML);

    // clean up
    strRequestXML = '';
    inputXMLDoc = null;

    // InvoiceQuery
    inputXMLDoc = builder.create('QBXML', { version: '1.0' })
              .instruction('qbxml', 'version="4.0"')
              .ele('QBXMLMsgsRq', { 'onError': 'stopOnError' })
                  .ele('InvoiceQueryRq', { 'requestID': '2' })
                      .ele('MaxReturned')
                          .text('1');
    strRequestXML = inputXMLDoc.end({ 'pretty': false });
    request.push(strRequestXML);

    // clean up
    strRequestXML = '';
    inputXMLDoc = null;

    // BillQuery
    inputXMLDoc = builder.create('QBXML', { version: '1.0' })
              .instruction('qbxml', 'version="4.0"')
              .ele('QBXMLMsgsRq', { 'onError': 'stopOnError' })
                  .ele('BillQueryRq', { 'requestID': '3' })
                      .ele('MaxReturned')
                          .text('1');
    strRequestXML = inputXMLDoc.end({ 'pretty': false });
    request.push(strRequestXML);

    return request;
}

/**
 * @function parseForVersion
 *
 * @desc Parses the first two version components out of the standard four
 *   component version number: `<Major>.<Minor>.<Release>.<Build>`.
 *
 * @example
 *   // returns 2.0
 *   parseForVersion('2.0.1.30');
 *
 * @param {String} input - A version number.
 *
 * @returns {String} First two version components (i.e. &lt;Major>.&lt;Minor>)
 *   if `input` matches the regular expression. Otherwise returns `input`.
 */
function parseForVersion(input) {
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

        return major + '.' + minor;
    } else {
        return input;
    }
}

/**
 * @function serviceLog
 *
 * @desc Writes a string to the console and log file.
 *
 * @param {String} data - The information to be logged.
 */
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

/**
 * @function objectNotEmpty
 *
 * @desc Checks that the type of a variable is 'object' and it is not empty.
 *
 * @param {Object} obj - The object to be checked.
 *
 * @returns {Number} The number of properties in obj, or null if it is not an
 *   object.
 */
function objectNotEmpty(obj) {
    if (typeof obj !== 'object') {
        return null;
    }

    return Object.getOwnPropertyNames(obj).length;
}

/**
 * @function announceMethod
 *
 * @desc Logs qbws method calls and their parameters.
 *
 * @param {String} name - The name of the method.
 *
 * @param {Object} params - The parameters sent to the method.
 */
function announceMethod(name, params) {
    var arg,
        argType;

    if (config.verbosity > 0) {
        serviceLog(chalk.green('WebMethod: ' + name +
                    '() has been called by QBWebConnector'));
    }

    if (config.verbosity > 1) {
        if (objectNotEmpty(params)) {
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
}

qbws = {
    QBWebConnectorSvc: {
        QBWebConnectorSvcSoap: {}
    }
};

/**
 * @function authenticate
 *
 * @desc Prompts qbws to authenticate the supplied user and specify the company
 *   to be used in the session.
 *
 * @summary When a scheduled update occurs for qbws or when the user clicks
 *   Update Selected in the Web Connector, authenticate() is called supplying
 *   the user name and password required for the user to access your web
 *   service. Your web service validates the user specified in the authenticate
 *   call and returns a string array.
 *
 * @param {String} args.strUsername The Web Connector supplies the user name
 *   that you provided to your user in the QWC file to allow that username to
 *   access your web service.
 *
 * @param {String} args.strPassword The Web Connector supplies the user
 *   password (provided to your user by you) which was stored by the user in
 *   the web connector.
 *
 * @example
 *   authReturn[1] = '';
 *   authReturn[2] = '30'
 *   authReturn[3] = ''
 *   // Result: the update is postponed by `30` seconds. In the QBWC status
 *   //   window this will be shown:
 *   //   'Last Result - Update postponed by application'.
 *
 * @example
 *   authReturn[1] = '';
 *   authReturn[2] = '';
 *   authReturn[3] = '60';
 *   // Result: The minimum limit for the `Every_Min` parameter is set. In the
 *   //   QBWC status window, the value of the `Every_Min` field will be shown
 *   //   set to `60` if the previous `Every_Min` value is lesser than `60`.
 *   //   The Last Run time and the Next Run time is also shown. (Here Next Run
 *   //   Time = Last Run Time = 60 seconds).
 *
 * @example
 *   authReturn[1] = '';
 *   authReturn[2] = '30';
 *   authReturn[3] = '60';
 *   // Result: The update is postponed by `30` seconds and the minimum limit
 *   //   for the `Every_Min` parameter is set. In the QBWC status window, the
 *   //   following are shown: 'Last Result - Update postponed by application.'
 *   //   Last Run time and the Next RUn time is also shown. (Here Next Run
 *   //   Time = Last Run Time + x seconds). Every_Min field is set to `60` if
 *   //   the previous `Every_Min` value is lesser than the `60`.
 *
 * @example
 *   authReturn[1] = 'NONE'; // Or 'NVU' or 'BUSY'
 *   authReturn[2] = '30';
 *   authReturn[3] = '';
 *   // Result: The update is postponed by 30 seconds. In the QBWC status
 *   //   the following will be shown:
 *   //   'Last Results - Update postponed by application'.
 *
 * @example
 *   authReturn[1] = 'NONE'; // Or 'NVU' or 'BUSY'
 *   authReturn[2] = '';
 *   authReturn[3] = '60';
 *   // Result: The minimum limit on the `Every_Min` parameter is set and the
 *   //   update is stopped. In the QBWC status window the following will be
 *   //   shown: 'Last Result - No Data Exchange/Invalid password for username/
 *   //   Application Busy' based on the value of authReturn[1]. Last Run Time
 *   //   and Next Run TIme is displayed; here Next Run Time = Last Run Time +
 *   //   60 seconds. `Every_Min` field is set to `60` if the previous
 *   //   `Every_Min` value was lesser than `60.
 *
 * @example
 *   authReturn[1] = 'NONE'; // Or 'NVU' or 'BUSY'
 *   authReturn[2] = '30';
 *   authReturn[3] = '60';
 *   // Result: the minimum limit on the `Every_Min` parameter is set and the
 *   //   update is postponed. In the QBWC status window the following will be
 *   //   shown: 'Last Result - Update postponed by application'. `Every_Min`
 *   //   field is et to `60` if previously less than `60`. Last Run TIme and
 *   //   Next Run Time is displayed. Here Next Run Time = Last Run Time + 30
 *   //   seconds.
 *
 * @example
 *   authReturn[1] = '';
 *   authReturn[2] = '';
 *   authReturn[3] = '';
 *   // Result: Update will complete successfully.
 *
 * @returns {String|Array} Instructions for QuickBooks to proceed with update.
 *   A string array must be returned with four possible elements. In this
 *   returned string array:
 *   - _The zeroth element_ provides a session ticket for the client.
 *   - _The first element_ contains either `'NONE'`, `'NVU'` (invalid user),
 *     `'BUSY'`, `''` (empty string), or a string that is the QB company file
 *     name. If qbws returns an empty string or any other string that is NOT
 *     `'NVU'`, `'NONE'`, or `'BUSY'`, that string will be used as the
 *     qbCompanyFileName parameter in the web connector's BeginSession call to
 *     QuickBooks.
 *   - _The second element_ enables qbws to postpone the update process. The
 *     value in this parameter determines the number of seconds by which the
 *     update will be postponed. For example, if `authReturn[2] = 60`, the Web
 *     Connector will postpone the update process by 60 seconds. That is, the
 *     current update process is discontinued and will resume after 60 seconds.
 *   - _The third element_ (optional) sets the lower limit in seconds for the
 *     `Every_Min` parameter (this parameter determines the interval the
 *     scheduler uses to run the updates when autorun is enabled). For example:
 *     if `authReturn[3] = 300`, suppose a client tries to set `Every_Min = 2`
 *     using the UI of the Web Connector instance. In this case the result
 *     would be a popup that informs the user that the lower limit for this
 *     parameter is 300 seconds and the Web Connector will automatically set
 *     the `Every_Min` parameter to `5` minutes (300 seconds).
 *   - _The fourth element_ (optional) contains the number of seconds to be
 *     used as the `MinimumRunEveryNSeconds` time.
 *   **Important**: In order to enable qbws to utilize `authReturn[2]` &
 *   `authReturn[3]`, 'Auto Run' hase to be enabled in the Web Connector.
 *
 *   Possible return values
 *   - string[0] = ticket
 *   - string[1]
 *     - `''` (empty string) = use current company file
 *     - `'none'` = no further request/no further action required
 *     - `'nvu'` = not valid user
 *     - any other string value = use this company file
 */
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.authenticate =
function (args) {
    var authReturn = [];

    announceMethod('authenticate', args);

    // Code below uses a random GUID to use as a session ticket
    // An example of a GUID is {85B41BEE-5CD9-427a-A61B-83964F1EB426}
    authReturn[0] = uuid.v1();

    // For simplicity of sample, a hardcoded username/password is used.
    // In real world, you should handle authentication in using a standard way.
    // For example, you could validate the username/password against an LDAP
    // or a directory server
    // TODO: This shouldn't be hard coded
    serviceLog('    Password locally stored = ' + password);

    if (args.strUserName.trim() === username && args.strPassword.trim() === password) {
        req = buildRequest();

        if (req.length === 0) {
            authReturn[1] = 'NONE';
        } else {
            // An empty string for authReturn[1] means asking QBWebConnector
            // to connect to the company file that is currently opened in QB
            authReturn[1] = companyFile;
        }
    } else {
        authReturn[1] = 'nvu';
    }

    serviceLog('    Return values: ');
    serviceLog('        string[] authReturn[0] = ' + authReturn[0]);
    serviceLog('        string[] authReturn[1] = ' + authReturn[1]);

    return {
        authenticateResult: { 'string': [authReturn[0], authReturn[1]] }
    };
};

/**
 * @function clientVersion
 *
 * @desc An optional callback that allows the web service to evaluate the
 *  current Web Connector version and react to it.
 *
 * @summary Not currently required to support backward compatibility but
 *   strongly recommended.
 *
 *   When the Web Connector user clicks on Update Selected with your web
 *   service selected or when a scheduled update occurs, the Web Connector
 *   begins the communication by calling clientVersion.
 *
 *   Not currently required to support backward compatibility but strongly
 *   recommended. If your web service does not implement this callback method,
 *   the Web Connector simply proceeds to the update by calling authenticate().
 *
 *   If your web service does implement the clientVersion callback, the Web
 *   Connector will continue with the update, cancel it, or warn the user
 *   depending on the information it receives from your web service.
 *
 *   Supply one of the following return strings:
 *   - `'NULL'` or `''` (empty string) if you want the Web Connector to proceed
 *     with the update.
 *   - `'W:<any text>'` if you want the web Connector to display a WARNING
 *     dialog prompting the user to continue with the update or cancel it. The
 *     text string after the `'W:'` will be displayed in the warning dialog.
 *   - `'E:<any text>'` if you want to cancel the update and display an ERROR
 *     dialog. The text string after `'E:'` will be displayed in the error
 *     dialog. The user will have to download a new version of the Web
 *     Connector to continue with the update.
 *   - `'O:<version number>'` to tell the user that the server expects a newer
 *     version of QBWC than the user currently has but also tells the user
 *     which version is needed.
 *
 * @param {String} args.strVersion - The version of the QB web connector
 *   supplied in the web connector's call to clientVersion.
 *
 * @returns {String} A string telling the Web Connector what to do next.
 */
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
        clientVersionResult: { 'string': retVal }
    };
};

/**
 * @function closeConnection
 *
 * @desc Called by the Web Connector at the end of a successful update session.
 *
 * @summary Tells your web service that the Web Connector is finished with the
 *   update session.
 *
 *   When the update with the web service is completed, the Web Connector will
 *   notify the web service that it is done with the session it started by
 *   calling closeConnection.
 *
 * @param {String} args.ticket The ticket from the client. This is the session
 *   token your web service returned to the client's authenticate call, as the
 *   first element of the returned string array.
 *
 * @returns {String} Specify a string that you want the Web Connector to
 *   display to the user showing the status of the web service action on behalf
 *   of your user. This string will be displayed in the Web Connector UI in the
 *   status column.
 */
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.closeConnection =
function (args) {
    var retVal = null;

    announceMethod('closeConnection', args);

    // This method doesn't currently do anything very interesting, just returns
    //   an 'OK' message.
    retVal = 'OK';

    serviceLog('    Return values:');
    serviceLog('        string retVal = ' + retVal);

    return {
        closeConnectionResult: { 'string': retVal }
    };
};

/**
 * @function connectionError
 *
 * @summary Tells your web service about an error the Web Connector encountered
 *   in its attempt to connect to QuickBooks or QuickBooks POS.
 *
 * @desc **Important**: Don't retry the same operation in response to the
 *   connectionError more than a couple of times. If the problem isn't resolved
 *   after a couple of tries, use getLastError to notify the user about the
 *   problem.
 *
 *   When the web service responds to the Web Connector's authenticate method
 *   call by indicating there is data to be exchanged with QuickBooks, the
 *   Web Connector calls the OpenConnection and BeginSession medhotds of the
 *   QuickBooks XML request processor.
 *
 *   If either of those calls fail for any reason, the Web Connector will
 *   display the error code and error message from the request processor to the
 *   user and it will let your web service know about the error via the
 *   connectionError call.
 *
 * @param {String} args.ticket - The ticket from the Web Connector. This is the
 *   session token your web service returns to the Web Connector's authenticate
 *   call as the first element of the returned string array.
 *
 * @param {String} args.hresult - An HRESULT value (in HEX) thrown by
 *   QuickBooks when trying to make a connection thrown by the request
 *   processor.
 *
 * @param {String} args.message - An error message that accompanies the HRESULT
 *   from the request processor.
 *
 * @returns {String} Returns `'done'` to indicate that the web service is
 *   finished or a full company pathname if you want to retry the connection
 *   attempt on a different QuickBooks or QuickBooks POS company. Any string
 *   other than `'done'` will be interpreted as the company name to be used in
 *   a retry attempt. An empty string will retry the connection attempt with
 *   the currently open company.
 */
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
        connectionErrorResult: { 'string': retVal }
    };
};

// TODO: What is the sessionID parameter?
// TODO: Is it ticket or wcTicket? (Mismatch in documentation)
/**
 * @function getInteractiveURL
 *
 * @desc Lets your web service tell the Web Connector where to get the web
 *   page to display in the browser at the start of interactive mode.
 *
 * @summary Used to support interactive mode. To start interactive mode, your
 *   web service indicates to the Web Connector that it wants to start
 *   interactive mode by returning an empty string from sendRequestXML, which
 *   causes the Web Connector to invoke getLastError. Then from getLastError
 *   you return the string 'Interactive mode' to kick off the interactive
 *   session.
 *
 *   The Web Connector responds to this string by calling getInteractiveURL and
 *   opens a browser with the web page you specify in your return to that call.
 *
 * @param {String} args.wcTicket The ticket from the Web Connector. This is the
 *   session token your web service returned to the Web Connector's
 *   authenticate call, as the first element of the returned string array.
 *
 * @param {String} args.sessionID
 *
 * @returns {String} The URL to the interactive mode website.
 */
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.getInteractiveURL =
function (args) {
    var retVal = '';

    announceMethod('getInteractiveURL', args);

    return {
        getInteractiveURLResult: { 'string': retVal }
    };
};

/**
 * @function getLastError
 *
 * @param {String} args.ticket
 *
 * @returns {String} An error message describing the last web service error.
 */
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
        getLastErrorResult:  { 'string': retVal }
    };
};

/**
 * @function interactiveDone
 *
 * @param {String} wcTicket
 *
 * @returns {String}
 */
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.interactiveDone =
function (args) {
    var retVal = '';

    announceMethod('interactiveDone', args);

    return {
        interactiveDoneResult: { 'string': retVal }
    };
};

// TODO Does the param reason actually exist?
// TODO: Is it ticket or wcTicket? (Mismatch in documentation)
/**
 * @function interactiveRejected
 *
 * @desc Allows your web service to take alternative action when the
 *   interactive session it requested was rejected by the user or by timeout
 *   in the absence of the user.
 *
 * @param {String} args.wcTicket The ticket from the Web Connector. This is the
 *   session token your web service returned to the Web Connector's
 *   authenticate call, as the first element of the returned string array.
 *
 * @param {String} args.reason The reason for rejection of interactive mode.
 *
 * @returns {String} A message string to be displayed.
 */
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.interactiveRejected =
function (args) {
    var retVal = '';

    announceMethod('interactiveRejected', args);

    return {
        interactiveRejectedResult: { 'string': retVal }
    };
};

/**
 * @function receiveResponseXML
 *
 * @desc This web method facilitates qbws to receive the response XML from
 *   QuickBooks via the Web Connector.
 *
 * @param {String} args.ticket
 *
 * @param {String} args.response
 *
 * @param {String} args.hresult
 *
 * @param {String} args.message
 *
 * @returns {Number} The percentage of work done. Must be an integer.
 *   Possible values:
 *   - Greater than 0 - There are more requests to send
 *   - 100 - Done; no more requests to send
 *   - Less than 0 - Custom error codes
 */
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.receiveResponseXML =
function (args) {
    var response = args.response,
        hresult = args.hresult,
        message = args.message,
        retVal = 0,
        percentage;

    announceMethod('receiveResponseXML', args);

    if (objectNotEmpty(hresult)) {
        // If there is an error with response received,
        //     web service could also return a -ve int
        serviceLog('    HRESULT = ' + hresult);
        serviceLog('    Message = ' + message);
        retVal = -101;
    } else {
        serviceLog('    Length of response received = ' + response.length);

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
        receiveResponseXMLResult: { 'int': retVal }
    };
};

//TODO: Verify all these parameter types
/**
 * @function sendRequestXML
 *
 * @desc This web method sends the request XML to the client which should
 *   process the request within QuickBooks.
 *
 * @param {Number} args.qbXMLMajorVers
 *
 * @param {Number} args.qbXMLMinorVers
 *
 * @param {String} args.ticket
 *
 * @param {String} args.strHCPResponse
 *
 * @param {String} args.strCompanyFileName
 *
 * @param {String} args.Country
 *
 * @returns {String} Returns the request XML for the client to process or an
 *   empty string if there are no more requests.
 */
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.sendRequestXML =
function (args) {
    var total,
        request = '';

    if (counter === null) {
        counter = 0;
    }

    announceMethod('sendRequestXML', args);

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
        sendRequestXMLResult: { 'string': request }
    };
};

/**
 * @function serverVersion
 *
 * @desc Communicates the web service's version number to the client.
 *
 * @returns {String} qbws's version number
 */
qbws.QBWebConnectorSvc.QBWebConnectorSvcSoap.serverVersion =
function (args) {
    var retVal = '0.2.1';

    announceMethod('serverVersion', args);
    serviceLog('    No parameters required.');
    serviceLog('    Returned: ' + retVal);

    return {
        serverVersionResult: { 'string': retVal }
    };
};

server = http.createServer(function requestListener(request,response) {
    response.end('404: Not Found: ' + request.url);
});

module.exports.run = function runQBWS() {
    var soapServer,
        wsdl = buildWsdl();
    server.listen(8000);
    soapServer = soap.listen(server, '/wsdl', qbws, wsdl);

    if (config.verbosity > 2) {
        soapServer.log = function soapServerLog(type, data) {
            serviceLog(type + ': ' + data);
        };
    }
};

