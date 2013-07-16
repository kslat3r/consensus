import time
import generic
import scraper
import multiprocessing
import re
import json

class Accounts(generic.Factory):
	_pk = 'id'
	_table = 'accounts'
	_className = 'Account'

	pass

class Account(generic.Base):
	_pk = 'id'
	_table = 'accounts'
	_className = 'Account'

	def connect(self):
		Database = generic.Database.instance()
		Database.setConnectionDetails(self.get('db_host'), int(self.get('db_port')), self.get('db_username'), self.get('db_password'), self.get('db_name'))
		Database.connect()

class Jobs(generic.Factory):
	_pk = 'id'
	_table = 'jobs'
	_className = 'Job'

	pass

class Job(generic.Base):
	_pk = 'id'
	_table = 'jobs'
	_className = 'Job'

	_interval = 60

	def getAverageResultScore(self):
		searches = Searches()
		searches = searches.find({'job_id': self.id()})

		total = 0

		if (len(searches) > 0):
			for key, search in searches:
				total += search.get('average_result_score')

		if (len(searches) > 0):
			return total / len(searches)

		return len(searches) / 1

	def getAverageTokenScore(self):
		searches = Searches()
		searches = searches.find({'job_id': self.id()})

		total = 0

		if (len(searches) > 0):
			for key, search in searches:
				total += search.get('average_token_score')

		if (len(searches) > 0):
			return total / len(searches)

		return len(searches) / 1

	def execute(self):
		microtime 	= time.time()
		params		= {}

		#get last search

		searches 	= Searches()
		lastSearch	= searches.find({'job_id': self.id()}, 'date_created_timestamp DESC', 1)

		if (isinstance(lastSearch, Search)):
			searchResults = SearchResults()



			for source in Search.sources:
				searchResult = searchResults.getMostRecentFromJobFromSource(self, source)

				if (isinstance(searchResult, SearchResult)):
					if (source == 'Facebook'):
						params['Facebook'] 			= {}
						params['Facebook']['since'] = str(searchResult.get('source_date_created_timestamp'))
					elif (source == 'Twitter'):
						params['Twitter']				= {}
						params['Twitter']['since_id'] 	= searchResult.get('source_id')

				searchResult = None

		search = Search({})
		search.set('date_created', time.strftime('%Y-%m-%d %H:%M:%S'))
		search.set('date_created_timestamp', microtime)
		search.set('job_id', self.id())
		search.save()

		search.execute(self.get('term'), json.loads(self.get('sources')), params)

		#wait for processes to complete

		for process in search.processes:
 			process.join()

 		#kill child processes

 		for process in search.processes:
 			process.terminate()

 		search.classify(self.get('include_hashtags'), self.get('include_term'))

 		search.set('execution_time', time.time() - microtime)
		search.save()

		self.set('queued', 0);
		self.save()

		search = None

class ModTokens(generic.Factory):
	_pk = 'id'
	_table = 'mod_tokens'
	_className = 'ModToken'

	pass

class ModToken(generic.Base):
	_pk = 'id'
	_table = 'mod_tokens'
	_className = 'ModToken'

	pass

class NegateTokens(generic.Factory):
	_pk = 'id'
	_table = 'negate_tokens'
	_className = 'NegateToken'

	pass

class NegateToken(generic.Base):
	_pk = 'id'
	_table = 'negate_tokens'
	_className = 'NegateToken'

	MODIFIER = -1

	pass

class ScoringBands(generic.Factory):
	_pk = 'id'
	_table = 'scoring_bands'
	_className = 'ScoringBand'

	pass

class ScoringBand(generic.Base):
	_pk = 'id'
	_table = 'scoring_bands'
	_className = 'ScoringBand'

	pass

class Searches(generic.Factory):
	_pk = 'id'
	_table = 'searches'
	_className = 'Search'

	pass

