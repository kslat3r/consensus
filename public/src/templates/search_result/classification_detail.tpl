<ul>
	<% for (var i in tokens) { %>
		<li class="floatleft <%= tokens[i].scoring_band.class_name %> token" title="<%= tokens[i].scoring_band.name %>" id="token_<%= search_result.get('id') %>_<%= i %>"><%= tokens[i].value %></li>
	<% } %>
</ul>
<div class="clear">&nbsp;</div>
<% for (var i in tokens) { %>
	<div class="hidden token_desc unclasp-top" id="token_<%= search_result.get('id') %>_<%= i %>_desc">
		<div class="clear">&nbsp;</div>
		<div class="floatleft centre pad">
			<h6 class="unclasp-bottom">Score</h6>
			<div class="code circle <%= tokens[i].original_scoring_band.class_name %>">
				<% if (typeof(tokens[i].original_score) != 'undefined') { %>
					<%= tokens[i].original_score %>
				<% }
				else { %>
					<%= tokens[i].score %>
				<% } %>
			</div>
		</div>
		<div class="equation floatleft">
			<img src="/assets/images/icons/light/appbar.close.png" alt="Multiplied" title="Multiplied" class="icon16" />
		</div>
		<div class="floatleft centre pad">
			<h6 class="unclasp-bottom">Capitaliser</h6>
			<% if (typeof(tokens[i].uppercase_modifier) != 'undefined') { %>
				<div class="code circle">
					1.5
				</div>
			<% }
			else { %>
				<div class="code circle italic">
					None
				</div>
			<% } %>
		</div>
		<div class="equation floatleft">
			<img src="/assets/images/icons/light/appbar.close.png" alt="Multiplied" title="Multiplied" class="icon16" />
		</div>
		<div class="floatleft centre pad">
			<h6 class="unclasp-bottom">Modifier</h6>
			<% if (typeof(tokens[i].mod_token) != 'undefined') { %>
				<div class="code circle">
					<%= tokens[i].mod_token.modifier %>
				</div>
				<div class="code">
					<%= tokens[i].mod_token.name %>
				</div>
			<% }
			else { %>
				<div class="code circle italic">
					None
				</div>
			<% } %>
		</div>
		<div class="equation floatleft">
			<img src="/assets/images/icons/light/appbar.close.png" alt="Multiplied" title="Multiplied" class="icon16" />
		</div>
		<div class="floatleft centre pad">
			<h6 class="unclasp-bottom">Negator</h6>
			<% if (typeof(tokens[i].negate_token) != 'undefined') { %>
				<div class="code circle">
					-1
				</div>
				<div class="code">
					<%= tokens[i].negate_token.name %>
				</div>
			<% }
			else { %>
				<div class="code circle italic">
					None
				</div>
			<% } %>
		</div>
		<div class="equation floatleft">
			<img src="/assets/images/icons/light/appbar.close.png" alt="Multiplied" title="Multiplied" class="icon16" />
		</div>
		<div class="floatleft centre pad">
			<h6 class="unclasp-bottom">Stopper</h6>
			<% if (typeof(tokens[i].stop_token) != 'undefined') { %>
				<div class="code circle">
					0
				</div>
				<div class="code">
					<%= tokens[i].stop_token.value %>
				</div>
			<% }
			else { %>
				<div class="code circle italic">
					None
				</div>
			<% } %>
		</div>
		<div class="equation floatleft">
			<img src="/assets/images/icons/light/appbar.equals.png" alt="Equals" title="Equals" class="icon16" />
		</div>
		<div class="floatleft centre unclasp-right pad">
			<h6 class="unclasp-bottom">Final score</h6>
			<div class="code circle <%= tokens[i].scoring_band.class_name %>">
				<%= tokens[i].score %>
			</div>
		</div>
		<div class="clear">&nbsp;</div>
	</div>
<% } %>