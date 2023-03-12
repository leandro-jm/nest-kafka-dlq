import { Controller, NotImplementedException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Kafka } from 'kafkajs';

@Controller()
export class AppController {
  constructor() {
    const kafka = new Kafka({
      clientId: 'nest-kafka-app',
      brokers: ['localhost:9092'],
    });

    const consumer = kafka.consumer({ groupId: 'nest-kafka-app-group' });

    const deadLetterProducer = kafka.producer();

    const handleConsume = async ({ topic, partition, message }) => {
      try {
        console.log('Received message: ' + message?.value?.toString());
        // process the message here
        //throw new NotImplementedException('Teste');
      } catch (error) {
        console.error(
          `Error processing message ${message.value.toString()}: ${
            error.message
          }`,
        );

        const deadLetterTopic = 'nest-kafka-app.dead-letter';
        const deadLetterMessage = {
          value: message.value,
          headers: {
            'x-origin-topic': topic,
            'x-origin-partition': partition.toString(),
            'x-origin-offset': message.offset.toString(),
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

    consumer.subscribe({ topic: 'nest-kafka-app', fromBeginning: true });

    consumer.run({
      eachMessage: handleConsume,
    });
  }

  @MessagePattern('nest-kafka-app')
  async processMessage(@Payload() message) {
    console.log('Received message', message.value);
    // process the message here
  }
}
