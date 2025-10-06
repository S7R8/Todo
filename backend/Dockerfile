FROM golang:1.24.4

WORKDIR /usr/src/app
EXPOSE 8080

RUN go install github.com/air-verse/air@latest \
    && go install github.com/go-delve/delve/cmd/dlv@latest


COPY backend/go.mod backend/go.sum ./
RUN go mod download && go mod verify

# COPY . .
# RUN go build -v -o /usr/local/bin/app ./...

CMD ["air", "-c", ".air.toml"]