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
    <script>
    /**
    * RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
    * LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables
    */
    /*
    var disqus_config = function () {
    this.page.url = '${content.uri}'; // Replace PAGE_URL with your page's canonical URL variable
    this.page.identifier = '${content.title}'; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
    };
    */
    (function() { // DON'T EDIT BELOW THIS LINE
    var d = document, s = d.createElement('script');

    s.src = '//jdpearlin.disqus.com/embed.js';

    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
    })();
    </script>
    <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a></noscript>
    <a href="http://disqus.com" class="dsq-brlink">comments powered by <span class="logo-disqus">Disqus</span></a>

    <hr>

<#include "footer.ftl">