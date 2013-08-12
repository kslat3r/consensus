import re
import config

class Util:

    @staticmethod
    def ksort(dict):
        keys = dict.keys()
        keys.sort()
        return keys

class Base:

    _database = None
    _details = {}
    _pk = None
    _table = None
    _classname = None

    def __init__(self, details = {}):
        self._details = details

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
        return self._details

    def id(self):
        return self._details[self._pk]

    def save(self):
        details = self._details.copy()

        if (self._pk in details):
            del details[self._pk]
            self._database.update(self._table, details, self._pk, self._details[self._pk])
        else:
            self._details[self._pk] = self._database.insert(self._table, details)

    def delete(self):
        data = {}
        data[self._pk] = self._details[self._pk]
        self._database(self._table, data)

class Factory:
    _database = None
    _pk = None
    _table = None
    _classname = None

    def __init__(self):
        self._database = Database.instance()

    def find(self, data = None, order_by = None, limit = None, force_array = False):
        pass

    def create(self, data, once = False):
        pass

    def returnInstances(self, rows, force_array = False):
        out = []

        if (len(rows) > 0):
            for row in rows:
                instance = getattr(__import__('consensus'), self._className)(row)
                out.append(instance)

        if (len(out) > 1 or len(out) == 0 or force_array == True):
            return out
        elif (len(out) == 1):
            return out[0]

class String:
    value = ''

    def __init__(self, value, includeHashtags):
        self.value = self._stripUrls(value)

        if (includeHashtags == False):
            self.value = self._stripHashTags(value)

        self.value = self._stripAtTags(value)

    def _stripUrls(self, value):
        return re.sub(r'/\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/i', '', value)

    def _stripHashTags(self, value):
        return re.sub(r'/\s?#(\w+)/', '', value)

    def _stripAtTags(self, value):
        return re.sub(r'/@(\w+)/', '', value)