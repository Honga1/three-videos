import Express from 'express';
import path from 'path';

const appRoot = process.env.PWD;
if (appRoot === undefined) {
  throw new Error('process.env.PWD not exposed to server');
}

const PORT = process.env.PORT || 5000;

const app = Express();
app.use(Express.static(path.join(appRoot, 'build')));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});
app.use(Express.static(path.join(__dirname, 'videos')));

app.listen(PORT, () => console.log(`${process.env.NODE_ENV}: Listening on ${PORT}`));
