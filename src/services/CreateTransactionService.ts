import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('Value unavailable');
    }

    let categoryValue = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryValue) {
      categoryValue = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(categoryValue);
    }

    const transaction = await transactionRepository.create({
      title,
      value,
      type,
      category: categoryValue,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
