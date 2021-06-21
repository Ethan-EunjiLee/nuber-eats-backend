import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Restaurant } from './entities/restaurant.entity';
import { User } from '../users/entities/user.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  // ! 레스토랑 생성
  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner; // * 로그인 정보에서 User 정보 가져오기
      /**
       * * [slug]
       * * [1]: 앞 뒤 공백 삭제: trim()
       * * [2]: 다 소문자로 변경: toLowerCase()
       * * [3]: 띄어쓰기를 -로 변경
       * *       => replace(/ /g, '-'):: 모든(플래그 g) 띄어쓰기(/ /)를 -로 변경
       */
      const categoryName = createRestaurantInput.categoryName
        .trim()
        .toLowerCase();
      const categorySlug = categoryName.replace(/ /g, '-');
      // * 카테고리 처리 방법: 일치하는 카테고리를 찾거나, 없으면 카테고리를 만들거나
      let category = await this.categories.findOne({ slug: categorySlug });
      if (!category) {
        category = await this.categories.save(
          this.categories.create({
            slug: categorySlug,
            name: categoryName,
          }),
        );
      }
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }
}
