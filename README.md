# Event-Driven Preact Demo (EDA-Preact-Demo)

## ⚠️ Important System Requirements

**This frontend requires a compatible backend service to be running.** The demo won't function properly without:

1. **Kafka Backend Service** (Go)

   - Must be connected to the same Kafka broker
   - Backend repository: [Kafka Backend Service](https://github.com/Gaoux/eda-go-backend)

2. **Kafka Infrastructure** (In the backend)
   - Kafka Broker and REST Proxy are started as part of the backend's Docker Compose setup.

## Quick Start (Development)

1. **Start Kafka and Backend**:

   - Navigate to the backend directory and start the backend service:

     ```bash
     cd ../eda-go-kafka
     docker-compose up -d
     ```

   - Ensure the backend is running and connected to Kafka.

2. **Start Frontend**:

   - Navigate to the frontend directory and start the frontend service:

     ```bash
     cd ../eda-preact-demo
     docker-compose up -d
     ```

3. **Access the application**:

   Open `http://localhost:3000` in your browser.

## Backend Integration Checklist

Your backend must:

1. Connect to the same Kafka broker (localhost:9092)
2. Produce/consume from the topic:

   - `events-topic`

## Production Notes

This setup is for development only.

## Troubleshooting

If events aren't processing:

1. Verify backend is running.

2. Check Kafka topics exist:

   ```bash
   docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092
   ```

3. Inspect REST Proxy logs:

   ```bash
   docker-compose logs kafka-rest
   ```
