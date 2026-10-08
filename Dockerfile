FROM node:20-alpine

WORKDIR /app

# 1. Root aur saari services ka code copy karo
COPY . .

# 2. Root dependencies install karo (concurrently ke liye)
RUN npm install

# 3. Har ek service ke andar jaakar unke packages install karo
RUN cd apiGateway && npm install
RUN cd auth && npm install
RUN cd cart && npm install
RUN cd notification && npm install
RUN cd order && npm install
RUN cd payment && npm install
RUN cd product && npm install
RUN cd seller-dashboard && npm install

EXPOSE 8080

CMD ["npm", "start"]