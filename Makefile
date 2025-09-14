# Mali-S - Sistema de Gerenciamento para Salão de Beleza
# Makefile para build e deploy do container Docker

# Configurações
REGISTRY := ghcr.io
REPOSITORY := brimes/mali-s
IMAGE_NAME := $(REGISTRY)/$(REPOSITORY)
TAG ?= latest
PLATFORMS := linux/amd64,linux/arm64

# Cores para output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

.PHONY: help build build-local build-multi push push-local push-multi login dev run stop clean test setup-buildx remove-buildx logs status release info install dev-next build-next start-next db-generate db-push db-seed db-studio up down restart rebuild

# Target padrão
help: ## Mostra esta ajuda
	@echo "$(BLUE)Mali-S Docker Management$(NC)"
	@echo ""
	@echo "$(YELLOW)Comandos disponíveis:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Exemplos de uso:$(NC)"
	@echo "  make setup       # Configuração inicial (primeira vez)"
	@echo "  make up          # Inicia a aplicação"
	@echo "  make logs        # Ver logs da aplicação"
	@echo "  make down        # Para a aplicação"
	@echo "  make rebuild     # Rebuild e restart"

# ===== COMANDOS PRINCIPAIS PARA DESENVOLVIMENTO =====

setup: ## �️ Configuração inicial completa
	@echo "$(BLUE)�🚀 Configurando ambiente de desenvolvimento Mali-S...$(NC)"
	@if ! docker info > /dev/null 2>&1; then \
		echo "$(RED)❌ Docker não está rodando. Por favor, inicie o Docker Desktop.$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)📁 Criando diretórios necessários...$(NC)"
	@mkdir -p data logs backups
	@if [ ! -f ".env" ]; then \
		echo "$(YELLOW)📝 Criando arquivo .env...$(NC)"; \
		cp .env.docker .env; \
		echo "$(GREEN)✅ Arquivo .env criado!$(NC)"; \
	fi
	@if [ ! -f "data/salon.db" ] && [ -f "prisma/data/salon.initial.db" ]; then \
		echo "$(YELLOW)🗄️ Copiando banco inicial...$(NC)"; \
		cp prisma/data/salon.initial.db data/salon.db; \
	fi
	@echo "$(GREEN)🎉 Configuração concluída!$(NC)"
	@echo "$(BLUE)🚀 Use 'make dev-up' para desenvolvimento ou 'make up' para produção$(NC)"

dev-up: ## 🚀 Inicia aplicação em modo DESENVOLVIMENTO (hot reload)
	@echo "$(BLUE)🚀 Iniciando aplicação Mali-S em modo DESENVOLVIMENTO...$(NC)"
	@if [ ! -d "./data" ]; then \
		echo "$(YELLOW)📁 Criando diretório data...$(NC)"; \
		mkdir -p ./data ./logs; \
	fi
	@if ! docker info > /dev/null 2>&1; then \
		echo "$(RED)❌ Docker não está rodando. Inicie o Docker Desktop primeiro.$(NC)"; \
		exit 1; \
	fi
	@docker-compose --env-file .env.dev up -d
	@echo "$(GREEN)✅ Aplicação iniciada em modo DESENVOLVIMENTO!$(NC)"
	@echo "$(YELLOW)🔥 Hot reload ativo - mudanças no código serão aplicadas automaticamente$(NC)"
	@echo "$(BLUE)🌐 Acesse: http://localhost:3000$(NC)"
	@echo "$(YELLOW)📋 Para ver logs: make logs$(NC)"

up: ## 🚀 Inicia a aplicação com Docker Compose
	@echo "$(BLUE)🚀 Iniciando aplicação Mali-S...$(NC)"
	@if [ ! -d "./data" ]; then \
		echo "$(YELLOW)📁 Criando diretório data...$(NC)"; \
		mkdir -p ./data ./logs; \
	fi
	@if ! docker info > /dev/null 2>&1; then \
		echo "$(RED)❌ Docker não está rodando. Inicie o Docker Desktop primeiro.$(NC)"; \
		exit 1; \
	fi
	@docker-compose --env-file .env.prod up -d
	@echo "$(GREEN)✅ Aplicação iniciada em modo PRODUÇÃO!$(NC)"
	@echo "$(BLUE)🌐 Acesse: http://localhost:3000$(NC)"
	@echo "$(YELLOW)📋 Para ver logs: make logs$(NC)"

