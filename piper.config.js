export default {
  apps: [
    {
      name: "piper",
      script: "./server.js",
      instances: 1, // Running a single instance in fork mode
      exec_mode: "fork",
      watch: false, // Disable watch in production, enable in dev if needed
      max_memory_restart: "1G", // Restart if memory exceeds 1GB
      env: {
        NODE_ENV: "development",
        PORT: 5500, // Set port 5500 for local development
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 80, // Set port 80 for production
      },
    },
  ],
};
