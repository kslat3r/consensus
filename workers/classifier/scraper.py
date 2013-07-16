import config
import json
import consensus
from datetime import datetime
import time
import twitter

class Scraper():
	_job		= None
	_session	= None
	_term		= None
	_numResults	= None
	_params		= None

	def __init__(self, job, session, term, numResults, params):
		self._job			= job
		self._session		= session
		self._term			= term
		self._numResults	= numResults
		self._params		= params
		
class Twitter(Scraper):	
	_source	= 'Twitter'

	def run(self):
		api = twitter.Api(consumer_key=config.Twitter.consumer_key, consumer_secret=config.Twitter.consumer_secret, access_token_key=self._session.get('access_token')['oauth_token'], access_token_secret=self._session.get('access_token')['oauth_token_secret'])

		if ('since_id' in self._params and self._params['since_id'] != None and self._params['since_id'] != 0):
			tweets = api.GetSearch(term=self._term, since_id=self._params['since_id'], count=self._numResults, lang='en', result_type='recent')
		else:
			tweets = api.GetSearch(term=self._term, count=self._numResults, lang='en', result_type='recent')

		out = []
		if (tweets != None):
			for tweet in tweets:
				out.append(tweet.AsDict())

			if ('since_id' in self._params and self._params['since_id'] != None and self._params['since_id'] != 0):
				out = self._returnInstances(self._removeDuplicates(out, self._params['since_id']))
			else:
				out = self._returnInstances(out)			
		
		return out

	def _returnInstances(self, rows):
		out = []

		for row in rows:
			data							= {}
			data['job_id']					= self._job.get('_id')
			data['source']					= self._source
			data['source_id']				= str(row['id'])
			data['source_user_id']			= str(row['user']['id'])
			data['source_user_image_url']	= str(row['user']['profile_image_url'])
			data['source_user_username']	= str(row['user']['screen_name'])
			data['value']					= row['text']

			data['source_date_created']				= datetime.strptime(row['created_at'], '%a %b %d %H:%M:%S +0000 %Y')
			data['source_date_created_timestamp']	= time.mktime(datetime.strptime(row['created_at'], '%a %b %d %H:%M:%S +0000 %Y').timetuple())
			data['classified']						= 0

			searchResult = consensus.SearchResult(data);
			out.append(searchResult)
			searchResult = None

		return out

	def _removeDuplicates(self, rows, since_id):
		if (rows == None):
			return rows

		for row in rows:
			if (row['id'] == since_id):
				del row

		return rows