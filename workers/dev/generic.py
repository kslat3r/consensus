import re
import sys
import config
from pymongo import MongoClient
from bson.objectid import ObjectId

class Database:

    _instance = None

    @staticmethod
    def instance():
        if Database._instance == None:
            try:
                Database._instance = MongoClient('mongodb://' + config.Mongo.username + ':' + config.Mongo.password + '@' + config.Mongo.host + ':' + config.Mongo.port + '/' + config.Mongo.db_name)
                Database._instance = Database._instance[config.Mongo.db_name]
            except:
                sys.exit('Database could not be found')

        return Database._instance

class Base:

    _database = None
    _details = {}
    _pk = None
    _collection = None
    _classname = None

    def __init__(self, details = {}):
        self._details = details
        self._database = Database.instance()
        self._database = self._database[self._collection]

    def __repr__(self):
        return self._print()

    def __str__(self):
        return self._print()

    def _print(self):
        out = '{'

        for key in self._details:
            out += str(key) + ': \'' + str(self._details[key]) + '\', '

        return out.rstrip(', ') + '}'

    def get(self, attr):
        if (attr in self._details):
            return self._details[attr]

        return None

    def set(self, key, attr):
        self._details[key] = attr

    def remove(self, attr):
        del self.details[attr]

    def toArray(self):
        details = self._details

        if self._pk in details:
            details[self._pk] = details[self._pk].__str__()
        
        return details

    def id(self):
        return self._details[self._pk]

    def save(self):
        details = self._details.copy()

        if (self._pk in details):
            del details[self._pk]
            self._database.update({'_id': self._details[self._pk]}, {'$set': details})
        else:
            self._details[self._pk] = self._database.insert(self._details)

    def delete(self):
        data = {}
        data[self._pk] = self._details[self._pk]
        self._database.remove(data)

class Factory:

    _database = None
    _pk = None
    _collection = None
    _classname = None

    def __init__(self):
        self._database = Database.instance()
        self._database = self._database[self._collection]

    def find_by_id(self, id):
        return getattr(__import__('consensus'), self._className)(self._database.find_one({'_id': ObjectId(id)}))

    def find(self, data = None, order_by = None, direction = None, limit = None):
        if (order_by != None and limit != None and direction != None):            
            return self._returnInstances(self._database.find(data).sort(order_by, direction).limit(limit))
        elif (order_by != None and direction != None):
            return self._returnInstances(self._database.find(data).sort(order_by, direction))
        elif (limit != None):
            return self._returnInstances(self._database.find(data).limit(limit))
        else:
            return self._returnInstances(self._database.find(data))

    def create(self, data):
        data[self._pk] = self._database.insert(data)
        return getattr(__import__('consensus'), self._className)(data)

    def _returnInstances(self, rows, force_array = False):
        out = []
        
        if (rows != None):
            for row in rows:
                instance = getattr(__import__('consensus'), self._className)(row)
                out.append(instance)

        return out

class String:
    
    value = ''

    def __init__(self, value):
        self.value = value.lower()
        self.value = self._stripUrls(value)
        self.value = self._stripHashTags(value)
        self.value = self._stripAtTags(value)

    def _stripUrls(self, value):
        return re.sub(r'/\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/i', '', value)

    def _stripHashTags(self, value):
        return re.sub(r'/\s?#(\w+)/', '', value)

    def _stripAtTags(self, value):
        return re.sub(r'/@(\w+)/', '', value)