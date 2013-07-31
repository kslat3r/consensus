import generic

class Jobs(generic.Factory):
	_pk = '_id'
	_collection = 'jobs'
	_className = 'Job'

	pass

class Job(generic.Base):
	_pk = '_id'
	_collection = 'jobs'
	_className = 'Job'
	
	def delete(self):
		
		#get all search results

		search_results = SearchResults()
		search_results = search_results.find({'job_id': self.get('_id')})

		if search_results != None:
			for search_result in search_results:
				search_result.delete()

		super(Job, self).delete()

class NegateTokens(generic.Factory):
	_pk = '_id'
	_collection = 'negate_tokens'
	_className = 'NegateToken'

	pass

class NegateToken(generic.Base):
	_pk = '_id'
	_collection = 'negate_tokens'
	_className = 'NegateToken'

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

	def delete(self):
		pass


class Sessions(generic.Factory):
	_pk = '_id'
	_collection = 'sessions'
	_className = 'Session'

	pass

class Session(generic.Base):
	_pk = '_id'
	_collection = 'sessions'
	_className = 'Session'

	pass

class Tokens(generic.Factory):
	_pk = '_id'
	_collection = 'tokens'
	_className = 'Token'

	pass

class Token(generic.Base):
	_pk = '_id'
	_collection = 'tokens'
	_className = 'Token'

	pass