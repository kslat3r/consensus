<div class="result" id="search_result_<%=search_result.mongoId() %>">
	<div class="pic floatleft">
		<a href="http://www.twitter.com/<%= search_result.get('source_user_username') %>" target="_new"><img src="<%= search_result.get('source_user_image_url') %>" alt="" /></a>
	</div>
	<div class="value floatleft">
		<div class="info">
			<span class="name"><%= search_result.get('source_user_name') %></span>&nbsp;<span class="at_tag"><a href="http://www.twitter.com/<%= search_result.get('source_user_username') %>" target="_new">@<%= search_result.get('source_user_username') %></a></span>
		</div>	    					
		<ul class="tokens">
			<% for (var i in tokens) { %>
				<li class="<%= tokens[i].scoring_band.class_name %> token" title="<%= tokens[i].scoring_band.name %> (<%= tokens[i].score > 0 ? '+' + tokens[i].score : tokens[i].score %>.00)"><%= tokens[i].value %></li>
			<% } %>			
		</ul>
	</div>
	<div title="<%= scoring_band.name %>" class="score <%= scoring_band.class_name %> floatright">
		<%= search_result.get('score') > 0 ? '+' + search_result.get('score') : search_result.get('score') %>
	</div>	    					
	<div class="date floatright">
		<%= Util.parseDate(search_result.get('source_date_created').sec) %>
	</div>
	<div class="clear">&nbsp;</div>
</div>
<div class="clear">&nbsp;</div>