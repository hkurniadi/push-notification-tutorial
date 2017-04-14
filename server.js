const express = require('express');

const PORT = 8080;

const app = express();

app.use(express.static('app'));

app.listen(PORT, () => {
  console.log('Push-Notification Tutorial App listening on port', PORT);
});