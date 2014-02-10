title=Where's My Exceptions, Spring Data MongoDB?
date=2011-11-19
type=post
tags=java, mongodb, spring-data-mongodb
status=published
~~~~~~

To be fair, the Spring Data MongoDB project is currently only at Milestone releases (as of writing, they are up to M5).  Unlike most open source projects, they do have fairly good reference documentation.  Recently, we decided to add some unique contraints to a document by adding a compound index.  The Spring Data MongoDB project provides a couple mechanisms to be able to do this:

1. Use the MongoTemplate class's ensureIndex method to programmatically create an index at runtime.
2. Use the CompoundIndexes and CompoundIndex annotations to declare the indexes on the document model class.
3. Manually create the index(es) against the database using the MongoDB command line.

For a variety of reasons, I decided to go with option #2.  Using the annotations is pretty straight forward:

	package test;

	import org.springframework.data.mongodb.core.index.CompoundIndex;
	import org.springframework.data.mongodb.core.index.CompoundIndexes;
	import org.springframework.data.mongodb.core.mapping.Document;

	@Document(collection="people")
	@CompoundIndexes(value={
    	@CompoundIndex(name="people_first_name_address_idx", def="{'firstName':1, 'address':1}", unique=true),
	    @CompoundIndex(name="people_last_name_address_idx", def="{'lastName':1, 'address':1}", unique=true)
	})
	public class Person {

    	private String address;
	    private String firstName;
    	private String lastName;

	    ...
	}

The example above declares two MongoDB compound indexes.  In the first one, it is creating an index on the firstName and address properties of the document.  The ":1" tells the index to sort that column in ascending order for the index (see the org.springframework.data.mongodb.core.query.Order class's Javadoc for more details on sort orders).  The "unique=true" property tells MongoDB to reject any inserts/saves that violate this contraint (think a unique contraint in the SQL world).  There are other properties on the CompoundIndex annotation, so refer to the Spring Data MongoDB Javadocs for more information.  When the application starts up, the Spring Data MongoDB library listens for the application start event via Spring and will create the indexes automatically (if they don't already exist).  This is a benefit over options 1 and 3 above that require manual intervention.

So Why Didn't It Work?
----------------------

According to the paragraph above, it is pretty easy to set up indexes using Spring Data MongoDB.  You annotate your classes, start your application and run some tests to make sure the unique constraint is being honored, right?  That's what I thought too.  I started out by annotating my document objects and re-building my application.  Before installing and starting my application in Tomcat, I decided to completely drop my database from MongoDB to ensure that everything was being created properly.  Once I was sure everything was clean, I installed my application and started Tomcat, causing Spring Data MongoDB to create the database, the collections and the indexes when the web application started. I verified this by running the following command in MongoDB to see the indexes existed:

	MongoDB shell version: 1.8.2
	connecting to: test
	> db.people.getIndexes()
	[
    	    {
        	        "name" : "_id_",
            	    "ns" : "test.people",
                	"key" : {
                   	     "_id" : 1
	                },
    	            "v" : 0
        	},
        	{
            	    "name" : "people_first_name_address_idx",
        	        "ns" : "test.people",
					"dropDups" : false,
					"sparse" : false,
					"unique" : true,
					"key" : {
            	            "firstName" : 1,
                	        "address" : 1
	                },
    	            "v" : 0
	        },
	        {
    	            "name" : "people_last_name_address_idx",
     		        "ns" : "test.people",
       	         	"dropDups" : false,
					"sparse" : false,
					"unique" : true,
                	"key" : {
                        "lastName" : 1,
                        "address" : 1
	                },
    	            "v" : 0
        	}
	]
	> 

This allowed me to verify that Spring Data MongoDB actually did create the indexes at startup.  So far, so good.  My next step was to insert some data to the collection via my application.  This worked and I was able to verify the document in MongoDB by using the .find({}) operation on the collection from the command line.  The next step was to attempt to insert the exact same document, which should fail due to the unique constraints.  To my surprise, it did not fail and I did not receive any exceptions from the MongoTemplate class (which executed the insert).  Just to make sure I wasn't crazy, I took the JSON and inserted it directly to the collection using the .save({...}) operation on the collection via the Mongo command line.  It did exactly what I expected it to do:

	E11000 duplicate key error index: test-people.$people_first_name_address_idx  dup key: { : "John", : "123 Fake Street" }

