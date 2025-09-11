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

.PHONY: help build build-local build-multi push push-local push-multi login dev run stop clean test setup-buildx remove-buildx logs status release info install dev-next build-next start-next db-generate db-push db-seed db-studio

# Target padrão
help: ## Mostra esta ajuda
	@echo "$(BLUE)Mali-S Docker Management$(NC)"
	@echo ""
	@echo "$(YELLOW)Comandos disponíveis:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

login: ## Faz login no GitHub Container Registry
	@echo "$(BLUE)🔐 Fazendo login no GHCR...$(NC)"
	@echo $(GITHUB_TOKEN) | docker login ghcr.io -u $(GITHUB_USER) --password-stdin
	@echo "$(GREEN)✅ Login realizado com sucesso!$(NC)"

build: ## Constrói a imagem Docker localmente
	@echo "$(BLUE)🏗️  Construindo imagem Docker...$(NC)"
	@echo "$(YELLOW)Imagem: $(IMAGE_NAME):$(TAG)$(NC)"
	docker build \
		--tag "$(IMAGE_NAME):$(TAG)" \
		--tag "$(IMAGE_NAME):latest" \
		.
	@echo "$(GREEN)✅ Build concluído!$(NC)"

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

build-local: ## Constrói apenas para arquitetura local (mais rápido)
	@echo "$(BLUE)🏗️  Construindo imagem Docker (local)...$(NC)"
	docker build --tag "$(IMAGE_NAME):$(TAG)" .
	@echo "$(GREEN)✅ Build local concluído!$(NC)"
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

run: ## Executa o container em modo produção
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

stop: ## Para o container
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

logs: ## Mostra logs do container
	@docker logs -f mali-s

status: ## Mostra status do container
	@echo "$(BLUE)📊 Status do container:$(NC)"
	@docker ps | grep mali-s || echo "$(YELLOW)Container não está rodando$(NC)"

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
	@echo "  Para build local: $(GREEN)make build$(NC)"
	@echo "  Para build multi-plataforma: $(GREEN)make build-multi$(NC)"
	@echo "  Para fazer pull: $(GREEN)docker pull $(IMAGE_NAME):$(TAG)$(NC)"
	@echo "  Para executar: $(GREEN)make run$(NC)"
	@echo "  Para desenvolvimento: $(GREEN)make dev$(NC)"

# Comandos do projeto Next.js
install: ## Instala dependências
	npm install

dev-next: ## Executa em modo desenvolvimento (sem Docker)
	npm run dev

build-next: ## Build do Next.js
	npm run build

start-next: ## Inicia o servidor de produção
	npm start

# Comandos do banco de dados
db-generate: ## Gera o cliente Prisma
	npx prisma generate

db-push: ## Aplica mudanças do schema
	npx prisma db push

db-seed: ## Popula o banco com dados de exemplo
	npm run db:seed

db-studio: ## Abre o Prisma Studio
	npx prisma studio