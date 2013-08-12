import sys
import json
import config
import generic
import consensus
import copy

reload(sys)
sys.setdefaultencoding('utf-8')

def callback(ch, method, properties, body):
	details = json.loads(body)

	#connect to main db

	db = generic.Database.instance()
	db.setConnectionDetails(config.Database.host, config.Database.port, config.Database.username, config.Database.password, config.Database.db_name)
	db.connect()

	#get job

	Jobs = consensus.Jobs()
	Job = Jobs.find({'id': details['job_id']})

	if (isinstance(Job, consensus.Job)):
		Job.execute()

		#acknowledge

		ch.basic_ack(method.delivery_tag)


amqp = generic.AMQP('consensus', 'jobs')
amqp.poll(copy.copy(callback))