
module.exports = {
 apps : [{
  name        : "obfuscate_discordbot",
  script      : "server/index.js",
  watch       : true,
  cwd         : "/opt/obfuscate_discordbot",
  instances   : "max",
  exec_mode   : "cluster",
  watch       : ["./server","./system_confs"],
  ignore_watch        : ["./log_storage","./db_storage"],
  out_file    : "./log_storage/obfuscate_discordbot_out.log",
  error_file  : "./log_storage/obfuscate_discordbot_err.log",
  pid_file    : "./log_storage/pid/obfuscate_discordbot_id.pid",
  log_date_format     : "YYYY-MM-DD HH:mm Z",
  kill_timeout : 60000,
  env: {
    "NODE_ENV": "prod",
    "PORT": "3100",
    "HOST": "0.0.0.0"
  },
  env_dev : {
    "NODE_ENV": "dev",
    "PORT": "3101",
    "HOST": "0.0.0.0"
  }
 }]
}
