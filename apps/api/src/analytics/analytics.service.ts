// ============================================================
// ANALYTICS SERVICE — Section 10: Analytics & Reporting
// ============================================================
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const [wallets, monthIncome, monthExpense, recentTransactions, budgets] =
      await Promise.all([
        this.prisma.wallet.findMany({ where: { userId, isArchived: false } }),
        this.prisma.transaction.aggregate({
          where: {
            userId,
            type: 'INCOME',
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: {
            userId,
            type: 'EXPENSE',
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        }),
        this.prisma.transaction.findMany({
          where: { userId },
          include: { category: true, fromWallet: true, toWallet: true },
          orderBy: { date: 'desc' },
          take: 10,
        }),
        this.prisma.budget.findMany({
          where: {
            userId,
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now },
          },
          include: { category: true },
        }),
      ]);

    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const totalIncome = Number(monthIncome._sum.amount || 0);
    const totalExpense = Number(monthExpense._sum.amount || 0);

    return {
      overview: {
        totalBalance,
        monthIncome: totalIncome,
        monthExpense: totalExpense,
        monthSavings: totalIncome - totalExpense,
      },
      wallets,
      recentTransactions,
      budgets: budgets.map((b) => ({
        ...b,
        percentage:
          Number(b.amount) > 0
            ? Math.round((Number(b.spent) / Number(b.amount)) * 100)
            : 0,
      })),
    };
  }

  async getCashflowChart(userId: string, year: number) {
    const months = Array.from({ length: 12 }, (_, i) => i);
    const data = await Promise.all(
      months.map(async (month) => {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);
        const [income, expense] = await Promise.all([
          this.prisma.transaction.aggregate({
            where: {
              userId,
              type: 'INCOME',
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
          }),
          this.prisma.transaction.aggregate({
            where: {
              userId,
              type: 'EXPENSE',
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
          }),
        ]);
        const labels = [
          'T1',
          'T2',
          'T3',
          'T4',
          'T5',
          'T6',
          'T7',
          'T8',
          'T9',
          'T10',
          'T11',
          'T12',
        ];
        return {
          month: labels[month],
          income: Number(income._sum.amount || 0),
          expense: Number(expense._sum.amount || 0),
          savings:
            Number(income._sum.amount || 0) - Number(expense._sum.amount || 0),
        };
      }),
    );
    return data;
  }

  async getCategoryBreakdown(
    userId: string,
    type: 'INCOME' | 'EXPENSE',
    startDate: string,
    endDate: string,
  ) {
    const transactions = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type,
        date: { gte: new Date(startDate), lte: new Date(endDate) },
        categoryId: { not: null },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    const categories = await this.prisma.category.findMany({
      where: {
        id: { in: transactions.map((t) => t.categoryId!).filter(Boolean) },
      },
    });

    const total = transactions.reduce(
      (sum, t) => sum + Number(t._sum.amount || 0),
      0,
    );

    return transactions.map((t) => {
      const category = categories.find((c) => c.id === t.categoryId);
      const amount = Number(t._sum.amount || 0);
      return {
        categoryId: t.categoryId,
        categoryName: category?.name || 'Khác',
        color: category?.color || '#94a3b8',
        icon: category?.icon || 'circle',
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      };
    });
  }

  async getNetWorthTimeline(userId: string) {
    // Simplified: current wallets balance as net worth
    const wallets = await this.prisma.wallet.findMany({
      where: { userId, isArchived: false },
      select: { name: true, balance: true, type: true, color: true },
    });
    const netWorth = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    return { wallets, netWorth };
  }
}
