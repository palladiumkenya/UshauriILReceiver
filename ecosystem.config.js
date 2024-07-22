module.exports = {
  apps: [{
    name: "ushauri_IL_reciever_cluster",
    script: "./index.js",
    instances: 4,
    exec_mode: "cluster",
    watch: true,
    max_memory_restart: "1G",
    increment_var : 'PORT',
    env: {
      NODE_ENV: "production",
      PORT: 1448
    }
  }]
}
