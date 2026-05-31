FROM node:22-alpine AS base
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

FROM base AS development
ENV NODE_ENV=development

COPY . .

EXPOSE 5000
CMD ["npm", "run", "start:dev"]

FROM base AS build
ENV NODE_ENV=production

COPY . .
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 5000
CMD ["node", "dist/main.js"]
