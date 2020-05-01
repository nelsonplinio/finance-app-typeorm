import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export default class AddCategoryIdToTransactions1588286263961
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'category_id',
        type: 'uuid',
      }),
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        name: 'category_id_fk',
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('transactions', 'category_id_fk');

    await queryRunner.dropColumn('transactions', 'category_id');
  }
}