This meant that index was working.  So what was Spring Data MongoDB's problem?  What was happening to the error?  After some Google-foo, I stumbled across this JIRA issue:  https://jira.springsource.org/browse/DATAMONGO-134.  Hidden in there was the answer to my problem.  By default, the MongoTemplate class uses the default WriteConcern from the MongoDB Java Driver library.  The default WriteConcern as it turns out does NOT raise exceptions for server errors, only network errors.  This means that you will only receive an exception if you lose connection to the database or try to connect to an invalid address/port and will not receive an exception for any errors generated by MongoDB.  Lame, but easy to fix.  The WriteConcern class comes with some static constants that define the following write concern options:

	/** No exceptions are raised, even for network issues */
    public final static WriteConcern NONE = new WriteConcern(-1);

    /** Exceptions are raised for network issues, but not server errors */
    public final static WriteConcern NORMAL = new WriteConcern(0);
    
    /** Exceptions are raised for network issues, and server errors; waits on a server for the write operation */
    public final static WriteConcern SAFE = new WriteConcern(1);
    
    /** Exceptions are raised for network issues, and server errors and the write operation waits for the server to flush the data to disk*/
    public final static WriteConcern FSYNC_SAFE = new WriteConcern(true);

    /** Exceptions are raised for network issues, and server errors; waits for at least 2 servers for the write operation*/
    public final static WriteConcern REPLICAS_SAFE = new WriteConcern(2);


So, depending on your needs, you can change the write concern options used by the MongoTemplate class.  Since I was using Spring to instantiate the MongoTemplate class, this required a couple of changes to my applicationContext.xml file:

	<beans 
    	xmlns:context="http://www.springframework.org/schema/context"      
	    xmlns:mongo="http://www.springframework.org/schema/data/mongo" 
    	xmlns:util="http://www.springframework.org/schema/util"  
	    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    	xmlns="http://www.springframework.org/schema/beans" 
	    xsi:schemalocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.0.xsd
    	http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-3.0.xsd
	    http://www.springframework.org/schema/data/mongo http://www.springframework.org/schema/data/mongo/spring-mongo-1.0.xsd
    	http://www.springframework.org/schema/util http://www.springframework.org/schema/util/spring-util-3.0.xsd">

	    ...

    	<mongo:db-factory dbname="${mongodb.database}" host="${mongodb.host}" id="databaseFactory" password="${mongodb.password}" port="${mongodb.port}" username="${mongodb.username}" />

	    <bean class="org.springframework.data.mongodb.core.MongoTemplate" id="mongoTemplate">
    	    <constructor-arg name="mongoDbFactory" ref="databaseFactory" />
        	<property name="writeConcern">
            	<util:constant static-field="com.mongodb.WriteConcern.SAFE" ></util:constant>
	        </property>
    	</bean>
	    ...  
	</beans>


