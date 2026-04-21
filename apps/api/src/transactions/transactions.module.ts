import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [TransactionsController, PaymentController],
  providers: [TransactionsService, PaymentService],
  exports: [TransactionsService, PaymentService],
})
export class TransactionsModule {}
