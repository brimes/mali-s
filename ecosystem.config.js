module.exports = {
  apps: [
    {
      name: "mali-s",
      script: "npm",
      args: "start",
      cwd: "/path/to/your/app",
      instances: 1,
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        DATABASE_URL: "file:./data/salon.db",
        NODE_OPTIONS: "--max-old-space-size=512"
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm Z"
    }
  ]
}