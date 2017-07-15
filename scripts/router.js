function Router() {
  this.roadMap = {};
  this._notFoundHandler = function () {console.log('Hash not found')};
}

// Register router routs, for each route assign correspond handler or handlers
Router.prototype.route = function (route, handler) {
  if(this[route]) {
    this.roadMap[route].push(handler);
  } else {
    this.roadMap[route] = [handler];
  }
}
  
// Set handler for not found rout
Router.prototype.notFound = function (handler) {
  this._notFoundHandler = handler;
}

//Call all handlers for path or _notFoundHandler
Router.prototype.toPath = function (path) {
  if(this.roadMap[path]) {
    this.roadMap[path].forEach(function (handler) {
      handler();
    });
  } else {
    this._notFoundHandler();
  }
}