FROM node:alpine

RUN apk add --no-cache npm
RUN mkdir /app
WORKDIR /app

ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}

# Copy only package files first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

COPY . /app

EXPOSE 3000

ENTRYPOINT ["npm", "run", "dev"]
