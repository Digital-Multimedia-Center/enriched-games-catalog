# Build stage: need devDependencies

FROM node:alpine AS builder
WORKDIR /app

ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage: production deps only and copy build output

FROM node:alpine
RUN mkdir /app
WORKDIR /app

ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}

COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["npm", "run", "start"]



