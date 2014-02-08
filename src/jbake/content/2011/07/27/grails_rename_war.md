title=Maven Trick to Rename Grails War
date=2011-07-27
type=post
tags=grails, maven
status=published
~~~~~~
Convention vs. Convention
=========================

One of the constant problems with the Grails Maven integration is the competing conventions imposed by the two technologies.  An obvious example of this is the naming convention used for WAR files by the two.  The Maven convention is to use the following when creating a WAR file:

    ${project.artifactId}-${project.version}.war

When building your Grails application as a WAR file using the Grails command line (i.e. grails prod war), the value of the grails.project.war.file configuration property found in the application's `BuildConfig.groovy` file is used.  This is obviously not the same convention as the one used by Maven, as described above, and depending on which goals you use with the Grails Maven plugin, you may end up with a WAR named using the Maven convention instead of the Grails convention.  This is because the Grails Maven plugin includes two WAR building Mojos:  `GrailsWarMojo` and `MvnWarMojo`.  The former is not tied to any specific phase and is executed if the war goal is executed.  The latter is tied to a phase (package) and therefore is executed automatically if the Grails Maven plugin is included in your POM file and package is specified as a phase to execute (and your project packaging is grails-app).  This Mojo uses the Maven WAR naming convention outlined above.  Therefore, building your Grails application using mvn clean package will result in a WAR named as outlined above.

Cutting Against The Grain
-----------

So, now that we know about the two competing conventions, how do we make the Maven build do what we want (that is, how do we make it produce a WAR file named using the Grails naming convention)?  The best solution that I have found is to use the maven-antrun-plugin.  Normally, I don't condone the use of the Ant plugin in Maven, as it is essentially a way to shell out control away from Maven and it is very easy to violate the conventions set for by Maven with this solution.  However, in this case we are trying to break Maven's convention, so the following solution feels acceptable.  To rename the WAR after Maven is done creating it, simply add the following plugin definition to your POM file AFTER the declaration to use the Grails Maven plugin:

    <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-antrun-plugin</artifactId>
        <executions>
            <execution>
                <id>run-ant-rename-war</id>
                <phase>package</phase>
                <goals>
                    <goal>run</goal>
                </goals>
                <configuration>
                    <tasks>
                        <move file="${project.build.directory}/${project.artifactId}-${project.version}.war" tofile="${project.build.directory}/${project.artifactId}.war" />
                    </tasks>
                </configuration>
            </execution>
        </executions>
	</plugin>

This will rename (by moving) the WAR produced with the Maven WAR naming convention to the Grails WAR naming convention, leaving it in the target directory (or whatever you have configured via Maven to be the `project.build.directory`).