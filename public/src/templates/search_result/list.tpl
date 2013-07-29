<% if (loading == false) { %>
    <% if (search_results.length > 0) { %>
    	<% if (show_load_more == true) { %>
            <div id="load_more" class="centre">
                <%= show_load_more_text %>
            </div>    
        <% } %> 
        <div id="results"></div>
        <% if (show_load_scroll == true) { %>
            <div id="load_scroll">
                <img src="/assets/images/throbber_big.gif" alt="" class="throbber" />
            </div>
        <% } %>
    <% }
    else { %>
    	<div id="no_results" class="centre">
            <em>No results to display</em>
        </div>
    <% } %>
<% }
else { %>
    <div id="loading" class="centre">
        <img src="/assets/images/throbber_big.gif" alt="" class="throbber" />
    </div>
<% } %>
