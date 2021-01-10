const id = process.argv[2];
const r = require("./api/video.js");

r({ query: { id, take: "yes" } }, { send: console.log, end: console.log });
