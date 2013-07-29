<div id="toolbar_wrapper">
    <div id="toolbar">
        <ul>
            <li class="search">
                <form id="search">
                    <input type="text" placeholder="Enter your search term" class="value" value="<%= job != null ? job.get('term') : '' %>" id="term" />
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
        <!-- Some instructions are needed here -->
    <% } %>
</div>