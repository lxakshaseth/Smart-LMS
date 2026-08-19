const { connection, isRabbitMQEnabled } = require('../config/rabbitmq');

let channelWrapper = null;

const getChannelWrapper = () => {
  if (!isRabbitMQEnabled() || !connection) return null;
  if (!channelWrapper) {
    channelWrapper = connection.createChannel({
      json: true,
      setup: (channel) => {
        return Promise.all([
          channel.assertQueue('ai-tasks-queue', { durable: true }),
          channel.assertQueue('email-notifications-queue', { durable: true }),
        ]);
      },
    });
  }
  return channelWrapper;
};

const publishToQueue = async (queueName, messageData) => {
  if (!isRabbitMQEnabled()) {
    console.log(`[RabbitMQ Mock Publish] Queue: ${queueName} | Data:`, messageData);
    return true;
  }

  const wrapper = getChannelWrapper();
  if (!wrapper) {
    console.warn(`[RabbitMQ Offline] Skipping publish to queue: ${queueName}`);
    return false;
  }

  try {
    await wrapper.sendToQueue(queueName, messageData, {
      persistent: true,
    });
    console.log(`📤 Task published to RabbitMQ [${queueName}]`);
    return true;
  } catch (err) {
    console.error(`❌ RabbitMQ publish error [${queueName}]:`, err.message);
    return false;
  }
};

module.exports = { publishToQueue };
