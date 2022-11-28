FROM public.ecr.aws/bitnami/node:16-prod as build

ENV NODE_ENV build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build \
    && npm prune --production

# -------

FROM public.ecr.aws/bitnami/node:16-prod as final

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY start.sh .
COPY package.json .

RUN pip3 install awscli
RUN apt-get update
RUN apt-get install postgresql postgis -y

# The command that starts our app
RUN chmod +x ./start.sh

EXPOSE 5000
CMD ["./start.sh"]