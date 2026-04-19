// ============================================================
// FinWallet — Root Application Module
// ============================================================
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { GoalsModule } from './goals/goals.module';
import { BillSplitModule } from './bill-split/bill-split.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AiModule } from './ai/ai.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StorageModule } from './storage/storage.module';
import { RecurringModule } from './recurring/recurring.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Section 6 — Infrastructure: Config
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Section 5 — Security: Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
      },
    ]),

    // Section 8 — Recurring Jobs Scheduler
    ScheduleModule.forRoot(),

    // Section 4 — Database
    PrismaModule,

    // Section 5 — Auth
    AuthModule,

    // Core Modules (Section 9)
    UsersModule,
    WalletsModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    GoalsModule,
    BillSplitModule,
    RecurringModule,

    // Section 10 — Analytics & Reporting
    AnalyticsModule,

    // Section 11 — Notifications
    NotificationsModule,

    // Section 12 — AI Features
    AiModule,

    // Section 8 — Integrations: Storage
    StorageModule,

    // Section 5 — Security: Audit
    AuditModule,

    // Section 7 — DevOps: Health checks
    HealthModule,
  ],
})
export class AppModule {}
