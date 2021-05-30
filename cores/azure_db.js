const { Connection, Request, TYPES } = require("tedious");

// Create connection to database
const config = {
  authentication: {
    options: {
      userName: "long1402", // update me
      password: "0ByG9WLVwgvkhU5E" // update me
    },
    type: "default"
  },
  server: "dadn-db.database.windows.net", // updated
  options: {
    database: "dadn-db", //update me
    encrypt: true
  }
};

const connection = new Connection(config);
connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
        console.log(`DB connected!`);
    }
  });
  
  connection.connect();
  commonRequestCallback = (err, rowCount) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(`${rowCount} row(s) returned`);
    }
  }

  function putTempData(devID, time, tempValue)
  {
      console.log(`putTempData(${devID}, ${time}, ${tempValue})`);
      sqlStr = "INSERT INTO temp_history VALUES (@devid,@time,@value)"
      req = new Request(sqlStr, commonRequestCallback);
      req.addParameter("devid", TYPES.Int, devID);
      req.addParameter("time", TYPES.DateTime, time);
      req.addParameter("value", TYPES.Float, tempValue);

      connection.execSql(req);
  }

  module.exports = putTempData;