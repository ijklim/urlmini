import app from '../app.js';

function list(stack, prefix=''){
  stack.forEach(layer =>{
    if(layer.route){
      const path = prefix + (layer.route.path || '');
      console.log(Object.keys(layer.route.methods).join(','), path);
    } else if(layer.name === 'router' && layer.handle && layer.handle.stack){
      list(layer.handle.stack, prefix + (layer.regexp && layer.regexp.source === '^\\/?$' ? '' : (layer.regexp && layer.regexp.source ? layer.regexp.source : '')));
    }
  });
}

list(app._router.stack);
