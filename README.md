# Demo Serverless Computing app 

This Bluemix application demonstrates how an OpenWhisk action can be used to validate unstructured data, add value to the data using 3rd party services, and to persist the high value data in an IBM Compose managed database server. The stateless, serverless action executed by OpenWhisk is implemented as a Node.JS app, packaged as a Docker container.

##Getting started

To run the code below you will need to sign up for the following services

- [IBM Compose Postgres Database 30 Day Trial] (https://app.compose.io/signup/svelte)
- [IBM Bluemix 30 Day Trial](https://console.ng.bluemix.net/registration)
- [Pitney Bowes Geocoding API](https://pitneybowes.developer.pbondemand.com/portal/#tab=signUp)
- [Docker Hub](https://hub.docker.com)

###Create a Cloudant document database in IBM Bluemix

Download a CF command line interface for your operating system using the following link

https://github.com/cloudfoundry/cli/releases

and then install it.

From your command line type in 

    cf login -a api.ng.bluemix.net

to authenticate with IBM Bluemix and then enter your Bluemix email, password, as well as the deployment organization and space as prompted.

*NOTE:* you will need to remember your selection of the deployment organization and space for the configuration of the OpenWhisk action

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

To create a Cloudant database, first replace the username, password, and host strings in the curl command below using the values from the JSON document.

```
curl https://username:password@host.cloudant.com/address_db -X PUT
```

On successful creation of a database you should get back a JSON response that looks like this:

```
{"ok":true}
```

## Clone the OpenWhisk action implementation

The OpenWhisk action is implemented as a Node.JS based application that will be packaged as a Docker image and published to Docker Hub. You can clone the code for the action from github by running the following from your command line

```git clone https://github.com/osipov/compose-postgres-openwhisk.git```

This will create a compose-postgres-openwhisk folder in your current working directory.

The implementation of the logic of a service to execute the action is in the ```server/service.js``` file. Most of the logic in the functions listed below. As evident from the function names, once the action is triggered with a JSON object containing address data, the process is to first query the Pitney Bowes geolocation data to validate the address and to obtain the latitude and the longitude geolocation coordinates. Next, the process retrives a connection to the Compose Postgres database, runs a SQL insert statement to put the address along with the coordinates into the database, and returns the connection back to the connection pool.

```
queryPitneyBowes
connectToCompose
insertIntoCompose
releaseComposeConnection
```




##Create a stateless, Docker-based OpenWhisk action

If you don't have Docker already installed, it is available per the instructions provided in the link below. Note that if you are using Windows or OSX, you will want to install Docker Toolbox.
https://docs.docker.com/engine/installation/

Make sure that your [Docker Hub](https://hub.docker.com) account is working correctly by trying to login

```docker login```

You will be prompted and will need to enter your Docker username and password to login.


To get started with OpenWhisk, download and install a command line interface using the instructions from the following link

https://new-console.ng.bluemix.net/openwhisk/cli

Configure OpenWhisk to use the same Bluemix organization and space as your Cloudant instance by executing the following from your command line

```
wsk property set --namespace
```

You will be prompted to choose the namespace that looks like ```organization_space```. If you don't remember the organization and space that you should use, refer back to the section on creating a Cloudant database.






