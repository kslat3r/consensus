import time
import generic
import re
import json
import scraper
import sys

class Jobs(generic.Factory):
	_pk = '_id'
	_collection = 'jobs'
	_className = 'Job'

	pass

class Job(generic.Base):
	_pk = '_id'
	_collection = 'jobs'
	_className = 'Job'
	_numResults = 10

	def execute(self):
		self.set('executing', True)
		self.set('started', True)
		self.set('api_limit', False)
		self.save()

		i = 0

		#get last search result

		searchResults 		= SearchResults()
		lastSearchResults	= searchResults.find({'job_id': self.id()}, 'source_date_created_timestamp', -1, 1)

		params = {}

		if (len(lastSearchResults) == 1 and isinstance(lastSearchResults[0], SearchResult)):
			params['since_id'] = lastSearchResults[0].get('source_id')
			i = lastSearchResults[0].get('num')

		sessions = Sessions()
		session = sessions.find_by_id(self.get('session_id'))

		try:
			twitter 		= scraper.Twitter(self, session, self.get('term'), self._numResults, params)
			searchResults 	= twitter.run()

			scoring_bands = ScoringBands()
			scoring_bands = scoring_bands.find()

			negate_tokens = NegateTokens()
			negate_tokens = negate_tokens.find()

			if (searchResults != None):
				i = i + 1
				for searchResult in searchResults:
					searchResult.classify(negate_tokens, scoring_bands, i)
					i = i + 1

			self.set('executing', False)
			self.save()	
		except: 
			self.set('executing', False)
			self.set('api_limit', True)
			self.save()		

class NegateTokens(generic.Factory):
	_pk = '_id'
	_collection = 'negate_tokens'
	_className = 'NegateToken'

	pass

class NegateToken(generic.Base):
	_pk = '_id'
	_collection = 'negate_tokens'
	_className = 'NegateToken'

	MODIFIER = -1

	pass

class ScoringBands(generic.Factory):
	_pk = '_id'
	_collection = 'scoring_bands'
	_className = 'ScoringBand'

	pass

class ScoringBand(generic.Base):
	_pk = '_id'
	_collection = 'scoring_bands'
	_className = 'ScoringBand'

	pass

class SearchResults(generic.Factory):
	_pk = 'id'
	_collection = 'search_results'
	_className = 'SearchResult'

	pass

class SearchResult(generic.Base):
	_pk = '_id'
	_collection = 'search_results'
	_className = 'SearchResult'

	tokens = []

	def classify(self, negateTokens, scoringBands, num):

		#get string and tokens

		str 		= generic.String(self.get('value'))
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

		self.tokens = self._regexTokens(negateTokens, str.value, self.tokens)		

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

		self.set('num', num)
		self.set('classified', 1)
		self.save()

	def _regexTokens(self, regexTokens, str, tokens):
		for regexToken in regexTokens:
			matches = re.findall(regexToken.get('value'), str.lower())

			if (len(matches) > 0):
				for match in matches:

					#find token

					for token in tokens:

						#does the token match?

						if (token.get('value') == match):

							#negate token

							if (isinstance(regexToken, NegateToken)):
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

class Sessions(generic.Factory):
	_pk = '_id'
	_collection = 'sessions'
	_className = 'Session'

	pass

class Session(generic.Base):
	_pk = '_id'
	_collection = 'sessions'
	_className = 'Session'

	MODIFIER = -1

	pass

class Tokens(generic.Factory):
	_pk = '_id'
	_collection = 'tokens'
	_className = 'Token'

	def tokenise(self, str, scoringBands):
		out = []

		#chunks = re.findall(r'([a-zA-Z0-9\'\-]+)', str.value)
		chunks = str.value.split()

		if chunks != None:
			for chunk in chunks:
				#chunk = chunk.strip("'")

				if (len(chunk) != 0):
					tokens = self.find({'value': chunk})

					if (tokens != None and len(tokens) > 0 and isinstance(tokens[0], Token)):
						out.append(tokens[0])					
					else:					
						token = Token({'value': chunk, 'score': 0})
						out.append(token)

		return out

class Token(generic.Base):
	_pk = '_id'
	_collection = 'tokens'
	_className = 'Token'

	MAX_SCORE 			= 5
	MIN_SCORE 			= -5

	def assertScore(self, score):
		if (score < self.MIN_SCORE):
			score = self.MIN_SCORE
		elif (score > self.MAX_SCORE):
			score = self.MAX_SCORE

		self.set('score', score)