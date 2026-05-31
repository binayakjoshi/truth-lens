FROM node:22-alpine AS base
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

FROM base AS builder

ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY . .
RUN npm run build

FROM node:22-alpine AS development
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM node:22-alpine AS production
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/next.config.* ./

EXPOSE 3000
CMD ["npm", "run", "start"]
