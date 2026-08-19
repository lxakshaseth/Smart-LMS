const amqp = require('amqp-connection-manager');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const isRabbitMQEnabled = () => process.env.ENABLE_RABBITMQ === 'true';

let connection = null;

if (isRabbitMQEnabled()) {
  connection = amqp.connect([RABBITMQ_URL]);

  connection.on('connect', () => console.log('✅ RabbitMQ Connected successfully'));
  connection.on('disconnect', (params) =>
    console.warn('⚠️ RabbitMQ Disconnected:', params.err ? params.err.message : 'Unknown error')
  );
}

module.exports = { connection, isRabbitMQEnabled };
