/**
 * PM2 Ecosystem — Traveloop Production Process Manager
 *
 * Usage:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save
 *   pm2 startup
 */
module.exports = {
  apps: [
    {
      name: 'traveloop-api',
      script: './server/server.js',
      cwd: '/var/www/traveloop',
      instances: 'max',           // Use all CPU cores
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/traveloop/error.log',
      out_file:   '/var/log/traveloop/out.log',
      merge_logs: true,
    },
  ],
};
