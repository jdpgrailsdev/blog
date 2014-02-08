title=Keep Your Hands Off of My Whitespace!
date=2011-07-31
type=post
tags=groovy, xml
status=published
~~~~~~
We Can Put a Man on the Moon...
===========================

Groovy has some awesome XML reading and parsing features that make it a breeze for developers to create new XML strings or to parse existing XML strings.  The `XMLSlurper` and associated `GPathResult` classes make it easy to traverse and manipulate the DOM of an XML document/string.  On top of that, the builder support in Groovy (`MarkupBuilder`, `StreamingMarkupBuilder`) make it much easier for developers to create structured documents and get essentially built-in commenting for free (since the builder syntax essentially describes the hierarchical document by itself).  With all of these improvements and modern conveniences provided by Groovy regarding XML, you would think that it would be easy to perform the following task:

1. Read in a file containing XML
2. Parse the file and find a particular element
3. Edit the value of said element
4. Update the file with the changes, preserving the original formatting and namespace(s) of the file.

Good luck.  The builders are great for creating new documents.  While you can use the `StreamingMarkupBuilder` to handle data read from a file, it does NOT preserve the white-space (and you have to know what additional calls need to be made to preserve any namespaces in the original XML document).  This was a choice made by the implementer, which certainly makes sense for the normal use case of the `StreamingMarkupBuilder` (creating XML on the fly as a response to a request), where white-space is irrelevant (and takes up precious bytes ;) ).  So, are we just doomed to lose are pretty, human readable formatting when editing XML?  The answer is no.  Luckily, there are some other classes provided by Groovy that will let you do things similar to the normal Groovy XML manipulation approach (slurper, markup builders and GPath).

DOMination
------

The solution to the problem above is to use the `groovy.xml.DOMBuilder` and `groovy.xml.dom.DOMCategory` classes to manipulate XML, while still preserving the formatting/white-space.  Assume that you already have a `java.io.File` object pointing to an XML file.  You can do the following to manipulate the contents of that file:

    def xml = file.text
    def document = groovy.xml.DOMBuilder.parse(new StringReader(xml)))
    def root = document.documentElement
    
    use(groovy.xml.dom.DOMCategory) {
        // manipulate the XML here, i.e. root.someElement?.each { it.value = 'new value'}
    }

    def result = groovy.xml.dom.DOMUtil.serialize(root)

    file.withWriter { w ->
        w.write(result)
    }

With 10-15 lines of Groovy code, we have just loaded XML from a file, manipulated its contents, and written it back out to file, while preserving all formatting from the original file.  I wasted about 4 hours trying to figure this out before I stumbled upon the `DOMCategory` class.  For more information on editing XML using `DOMCategory`, see the Groovy tutorial on it [here](http://groovy.codehaus.org/Updating+XML+with+DOMCategory).