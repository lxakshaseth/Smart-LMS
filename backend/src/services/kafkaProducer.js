const { kafka } = require('../config/kafka');

let producer = null;
let isConnected = false;

const isKafkaEnabled = () => process.env.ENABLE_KAFKA === 'true';

const getProducer = async () => {
  if (!isKafkaEnabled()) return null;
  if (!producer) {
    producer = kafka.producer();
  }
  if (!isConnected) {
    try {
      await producer.connect();
      isConnected = true;
      console.log('✅ Kafka Producer connected');
    } catch (error) {
      console.warn('⚠️ Kafka Producer connection failed:', error.message);
      isConnected = false;
      return null;
    }
  }
  return producer;
};

const sendEvent = async (topic, key, value) => {
  if (!isKafkaEnabled()) {
    console.log(`[Kafka Mock Producer] Topic: ${topic} | Key: ${key} | Data:`, value);
    return true;
  }

  const activeProducer = await getProducer();
  if (!activeProducer) {
    console.warn(`[Kafka Producer Offline] Skipping event publish for topic: ${topic}`);
    return false;
  }

  try {
    await activeProducer.send({
      topic,
      messages: [
        {
          key: key ? String(key) : null,
          value: typeof value === 'string' ? value : JSON.stringify(value),
          timestamp: Date.now().toString(),
        },
      ],
    });
    return true;
  } catch (error) {
    console.error(`❌ Kafka produce error [${topic}]:`, error.message);
    return false;
  }
};

const disconnectProducer = async () => {
  if (producer && isConnected) {
    await producer.disconnect();
    isConnected = false;
    console.log('🔌 Kafka Producer disconnected');
  }
};

module.exports = { sendEvent, getProducer, disconnectProducer };
