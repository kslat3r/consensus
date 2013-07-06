<div class="cont12">
    <div class="grid12 alpha">
        <form class="extra-compact">
            <fieldset>
                <div class="field">
                    <input type="text" autocomplete="off" value="<%= job != null ? job.get('term') : '' %>" id="term" name="term" />
                </div>
                <div class="submit">
                    <input type="submit" value="Search" name="submit" class="button blue-button" id="search" />
                </div>
            </fieldset>
        </form>
    </div>
</div>
<% if (job != null) { %>
    <div class="cont12">
        <div class="cont10">
            <div id="results_view" class="<%= selected == 'chart' || selected == 'detailed' ? 'hidden' : '' %>">
                <div class="grid10 alpha">
                    <div id="search_results_cont" />
                </div>
            </div>
            <div id="chart_view" class="<%= selected == 'results' || selected == 'detailed' ? 'hidden' : '' %>">
                <div class="grid10 alpha">
                    <div id="chart_cont" />
                </div>
            </div>
            <div id="detailed_view" class="<%= selected == 'results' || selected == 'chart' ? 'hidden' : '' %>">
                <div id="detailed_cont" />
            </div>
        </div>
        <div class="cont2">
            <div class="grid2 omega panel yellow-grad" id="controls" style="top: <%= controls_scroll_top %>px;">
                <div class="view whole">
                    <ul class="controls floatright">
                        <li id="to_top"><a href="#" title="Go to top"><img src="/assets/images/icons/light/appbar.arrow.up.png" alt="Go to top" title="Go to top" class="icon32 inline" /></a></li>
                    </ul>
                    <ul class="view_options floatleft unclasp-right">
                        <li id="results_view_sel"<%= selected == 'results' ? ' class="selected"' : '' %>><a href="#"><img src="/assets/images/icons/light/appbar.column.one.png" alt="Results" title="Results" class="icon32" /></a></li>
                        <li id="chart_view_sel"<%= selected == 'chart' ? ' class="selected"' : '' %>><a href="#"><img src="/assets/images/icons/light/appbar.graph.line.png" alt="Chart" title="Chart" class="icon32" /></a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="clear">&nbsp;</div>
    </div>
<% } %>
