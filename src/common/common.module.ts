import { Global, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from './common.constants';

// * 여기에 newPubsub() 한 후 providers의 useValue로 갖다써도 된다.
// * ====> const pubsub = new PubSub();

/**
 * ! CommonModule: 기본적으로 공유되는 모든 것을 적용할 Module
 * * PUB_SUB은 전체 어플리케이션에서 1개여야 하기 때문에 Common에서 만들고, Common Module을 Global로 지정해 어디서든 접근할 수 있도록 한다.
 */
@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB, // * ==> 다른 클래스에서 사용하고 싶은 경우 @Inject()를 통해 주입
      useValue: new PubSub(), // * 외부에서 선언 후 끌어와도 된다. pubsub
    },
  ],
  exports: [PUB_SUB],
})
export class CommonModule {}
