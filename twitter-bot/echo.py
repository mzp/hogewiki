#! /usr/bin/python
import wsgiref.handlers
import logging
import yaml
import base64
import urllib
from google.appengine.ext import webapp
from django.utils import simplejson
from google.appengine.api import memcache
from google.appengine.api import urlfetch
from google.appengine.ext import db

class Dm(db.Model):
    dm_id  = db.StringProperty()

class EchoHandler(webapp.RequestHandler):
    def __init__(self):
        config_data = yaml.load(open('config.yaml'))
        self.bot_config = config_data['twitter']
        self.auth_header = {
            'Authorization' : 'Basic ' + base64.b64encode(
                '%s:%s' % (self.bot_config['username'], self.bot_config['password']))}

    def get(self):
        url = 'http://twitter.com/direct_messages.json'
        result = urlfetch.fetch(url = url, headers = self.auth_header)
        logging.debug(result.status_code)
        logging.debug(result.content)

        dms = simplejson.loads(result.content)
        dms.reverse()
        for dm in dms:
            id = str(dm['id'])
            exists = list(db.GqlQuery("SELECT * FROM Dm WHERE dm_id = :1 LIMIT 1",id))
            if exists == []:
                self.update(u"%s by @%s" %(dm['text'],dm['sender_screen_name']))
                model = Dm()
                model.dm_id = id
                model.put()
        self.response.out.write("ok")

    def update(self, status = None, in_reply_to = None):
        url  = 'http://twitter.com/statuses/update.json'
        data = urllib.urlencode({
                'status' : status.encode('utf-8'),
                'in_reply_to_status_id' : in_reply_to})
        result = urlfetch.fetch(
            url     = url,
            method  = urlfetch.POST,
            payload = data,
            headers = self.auth_header)

        logging.debug(result.status_code)
        logging.debug(result.content)

def main():
    application = webapp.WSGIApplication([('/echo/dm', EchoHandler)],
                                         debug=True)
    wsgiref.handlers.CGIHandler().run(application)

if __name__ == '__main__':
    main()
