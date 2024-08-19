# Take home assignment

## Description:

Build 2 Backend services which manages user’s accounts and transactions (send/withdraw).

In Account Manager service, we have:

- User: Login with Id/Password
- Payment Account: One user can have multiple accounts like credit, debit, loan...
- Payment History: Records of transactions

In Payment Manager service, we have:

- Transaction: Include basic information like amount, timestamp, toAddress, status...
- We have a core transaction process function, that will be executed by `/send` or `/withdraw` API:

```js
function processTransaction(transaction) {
  return new Promise((resolve, reject) => {
    console.log('Transaction processing started for:', transaction);

    // Simulate long running process
    setTimeout(() => {
      // After 30 seconds, we assume the transaction is processed successfully
      console.log('transaction processed for:', transaction);
      resolve(transaction);
    }, 30000); // 30 seconds
  });
}

// Example usage
let transaction = { amount: 100, currency: 'USD' }; // Sample transaction input
processTransaction(transaction)
  .then((processedTransaction) => {
    console.log('transaction processing completed for:', processedTransaction);
  })
  .catch((error) => {
    console.error('transaction processing failed:', error);
  });
```

Features:

- Users need to register/log in and then be able to call APIs.
- APIs for 2 operations send/withdraw. Account statements will be updated after the transaction is successful.
- APIs to retrieve all accounts and transactions per account of the user.
- Write Swagger docs for implemented APIs (Optional)
- Auto Debit/Recurring Payments: Users should be able to set up recurring payments. These payments will automatically be processed at specified intervals. (Optional)

### Tech-stack:

- Recommend using authentication 3rd party: Supertokens, Supabase...
- `NodeJs` for API server (`Fastify/Gin` framework is the best choices)
- `PostgreSQL/MongoDB` for Database. Recommend using `Prisma` for ORM.
- `Docker` for containerization. Recommend using `docker-compose` for running containers.

## Target:

- Good document/README to describe your implementation.
- Make sure app functionality works as expected. Run and test it well.
- Containerized and run the app using Docker.
- Using `docker-compose` or any automation script to run the app with single command is a plus.
- Job schedulers utilization is a plus

**be-assignment** is a lightweight backend application developed using NestJS, Prisma, and PostgreSQL.

## Clone

```sh
git clone https://github.com/dikiamust/be-assignment

cd be-assignment
```

## Environment Variables

You can see it in the .env.example file

```sh
cp .env.example .env
```

## Installation

```sh
yarn # or yarn install
```

## Database Migration

```sh
# Generate Prisma Client
 yarn db:generate

#  run migration
yarn db:migrate

```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod

# Docker Compose
$ docker compose up --build
```

## Api Doc.

Once the application is running, you can access the API documentation at http://localhost:3000/api-doc, which includes information on endpoint usage.
