
import sys
import json
import config
import generic
import consensus

payload_file = None
payload = None

for i in range(len(sys.argv)):
    if sys.argv[i] == "-payload" and (i + 1) < len(sys.argv):
        payload_file = sys.argv[i + 1]
        with open(payload_file,'r') as f:
            payload = json.loads(f.read())
        break

if payload == None:
	sys.exit('No payload data')

jobs = consensus.Jobs()
job = jobs.find_by_id(payload['job_id'])

if (isinstance(job, consensus.Job)):
	job.execute()
elif (job.get('executing') == True):
	print 'Job is already executing'
else:
	print 'No job found'