class Search(generic.Base):
	_pk = 'id'
	_table = 'searches'
	_className = 'Search'
	_term = None
	_sourceNumResults = 100;

	processes	= []
	sources = ('Twitter', 'Facebook')

	def execute(self, term, sources, params):
		self._term = term

		for source in sources:

			if (source in params):
				sourceObj	= getattr(scraper, source)(self, '"' + self._term + '"', self._sourceNumResults, params[source])
			else:
				sourceObj 	= getattr(scraper, source)(self, '"' + self._term + '"', self._sourceNumResults, {})

			sourceObj.start()
			self.processes.append(sourceObj)

	def classify(self, includeHashtags, includeTerm):
		searchResults 	= SearchResults()
		searchResults	= searchResults.find({'search_id': self.get('id')}, 'source_date_created_timestamp DESC', force_array = True)

		modTokens		= ModTokens()
		modTokens		= modTokens.find(force_array = True)

		negateTokens	= NegateTokens()
		negateTokens	= negateTokens.find(force_array = True)

		stopTokens		= StopTokens()
		stopTokens		= stopTokens.find(force_array = True)

		scoringBands	= ScoringBands()
		scoringBands	= scoringBands.find(force_array = True)

		#add from term

		if (includeTerm == False):
			parts = self._term.split(' ')

			for part in parts:
				stopToken = StopToken({'value': part})
				stopTokens.append(stopToken)

		#create processes

		if (len(searchResults) > 0):
			for searchResult in searchResults:
				classifier = Classifier(searchResult, modTokens, negateTokens, stopTokens, scoringBands, includeHashtags)
				classifier.start()
				classifier.join()
	 			classifier.terminate()

 		#do classification of this search

 		#i really don't want to have to do this - but it appears python does not pass class instances by reference to child processes

 		searchResults 	= SearchResults()
		searchResults	= searchResults.find({'search_id': self.get('id')}, 'source_date_created_timestamp DESC', force_array = True)

 		token_count		= 0
 		token_score		= 0
 		result_count	= 0
 		result_score	= 0
 		tokens			= []

 		if (len(searchResults) > 0):
	 		for searchResult in searchResults:
	 			tokens = json.loads(searchResult.get('tokens'))
	 			for token in tokens:
	 				if (token.get('score') != 0):
	 					token_score += float(token.get('score'))
	 					token_count += 1

	 			result_score += float(searchResult.get('score'))
	 			result_count += 1

 		if (token_count > 0):
 			self.set('average_token_score', float(token_score) / float(token_count))
 		else:
 			self.set('average_token_score', float(token_score) / 1)

 		if (result_count > 0):
 			self.set('average_result_score', float(result_score) / float(result_count))
 		else:
 			self.set('average_result_score', float(result_score) / 1)

class SearchResults(generic.Factory):
	_pk = 'id'
	_table = 'search_results'
	_className = 'SearchResult'

	def getMostRecentFromJobFromSource(self, job, source):
		sql	= """SELECT search_results.* FROM search_results, searches
			  	 WHERE search_results.search_id = searches.id
			  	 AND search_results.source = '""" + source + """'
			  	 AND searches.job_id = """ + str(job.get('id')) + """
			  	 ORDER BY source_date_created_timestamp DESC
			  	 LIMIT 1"""
		return self.returnInstances(self._database.selectRows(sql))

class Classifier(multiprocessing.Process):
	_searchResult		= None
	_modTokens			= None
	_negateTokens		= None
	_stopTokens			= None
	_scoringBands		= None
	_includeHashtags	= False

	def __init__(self, searchResult, modTokens, negateTokens, stopTokens, scoringBands, includeHashtags):
		self._searchResult 		= searchResult
		self._modTokens			= modTokens
		self._negateTokens		= negateTokens
		self._stopTokens		= stopTokens
		self._scoringBands		= scoringBands
		self._includeHashtags	= includeHashtags

		multiprocessing.Process.__init__(self)

	def run(self):
		self._searchResult.classify(self._modTokens, self._negateTokens, self._stopTokens, self._scoringBands, self._includeHashtags)

