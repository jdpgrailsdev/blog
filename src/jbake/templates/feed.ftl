<?xml version="1.0"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>Why We Can't Have Nice Things</title>
        <link>${config.site_host}</link>
        <atom:link href="${config.site_host}/feed.xml" rel="self" type="application/rss+xml" />
        <description>Jonathan Pearlin's Blog</description>
        <language>en-us</language>
        <pubDate>${published_date?string("EEE, d MMM yyyy HH:mm:ss Z")}</pubDate>
        <lastBuildDate>${published_date?string("EEE, d MMM yyyy HH:mm:ss Z")}</lastBuildDate>
        <image>
            <url>${config.site_host}/img/robot_devil.png</url>
            <title>Jonathan Pearlin's Blog</title>
            <link>${config.site_host}</link>
        </image>
        <#list published_posts[0..4] as post>
        <item>
            <title><#escape x as x?xml>${post.title}</#escape></title>
            <link>${config.site_host}${post.uri}</link>
            <pubDate>${post.date?string("EEE, d MMM yyyy HH:mm:ss Z")}</pubDate>
            <guid isPermaLink="false">${post.uri}</guid>
            <description>
                <#escape x as x?xml>
                    ${post.body}
                </#escape>
            </description>
        </item>
        </#list>
    </channel>
</rss>
