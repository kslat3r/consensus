import requests
import json
import consensus
from datetime import datetime
import time
import multiprocessing

class Scraper(multiprocessing.Process):
	_search 	= None
	_term		= None
	_numResults	= None
	_params		= None
	_timeSpan	= None

	def __init__(self, search, term, numResults, params):
		self._search 		= search
		self._term			= term
		self._numResults	= numResults
		self._params		= params

		multiprocessing.Process.__init__(self)

	def _makeRequest(self, url, payload):
		r = requests.get(url, params=payload)
		return r.json

	def _saveInstances(self, objects):
		for obj in objects:
			obj.save()

class Facebook(Scraper):
	_source	= 'Facebook'
	_url 	= 'https://graph.facebook.com/search'

	def run(self):
		payload = {'type': 'post', 'limit': self._numResults, 'q': self._term}

		if ('since' in self._params and self._params['since'] != None and self._params['since'] != 0):
			payload['since'] = str(self._params['since'])

		posts = self._makeRequest(self._url, payload)

		if ('data' in posts):
			objects = self.returnInstances(posts['data'])
			self._saveInstances(objects)

	def returnInstances(self, rows):
		out = []

		for row in rows:
			data							= {}
			data['search_id']				= self._search.get('id')
			data['source']					= self._source
			data['source_id']				= row['id']
			data['source_user_id']			= row['from']['id']
			data['source_user_image_url']	= ''
			data['source_user_username']	= ''

			#status updates have 'message', shared posts have 'name', photos have 'caption'

			if ('message' in row):
				data['value']	= row['message']
			elif ('name' in row):
				data['value']	= row['name']
			elif ('caption' in row):
				data['value']	= row['caption']

			data['source_date_created']				= datetime.strptime(row['created_time'], '%Y-%m-%dT%H:%M:%S+0000')
			data['source_date_created_timestamp']	= time.mktime(datetime.strptime(row['created_time'], '%Y-%m-%dT%H:%M:%S+0000').timetuple())
			data['classified']						= 0

			searchResult = consensus.SearchResult(data)
			out.append(searchResult)
			searchResult = None

		return out

class Twitter(Scraper):
	_source	= 'Twitter'
	_url 	= 'http://search.twitter.com/search.json?search_type=recent&lang=en'

	def run(self):
		payload = {'search_type': 'recent', 'lang': 'en', 'rpp': self._numResults, 'q': self._term}

		if ('since_id' in self._params and self._params['since_id'] != None and self._params['since_id'] != 0):
			payload['since_id'] = str(self._params['since_id'])

		posts = self._makeRequest(self._url, payload)

		if (posts != None and 'results' in posts):
			if ('since_id' in self._params and self._params['since_id'] != None and self._params['since_id'] != 0):
				objects = self.returnInstances(self._removeDuplicates(posts['results'], self._params['since_id']))
			else:
				objects = self.returnInstances(posts['results'])

			self._saveInstances(objects)

	def returnInstances(self, rows):
		out = []

		for row in rows:
			data							= {}
			data['search_id']				= self._search.get('id')
			data['source']					= self._source
			data['source_id']				= row['id_str']
			data['source_user_id']			= row['from_user_id_str']
			data['source_user_image_url']	= row['profile_image_url']
			data['source_user_username']	= row['from_user']
			data['value']					= row['text']

			data['source_date_created']				= datetime.strptime(row['created_at'], '%a, %d %b %Y %H:%M:%S +0000')
			data['source_date_created_timestamp']	= time.mktime(datetime.strptime(row['created_at'], '%a, %d %b %Y %H:%M:%S +0000').timetuple())
			data['classified']						= 0

			searchResult = consensus.SearchResult(data);
			out.append(searchResult)
			searchResult = None

		return out

	def _removeDuplicates(self, rows, since_id):
		if (rows == None):
			return rows

		for row in rows:
			if (row['id_str'] == since_id):
				del row

		return rows