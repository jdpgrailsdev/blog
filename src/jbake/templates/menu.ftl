    <!-- Fixed navbar -->
      <div class="navbar navbar-fixed-top">
        <div class="navbar-inner">
          <div class="container">
            <button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
            </button>
            <a class="brand" href="/blog/index.html">Jonathan Pearlin's Blog</a>
            <div class="navbar-collapse collapse">
              <ul class="nav navbar-nav">
                <li><a href="/blog/about.html">About</a></li>
                <li class="dropdown">
                       <a data-toggle="dropdown" href="#">Topics<b class="caret"></b></a>
                    <ul class="dropdown-menu" role="menu">
                        <!--<li><a href="/blog/tags/groovy.html">Groovy</a></li>-->
                    </ul>
                </li>
                <li><a href="/blog/${config.feed_file}">Feed</a></li>
              </ul>
              <ul class="nav navbar-nav navbar-right">
                <li><a href="https://github.com/jdpgrailsdev"><i class="fa fa-github"></i></a></li>
              </ul>
            </div>
          </div>
      </div>
      <div class="container">