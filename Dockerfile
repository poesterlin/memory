# nodejs dockerfile with frontend build stage and backend run stage

# frontend build stage
FROM node:18 as build-stage

WORKDIR /app

COPY frontend/package.json /app

RUN npm install

COPY frontend /app

RUN npm run build

# backend run stage
FROM node:18

WORKDIR /app

COPY package.json /app

RUN npm install

COPY backend /app/backend

COPY --from=build-stage /app/public /app/frontend/public

CMD ["node" , "/app/backend/index.js"]
