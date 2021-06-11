import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable() // * 이 데코레이터가 있어야 dependecny injection 가능
//* 만약, 클래스만의 기능을 안쓴다면 function으로 만들어줘도 무방
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    console.log('here is jwtMiddleware');
    // * Request, Resoponse 객체에 접근하여 원하는대로 처리
    //console.log('JwtMiddleware req.header: ', req.headers);
    // * headers에 x-jwt값이 있는 경우
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      console.log('Here is jwtMiddleware. 토큰은 있어요');
      try {
        const decoded = this.jwtService.verify(token.toString());
        // * typescript는 headers의 모든 값이 array가 될 수 있다고 보기 때문에, 여기서 token을 string으로 주기 위해서는 따로 변형 필요

        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          // * 자바스크립트의 객체에서 키값을 이용해 값을 부르는 방법: 객체['키값'] => console.log(decoded['id']);

          const user = await this.userService.findById(decoded['id']);
          console.log('jwtMiddleware user: ', user);
          req['user'] = user; // * 새로 찾은 user 객체를 Request로 보내기
        } else {
          console.log('Here is jwtMiddleware. your token is bad');
        }
      } catch (error) {
        console.log('here is jwtMiddleware... 에러를 잡았다');
      }
    }
    // * 마지막에는 반드시 next() 함수 호출 필수
    next();
  }
}

// ! 함수로 Middleware 구현
// export function JwtMiddleware(req: Request, res: Response, next: NextFunction) {
//   console.log('jwtMiddleware');
//   next();
// }
