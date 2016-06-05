# Demo Serverless Computing app 

This Bluemix application demonstrates how an OpenWhisk action can be used to validate unstructured data, add value to the data using 3rd party services, and to persist the high value data in an IBM Compose managed database server. The stateless, serverless action executed by OpenWhisk is implemented as a Node.JS app, packaged as a Docker container.

##Getting started

To run the code below you will need to sign up for the following services

- [IBM Compose Postgres Database 30 Day Trial] (https://app.compose.io/signup/svelte)
- [IBM Bluemix 30 Day Trial](https://console.ng.bluemix.net/registration)
- [Pitney Bowes Geocoding API](https://pitneybowes.developer.pbondemand.com/portal/#tab=signUp)


###Create a Cloudant document database in IBM Bluemix

Download a CF command line interface for your operating system using the following link

https://github.com/cloudfoundry/cli/releases

and then install it.

From your command line type in 

    cf login -a api.ng.bluemix.net

to authenticate with IBM Bluemix and then enter your Bluemix email, password, and the deployment space as prompted.

To create a new Cloudant database, run the following commands from your command line

```
cf create-service cloudantNoSQLDB Shared cloudant-deployment

cf create-service-key cloudant-deployment cloudant-key

cf service-key cloudant-deployment cloudant-key
```

The first command creates a new Cloudant deployment in your IBM Bluemix account, the second assigns a set of credentials for your account to the Cloudant deployment. The third command should output a JSON document similar to the following. 
```
{
 "host": "d5695abd-d00e-40ef-1da6-1dc1e1111f63-bluemix.cloudant.com",
 "password": "5555ee55555a555555c8d559e248efce2aa9187612443cb8e0f4a2a07e1f4",
 "port": 443,
 "url": "https://"d5695abd-d00e-40ef-1da6-1dc1e1111f63-bluemix:5555ee55555a555555c8d559e248efce2aa9187612443cb8e0f4a2a07e1f4@d5695abd-d00e-40ef-1da6-1dc1e1111f63-bluemix.cloudant.com",
 "username": "d5695abd-d00e-40ef-1da6-1dc1e1111f63-bluemix"
}
```
