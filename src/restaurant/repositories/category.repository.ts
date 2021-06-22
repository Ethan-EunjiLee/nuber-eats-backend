import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreate(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');
    // * 카테고리 처리 방법: 일치하는 카테고리를 찾거나, 없으면 카테고리를 만들거나
    let category = await this.findOne({ slug: categorySlug });
    if (!category) {
      category = await this.save(
        this.create({
          slug: categorySlug,
          name: categoryName,
        }),
      );
    }
    return category;
  }
}
