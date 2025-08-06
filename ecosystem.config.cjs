// ecosystem.config.js (ESM style)
// pm2 start ecosystem.config.js --env development
export default {
    apps: [
      {
        name: "apideligo",
        script: "server.js",
        cwd: "/var/www/apideligo",
        watch: true,
        env: {
          NODE_ENV: "development",
          PORT: 3000
        }
      }
    ]
  };
  