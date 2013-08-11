<div id="toolbar_wrapper">
    <div id="toolbar">
        <ul>
            <li class="logo">
                <a href="/"><img src="/assets/images/logo_small.png" class="Consensus" /></a>
            </li>
            <li class="search">
                <form id="search">
                    <input type="text" placeholder="" class="value" value="<%= job != null ? job.get('term') : '' %>" id="term" />
                    <input type="submit" value="" class="submit" id="submit" />
                </form>
            </li>
            <li class="list view<%= selected == 'results' ? ' selected' : '' %>"><a href="#"><img src="/assets/images/list.png" title="List view" /></a></li>
            <li class="graph view<%= selected == 'chart' ? ' selected' : '' %>"><a href="#"><img src="/assets/images/chart.png" title="Chart view" /></a></li>
            <li class="logout"><a href="/auth/logout"><img src="/assets/images/logout.png" title="Logout" /></a></li>
        </ul>
        <div class="clear">&nbsp;</div>
    </div>
</div>
<div id="content">
    <% if (job != null) { %>
        <div id="results_view" class="<%= selected == 'chart' ? 'hidden' : '' %>"></div>
        <div id="chart_view" class="<%= selected == 'results' ? 'hidden' : '' %>"></div>    
    <% }
    else { %>
        <div id="instructions">
            <img src="/assets/images/arrow_flip.png" alt="" class="search" />
            <p class="search">Enter your search term here</p>
            <img src="/assets/images/arrow.png" alt="" class="chart" />
            <p class="chart">Click here for the chart view</p>
        </div>
    <% } %>
</div>