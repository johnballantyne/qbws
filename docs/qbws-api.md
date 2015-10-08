## Functions
<dl>
<dt><a href="#buildWsdl">buildWsdl(wsdlFileLocation)</a> ⇒ <code>String</code></dt>
<dd><p>Fetches the wsdl file; address location is changed if set in config.</p>
</dd>
<dt><a href="#buildRequest">buildRequest()</a> ⇒ <code>String</code> | <code>Array</code></dt>
<dd><p>Returns an array of sample QBXML requests</p>
</dd>
<dt><a href="#parseForVersion">parseForVersion(input)</a> ⇒ <code>String</code></dt>
<dd><p>Parses the first two version components out of the standard four
  component version number: <code>&lt;Major&gt;.&lt;Minor&gt;.&lt;Release&gt;.&lt;Build&gt;</code>.</p>
</dd>
<dt><a href="#serviceLog">serviceLog(data)</a></dt>
<dd><p>Writes a string to the console and log file.</p>
</dd>
<dt><a href="#objectNotEmpty">objectNotEmpty(obj)</a> ⇒ <code>Number</code></dt>
<dd><p>Checks that the type of a variable is &#39;object&#39; and it is not empty.</p>
</dd>
<dt><a href="#announceMethod">announceMethod(name, params)</a></dt>
<dd><p>Logs qbws method calls and their parameters.</p>
</dd>
<dt><a href="#serverVersion">serverVersion()</a> ⇒ <code>String</code></dt>
<dd><p>Communicates the web service&#39;s version number to the client.</p>
</dd>
<dt><a href="#clientVersion">clientVersion()</a> ⇒ <code>String</code></dt>
<dd><p>An optional callback that allows the web service to evaluate the
 current web connector version and react to it.</p>
</dd>
<dt><a href="#authenticate">authenticate()</a> ⇒ <code>String</code> | <code>Array</code></dt>
<dd><p>Verifies the username and password for the Web Connector that is
  trying to connect.</p>
</dd>
<dt><a href="#sendRequestXML">sendRequestXML()</a> ⇒ <code>String</code></dt>
<dd><p>This web method sends the request XML to the client which should
  process the request within QuickBooks.</p>
</dd>
<dt><a href="#closeConnection">closeConnection()</a> ⇒ <code>String</code></dt>
<dd><p>Called by the Web Connector at the end of a successful update session.</p>
</dd>
<dt><a href="#connectionError">connectionError()</a> ⇒ <code>String</code></dt>
<dd></dd>
<dt><a href="#getInteractiveURL">getInteractiveURL()</a> ⇒ <code>String</code></dt>
<dd></dd>
<dt><a href="#getLastError">getLastError()</a> ⇒ <code>String</code></dt>
<dd></dd>
<dt><a href="#interactiveDone">interactiveDone(wcTicket)</a> ⇒ <code>String</code></dt>
<dd></dd>
<dt><a href="#interactiveRejected">interactiveRejected()</a> ⇒ <code>String</code></dt>
<dd></dd>
<dt><a href="#receiveResponseXML">receiveResponseXML()</a> ⇒ <code>Number</code></dt>
<dd><p>This web method facilitates qbws to receive the response XML from
  QuickBooks via the Web Connector.</p>
</dd>
</dl>
<a name="buildWsdl"></a>
## buildWsdl(wsdlFileLocation) ⇒ <code>String</code>
Fetches the wsdl file; address location is changed if set in config.

**Kind**: global function  
**Summary**: If needed, set `'wsdlAddress'` within config to build a correct
  wsdl file. This is likely unecessary if you're not connecting to your web
  service with a client other than the QuickBooks Web Connector. The Web
  Connector doesn't seem to care if the address location is incorrect, but
  connecting using a client created with the soap package does.  
**Returns**: <code>String</code> - The wsdl file.  

| Param | Type | Description |
| --- | --- | --- |
| wsdlFileLocation | <code>String</code> | Optional. Defaults to `'/qbws.wsdl'`. |

<a name="buildRequest"></a>
## buildRequest() ⇒ <code>String</code> &#124; <code>Array</code>
Returns an array of sample QBXML requests

**Kind**: global function  
**Summary**: These QBXML requests are hard coded in to provide examples. This
  should be replaced with something dynamic.  
**Returns**: <code>String</code> &#124; <code>Array</code> - QBXML requests: CustomerQuery, InvoiceQuery and
  BillQuery  
<a name="parseForVersion"></a>
## parseForVersion(input) ⇒ <code>String</code>
Parses the first two version components out of the standard four
  component version number: `<Major>.<Minor>.<Release>.<Build>`.

**Kind**: global function  
**Returns**: <code>String</code> - First two version components (i.e. &lt;Major>.&lt;Minor>)
  if `input` matches the regular expression. Otherwise returns `input`.  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>String</code> | A version number. |

**Example**  
```js
// returns 2.0
  parseForVersion('2.0.1.30');
```
<a name="serviceLog"></a>
## serviceLog(data)
Writes a string to the console and log file.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>String</code> | The information to be logged. |

<a name="objectNotEmpty"></a>
## objectNotEmpty(obj) ⇒ <code>Number</code>
Checks that the type of a variable is 'object' and it is not empty.

**Kind**: global function  
**Returns**: <code>Number</code> - The number of properties in obj, or null if it is not an
  object.  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> | The object to be checked. |

