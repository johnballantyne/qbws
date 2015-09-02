qbws
=========

Goal: A Node.js based web service for integrating with Quickbooks Web Connector

## Status ##

This project replicates the functionality of the C# web service found in the QBSDK. Unfortunately that means some things are hard coded that should not be, and other things are left unimplemented. Eventually, qbws will diverge from that C# example to serve less of an SDK example and more as a reliable utility.

## Usage ##

Install the package using `npm install qbws`. The following code is all you need to run the server:

> var qbws = require('qbws');
> qbws.run();

## Next Milestones ##
 - v0.2.0: loose port of [Intuit's WCWebService][1] provided in the QBSDK samples. (mostly complete; pending code review)
 - v0.2.1: include documentation for all functions (likely using JSDoc)


 [1]: https://developer-static.intuit.com/qbsdk-current/samples/readme.html#WCWebService%20(C#%20ASP.NET)%20(qbxml)%20(desktop)
 

