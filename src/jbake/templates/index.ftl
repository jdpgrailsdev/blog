<#include "header.ftl">

<#include "menu.ftl">

                <div class="page-header">
                    <h1>Why We Cant Have Nice Things</h1>
                </div>
<#assign lastposts = posts[0..0]>
<#list lastposts as post>
       <#if (post.status == "published")>
                   <a href="/blog${post.uri}"><h1>${post.title}</h1></a>
                   <p>${post.date?string("dd MMMM yyyy")}</p>
                <p><em>Tags: </em><#list post.tags as tag>
                <a href="/blog/tags/${tag?trim?replace(' ','-')}.html">${tag}</a>
        </#list></p>

                <div class="g-plusone" data-size="medium" data-href="http://jdpgrailsdev.github.io/blog${post.uri}"></div>
                <script type="IN/Share" data-url="http://jdpgrailsdev.github.io/blog${post.uri}" data-counter="right"></script>
                <div class="fb-like" data-href="http://melix.github.io/blog${post.uri}" data-layout="button_count" data-action="like" data-show-faces="false" data-share="true"></div>

                   <p>${post.body}</p>
                <p><a href="/blog${post.uri}#disqus_thread">Comments</a></p>
       </#if>
</#list>

                <hr />

                <p>Older posts are available in the <a href="/blog/${config.archive_file}">archive</a>.</p>

<#include "footer.ftl">
