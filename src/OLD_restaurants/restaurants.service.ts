import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OldCreateRestaurantDto } from './dtos/create-restaurant.dto';
import { OldUpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { OldRestaurant } from './entities/restaurant.entity';

@Injectable()
export class OldRestaurantService {
  constructor(
    // * Repository 주입 - Restaurant Module에서 TypeOrmModule.forFeature()에서 정의된 Repository
    // * Entity 이름 필수 입력 필요
    @InjectRepository(OldRestaurant)
    private readonly restaurants: Repository<OldRestaurant>,
  ) {}
  // ! 전체 가져오기
  getAll(): Promise<OldRestaurant[]> {
    // * Repository의 find()는 비동기라 Promise 리턴
    return this.restaurants.find();
  }
  // ! 레스토랑 생성
  createRestaurant(
    createRestaurntDto: OldCreateRestaurantDto,
  ): Promise<OldRestaurant> {
    /**
     * * const newRestaurant = new Restaurant();
     * * newRestaurant.name = createRestaurntDto.name;
     * * ...
     *
     * * 위의 방식은 하나하나 다 입력해야해서 귀찮다.
     * * 이 과정을 간결하게 만들어주는게 Repository의 create 메소드
     * * [사용방법]
     * * create를 이용해 db에 저장할 인스턴스를 생성
     * * -> 만들어진 인스턴스를 save를 이용해 db에 저장
     */

    const newRestarunt = this.restaurants.create(createRestaurntDto);
    return this.restaurants.save(newRestarunt);
  }

  // ! 레스토랑 업데이트
  // * { id, data }: 넘어온 updateRestaurantDto에서 id, data 값을 각각 바로 변수로 가져온다.
  updateRestaurant({ id, data }: OldUpdateRestaurantDto) {
    // * { ...data }: data의 각각 변수들을 가져온다.
    return this.restaurants.update(id, { ...data });
    /**
     * * Repository.update(): entity 존재 여부 확인하지 않고 바로 udpate query문 실행
     * * => 존재하지 않는 id를 넣어도 에러가 발생하지 않는다.
     */
  }
}
