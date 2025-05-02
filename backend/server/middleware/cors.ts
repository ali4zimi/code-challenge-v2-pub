import { defineEventHandler } from 'h3';

export default defineEventHandler((event) => {
  // This middleware will handle CORS preflight requests
  // and set the appropriate headers for all other requests.

  if (event.node.req.method === 'OPTIONS') {
    event.node.res.setHeader('Access-Control-Allow-Origin', '*');
    event.node.res.setHeader('Access-Control-Allow-Headers', 'content-type');
    event.node.res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    event.node.res.statusCode = 200; 
    event.node.res.end();
    return;
  } 

  event.node.res.setHeader("Access-Control-Allow-Origin", "*");
});