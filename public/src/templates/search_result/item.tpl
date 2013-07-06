<td title="<%= scoring_band.name %>" class="centre score"><span class="<%= scoring_band.class_name %> band"><a href="#" class="classification_detail" title="Classification details" id="search_result_<%= search_result.get('id') %>"><%= search_result.get('score') %></a></span></td>
<% if (selected == 'item') { %>
    <td class="value">
        <%= search_result.get('value') %>
    </td>
<% }
else { %>
    <td class="classification_detail_cont">

    </td>
<% } %>
</td>
<td class="centre date"><%= Util.parseDate(search_result.get('source_date_created')) %></td>
<td class="centre network">
	<a href="http://www.twitter.com/<%= search_result.get('source_user_username') %>" target="_new"><img src="<%= search_result.get('source_user_image_url') != '' ? search_result.get('source_user_image_url') : '/assets/images/unknown_user.png' %>" alt="<%= search_result.get('source_user_username') %>" title="<%= search_result.get('source_user_username') %>" class="icon32" /></a>
</td>