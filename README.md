# Acme WebService Demo

A tiny REST/JSON web service using [Spark](http://sparkjava.com) java web framework and a [ReactJS](https://facebook.github.io/react/) javascript client.   

It supports the following operations on an Acme Company:
  
* Create
* Get List
* Get Details
* Update 
* Add "beneficial owner(s)"

An Acme Company has the following attributes:

* Company ID
* Name
* Address
* City
* Country
* E­mail (not required)
* Phone Number (not required)
* One or more beneficial owner(s)

### Calling the API 

I will describe using [cUrl](https://curl.haxx.se/docs/httpscripting.html#POST).  Any other tool that makes it easy to create and send http calls like [Postman](https://www.getpostman.com) will work just as well.

Create an Acme company

** curl -X POST -d @company.json http://localhost:4567/companies

company.json file contents:

{"data":{"id":"COMP1","name":"Acme","address":"1 Acme Dr","city":"Asheville","country":"USA", "beneficiaries":[{"name":"John Doe"}]}}

Get a list of Acme companies

** curl  http://localhost:4567/companies 

result: 

{"success":true,"data":[{"id":"COMP1","name":"Acme","address":"1 Acme Dr","city":"Asheville","country":"USA", "beneficiaries":[{"id":1,"name":"John Doe"}]}]}

Update an Acme company

curl -X PUT -d @company.json http://localhost:4567/companies

this time contents of company.json includes:

{"data":{"id":"COMP1","name":"Acme","address":"1 Acme Dr","city":"Asheville","country":"USA", "email": "cto@acme.inc", "phone":"1 888 444 1234", "beneficiaries":[{"id":1, "name":"John Doe"}]}}

basically added email and phone

Get details about an Acme company 

curl  http://localhost:4567/companies/COMP1 

{"success":true,"data":{"id":"COMP1","name":"Acme","address":"1 Acme Dr","city":"Asheville","country":"USA","email":"cto@acme.inc","phone":"1 888 444 1234","beneficiaries":[{"id":1,"name":"John Doe"}]}}

That is basically how the API works there are errors cases I did not cover I will show an example response for a flavor of how errors look like:

an update 

curl -X PUT -d @company.json http://localhost:4567/companies
with contents of company.json like so

{"data":{"id":"COMP1","name":"Acme","address":"1 Acme Dr","city":"Asheville","country":"USA", "beneficiaries":[]}}

recall that an Acme company must have at least one beneficiary this explains the following result:

{"messages":["At least one beneficiary is required"],"success":false}

To sum up, all successful operations will contain a success:true property in the result along with a possible data property and all failed operations will contain a success:false and a message or messages property, that's it!

### Acme Client In Action 

You can start by checking out a working version which may still be available on [heroku](https://www.heroku.com) at [ https://acme-web-service.herokuapp.com/].  If the heroku app is available you can
test the api against it instead of locally as well.

Otherwise download the acme-web-service-demo.jar on github and fire it up using good ole' java 8; oh right it's build with java 8, I will have some more details about that below in the development section. 

The client will be available at localhost:4567

### Development

what is it exactly?

It uses the following technologies: 

SparkJava REST framework, 

Java 8, 

Ormlite dabase abstraction layer, 

and finally ReactJS for the javasccript client, since the server is [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) enabled
to allow a client running on a different port or even from a different domain to consume the API 

To build it yourself: 

mvn install 

mvn compile

mvn exec:java 

it's that simple!

It is configured to use an embedded derby database by default;
it is ready to use a postgres database as well you would have 
to recompile it for now turning use.derby option off in 
src/main/resources/app.properties

### Testing

Apologies nothing at this time, in the near future perhaps, I was just exploring using Spark + React and just about out of time!

### TODOS

The reactjs code is currently in a single javascript, resources/public/app.js file;
due to time constraints I did not explore breaking it up into separate modules;
which would have involved setting up a module loader -- an overkill
for the purpose of this demo 

### Feedback

If you feel inspired for some reason to contact me to let me know the good, the bad all feedback welcome drop me a line at my yahoo account with username mitzsuyi thanks!  