const { kafka } = require('../config/kafka');

let consumer = null;

const isKafkaEnabled = () => process.env.ENABLE_KAFKA === 'true';

const startConsumer = async () => {
  if (!isKafkaEnabled()) {
    console.log('ℹ️ Kafka is disabled (ENABLE_KAFKA!=true). Consumer skipped.');
    return null;
  }

  try {
    consumer = kafka.consumer({
      groupId: process.env.KAFKA_GROUP_ID || 'smart-lms-group',
    });

    await consumer.connect();
    console.log('✅ Kafka Consumer connected');

    // Subscribe to LMS event topics
    await consumer.subscribe({ topic: 'user-activity', fromBeginning: false });
    await consumer.subscribe({ topic: 'ai-tasks', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const rawValue = message.value ? message.value.toString() : '{}';
          const payload = JSON.parse(rawValue);
          const key = message.key ? message.key.toString() : null;

          console.log(`📩 Kafka event received [Topic: ${topic}] [Key: ${key}]:`, payload);

          // Route to appropriate task handlers
          switch (topic) {
            case 'ai-tasks':
              console.log('🤖 Processing AI background task event:', payload.action);
              break;
            case 'user-activity':
              console.log('📊 Processing user activity event:', payload.eventType);
              break;
            default:
              console.log(`Unhandled topic: ${topic}`);
          }
        } catch (err) {
          console.error('Error processing Kafka message:', err);
        }
      },
    });

    return consumer;
  } catch (error) {
    console.warn('⚠️ Kafka Consumer connection error:', error.message);
    return null;
  }
};

const stopConsumer = async () => {
  if (consumer) {
    await consumer.disconnect();
    console.log('🔌 Kafka Consumer disconnected');
  }
};

module.exports = { startConsumer, stopConsumer };