After making this change and restarting the application, I finally go the exception I was expecting to receive from Spring Data MongoDB:

	2011-11-18 15:44:32,913 ERROR - Unable to create or update person '{"firstName" : "John", "lastName" : "Doe", "address": "123 Fake Street"}'.
	org.springframework.dao.DuplicateKeyException: E11000 duplicate key error index: test.people.$people_first_name_address_idx  dup key: { : "John", : "123 Fake Street"}; nested exception is com.mongodb.MongoException$DuplicateKey: E11000 duplicate key error index: test.people.$people_first_name_address_idx  dup key: { : "John", : "123 Fake Street"};
		at org.springframework.data.mongodb.core.MongoExceptionTranslator.translateExceptionIfPossible(MongoExceptionTranslator.java:53)
		at org.springframework.data.mongodb.core.MongoTemplate.potentiallyConvertRuntimeException(MongoTemplate.java:1373)
		at org.springframework.data.mongodb.core.MongoTemplate.execute(MongoTemplate.java:333)
		at org.springframework.data.mongodb.core.MongoTemplate.saveDBObject(MongoTemplate.java:739)
		at org.springframework.data.mongodb.core.MongoTemplate.doSave(MongoTemplate.java:679)
		at org.springframework.data.mongodb.core.MongoTemplate.save(MongoTemplate.java:669)
		at org.springframework.data.mongodb.core.MongoTemplate.save(MongoTemplate.java:665)
		at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
		at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:39)
		at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)
		at java.lang.reflect.Method.invoke(Method.java:597)
		at com.sun.jersey.spi.container.JavaMethodInvokerFactory$1.invoke(JavaMethodInvokerFactory.java:60)
		at com.sun.jersey.server.impl.model.method.dispatch.AbstractResourceMethodDispatchProvider$ResponseOutInvoker._dispatch(AbstractResourceMethodDispatchProvider.java:205)
		at com.sun.jersey.server.impl.model.method.dispatch.ResourceJavaMethodDispatcher.dispatch(ResourceJavaMethodDispatcher.java:75)
		at com.sun.jersey.server.impl.uri.rules.HttpMethodRule.accept(HttpMethodRule.java:288)
		at com.sun.jersey.server.impl.uri.rules.ResourceClassRule.accept(ResourceClassRule.java:108)
		at com.sun.jersey.server.impl.uri.rules.RightHandPathRule.accept(RightHandPathRule.java:147
		at com.sun.jersey.server.impl.uri.rules.RootResourceClassesRule.accept(RootResourceClassesRule.java:84)
		at com.sun.jersey.server.impl.application.WebApplicationImpl._handleRequest(WebApplicationImpl.java:1465)
		at com.sun.jersey.server.impl.application.WebApplicationImpl._handleRequest(WebApplicationImpl.java:1396)
		at com.sun.jersey.server.impl.application.WebApplicationImpl.handleRequest(WebApplicationImpl.java:1345)
		at com.sun.jersey.server.impl.application.WebApplicationImpl.handleRequest(WebApplicationImpl.java:1335)
		at com.sun.jersey.spi.container.servlet.WebComponent.service(WebComponent.java:416)
		at com.sun.jersey.spi.container.servlet.ServletContainer.service(ServletContainer.java:537)
		at com.sun.jersey.spi.container.servlet.ServletContainer.service(ServletContainer.java:699)
		at javax.servlet.http.HttpServlet.service(HttpServlet.java:717)
		at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:290)
		at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:206)
		at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:235)
		at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:206)
		at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:233)
		at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:191)
		at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:128)
		at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:102)
		at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:109)
		at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:293)
		at org.apache.coyote.http11.Http11Processor.process(Http11Processor.java:849)
		at org.apache.coyote.http11.Http11Protocol$Http11ConnectionHandler.process(Http11Protocol.java:583)
		at org.apache.tomcat.util.net.JIoEndpoint$Worker.run(JIoEndpoint.java:454)
		at java.lang.Thread.run(Thread.java:680)
	Caused by: com.mongodb.MongoException$DuplicateKey: E11000 duplicate key error index: test.people.$people_first_name_address_idx  dup key: { : "John", : "123 Fake Street"};
		at com.mongodb.CommandResult.getException(CommandResult.java:80)
		at com.mongodb.CommandResult.throwOnError(CommandResult.java:116)
		at com.mongodb.DBTCPConnector._checkWriteError(DBTCPConnector.java:126)
		at com.mongodb.DBTCPConnector.say(DBTCPConnector.java:148)
		at com.mongodb.DBTCPConnector.say(DBTCPConnector.java:132)
		at com.mongodb.DBApiLayer$MyCollection.insert(DBApiLayer.java:262)
		at com.mongodb.DBApiLayer$MyCollection.insert(DBApiLayer.java:217)
		at com.mongodb.DBCollection.insert(DBCollection.java:71)
 		at com.mongodb.DBCollection.save(DBCollection.java:633)
		at org.springframework.data.mongodb.core.MongoTemplate$13.doInCollection(MongoTemplate.java:745)
 		at org.springframework.data.mongodb.core.MongoTemplate.execute(MongoTemplate.java:331)
 	... 41 more


So, it is really hard to blame the Spring Data MongoDB guys for this issue, as it is really a configuration option of the underlying MongoDB Java Driver.  However, the MongoTemplate class does have a setWriteConcern method for this very reason and it would have saved me some time if the reference documentation had mentioned this and/or had some examples on how to change the setting.  I guess that will be in the "release" :).