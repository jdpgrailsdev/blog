<#include "header.ftl">

<#include "menu.ftl">

                <div class="page-header">
                    <h1>Why We Cant Have Nice Things</h1>
                </div>
<#list posts as post>
    <#if (post.status == "published")>
                <a href="${post.uri}"><h1><#escape x as x?xml>${post.title}</#escape></h1></a>
                <p>${post.date?string("dd MMMM yyyy")}</p>
                <p><em>Tags: </em><#list post.tags as tag><a href="/blog/tags/${tag?trim?replace(' ','-')}.html">${tag}</a></#list></p>

                <div class="g-plusone" data-size="medium" data-href="${config.site_host}${post.uri}"></div>
                <script type="IN/Share" data-url="${config.site_host}${post.uri}" data-counter="right"></script>
                <div class="fb-like" data-href="${config.site_host}${post.uri}" data-layout="button_count" data-action="like" data-show-faces="false" data-share="true"></div>

                <p>${post.body}</p>
                <p><a href="/blog${post.uri}#disqus_thread">Comments</a></p>
    </#if>
</#list>

                <hr />

                <p>Older posts are available in the <a href="/blog/${config.archive_file}">archive</a>.</p>

<#include "footer.ftl">
