<% if (loading == false) { %>
	<h3>Average score over time</h3>
	<div class="chart" />
	<em>Neutral results ignored</em>
	<h3>Scoring band count</h3>
	<div class="bar_chart" />
	<em>Total count: <%= count %></em>
<% }
else { %>
	<div id="loading" class="centre">
        <img src="/assets/images/throbber_big.gif" alt="" class="throbber" />
        <br/><br/>
        Performing your search, won't be long!
    </div>
<% } %>
