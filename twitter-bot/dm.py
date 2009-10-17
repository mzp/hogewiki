#! /usr/bin/python
import wsgiref.handlers
from google.appengine.ext import webapp

class EchoHandler(webapp.RequestHandler):
  def get(self):
    self.response.out.write('Hello world!')

def main():
  application = webapp.WSGIApplication([('/dm/', echoHandler)],
                                       debug=True)
  wsgiref.handlers.CGIHandler().run(application)

if __name__ == '__main__':
  main()
