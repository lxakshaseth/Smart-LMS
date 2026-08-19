const { Kafka, logLevel } = require('kafkajs');

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

const kafkaConfig = {
  clientId: process.env.KAFKA_CLIENT_ID || 'smart-lms-backend',
  brokers,
  logLevel: process.env.NODE_ENV === 'production' ? logLevel.ERROR : logLevel.INFO,
  retry: {
    initialRetryTime: 300,
    retries: 5,
  },
};

// If cloud Kafka authentication is supplied (e.g. Upstash / Confluent)
if (process.env.KAFKA_USERNAME && process.env.KAFKA_PASSWORD) {
  kafkaConfig.ssl = true;
  kafkaConfig.sasl = {
    mechanism: process.env.KAFKA_SASL_MECHANISM || 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  };
}

const kafka = new Kafka(kafkaConfig);

module.exports = { kafka };