class SearchResult(generic.Base):
	_pk = 'id'
	_table = 'search_results'
	_className = 'SearchResult'

	tokens = []

	def classify(self, modTokens, negateTokens, stopTokens, scoringBands, includeHashtags):

		#get string and tokens

		str 		= generic.String(self.get('value'), includeHashtags)
		tokens		= Tokens()
		self.tokens	= tokens.tokenise(str, scoringBands)

		#get original scoring bands

		for token in self.tokens:

			#scoring band for token

			for scoringBand in scoringBands:
				if (scoringBand.get('min_score') == 0 and scoringBand.get('max_score') == 0):
					if (float(token.get('score')) == float(scoringBand.get('min_score')) and float(token.get('score')) == float(scoringBand.get('max_score'))):
						token.set('original_scoring_band', scoringBand.toArray())
				else:
					if (float(token.get('score')) >= float(scoringBand.get('min_score')) and float(token.get('score')) <= float(scoringBand.get('max_score'))):
						token.set('original_scoring_band', scoringBand.toArray())

		#do classification

		self.tokens = self._uppercaseTokens(self.tokens)
		self.tokens	= self._stopTokens(stopTokens, self.tokens)
		self.tokens = self._regexTokens(negateTokens, str.value, self.tokens)
		self.tokens	= self._regexTokens(modTokens, str.value, self.tokens)

		#do scoring and scoring band

		self.set('score', self._score(self.tokens))

		scoringBand = self._scoringBand(scoringBands, self.get('score'))
		self.set('scoring_band', json.dumps(scoringBand.toArray()))

		#export tokens

		tokens_out = []

		for token in self.tokens:

			#scoring band for token

			for scoringBand in scoringBands:
				if (scoringBand.get('min_score') == 0 and scoringBand.get('max_score') == 0):
					if (float(token.get('score')) == float(scoringBand.get('min_score')) and float(token.get('score')) == float(scoringBand.get('max_score'))):
						token.set('scoring_band', scoringBand.toArray())
				else:
					if (float(token.get('score')) >= float(scoringBand.get('min_score')) and float(token.get('score')) <= float(scoringBand.get('max_score'))):
						token.set('scoring_band', scoringBand.toArray())

			tokens_out.append(token.toArray())

		self.set('tokens', json.dumps(tokens_out))

		#save

		self.set('classified', 1)
		self.save()

	def _uppercaseTokens(self, tokens):
		for token in tokens:
			if (str(token.get('value')).upper() == str(token.get('value'))):
				token.set('uppercase_modifier', True)
				token.set('original_score', token.get('score'))
				token.assertScore(token.get('score') * Token.UPPERCASE_MODIFIER)

		return tokens

	def _stopTokens(self, stopTokens, tokens):
		for token in tokens:
			for stopToken in stopTokens:
				if (str(token.get('value')).lower() == str(stopToken.get('value')).lower()):
					token.set('stop_token', stopToken.toArray())
					token.set('original_score', token.get('score'))
					token.set('score', 0)

		return tokens

	def _regexTokens(self, regexTokens, str, tokens):
		for regexToken in regexTokens:
			matches = re.findall(regexToken.get('value'), str.lower())

			if (len(matches) > 0):
				for match in matches:

					#find token

					for token in tokens:

						#does the token match?

						if (token.get('value') == match):

							#mod token

							if (isinstance(regexToken, ModToken)):
								if (token.get('mod_token') == None):
									token.set('original_score', float(token.get('score')))
									token.assertScore(float(token.get('score')) * float(regexToken.get('modifier')))
									token.set('mod_token', regexToken.toArray())

							#negate token

							elif (isinstance(regexToken, NegateToken)):
								if (token.get('negate_token') == None):
									token.set('original_score', float(token.get('score')))
									token.assertScore(float(token.get('score')) * NegateToken.MODIFIER)
									token.set('negate_token', regexToken.toArray())

		return tokens

	def _score(self, tokens):
		total = 0
		count = 0

		for token in tokens:
			if (token.get('score') != 0):
				total += float(token.get('score'))
				count += 1

		if (count == 0):
			count = 1

		score = float(total / count)
		return "%.2f" % score

	def _scoringBand(self, scoringBands, score):
		for scoringBand in scoringBands:
			if (scoringBand.get('min_score') == 0 and scoringBand.get('max_score') == 0):
				if (float(score) == float(scoringBand.get('min_score')) and float(score) == float(scoringBand.get('max_score'))):
					return scoringBand
			else:
				if (float(score) >= float(scoringBand.get('min_score')) and float(score) <= float(scoringBand.get('max_score'))):
					return scoringBand

class StopTokens(generic.Factory):
	_pk = 'id'
	_table = 'stop_tokens'
	_className = 'StopToken'

	pass

class StopToken(generic.Base):
	_pk = 'id'
	_table = 'stop_tokens'
	_className = 'StopToken'

	pass

class Tokens(generic.Factory):
	_pk = 'id'
	_table = 'tokens'
	_className = 'Token'

	def tokenise(self, str, scoringBands):
		out = []

		chunks = re.findall(r'([a-zA-Z0-9\'\-]+)', str.value)

		for chunk in chunks:
			chunk = chunk.strip("'")

			if (len(chunk) != 0):
				token = self.find({'value': chunk}, None, 1)

				if (isinstance(token, Token) == False):
					token = Token({'value': chunk, 'score': 0})

				out.append(token)

		return out

class Token(generic.Base):
	_pk = 'id'
	_table = 'tokens'
	_className = 'Token'

	MAX_SCORE 			= 5
	MIN_SCORE 			= -5
	UPPERCASE_MODIFIER	= 1.5

	def assertScore(self, score):
		if (score < self.MIN_SCORE):
			score = self.MIN_SCORE
		elif (score > self.MAX_SCORE):
			score = self.MAX_SCORE

		self.set('score', score)