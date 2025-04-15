# Event-Driven Preact Demo (EDA-Preact-Demo)

## ⚠️ Important System Requirements

**This frontend requires a compatible backend service to be running.** The demo won't function properly without:

1. **Kafka Backend Service** (Go/Node.js/Java)

   - Must be connected to the same Kafka broker
   - Must implement the expected event schemas:

     ```typescript
     interface UserEvent {
       type: 'USER_CREATED' | 'USER_UPDATED';
       user: { id: string; name: string };
     }

     interface PropertyEvent {
       type: 'PROPERTY_ADDED' | 'PROPERTY_REMOVED';
       property: { id: string; name: string; price: number };
     }
     ```

2. **Kafka Infrastructure** (included in `/kafka-infra`)
   - Requires Docker
   - Starts Kafka + REST Proxy

## Quick Start (Development)

1. **Start Kafka** (in separate terminal):

   ```bash
   cd kafka-infra
   docker-compose up -d
   ```

   _For more Kafka configuration details, see the [Kafka README](./kafka-infra/README.md)_

2. **Run Backend Service**:  
   See your backend [repository](https://github.com/gaoux/) README for instructions

3. **Run Frontend**:

   ```bash
    npm install
    npm run dev
   ```

4. **Access the application**:  
   Open `http://localhost:5173` in your browser

## Backend Integration Checklist

Your backend must:

1. Connect to the same Kafka broker (localhost:9092)
2. Produce/consume from these topics:

   - `user-events`
   - `property-events`

## Production Notes

This setup is for development only.

## Troubleshooting

If events aren't processing:

1. Verify backend is running

2. Check Kafka topics exist:

   ```bash
   docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092
   ```

3. Inspect REST Proxy logs:

   ```bash
   docker-compose logs kafka-rest
   ```
