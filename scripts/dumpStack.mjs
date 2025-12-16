import app from '../app.js';
console.log('app router:', !!app._router);
if (app._router) {
  app._router.stack.forEach((layer,i)=>{
    console.log(i, layer.name, layer.regexp && layer.regexp.source, layer.route && layer.route.path);
  });
}
