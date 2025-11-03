FROM node:20-slim
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm ci || npm install --no-audit --no-fund
COPY src ./src
EXPOSE 8787
CMD ["npm", "run", "dev"]


