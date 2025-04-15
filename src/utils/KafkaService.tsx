interface KafkaEvent {
  [key: string]: any;
  type: string;
  payload?: any;
  timestamp?: string;
}

interface ConsumerInstance {
  instance_id: string;
  base_uri: string;
}

interface KafkaMessage {
  topic: string;
  key: string | null;
  value: KafkaEvent;
  partition: number;
  offset: number;
}

const KAFKA_REST_URL: string = 'http://localhost:8082';

export const produceEvent = async (
  topic: string,
  event: KafkaEvent
): Promise<any> => {
  try {
    const response = await fetch(`${KAFKA_REST_URL}/topics/${topic}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.kafka.json.v2+json',
      },
      body: JSON.stringify({
        records: [
          {
            value: event,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Kafka produce error:', error);
    throw error;
  }
};

export const createConsumer = async (
  groupId: string
): Promise<ConsumerInstance> => {
  try {
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
  } catch (error) {
    console.error('Consumer creation error:', error);
    throw error;
  }
};

export const subscribeConsumer = async (
  groupId: string,
  consumerInstance: string,
  topics: string[]
): Promise<void> => {
  try {
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
  } catch (error) {
    console.error('Consumer subscription error:', error);
    throw error;
  }
};

export const consumeEvents = async (
  groupId: string,
  consumerInstance: string
): Promise<KafkaMessage[]> => {
  try {
    const response = await fetch(
      `${KAFKA_REST_URL}/consumers/${groupId}/instances/${consumerInstance}/records`,
      { headers: { Accept: 'application/vnd.kafka.json.v2+json' } }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Consumer instance not found or timeout occurred');
      }
      throw new Error(`Consumption failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Event consumption error:', error);
    throw error;
  }
};

// Optional: Add a cleanup function
export const deleteConsumer = async (
  groupId: string,
  consumerInstance: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${KAFKA_REST_URL}/consumers/${groupId}/instances/${consumerInstance}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      throw new Error(`Consumer deletion failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Consumer deletion error:', error);
    throw error;
  }
};
