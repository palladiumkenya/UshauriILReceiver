FROM node:latest

# Working directory in your container
WORKDIR /app

COPY package.json .

RUN npm install


ENV TIMEZONE Africa/Narobi

# Copy everything inside the current working directory to the container ideal path
COPY . /app

EXPOSE 6000

ENTRYPOINT npm run start
