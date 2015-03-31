var express = require('express');
var logger = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');

var fs = require('fs');

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

Array.prototype.contains = function(element) {
  var answer = false;
  this.forEach(function(part) { if(part == element) { answer = true; return; } });
  return answer;
}

var q = [];

io.on('connection', function(socket) {

  socket.emit('init', { queue: q });

  socket.on('push', function(data) {
    if(!q.contains(data.name)) {
      q.push(data.name);
      io.emit('addname', data.name);
    } else { socket.emit('dupe'); }
  });

  socket.on('pop', function() { q.shift(); io.emit('delname'); });
});

app.get('/', function(req, res) {
    res.render('index');
});

// lame authentication: to be upgraded
app.get('/admin', function(req, res) {
  var serverKey = fs.readFileSync('key.txt').toString().split('\n')[0];
  if(req.query.key == serverKey) { res.render('admin'); }
  else { res.send({}); }
});

app.get('/reset', function(req, res) {
  q = [];
  io.emit('reset');
  res.send({});
});

app.get('/favicon.ico', function(req, res) {
  res.send({});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var port = 8080;
var ip_address = '0.0.0.0';

try {
  http.listen(port, ip_address, function() {
    console.log('Listening on ' + ip_address + ':' + port)
  });
} catch(e) {
  console.log('cannot bind to address: '+ ip_address);
}
