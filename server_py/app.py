import socketio
import eventlet
# create a Socket.IO server
sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio)

@sio.event
def connect(sid, environ, auth):
    print('A client is connected ', sid)

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 3001)), app)