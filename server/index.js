//Destination: server
const express = require('express');
const fs = require('fs');
const emoji = require('node-emoji');
const compression = require('compression');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const cors = require('cors');
const childProcess = require('child_process');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const mongoStore = require("connect-mongo")(session);
const app = express();
const core = require('./core/core.js');
const system = require('../system_confs/system_vars.json');
const jobs = require('./core/cronJobs.js').jobs;
const handlebarsHelperFunctions = require('./view/handlebars/helpers.js');
const routes = require('./controller/routes.js');

//Main connection to DB
mongoose.connect(
  core.coreVars.dbServer,
  {useNewUrlParser: true,useUnifiedTopology: true}
 )
 .then(() => console.log(`${core.coreVars.projectName}|${process.env.NODE_APP_INSTANCE}: App\'s MongoDB connection established!`))
 .catch((err) => console.log(err));

const sessionStore = new mongoStore({
 mongooseConnection: mongoose.connection,
 collection: core.coreVars.dbSessionsColleciton,
 ttl: 2 * 24 * 60 * 60,
 autoRemove: 'native'
});

//Global Middleware: Must be defined before routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors());

//Express session middleware
app.use(
 session({
  secret: system.tokenSecret,
  cookie: {
   maxAge: 172800000, //Two days
  },
  resave: false,
  saveUninitialized: true,
  store: sessionStore
 })
);

// Serve secure cookies, requires HTTPS
/*
if (process.env.NODE_ENV === "prod") {
 session.cookie.secure = true;
}
*/

// View engine setup
app.set('views', path.join(__dirname, "view/pages"));
app.engine('handlebars', exphbs({
        defaultLayout: 'main',
    	extname: '.handlebars',
        layoutsDir:'server/view/pages/layouts',
        partialsDir:'server/view/pages/partials'
}));

app.set('view engine', 'handlebars');

//Source: https://stackoverflow.com/a/59930561
var hbs = exphbs.create({});
for (var h in handlebarsHelperFunctions) {
 handlebarsHelperFunctions[h](hbs);
}

//All routes and pages are called here.
for (var r in routes) {
 routes[r](app);
}

//Create required directories and change permissions if they do not exist.
//These should be mounted to a large storage pool
if (!fs.existsSync(core.coreVars.installedDir)){
 console.log(`${core.coreVars.projectName}|${process.env.NODE_APP_INSTANCE}: Creating: ${core.coreVars.installedDir}`);
 core.createDir (core.coreVars.installedDir);
}
if (!fs.existsSync(core.coreVars.dbStoreDir)){
 console.log(`${core.coreVars.projectName}|${process.env.NODE_APP_INSTANCE}: Creating: ${core.coreVars.dbStoreDir}`);
 core.createDir (core.coreVars.dbStoreDir);
}

function startApp () {
 app.listen(process.env.PORT, process.env.HOST, () => {
  console.log(`${core.coreVars.projectName}|${process.env.NODE_APP_INSTANCE}: ${emoji.emojify(':heavy_check_mark:.....:100:')}`);
 });
}

//Check if app is runing as correct user then execute.
core.incorrectUser(process.env.USER,process.env.HOST,process.env.PORT);
if (process.env.CORRECT_USER) {
 //Check if MongoDB is running.
 childProcess.exec('ps -C mongod -o pid=', (error, stdout, stderr) => {
  if (error) {
   console.error(`${core.coreVars.projectName}|${process.env.NODE_APP_INSTANCE}: MongoDB is not running. I will start it...`);
   //If MongoDB is not running attempt to start it.
   childProcess.exec(`mongod -f ${core.coreVars.systemConfsDir}/mongod.conf`, (error, stdout, stderr) => {
    if (error) {
     //If it can not run show error and stop.
     console.error(`${core.coreVars.projectName}|${process.env.NODE_APP_INSTANCE}: MongoDB could not start: ${error}`);
     return;
    }
    //Start has completed.
    console.log(`${core.coreVars.projectName}|${process.env.NODE_APP_INSTANCE}: MongoDB start complete: ${stdout.replace(/\n$/, '')}`);
   });
  }
  //MongoDB is running.
  console.log(`${core.coreVars.projectName}|${process.env.NODE_APP_INSTANCE}: MongoDB is running: ${stdout.replace(/\n$/, '')}`);
  //Start app.
  startApp();
  //Start all cron jobs defined in ./server/core/cronJobs.js
  for (key in jobs) {
   jobs[key].start();
  }
 });
}

process.on('SIGINT', () => {
 childProcess.exec(`mongod -f ${core.coreVars.systemConfsDir}/mongod.conf --shutdown`, (error, stdout, stderr) => {
  if (error) {
   console.error(`${core.coreVars.projectName}|${process.env.NODE_APP_INSTANCE}: MongoDB error: ${error}`);
  }
  console.log(`${core.coreVars.projectName}|${process.env.NODE_APP_INSTANCE}: Shutting down MongoDB...`);
  process.exit(error ? 1 : 0);
 });
});
