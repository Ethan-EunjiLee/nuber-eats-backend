import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';

import { Restaurant } from './entities/restaurant.entity';
import { User } from '../users/entities/user.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Category } from './entities/category.entity';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import { Dish } from './entities/dish.entity';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';

@Injectable()
export class RestaurantService {
  constructor(
    // * forFeature에서 다 해주고 왓기 때문에 아래 내용도 필요 없다.
    // @InjectRepository(Category)
    private readonly categories: CategoryRepository,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
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

      // * 따로 method 빼서 카테고리 셋팅 기능 구현
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );
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

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      // * [1] 입력한 레스토랑 아이디와 일치하는 레스토랑 정보 찾기
      // * FindOneOrFail: 찾기 실패하면 exception throw
      // * loadRelationIds: 전체 객체를 가져오는게 아니라 relation 관계에 있는 데이텁데이스의 id값만을 싹 가져온다.
      // * loadRelationIds로 가져왔기 때문에 owner에는 id값만 들어있다 => 그런데 Entity선언할 때, User타입으로 선언해줘서 에러 발생
      // * ===> 그래서 loadRelationIds를 쓰기 보다는 Restaurant Entity 내부에 @RelationId 데코레이터를 이용해 id값만 받아오는 변수를 만든다.
      const restaurant = await this.restaurants.findOne(
        editRestaurantInput.restaurantId,
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      // * [2] 찾은 레스토랑의 주인이 현재 로그인한 사람과 일치하는지 확인
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'You can not edit a restaurant that you do not own',
        };
      }
      // * [3] 모든게 다 일치할 경우, 레스토랑 정보 수정
      // * => 3-1: 카테고리 정보 수정
      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }

      /**
       * * 테스트용 fakeCategory
       const fakeCategory = this.categories.create();
       fakeCategory.name = 'fake4';
       fakeCategory.coverImage = 'fake4';
       fakeCategory.slug = 'fake4';
       const fakeCategoryResult = await this.categories.save(fakeCategory);
       */

      // * id를 콕집어서 보내지 않는 경우 update가 아니라 insert가 실행된다.
      const result2 = await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput, // * editRestaurantInput에 들어있는 객체 통으로 넣어주세요~
          ...(category && { category }), // * category가 존재하면 Category가 category인 object를 리턴 // * category가 존재하면 Category가 category인 object를 리턴
          // * ...((category && { category }) || { category: fakeCategoryResult }),  category가 존재하면 Category가 category인 object를 리턴, 없으면 fake리턴 // * category가 존재하면 Category가 category인 object를 리턴
        },
      ]);
      console.log('result2: ', result2);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not edit restaurant',
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      // * [1] 입력한 레스토랑 아이디와 일치하는 레스토랑 정보 찾기
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      // * [2] 찾은 레스토랑의 주인이 현재 로그인한 사람과 일치하는지 확인
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'You can not delete a restaurant that you do not own',
        };
      }

      // * [3] 레스토랑 삭제
      console.log('delete restaurant');
      // await this.restaurants.delete(restaurantId);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not delete',
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load categories',
      };
    }
  }

  // * 해당 카테고리에 해당하는 restaurant 개수 세기
  countRestaurants(category: Category) {
    return this.restaurants.count({ category });
  }

  // * 카테고리 일치하는 restaurant 출력
  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      // * 일치하는 slug이 있는 category 찾기
      const category = await this.categories.findOne(
        { slug },
        // * 아래처럼 받아오면, 300개, 400개,1000개 가리지 않고 한번에 받아와서
        // * DB에 무리가 온다.
        // * => restaurant에서 paginagtion을 구현해 가져와야 한다.
        // {
        //   relations: ['restaurants'], // * Category entity에 적힌대로 명시
        // },
      );
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }
      const restaurants = await this.restaurants.find({
        where: { category },
        take: 25, // * 한번에 보여줄 개수
        skip: (page - 1) * 25, // * 이전 페이지는 스킵(안보여줘도 된다),
      });
      // category.restaurants = restaurants;
      const totalResults = await this.countRestaurants(category);
      return {
        ok: true,
        category,
        totalPages: Math.ceil(totalResults / 25),
        restaurants,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load category',
      };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      // * findAndCount: 조건에 맞는 객체들, 조건에 상관없이 전체 개수 리턴
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        skip: (page - 1) * 25,
        take: 25,
        relations: ['category', 'owner'], // * relation은 가져오고 싶으면 꼭, find할 때 지정을 해줘야한다. => 내부 객체의 relation을 끌어올 경우도 똑같이 입력해서 처리 가능
      });
      console.log('totalResults: ', totalResults);
      return {
        ok: true,
        totalPages: Math.ceil(totalResults / 25),
        results: restaurants,
        totalResults,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load restaurants',
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, {
        relations: ['menu', 'category'], // * relations를 이용해 관계가 있는 테이블을 불러올 때는 불러와질 테이블말고 부르는 테이블에 적용된 변수명으로 부른다.
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      return {
        ok: true,
        restaurant,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }

  // TODO: pagination을 위한 repository 만들기
  // * Search Restaurant
  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      // * findAndCount(): 배열 형태로 조건에 대한 검색값, 조건과 상관없는 전체 검색값이 순서대로 출력된다.
      // * 각각의 값을 restaurants, totalResults에 넣어주었다.
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        // * where: { name: ILike(`%${query}%`) }, // * query가 들어간 모든 값을 가져온다.
        where: {
          name: Raw((name) => `${name} ILike '%${query}%'`), // * Raw() raw query 실행하게 해준다.
        },
        skip: (page - 1) * 25,
        take: 25,
        relations: ['category', 'owner'], // * relation은 가져오고 싶으면 꼭, find할 때 지정을 해줘야한다. => 내부 객체의 relation을 끌어올 경우도 똑같이 입력해서 처리 가능
      });
      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not search for restaurants',
      };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      // * [1] Dish 생성할 Restaurant 존재 여부 체크
      const restaurant = await this.restaurants.findOne(
        createDishInput.restaurantId,
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      // * [2] owner id와 restaurant의 owner id 체크
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'you cannot do that',
        };
      }
      const dish = await this.dishes.save(
        // * Dish에 설정해둔 ManyToOne은 nullable: true가 기본! 그래서 없어도 에러가 발생하지 않았다.
        // * restaurant값에 맞춰서 restaurantId도 typeorm이 알아서 넣어준다.
        this.dishes.create({ ...createDishInput, restaurant }),
        // this.dishes.create({ ...createDishInput, restaurant }),
      );
      console.log('dish:::: ', dish);
      return {
        ok: true,
      };
    } catch (error) {
      console.log('error: ', error);
      return {
        ok: false,
        error: 'Could not create dish',
      };
    }
  }

  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      // * [1] dishID값이 일치하는 dish 찾기
      const dish = await this.dishes.findOne(editDishInput.dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }
      // * [2] owner 일치 여부 확인
      if (owner.id !== dish.restaurant.ownerId) {
        return {
          ok: false,
          error: 'you cannot do that',
        };
      }
      // * [3] dish 수정
      await this.dishes.save({
        id: editDishInput.dishId,
        ...editDishInput, // * editDishInput에 있는 모든 정보가 업데이트 된다. 없는 값은 알아서 스킵된다.
      });
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not edit dish',
      };
    }
  }
  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      // * [1] dishID값이 일치하는 dish 찾기
      const dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }
      // * [2] owner 일치 여부 확인
      if (owner.id !== dish.restaurant.ownerId) {
        return {
          ok: false,
          error: 'you cannot do that',
        };
      }
      // * [3] dish 삭제
      await this.dishes.delete(dishId);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not delete dish',
      };
    }
  }
}
