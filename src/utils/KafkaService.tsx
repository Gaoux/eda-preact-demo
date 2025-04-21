const KAFKA_REST_URL: string = 'http://localhost:8082'; // Kafka REST Proxy URL

interface KafkaEvent {
  eventType: string;
  payload?: any;
}

interface ConsumerInstance {
  instance_id: string;
  base_uri: string;
}

// Produce an event to a Kafka topic
export const produceEvent = async (
  topic: string,
  event: KafkaEvent
): Promise<void> => {
  const response = await fetch(`${KAFKA_REST_URL}/topics/${topic}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.kafka.json.v2+json',
    },
    body: JSON.stringify({
      records: [{ value: event }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to produce event to Kafka: ${response.statusText}`);
  }
};

// Create a Kafka consumer
export const createConsumer = async (
  groupId: string
): Promise<ConsumerInstance> => {
  const response = await fetch(`${KAFKA_REST_URL}/consumers/${groupId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/vnd.kafka.v2+json' },
    body: JSON.stringify({
      name: 'preact-consumer',
      format: 'json',
      'auto.offset.reset': 'earliest',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create consumer: ${response.statusText}`);
  }

  return await response.json();
};

// Subscribe a consumer to Kafka topics
export const subscribeConsumer = async (
  groupId: string,
  consumerInstance: string,
  topics: string[]
): Promise<void> => {
  const response = await fetch(
    `${KAFKA_REST_URL}/consumers/${groupId}/instances/${consumerInstance}/subscription`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/vnd.kafka.v2+json' },
      body: JSON.stringify({ topics }),
    }
  );

  if (!response.ok) {
    throw new Error(`Subscription failed: ${response.statusText}`);
  }
};

// Consume events from Kafka
export const consumeEvents = async (
  groupId: string,
  consumerInstance: string
): Promise<KafkaEvent[]> => {
  const response = await fetch(
    `${KAFKA_REST_URL}/consumers/${groupId}/instances/${consumerInstance}/records`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.kafka.json.v2+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to consume events: ${response.statusText}`);
  }

  const messages = await response.json();
  return messages.map((msg: any) => msg.value);
};

// Delete a Kafka consumer
export const deleteConsumer = async (
  groupId: string,
  consumerInstance: string
): Promise<void> => {
  const response = await fetch(
    `${KAFKA_REST_URL}/consumers/${groupId}/instances/${consumerInstance}`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete consumer: ${response.statusText}`);
  }
};
