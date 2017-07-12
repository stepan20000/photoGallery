function Router() {
  this.roadMap = {};
  this._notFoundHandler = function () {console.log('Hash not found')};
}

Router.prototype.route = function (route, handler) {
  if(this[route]) {
    this.roadMap[route].push(handler);
  } else {
    this.roadMap[route] = [handler];
  }
}
  
Router.prototype.notFound = function (handler) {
  this._notFoundHandler = handler;
}

Router.prototype.toPath = function (path) {
  if(this.roadMap[path]) {
    this.roadMap[path].forEach(function (handler) {
      handler();
    });
  } else {
    this._notFoundHandler();
  }
}