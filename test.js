const id = process.argv[2];
const r = require("./api/video/[id].js");

r({ params: { id } }, { send: console.log });