dev-rebuild: ## 🔨 Rebuild em modo desenvolvimento
	@echo "$(BLUE)🔨 Fazendo rebuild em modo desenvolvimento...$(NC)"
	@docker-compose down
	@docker-compose --env-file .env.dev build --no-cache
	@docker-compose --env-file .env.dev up -d
	@echo "$(GREEN)✅ Rebuild desenvolvimento concluído!$(NC)"
	@echo "$(YELLOW)🔥 Hot reload ativo$(NC)"
	@echo "$(BLUE)🌐 Acesse: http://localhost:3000$(NC)"

down: ## 🛑 Para a aplicação
	@echo "$(BLUE)🛑 Parando aplicação...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✅ Aplicação parada!$(NC)"

restart: ## 🔄 Reinicia a aplicação
	@echo "$(BLUE)🔄 Reiniciando aplicação...$(NC)"
	@docker-compose restart
	@echo "$(GREEN)✅ Aplicação reiniciada!$(NC)"

rebuild: ## 🔨 Rebuild e reinicia a aplicação
	@echo "$(BLUE)🔨 Fazendo rebuild da aplicação...$(NC)"
	@docker-compose down
	@docker-compose build --no-cache
	@docker-compose up -d
	@echo "$(GREEN)✅ Rebuild concluído!$(NC)"
	@echo "$(BLUE)🌐 Acesse: http://localhost:3000$(NC)"

# ===== COMANDOS DE DESENVOLVIMENTO =====

dev-shell: ## 🐚 Acessa shell do container
	@echo "$(BLUE)🐚 Acessando shell do container...$(NC)"
	@docker-compose exec mali-s sh

dev-logs: ## 📋 Logs em tempo real (desenvolvimento)
	@docker-compose logs -f

# ===== COMANDOS DE BANCO DE DADOS =====

db-reset: ## 🗄️ Reseta o banco de dados
	@echo "$(BLUE)🗄️ Resetando banco de dados...$(NC)"
	@if [ -f "./data/salon.db" ]; then \
		echo "$(YELLOW)🗑️ Removendo banco existente...$(NC)"; \
		rm -f ./data/salon.db; \
	fi
	@echo "$(YELLOW)🌱 Reiniciando aplicação para recriar banco...$(NC)"
	@docker-compose restart
	@echo "$(GREEN)✅ Banco resetado!$(NC)"

db-backup: ## 💾 Backup do banco de dados
	@echo "$(BLUE)💾 Fazendo backup do banco...$(NC)"
	@mkdir -p ./backups
	@cp ./data/salon.db ./backups/salon-backup-$(shell date +%Y%m%d-%H%M%S).db 2>/dev/null || echo "$(YELLOW)⚠️ Banco não encontrado$(NC)"
	@echo "$(GREEN)✅ Backup criado em ./backups/$(NC)"

db-restore: ## 🔄 Restaura backup do banco (usage: make db-restore FILE=backup.db)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)❌ Especifique o arquivo: make db-restore FILE=backup.db$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)🔄 Restaurando backup...$(NC)"
	@cp "$(FILE)" ./data/salon.db
	@docker-compose restart
	@echo "$(GREEN)✅ Backup restaurado!$(NC)"

# ===== COMANDOS DE LIMPEZA =====

clean-docker: ## 🧹 Remove containers e imagens
	@echo "$(BLUE)🧹 Limpando containers e imagens...$(NC)"
	@docker-compose down --rmi all --volumes --remove-orphans 2>/dev/null || true
	@docker system prune -f
	@echo "$(GREEN)✅ Limpeza concluída!$(NC)"

clean-all: ## 🧹 Limpeza completa (containers, imagens e dados)
	@echo "$(RED)⚠️ ATENÇÃO: Isso vai remover TUDO (containers, imagens e dados)!$(NC)"
	@read -p "Tem certeza? Digite 'yes' para confirmar: " confirm && [ "$$confirm" = "yes" ] || exit 1
	@echo "$(BLUE)🧹 Fazendo limpeza completa...$(NC)"
	@docker-compose down --rmi all --volumes --remove-orphans 2>/dev/null || true
	@docker system prune -af
	@rm -rf ./data ./logs ./backups
	@echo "$(GREEN)✅ Limpeza completa concluída!$(NC)"
	@echo "$(YELLOW)Use 'make setup' para reconfigurar$(NC)"

