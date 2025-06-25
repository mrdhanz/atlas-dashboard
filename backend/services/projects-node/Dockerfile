FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

# We will run with ts-node for simplicity in development
# For production, you would compile to JS first: `RUN pnpm build`
# and then `CMD ["node", "dist/index.js"]`

EXPOSE 8081
CMD ["pnpm", "start"]