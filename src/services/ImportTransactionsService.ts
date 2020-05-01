import { getRepository, getCustomRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const contactsReadStream = fs.createReadStream(filePath);

    const csvParsers = csvParse({
      from_line: 2,
    });

    const parseCSV = contactsReadStream.pipe(csvParsers);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      transactions.push({ title, type, value, category });
      categories.push(category);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentCategoriesTitle = existentCategories.map(
      ({ title }) => title,
    );

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitle.includes(category))
      .filter((category, index, self) => self.indexOf(category) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const allCategories = [...newCategories, ...existentCategories];

    const addTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        ...transaction,
        category: allCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(addTransactions);

    return addTransactions;
  }
}

export default ImportTransactionsService;
