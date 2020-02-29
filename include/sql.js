//Require
const cred = require("../cred.json");
//--establish SQL connection
const mysql = require('mysql');
const con = mysql.createConnection({
  host: cred.sql.host,
  user: cred.sql.user,
  password: cred.sql.password,
  database: cred.sql.database
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
//--keep connection open
setInterval(function () {
    con.query('SELECT 1');
}, 5000);
});

function query(sql, vars, callback){
  con.query(sql, vars, function (err, result) {
    if (err){
      throw err;
    }
    return callback(result);
  });
}

function edit(sql, vars){
  con.query(sql, vars, function (err, result) {
    if (err){
      throw err;
    }
  });
}

function create(id){
  var nodeResults = "CREATE TABLE ??(nodeID INT(11) NOT NULL AUTO_INCREMENT, nodeDate DATE DEFAULT NULL, nodeRegion VARCHAR(255) DEFAULT NULL, nodeTier VARCHAR(255) DEFAULT NULL, nodeMembers INT(11) DEFAULT NULL, nodeEnemies INT(11) DEFAULT NULL, nodeResult VARCHAR(255) DEFAULT NULL, PRIMARY KEY (nodeID));";
  var nodeAttendance = "CREATE TABLE ??(nodeID INT(11) DEFAULT NULL, nodeDate DATE DEFAULT NULL, discordID VARCHAR(255) DEFAULT NULL);";
  var seaLoot = "CREATE TABLE ??(lootID INT(11) NOT NULL AUTO_INCREMENT, lootDate DATE DEFAULT NULL, discordID VARCHAR(255) DEFAULT NULL, lootAmount INT(11) DEFAULT NULL, lootAudit VARCHAR(255) DEFAULT NULL, UNIQUE KEY lootID (lootID));";
  con.query(nodeResults, (id + "_nodeResults"), function (err, result) {
    if (err){
      throw err;
    }
  });
  con.query(nodeAttendance, (id + "_nodeAttendance"), function (err, result) {
    if (err){
      throw err;
    }
  });
  con.query(seaLoot, (id + "_seaLoot"), function (err, result) {
    if (err){
      throw err;
    }
  });
}

module.exports = {
  query: query,
  edit: edit,
  create: create,
}