reset: ## 🔄 Reset completo (equivale a clean-all + setup)
	@echo "$(BLUE)🔄 Fazendo reset completo do sistema...$(NC)"
	@make clean-all
	@make setup
	@echo "$(GREEN)✅ Reset completo concluído!$(NC)"

# ===== COMANDOS AVANÇADOS =====

login: ## Faz login no registry
	@echo "$(BLUE)🔐 Fazendo login no GHCR...$(NC)"
	@docker login ghcr.io

build: setup-buildx ## Constrói imagem multi-plataforma
	@echo "$(BLUE)🏗️  Construindo imagem Docker multi-plataforma...$(NC)"
	@echo "$(YELLOW)Imagem: $(IMAGE_NAME):$(TAG)$(NC)"
	docker buildx build \
		--platform $(PLATFORMS) \
		--tag "$(IMAGE_NAME):$(TAG)" \
		--tag "$(IMAGE_NAME):latest" \
		--load \
		.
	@echo "$(GREEN)✅ Build concluído!$(NC)"

build-local: ## Constrói apenas para arquitetura local (mais rápido)
	@echo "$(BLUE)🏗️  Construindo imagem Docker (local)...$(NC)"
	docker build --tag "$(IMAGE_NAME):$(TAG)" .
	@echo "$(GREEN)✅ Build local concluído!$(NC)"

build-multi: ## Constrói imagem multi-plataforma (requer buildx)
	@echo "$(BLUE)🏗️  Construindo imagem Docker multi-plataforma...$(NC)"
	@echo "$(YELLOW)Imagem: $(IMAGE_NAME):$(TAG)$(NC)"
	@echo "$(YELLOW)Configurando buildx...$(NC)"
	@docker buildx create --name mali-s-builder --use --bootstrap || true
	docker buildx build \
		--platform $(PLATFORMS) \
		--tag "$(IMAGE_NAME):$(TAG)" \
		--tag "$(IMAGE_NAME):latest" \
		--push \
		.
	@echo "$(GREEN)✅ Build multi-plataforma concluído!$(NC)"

push-multi: build-multi ## Build multi-plataforma e push para GHCR
	@echo "$(GREEN)✅ Push multi-plataforma concluído!$(NC)"
	@echo "$(BLUE)📍 Disponível em: https://github.com/brimes/mali-s/packages$(NC)"

push: build login ## Constrói e faz push da imagem para GHCR
	@echo "$(BLUE)📤 Fazendo push da imagem...$(NC)"
	docker push "$(IMAGE_NAME):$(TAG)"
	@if [ "$(TAG)" != "latest" ]; then \
		docker push "$(IMAGE_NAME):latest"; \
	fi
	@echo "$(GREEN)✅ Push concluído!$(NC)"
	@echo "$(BLUE)📍 Disponível em: https://github.com/brimes/mali-s/packages$(NC)"

push-local: build-local login ## Push da build local (sem multi-arch)
	@echo "$(BLUE)📤 Fazendo push da imagem local...$(NC)"
	docker push "$(IMAGE_NAME):$(TAG)"
	@echo "$(GREEN)✅ Push local concluído!$(NC)"

dev: ## Executa o container em modo desenvolvimento
	@echo "$(BLUE)🚀 Iniciando container em modo desenvolvimento...$(NC)"
	docker run -it --rm \
		-p 3000:3000 \
		-v $(PWD)/prisma/data:/app/data \
		-e NODE_ENV=development \
		-e DATABASE_URL=file:./data/salon.db \
		"$(IMAGE_NAME):$(TAG)"

run: ## Executa o container em modo produção (standalone)
	@echo "$(BLUE)🚀 Iniciando container...$(NC)"
	docker run -d \
		--name mali-s \
		-p 3000:3000 \
		-v mali-s-data:/app/data \
		-e NODE_ENV=production \
		-e DATABASE_URL=file:./data/salon.db \
		--restart unless-stopped \
		"$(IMAGE_NAME):$(TAG)"
	@echo "$(GREEN)✅ Container iniciado!$(NC)"
	@echo "$(BLUE)🌐 Acesse: http://localhost:3000$(NC)"

stop: ## Para o container standalone
	@echo "$(BLUE)🛑 Parando container...$(NC)"
	@docker stop mali-s || true
	@docker rm mali-s || true
	@echo "$(GREEN)✅ Container parado!$(NC)"

