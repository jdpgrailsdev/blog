title=Grails web.xml Generation Magic
date=2011-07-18
type=post
tags=grails
status=published
~~~~~~
The Problem
===========

Grails provides a nice feature in each plugin's descriptor file that allows the plugin to make modifications to the web.xml file created by Grails application that includes the plugin at build time.  This can be done by implementing the `doWithWebDescriptor` closure in the plugin's descriptor file (see the Grails documentation for more information).  This works fine if you have a limited number of Grails plugins in your application that want to modify the web.xml file or have plugins whose changes to the `web.xml` file do not require some sort of order.  I recently ran into an issue where we needed to make sure that a custom Grails plugin added a servlet filter to the web.xml that came BEFORE the filters added by the Spring Security plugin.  I did not want to modify the Spring Security plugin to make sure its modifications to the web.xml came after the custom plugin's modifications, nor did I want to assume that the plugins would be installed in a particular order by Grails when building the main application.  

The Solution
------

After realizing that I could not rely on the order that each plugin's `doWithWebDescriptor` closure would be called, I decided to use the Grails application's `BuildConfig.groovy` file to make sure that the web.xml file was modified AFTER all plugins had modified the `web.xml` file.  This would allow the build to re-organize the servlet filters in the `web.xml` file to ensure they were in the right order (and would also cover the case where one or more of the filters was not added to the `web.xml` file -- i.e. this solution would work if one or both of the filters are missing from the generated web.xml file).  The trick is to make use of the grails.war.resources closure in the `BuildConfig.groovy` file.  This closure is called right before the WAR file is created, ensuring that nothing else will modify the web.xml file.  This takes care of the timing issue.  However, I still needed to write some code to actually modify the order of the servlet filters in the `web.xml` file.  To do this, I made use of the Groovy shell and binding classes:

    grails.war.resources = { stagingDir, args ->
        ...
        updateWebXml("${stagingDir}/WEB-INF/web.xml")
    }

    private def updateWebXml(webXmlPath) {
        Binding binding = new Binding()
        binding.indentity {
            setVariable("webXmlPath", webXmlPath)
        }

        new GroovyShell(binding).evaluate(new File("ModifyWebXml.groovy")
    }

The `updateWebXml` method uses the GroovyShell object to execute a Groovy script file, named `ModifyWebXml.groovy`.  This script uses the `XmlSlurper` class to read in the existing web.xml file and write out the modified one in its place:

    def webXml = new java.io.File(webXmlPath)
    if(webXml.exists()) {
        def origWebXml = new XmlSlurper().parse(webXml)
        def newWebXml = new groovy.xml.StreamingMarkupBuilder().bind { builder ->
            // Create the new web.xml file from the old one!
        }

        webXml.withWriter { w ->
            w.write(groovy.xml.XmlUtil.serialize(newWebXml))
        }
    }

This solution allowed me to create a script that could re-order the contents of the `web.xml` file and handle all cases with regards to whether or not the servlet filter entries in question are present or not in the `web.xml` file used as input.  It is also important to note that this solution can be extended to help in any other situation where you need to make last second modifications to files to be included in the WAR file at build time. 