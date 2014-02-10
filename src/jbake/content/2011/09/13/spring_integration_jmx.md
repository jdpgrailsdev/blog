title=I Don't Need To Read The Manual...Spring Integration and JMX
date=2011-09-13
type=post
tags=jmx, spring-integration
status=published
~~~~~~

The title pretty much says it all.  This seems like a pretty simple task, right?  I thought that I would just go to the Spring Integration reference documentation, follow the instructions, and boom, you can see all of your Spring Integration components via JMX from your favorite JMX monitoring client.  If only it were that easy.  The first hurdle I encountered was that the documentation at Spring's site fails to mention how to get the JMX schema included in your integration.xml or where the parsers/handlers live in the Spring library so that it can actually load and parse the integration.xml file.  The second is that there appears to be some typos in it (it should be "jmx:mbean-export", not "jmx:mbean-exporter" and the attributes of that tag are also listed incorrectly). Grr (I guess you get what you pay for). So, without further ado, this is how to turn on the MBean Exporter for Spring Integration:

1. Declare the "jmx" namespace in your integration.xml file: 

		xmlns:jmx="http://www.springframework.org/schema/integration/jmx"

2. Add the "jmx" schema to the "schemaLocation" attribute:

		xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.0.xsd
        http://www.springframework.org/schema/integration/jmx http://www.springframework.org/schema/integration/jmx/spring-integration-jmx-2.0.xsd
        http://www.springframework.org/schema/integration http://www.springframework.org/schema/integration/spring-integration-2.0.xsd"

3. Declare the MBean server bean: 

		<bean class="org.springframework.jmx.support.MBeanServerFactoryBean" id="mbeanServer">
	    	<property name="locateExistingServerIfPossible" value="true"></property>
		</bean>
        
4. Declare the Integration MBean Exporter: 

		<jmx:mbean-export default-domain="your.custom.domain" server="mbeanServer"></jmx:mbean-export>

5. Add the spring-integration-jmx library to your classpath.
