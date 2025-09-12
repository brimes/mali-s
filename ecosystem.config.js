module.exports = {
  apps: [
    {
      name: "mali-s",
      script: "npm",
      args: "start",
      cwd: "/var/www/mali-s",
      instances: 1,
      exec_mode: "fork", // mudado de cluster para fork para VM com poucos recursos
      watch: false,
      max_memory_restart: "400M", // reduzido para VM com poucos recursos
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        DATABASE_URL: "file:./data/salon.db",
        NODE_OPTIONS: "--max-old-space-size=384", // reduzido para VM
        PRISMA_BINARY_TARGETS: "native,linux-musl-openssl-3.0.x",
        PRISMA_QUERY_ENGINE_BINARY: "./node_modules/.prisma/client/query-engine-linux-musl-openssl-3.0.x",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "your-production-secret-here",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000"
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm Z",
      // Script para executar antes de iniciar a aplicação
      pre_start: "./scripts/fix-prisma.sh"
    }
  ]
}