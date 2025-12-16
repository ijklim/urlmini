
// Entry point: start the server (ESM)
import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3000;

// Dump registered routes for debugging
if (app && app._router && app._router.stack) {
  console.log('Registered route layers:');
  app._router.stack.forEach((layer, i) => {
    console.log(i, layer.name, layer.regexp && layer.regexp.source, layer.route && layer.route.path);
  });
}

app.listen(PORT, () => {
  console.log(`Node.js listening on port ${PORT}...`);
});