<a name="announceMethod"></a>
## announceMethod(name, params)
Logs qbws method calls and their parameters.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the method. |
| params | <code>Object</code> | The parameters sent to the method. |

<a name="serverVersion"></a>
## serverVersion() ⇒ <code>String</code>
Communicates the web service's version number to the client.

**Kind**: global function  
**Returns**: <code>String</code> - qbws's version number  
<a name="clientVersion"></a>
## clientVersion() ⇒ <code>String</code>
An optional callback that allows the web service to evaluate the
 current web connector version and react to it.

**Kind**: global function  
**Summary**: Not currently required to support backward compatibility but
  strongly recommended.

  Supply one of the following return strings:
  - `'NULL'` or `''` (empty string) if you want the Web Connector to proceed
    with the update.
  - `'W:&lt;any text&gt;'` if you want the web Connector to display a WARNING
    dialog prompting the user to continue with the update or cancel it. The
    text string after the `'W:'` will be displayed in the warning dialog.
  - `'E:&lt;any text&gt;'` if you want to cancel the update and display an ERROR
    dialog. The text string after `'E:'` will be displayed in the error
    dialog. The user will have to download a new version of the Web
    Connector to continue with the update.
  - `'O:&lt;version number&gt;'` to tell the user that the server expects a newer
    version of QBWC than the user currently has but also tells the user
    which version is needed.  

**Returns**: <code>String</code> - A string telling the Web Connector what to do next.  

| Param | Type | Description |
| --- | --- | --- |
| args.strVersion | <code>String</code> | The version of the QB web connector   supplied in the web connector's call to clientVersion. |

<a name="authenticate"></a>
## authenticate() ⇒ <code>String</code> &#124; <code>Array</code>
Verifies the username and password for the Web Connector that is
  trying to connect.

**Kind**: global function  
**Summary**: The current username and password values are hard-coded for
  demonstration. You should replace this with your own authentication.  
**Returns**: <code>String</code> &#124; <code>Array</code> - Instructions for QuickBooks to proceed with update.

  Possible return values
  - string[0] = ticket
  - string[1]
    - `''` (empty string) = use current company file
    - `'none'` = no further request/no further action required
    - `'nvu'` = not valid user
    - any other string value = use this company file  

| Param | Type |
| --- | --- |
| args.strUsername | <code>String</code> | 
| args.strPassword | <code>String</code> | 

<a name="sendRequestXML"></a>
## sendRequestXML() ⇒ <code>String</code>
This web method sends the request XML to the client which should
  process the request within QuickBooks.

**Kind**: global function  
**Returns**: <code>String</code> - Returns the request XML for the client to process or an
  empty string if there are no more requests.  

| Param | Type |
| --- | --- |
| args.qbXMLMajorVers | <code>Number</code> | 
| args.qbXMLMinorVers | <code>Number</code> | 
| args.ticket | <code>String</code> | 
| args.strHCPResponse | <code>String</code> | 
| args.strCompanyFileName | <code>String</code> | 
| args.Country | <code>String</code> | 

<a name="closeConnection"></a>
## closeConnection() ⇒ <code>String</code>
Called by the Web Connector at the end of a successful update session.

**Kind**: global function  

| Param | Type |
| --- | --- |
| args.ticket | <code>String</code> | 

<a name="connectionError"></a>
## connectionError() ⇒ <code>String</code>
**Kind**: global function  
**Returns**: <code>String</code> - Returns `'done'` if no further action is required by from
  the client or the company file location.  

| Param | Type | Description |
| --- | --- | --- |
| args.ticket | <code>String</code> | A GUID-based ticket string to maintain the   identity of the client. |
| args.hresult | <code>String</code> | An HRESULT value thrown by QuickBooks when   trying to make a connection. |
| args.message | <code>String</code> | An error message corresponding to the   HRESULT. |

<a name="getInteractiveURL"></a>
## getInteractiveURL() ⇒ <code>String</code>
**Kind**: global function  
**Returns**: <code>String</code> - The URL to the interactive mode website.  

| Param | Type |
| --- | --- |
| args.wcTicket | <code>String</code> | 
| args.sessionID | <code>String</code> | 

<a name="getLastError"></a>
## getLastError() ⇒ <code>String</code>
**Kind**: global function  
**Returns**: <code>String</code> - An error message describing the last web service error.  

| Param | Type |
| --- | --- |
| args.ticket | <code>String</code> | 

<a name="interactiveDone"></a>
## interactiveDone(wcTicket) ⇒ <code>String</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| wcTicket | <code>String</code> | 

<a name="interactiveRejected"></a>
## interactiveRejected() ⇒ <code>String</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| args.wcTicket | <code>String</code> | 

<a name="receiveResponseXML"></a>
## receiveResponseXML() ⇒ <code>Number</code>
This web method facilitates qbws to receive the response XML from
  QuickBooks via the Web Connector.

**Kind**: global function  
**Returns**: <code>Number</code> - The percentage of work done. Must be an integer.
  Possible values:
  - Greater than 0 - There are more requests to send
  - 100 - Done; no more requests to send
  - Less than 0 - Custom error codes  

| Param | Type |
| --- | --- |
| args.ticket | <code>String</code> | 
| args.response | <code>String</code> | 
| args.hresult | <code>String</code> | 
| args.message | <code>String</code> | 

