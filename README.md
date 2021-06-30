# Nuber Eats

The Backend of Nuber Eats Clone

## User Entity:

- id
- createdAt
- updatedAt

- email
- password
- role(client|owner|delivery)

## Restaruatnt Model
- name
- category(foreing key)
- address
- coverImage

# Plan
- Delete Restaurant(Owner)
- Edit Restaurant(Owner)
  
- Search restaurants

- See Categories
- See Restaurants by Category (pagination)
- See Restaurants (pagination)
- See Restaurant
  
- Create Dish
- Edit Dish
- Delete Dish

- Orders Crud
- Orders Subscription(Owner, customer, Delivery)

- payment(Cron, Paddle)

### 필요한 Subscription
1. Orders Subscription
    - (Pending Orders) restaurant owner: dashboard에서 새로 들어오는 order를 봐야한다.
        ==> listener(subscription): newOrder
        ==> trigger: createOrder(newOrder)
        ==> ... customer가 order를 만들 때, createOrder라는 resolver를 사용. 이 때 newOrder라는 이벤트를 trigger한다.
                이 때 restauranat owner는 newOrder를 lisening하고 있다가 newOrder가 발생하면 새로 발생한 주문을 listen한다.
      
    - (Order Status) client: order를 만들면 화면에서 order status를 봐야한다.
        ==> subscription: orderUpdate
        ==> trigger: editOrder ... editOrder가 order status를 update 할 때 마다 orderUpdate를 trigger
        ==> ... customer의 order가 owner에 의해 승인되면, 화면에서 order status를 보여준다.
                order가 cooking중인걸 보게 된다.
                owner가 cooked 되었다고 state를 update하면 OrderUdpate event가 발생한다.
                owner와 customer 모두 이 OrderUpdate event를 listening 하고 있다가 이걸 캐치한다.
    - (Pending Pickup Order) delivery: order가 cooked되면 delivery에게 픽업할 order가 있다고 알람을 줘야한다.
        ==> subscription: orderUpdate
        ==> trigger: editOrder
        ==> ... 주문한 요리의 status가 cooked 되고나면 cooked에 listening하고 있던 delivery가 이 이벤트를 listen한다.
                그러면 이 때, order에 driver가 등록되고 owner, customer, driver모두 order status를 보는게 된다.