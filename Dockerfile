# 1. Official Node.js Linux image
FROM node:20-alpine

# 2. Container ke andar working directory
WORKDIR /app

# 3. Root dependencies copy aur install karo
COPY package*.json ./
RUN npm install

# 4. Saara code container me copy karo
COPY . .

# 5. Port expose karo (Render PORT env provide karta hai)
ENV PORT=8080
EXPOSE 8080

# 6. Container start hone par command
CMD ["npm", "start"]