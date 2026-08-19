const { connection, isRabbitMQEnabled } = require('../config/rabbitmq');

const startRabbitWorkers = () => {
  if (!isRabbitMQEnabled() || !connection) {
    console.log('ℹ️ RabbitMQ is disabled (ENABLE_RABBITMQ!=true). Workers skipped.');
    return null;
  }

  const channelWrapper = connection.createChannel({
    json: true,
    setup: (channel) => {
      return Promise.all([
        channel.assertQueue('ai-tasks-queue', { durable: true }),
        channel.assertQueue('email-notifications-queue', { durable: true }),
        channel.prefetch(1),
        channel.consume('ai-tasks-queue', async (msg) => {
          if (!msg) return;
          try {
            const task = JSON.parse(msg.content.toString());
            console.log('👷 RabbitMQ Worker processing AI Task:', task);
            channel.ack(msg);
          } catch (error) {
            console.error('❌ RabbitMQ AI Worker Error:', error);
            channel.nack(msg, false, false);
          }
        }),
        channel.consume('email-notifications-queue', async (msg) => {
          if (!msg) return;
          try {
            const payload = JSON.parse(msg.content.toString());
            console.log('📧 RabbitMQ Worker processing Email Notification:', payload);
            channel.ack(msg);
          } catch (error) {
            console.error('❌ RabbitMQ Email Worker Error:', error);
            channel.nack(msg, false, false);
          }
        }),
      ]);
    },
  });

  return channelWrapper;
};

module.exports = { startRabbitWorkers };
