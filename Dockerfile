FROM public.ecr.aws/bitnami/node:16-prod as build

ENV NODE_ENV build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install && pip3 install awscli

COPY . .
RUN npm run build \
    && npm prune --production

FROM public.ecr.aws/bitnami/node:16-prod as final

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY start.sh .
COPY package.json .

EXPOSE 5000

RUN chmod +x ./start.sh
CMD ["./start.sh"]
