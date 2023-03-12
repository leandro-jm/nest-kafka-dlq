import { Controller, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';

@Controller()
export class AppController {
  constructor(configService: ConfigService) {
    const kafka = new Kafka({
      clientId: configService.get<string>('KAFKA_CLIENT_ID'),
      brokers: [configService.get<string>('KAFKA_BROKER')],
    });

    const consumer = kafka.consumer({
      groupId: configService.get<string>('KAFKA_CONSUMER_GROUP_ID'),
    });

    const deadLetterProducer = kafka.producer();

    const handleConsume = async ({ topic, partition, message }) => {
      try {
        console.log('Received message: ' + message?.value?.toString());
        // process the message here
        throw new NotImplementedException('Simulation of error!');
      } catch (error) {
        console.error(
          `Error processing message ${message.value.toString()}: ${
            error.message
          }`,
        );

        const deadLetterTopic = configService.get<string>(
          'KAFKA_TOPIC_DEAD_LETTER',
        );
        const deadLetterMessage = {
          value: message.value,
          headers: {
            'origin-topic': topic,
            'origin-partition': partition.toString(),
            'origin-offset': message.offset.toString(),
            'origin-error': error.message.toString(),
          },
        };

        await deadLetterProducer.connect();

        await deadLetterProducer.send({
          topic: deadLetterTopic,
          messages: [deadLetterMessage],
        });

        console.log(`Sent message to dead letter queue ${deadLetterTopic}`);
      }
    };

    consumer.subscribe({
      topic: configService.get<string>('KAFKA_TOPIC'),
      fromBeginning: true,
    });

    consumer.run({
      eachMessage: handleConsume,
    });
  }
}
