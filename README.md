# aws-websocket-api-server

Testing bootstrap for routing websocket messages to locally running lambdas.

# route-config file

The route configuration file is a dictionary of route actions that maps to Lambda's that will be executed when a message with that route selection property exists.

```
{
  'route selection value': {
  		id: 'The name of the lamnda in the template.yaml',
  		debug: true|false,
  		debugPort: 15988 
  }
}
```

The structure of the route-config.json is simple. Just sepcify the `Route Key` value that will trigger the lambda as the key in the dictionary. Then supply an object in the form {id: <string>, debug: <bool>}.

|property|description|
|---|---|
|id|The **id** value should be the name of the Lambda as defined in your SAM template.|
|debug|The **debug** flag determines if the lambda waits for your debugger to attach before executing the lambda.|
|debugPort|[optional, default: 15988] lets you specify a different debugger port for each lambda so you can debug more than one at a time. 

# install

Install the node module:

```
yarn add aws-websocket-api-helper -D
```

Then update your `package.json` scripts to include a script to test locally.

```
"scripts": {
	"debug-local": "websocket-api start route-config.json"
}
```

# how to use

After installing and adding the **script** to your `package.json` you can simply type:

```bash
yarn debug-local
```

This fires up the websocket server on the default port of **9090** 
(you can override that with the -p or --port command line argument). Now all you need to do is send 
your JSON messages to the websocket server as if you app was connecting to the websocket API. You do not
need to wrap the json in an event envelope as the websocket server will do this for you.

If your route is configured to connect to a debugger the lambda will start up and wait for your debugger to connect.

# what is not implemented

### two way communication.  

Because in your lambda you will be using the APIGW Admin api to talk back to your
websocket clients you have no way of doing that right now.  It would be great to mock that up locally so we can
also respond to the websocket requests.




