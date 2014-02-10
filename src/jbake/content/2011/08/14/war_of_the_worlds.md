title=War of the Worlds
date=2011-08-14
type=post
tags=cloud9ide.com, eclipse, node.js
status=published
~~~~~~

Node.JS is a new and exciting evented I/O library for V8 JavaScript.  While the consensus seems to be to use Cloud9ide.com as the IDE of choice to develop Node.JS applications, this may be impractical for a couple of reasons.  First, Cloud9 is an online IDE, which means your source must be hosted on the Internet, either at Cloud9, Bitbucket or Github (I will say that the Github integration @ Cloud9ide.com is pretty nice).  Second, it is a rather limited IDE, which means you will have to do your other development elsewhere (if you only develop in JavaScript, than this isn't such a big deal).  Finally, the Cloud9ide.com IDE does NOT provide Node.JS code-completion for built-in modules (at least it did not at the time of writing this post).  With this in mind, I set out to see how well I could get Node.JS support into Eclipse.  Despite these shortcomings, one of the nice things about Cloud9ide.com is that it allows you to run and debug your application in their cloud, making it very easy to test your application.  Therefore, my goals for finding desktop IDE support for Node.JS was to make sure that it supported everything that Cloud9ide.com has and more.  I settled on the following requirements

* The ability to run/launch Node.JS applications from Eclipse
* The ability to debug Node.JS applications from Eclipse
* Code-completion for Node.JS module

I set out to do all of the above with Eclipse, as it is my favorite IDE of choice.  I was able to achieve all of the goals by following the instructions outlined in this post.  Please keep in mind that the instructions that follow assumes version 0.4.10 of Node.JS and version “Indigo” (3.7) of Eclipse.  All these instructions were tested on Mac OSX 10.6.8.

One IDE to Rule Them All
----------------
The first piece of the puzzle is to install Node.JS:

* Download the tarball from http://nodejs.org/#download
* Untar/unzip the package with tar –xvf
* Change into the newly created directory
* Run ./configure
* Run make
* Run make install
* Verify node.js is installed by running node –version

Once you have installed and verified Node.JS, the next step (assuming that you already have Eclipse installed) is to install the Eclipse Debugger Plugin for V8 (Google):

1. Open Eclipse
2. Select Help > Install New Software…
3. Click on the “Add…” button
4. Enter the following information:
	* Name: Eclipse Debugger Plugin for V8 Update Site
	* Location: [http://chromedevtools.googlecode.com/svn/update/dev/]()
5. Click on “OK” to add the update site
6. In the “Work with:” drop-down box, choose “Eclipse Debugger Plugin for V8 Update Site”. The plugin area should now be populated with the plugins offered by the update site.
7. Check the box next to “Google Chrome Developer Tools” and click on “Next” to install.
8. Walk through the wizard and install the plugin. Restart Eclipse when prompted for the changes to take effect.

The next plugin to install is the VJET Plugin from the good folks over at eBay:

1. In Eclipse, Select Help > Install New Software…
2. Click on the “Add…” button
3. Enter the following information:
	* Name: VJET Update Site
	* Location: [https://www.ebayopensource.org/p2/vjet/eclipse]()
4. Click on “OK” to add the update site
5. In the “Work with:” drop-down box, choose “VJET Update Site”. The plugin area should now be populated with the plugins offered by the update site.
6. Check the box next to “VJET” and click on “Next” to install.
7. Walk through the wizard and install the plugin. Restart Eclipse when prompted for the changes to take effect.

At this point, we have all the support we need to create, run, and debug V8 (and therefore Node.JS) applications.  However, this is essentially what Cloud9ide.com provides.  The cherry on top is the Node.JS code-completion support provided by the VJET plugin.  The support is a separate project that needs to be installed in your Eclipse workspace.  The VJET Type Library for Node.JS can be installed by following these steps:

1. Download the VJET Type Library for Node.JS from [http://www.ebayopensource.org/p2/vjet/typelib/NodejsTL.zip]()
2. In Eclipse, select File > Import…
3. In the Import wizard, select General > Existing Projects into Workspace
4. Select “Next”
5. Select the “Select archive file:” import option and click on the “Browse…” button
6. Navigate to the location where the NodejsTL.zip file is saved and select it for import.
7. Select “Finish” to import the type library.
8. Verify that the NodejsTL project appears in your Eclipse workspace.

Now we have everything we need to get started creating applications with Node.JS from eclipse.  To create a Node.JS project in Eclipse, follow these steps:

1. In Eclipse, select File > New > Project…
2. In the New Project wizard, select VJET > VJET Project and click on the “Next” button.
3. On the “Create a VJET Project” screen of the wizard, enter the project name and location (leave the default selections for all other input fields). Click on the “Next” button.
4. On the “VJET Settings” screen of the wizard, click on the “Projects” tab.
	* Click on the “Add…” button.
	* Select the NodejsTL project and click on the “OK” button. This will add auto-completion for NodeJS modules/functions.
5. Click on the “Finish” button to create the project

Assuming that you created a simple Node.JS application, the next step is to try to run your Node.JS application from WITHIN Eclipse:

1. In Eclipse, select Run > External Tools > External Tools Configurations…
2. In the External Tools Configurations window, select the “Program” node in the tree display on the left-hand side of the window.
3. Click on the “New launch configuration” button (appears above the tree as a blank piece of paper with a yellow plus sign in the upper right-hand corner). The right-hand side of the window should populate with the launch configuration screen.
4. Enter the following information:
	* Name: Debug Node
	* Location: /usr/local/bin/node
	* Working Directory: ${project_loc}
	* Arguments: --debug ${resource_name}
5. Click on “Apply” to save the changes
6. Click on “Close” to exit the “External Tools Configurations” window

To launch the application, select the “Debug Node” configuration under Run > External Tools. Make sure that the .js file that you would normally pass to Node.JS from the command line is selected in the Script Explorer prior to running. Otherwise, you will get errors when Node.JS runs, as it will not know which file to execute.

Note that you can create multiple launch configurations, so if you would like to have one for debugging and one for running, simply duplicate the configuration, give it a new name (like “Run Node”) and remove the “—debug” option from the arguments.  Assuming that you executed step 7 above, you can now attach the V8 remote debugger to the process so that you can set breakpoints and inspect your application:

1. In Eclipse, select Run > Debug Configurations
2. In the Debug Configurations window, select the “Standalone V8 VM” node in the tree display on the left-hand side of the window.
3. Click on the “New launch configuration” button (appears above the tree as a blank piece of paper with a yellow plus sign in the upper right-hand corner). The right-hand side of the window should populate with the launch configuration screen
4. Enter the following information:
	* Name: Debug Node 5858
	* Host: localhost
	* Port: 5858
	* Breakpoint sync on launch: Merge local and remote breakpoints
5. Click on “Apply” to save the changes
6. Click on “Close” to exit the “Debug Configurations” window
7. To launch the remote debugger, select the “Debug Node 5858” configuration from the Debug Configurations wizard and click on the “Debug” button. This assumes that the Node.JS process is already running and in debug mode, using the default debug port (5858).

Assuming that the remote debugging configuration connects successfully to your running application,  you can place breakpoints in the code by locating the “virtual project” created by the V8 plugin. To do this, use the following directions (assumes that Eclipse is already open AND the remote debugger configuration created above is currently connected to a running Node.JS application in debug mode):

1. Change to the VJET JS perspective
	* If the VJET JS perspective is not open, open it by selecting Window > Open Perspective > Other…
	* Select “VJET JS” from the list and click on the “OK” button.
2. Locate the “Debug Node 5858” project that appears in the “Script Explorer” view on the left-hand side of the perspective.
3. Expand the project and double click on the source file that you would like to set a breakpoint in to open it in the viewer.
4. Right-click to the left of the line that you would like to place a breakpoint on in the file viewer and select “Toggle Breakpoint” to set the breakpoint.
5. Interact with the Node.JS application. The application should pause when it hits the breakpoint set in Eclipse.

Note that the virtual project actually lets you see the code from the running Node.JS instance and NOT the source that you imported into Eclipse. In fact, if you just want to use Eclipse for setting breakpoints, you do not even need to import the source. You simply need to create the remote debugger configuration and set breakpoints in the virtual project once the remote debugger has connected to a running Node.JS instance in debug mode.  According to the V8 documentation (links below), you can make Eclipse actually honor the breakpoints set in your project.  However, I was not able to get this to work (and since the process is running from your code in the workspace anyways, the Virtual Project is actually already pointing at the same source files).  And that's it!  You now have the ability to create, run, and debug Node.JS applications from Eclipse with the added benefit of code-completion for the built-in modules in Node.JS.  Also, because the code-completion comes from a project imported into Eclipse, you can always modify it to add additional support for internal libraries, etc.  Below is a list of resources that I used to figure this all out:

* [Node.JS](http://nodejs.org/)
* [Using Eclipse as a Node.JS Debugger ](http://code.google.com/p/chromedevtools/)
* [Eclipse Debugger Plugin for V8 Tutorial](http://code.google.com/p/chromedevtools/wiki/DebuggerTutorial)
* [Eclipse Virtual Projects](http://code.google.com/p/chromedevtools/wiki/VirtualProject)
* [VJET: Importing VJET JavaScript Type Libraries into Eclipse](http://net.tutsplus.com/sessions/node-js-step-by-step/)