export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event) => {
    if (event.node.res.headersSent) {
      return;
    }

    removeResponseHeader(event, 'x-powered-by');
    event.node.res.setHeader('x-powered-by', 'ASP.NET');
  });
});
