FROM node:16.13.1

# Create app directory
WORKDIR /usr/src/app

# Update npm
RUN npm i -g npm@7

# Install app dependencies
COPY package*.json ./
RUN npm install --only=production

# Bundle app source
COPY . .

CMD ["node", "index.js"]