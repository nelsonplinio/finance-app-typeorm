import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = transactions.reduce(
      (result, transaction) => {
        const value = Number(transaction.value);
        return {
          ...result,
          [transaction.type]: result[transaction.type] + value,
          total:
            transaction.type === 'income'
              ? result.total + value
              : result.total - value,
        };
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return balance;
  }
}

export default TransactionsRepository;
