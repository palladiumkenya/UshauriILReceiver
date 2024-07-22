# UshauriILReceiver Deployment Guide

This guide covers deploying the UshauriILReceiver application using PM2 and Nginx.

## Prerequisites

- Node.js and npm
- PM2 (`npm install -g pm2`)
- Nginx
- Git

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/palladiumkenya/UshauriILReceiver.git
   cd UshauriILReceiver
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create `ecosystem.config.js` in the project root:

   ```javascript
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
   ```

4. Start the application:
   ```
   pm2 start ecosystem.config.js
   ```

5. Save PM2 process list and set up startup script:
   ```
   pm2 save
   pm2 startup
   ```

## Nginx Configuration

1. Create a new Nginx configuration file:
   ```
   sudo nano /etc/nginx/sites-available/ushauri_il_receiver
   ```

2. Add the following configuration:

   ```nginx
   upstream node_app {
       server localhost:1448;
       server localhost:1449;
       server localhost:1450;
       server localhost:1451;
   }

   server {
       listen 1440;
       server_name _;
       location / {
           proxy_pass http://node_app;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Enable the configuration:
   ```
   sudo ln -s /etc/nginx/sites-available/ushauri_il_receiver /etc/nginx/sites-enabled/
   ```

4. Test and restart Nginx:
   ```
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Usage

The application will be accessible at `http://your-server-ip:1440`.

## Management

- Monitor: `pm2 monit`
- Logs: `pm2 logs ushauri_IL_reciever_cluster`
- Restart: `pm2 restart ushauri_IL_reciever_cluster`

For more details, refer to [PM2 documentation](https://pm2.keymetrics.io/docs/usage/quick-start/) and [Nginx documentation](https://nginx.org/en/docs/).
