# Kafka Infrastructure

This directory contains the Docker Compose setup for running a local Kafka broker with related services.

## Prerequisites

Before running this setup, ensure you have the following installed:

1. **Docker** (version 20.10.0 or higher)

   - [Install Docker Desktop](https://www.docker.com/products/docker-desktop) (Mac/Windows)
   - Or install Docker Engine on Linux

2. **Docker Compose** (v2.0.0 or higher)

   - Included with Docker Desktop
   - For Linux: `sudo apt install docker-compose-plugin`

3. **Recommended Tools**:
   - `curl` (for testing REST API endpoints)
   - `jq` (for pretty-printing JSON responses)
   - Kafka CLI tools (optional):
     ```bash
     brew install kafka  # MacOS
     sudo apt install kafkacat  # Linux
     ```

## Services Included

1. **Zookeeper** (port 2181)

   - Kafka's coordination service
   - Required for broker management

2. **Kafka Broker** (port 9092)

   - The core message broker
   - Accessible at `localhost:9092` from host machine

3. **Kafka REST Proxy** (port 8082)
   - HTTP interface for Kafka
   - Enables frontend applications to produce/consume messages

## Quick Start

1. Start all services:

   ```bash
   docker-compose up -d

   ```

2. Verify it's running:

    ```bash
    docker-compose ps
    ```

3. Stop the services (when done):

    ```bash
    docker-compose down
    ```

## Persistent Data Setup

To persist Kafka data between restarts, uncomment the volumes section in `docker-compose.yml`:

```yaml
kafka:
  volumes:
    - kafka-data:/var/lib/kafka/data
volumes:
  kafka-data:
```

Then recreate containers:

```bash
docker-compose up -d --force-recreate
```

## Testing Your Setup

1. Verify Kafka is running:
```bash
docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092
```
2. Test REST Proxy:

```bash
curl -X POST -H "Content-Type: application/vnd.kafka.v2+json" \
  --data '{"name": "test_consumer", "format": "json", "auto.offset.reset": "earliest"}' \
  http://localhost:8082/consumers/test_group
```
