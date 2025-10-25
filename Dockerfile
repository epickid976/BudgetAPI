# 1️⃣ Use a recent Node version
FROM node:22

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Copy package files first (for caching)
COPY package*.json ./

# 4️⃣ Install dependencies
RUN npm ci --omit=dev

# 5️⃣ Copy the rest of the app
COPY . .

# 6️⃣ Expose the API port (match your .env)
EXPOSE 3002

# 7️⃣ Set environment variables (optional but recommended)
ENV NODE_ENV=production
ENV PORT=3002

# 8️⃣ Start the app
CMD ["npm", "run", "start"]