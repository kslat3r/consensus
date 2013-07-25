<table class="search_results">
    <% if (loading == false) { %>
        <% if (search_results.length > 0) { %>
        	<thead>
                <tr>
                    <th class="centre">Score</th>
                    <th class="centre">Content</th>
                    <th class="centre">Date</th>
                    <th class="centre">User</th>
                </tr>                
            </thead>
        	<tbody class="items">
                <% if (show_load_more == true) { %>
                    <tr>
                        <td colspan="4">
                            <div class="button pale-yellow load_more">
                                <%= show_load_more_text %>
                            </div>
                        </td>
                    </tr>
                <% } %>
        	</tbody>
            <tfoot>
                <tr id="loading_more"<%= loading_more == false ? ' style="display: none;"' : '' %>>
                    <td colspan="4" class="centre">
                        <img src="/assets/images/throbber_big.gif" alt="" class="throbber unclasp-top" />
                    </td>
                </tr>
            </tfoot>
        <% }
        else { %>
        	<tr>
        		<td colspan="4" class="centre">
        			<em class="italic fade no_results">No results to display</em>
        		</td>
        	</tr>
        <% } %>
    <% }
    else { %>
        <tr>
            <td colspan="4" class="centre">
                <img src="/assets/images/throbber_big.gif" alt="" class="throbber" />
            </td>
        </tr>
    <% } %>
</table>