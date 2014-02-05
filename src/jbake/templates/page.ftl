<#include "header.ftl">

    <#include "menu.ftl">

    <div class="page-header">
        <h1>${content.title}</h1>
    </div>

    <p><em>${content.date?string("dd MMMM yyyy")}</em></p>

    <div class="g-plusone" data-size="medium" data-href="${config.site_host}${content.uri}"></div>
    <script type="IN/Share" data-url="${config.site_host}${content.uri}" data-counter="right"></script>
    <div class="fb-like" data-href="${config.site_host}${content.uri}" data-layout="button_count" data-action="like" data-show-faces="false" data-share="true"></div>

    <p>${content.body}</p>

    <div class="g-plusone" data-size="medium" data-href="${config.site_host}blog${content.uri}"></div>
    <script type="IN/Share" data-url="${config.site_host}${content.uri}" data-counter="right"></script>
    <div class="fb-like" data-href="${config.site_host}${content.uri}" data-layout="button_count" data-action="like" data-show-faces="false" data-share="true"></div>

    <div id="disqus_thread"></div>
    <script type="text/javascript">
        var disqus_shortname = 'jdpgrailsdevblog';
        var disqus_identifier = '${content.uri}';
        /* * * DON'T EDIT BELOW THIS LINE * * */
        (function() {
            var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
            dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
        })();
    </script>
    <noscript>Please enable JavaScript to view the <a href="http://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
    <a href="http://disqus.com" class="dsq-brlink">comments powered by <span class="logo-disqus">Disqus</span></a>

    <hr>

<#include "footer.ftl">