clean: ## Remove imagens Docker locais
	@echo "$(BLUE)🧹 Limpando imagens locais...$(NC)"
	@docker rmi "$(IMAGE_NAME):$(TAG)" || true
	@docker rmi "$(IMAGE_NAME):latest" || true
	@docker system prune -f
	@echo "$(GREEN)✅ Limpeza concluída!$(NC)"

setup-buildx: ## Configura Docker Buildx para builds multi-plataforma
	@echo "$(BLUE)🔧 Configurando Docker Buildx...$(NC)"
	@docker buildx create --name mali-s-builder --use --bootstrap || echo "Builder já existe"
	@docker buildx inspect --bootstrap
	@echo "$(GREEN)✅ Buildx configurado!$(NC)"

remove-buildx: ## Remove o builder customizado
	@echo "$(BLUE)🧹 Removendo builder customizado...$(NC)"
	@docker buildx rm mali-s-builder || true
	@echo "$(GREEN)✅ Builder removido!$(NC)"
test: build-local ## Executa testes no container
	@echo "$(BLUE)🧪 Executando testes...$(NC)"
	docker run --rm \
		-v $(PWD)/prisma/data:/app/data \
		-e NODE_ENV=test \
		-e DATABASE_URL=file:./data/salon.db \
		"$(IMAGE_NAME):$(TAG)" \
		npm test

logs: ## 📋 Mostra logs da aplicação
	@echo "$(BLUE)📋 Logs da aplicação (Ctrl+C para sair):$(NC)"
	@docker-compose logs -f mali-s

status: ## 📊 Mostra status da aplicação
	@echo "$(BLUE)📊 Status da aplicação:$(NC)"
	@docker-compose ps

release: ## Cria uma release com tag versionada
	@read -p "Versão (ex: v1.0.0): " version; \
	make push TAG=$$version; \
	git tag $$version; \
	git push origin $$version

info: ## Mostra informações sobre as imagens
	@echo "$(BLUE)📋 Informações das imagens:$(NC)"
	@echo "$(YELLOW)Repositório:$(NC) $(IMAGE_NAME)"
	@echo "$(YELLOW)Tag atual:$(NC) $(TAG)"
	@echo "$(YELLOW)Plataformas:$(NC) $(PLATFORMS)"
	@echo ""
	@echo "$(BLUE)🐳 Comandos úteis:$(NC)"
	@echo "  make up          - Iniciar aplicação"
	@echo "  make logs        - Ver logs"
	@echo "  make down        - Parar aplicação"
	@echo "  make rebuild     - Rebuild completo"

# ===== COMANDOS DE INSTALAÇÃO LOCAL (para desenvolvimento) =====

install: ## Instala dependências locais (para desenvolvimento)
	@echo "$(BLUE)📦 Instalando dependências...$(NC)"
	npm install
	@echo "$(GREEN)✅ Dependências instaladas!$(NC)"

dev-next: ## Inicia Next.js localmente (se Prisma estiver configurado)
	@echo "$(BLUE)🚀 Iniciando Next.js...$(NC)"
	@echo "$(YELLOW)⚠️ Certifique-se de ter o Prisma configurado para macOS$(NC)"
	npm run dev

build-next: ## Build local do Next.js
	@echo "$(BLUE)🏗️ Fazendo build do Next.js...$(NC)"
	npm run build
	@echo "$(GREEN)✅ Build concluído!$(NC)"

start-next: ## Inicia Next.js em produção
	@echo "$(BLUE)🚀 Iniciando Next.js em produção...$(NC)"
	npm start

db-generate: ## Gera cliente Prisma para macOS
	@echo "$(BLUE)🔧 Gerando cliente Prisma para macOS...$(NC)"
	npx prisma generate
	@echo "$(GREEN)✅ Cliente Prisma gerado!$(NC)"

db-push: ## Aplica schema ao banco
	@echo "$(BLUE)📤 Aplicando schema ao banco...$(NC)"
	npx prisma db push
	@echo "$(GREEN)✅ Schema aplicado!$(NC)"

db-seed: ## Popula banco com dados iniciais
	@echo "$(BLUE)🌱 Populando banco...$(NC)"
	npm run db:seed
	@echo "$(GREEN)✅ Banco populado!$(NC)"

db-studio: ## Abre Prisma Studio
	@echo "$(BLUE)🎨 Abrindo Prisma Studio...$(NC)"
	npx prisma studio