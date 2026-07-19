# Changelog

## 1.0.0 (2026-07-19)


### Features

* add copy client link button to meeting types page ([b2da68d](https://github.com/artarn-v1/ai-for-developers-project-387/commit/b2da68d900db1aaa09c2ab508c0856a16fe79830))
* add Docker support with docker-compose (postgres 12, Go backend, React frontend) ([fc1c708](https://github.com/artarn-v1/ai-for-developers-project-387/commit/fc1c70884a6d5b19dd3fd9aa7f21375568aa1db8))
* add docker-recreate-db make target ([b4c32b8](https://github.com/artarn-v1/ai-for-developers-project-387/commit/b4c32b8aada5b348a9723f6102dc1936c75ff603))
* add ESLint to tests directory ([8a7f73b](https://github.com/artarn-v1/ai-for-developers-project-387/commit/8a7f73ba5706e38bb131fa8babb7bd89d38eae47))
* add Go backend with PostgreSQL and API from TypeSpec spec ([949a58e](https://github.com/artarn-v1/ai-for-developers-project-387/commit/949a58e70b05c2bcb7711337edd34e9541dd80b1))
* add meetings filter by meeting type ([f593240](https://github.com/artarn-v1/ai-for-developers-project-387/commit/f5932408ed13d989e618887ea5d99fa747059149))
* add owners list page with GET /owners endpoint ([7d888ea](https://github.com/artarn-v1/ai-for-developers-project-387/commit/7d888ea0c6fc03a0b7a55fbcf922b3615fdaf21e))
* add Playwright integration tests ([3b06906](https://github.com/artarn-v1/ai-for-developers-project-387/commit/3b0690600ac49ce7369e373ded1da6a3970594aa))
* add TypeSpec Meeting Booking API with admin and client endpoints ([56240ea](https://github.com/artarn-v1/ai-for-developers-project-387/commit/56240ea712a1e59173395252827b2fe32d74e6d7))
* **admin:** add confirm/decline actions to meeting modal, unify filter design ([13e1259](https://github.com/artarn-v1/ai-for-developers-project-387/commit/13e1259f4a11573a68222985c641c4649f9f5be7))
* **api:** add isConfirmed filter to AdminMeetings list ([524e738](https://github.com/artarn-v1/ai-for-developers-project-387/commit/524e7383e841d3d710dd118343161d7408dce88d))
* **backend:** add .env file support via godotenv ([4f3e8de](https://github.com/artarn-v1/ai-for-developers-project-387/commit/4f3e8dec6cde313c06e9930ffef644690707f6d6))
* **backend:** add in-memory storage when DATABASE_URL is unset ([6a72c17](https://github.com/artarn-v1/ai-for-developers-project-387/commit/6a72c174020e5f706921762cda7905b1b7d6a761))
* **backend:** add postgres credentials to default DATABASE_URL and migrate make targets ([fd92993](https://github.com/artarn-v1/ai-for-developers-project-387/commit/fd929938a47c74a9b7b64bbd071bddfbf3c0d675))
* **client:** add booking UI with calendar and time-slot selection ([e909594](https://github.com/artarn-v1/ai-for-developers-project-387/commit/e909594675c4c7097fdbd02920970275f2e2116f))
* **frontend:** add meeting filters UI with dark calendar ([8a477c7](https://github.com/artarn-v1/ai-for-developers-project-387/commit/8a477c764232b0760daedeabd5e7fa9761d571d6))
* **infra:** add unified Docker image with frontend and backend ([8f581a5](https://github.com/artarn-v1/ai-for-developers-project-387/commit/8f581a5981c435155630d3e3650237b97c2ec5c6))
* merge calendar and booking form into a single card with side-by-side layout ([1f7cf72](https://github.com/artarn-v1/ai-for-developers-project-387/commit/1f7cf72c5d3d843e4a0403fcdc01dafc3514545e))


### Bug Fixes

* add continue-on-error to opencode action step ([313942a](https://github.com/artarn-v1/ai-for-developers-project-387/commit/313942ae5561864932fd01a656a42c639284bccc))
* **backend:** add end_date_time column to fix exclusion constraint migration ([e4cd7b1](https://github.com/artarn-v1/ai-for-developers-project-387/commit/e4cd7b1eddf3589b7a1a6bec0e49326960e2966e))
* **backend:** prevent race condition on meeting booking with exclusion constraint ([5ade37a](https://github.com/artarn-v1/ai-for-developers-project-387/commit/5ade37aebf9404d152e0ad2a4874e02b33a74de2))
* **infra:** add main to allowed commitlint scopes for release-please ([25de005](https://github.com/artarn-v1/ai-for-developers-project-387/commit/25de0050a9a506efe80529ac9454274a9b62b4c4))
* **infra:** pass correct port to Go backend in entrypoint ([a3f444b](https://github.com/artarn-v1/ai-for-developers-project-387/commit/a3f444b27bf7e9bf9ffb2756a6345f212e33221e))
* **infra:** replace dynamic step id with static string ([0335f31](https://github.com/artarn-v1/ai-for-developers-project-387/commit/0335f31f73bf082ff4a71ffaf94981b2eee0d182))
* remove continue-on-error to opencode action step ([a3c8bf4](https://github.com/artarn-v1/ai-for-developers-project-387/commit/a3c8bf459ed662dbe2f0561fbbe7f24f03b56eb3))
* remove unused imports and dead code in test specs ([6c44480](https://github.com/artarn-v1/ai-for-developers-project-387/commit/6c444801ddc8137b7e6264eb75ea5bc058d521e3))
* return 404 when updating non-existent meeting/meeting-type; fix frontend toggle calling wrong endpoint ([e82f130](https://github.com/artarn-v1/ai-for-developers-project-387/commit/e82f130c05ab46284fd4b3ef3095e95fa13d64c8))
* use clientSlug вместо adminSlug в кнопках копирования ([4c4ca34](https://github.com/artarn-v1/ai-for-developers-project-387/commit/4c4ca34a7d43f4517b17f2b67c3d77a99c1b530f))

## [1.3.0](https://github.com/artarn-v1/ai-for-developers-project-386/compare/v1.2.0...v1.3.0) (2026-06-16)


### Features

* **backend:** add in-memory storage when DATABASE_URL is unset ([6a72c17](https://github.com/artarn-v1/ai-for-developers-project-386/commit/6a72c174020e5f706921762cda7905b1b7d6a761))

## [1.1.1](https://github.com/artarn-v1/ai-for-developers-project-386/compare/v1.1.0...v1.1.1) (2026-06-16)


### Bug Fixes

* **infra:** pass correct port to Go backend in entrypoint ([a3f444b](https://github.com/artarn-v1/ai-for-developers-project-386/commit/a3f444b27bf7e9bf9ffb2756a6345f212e33221e))

## [1.1.0](https://github.com/artarn-v1/ai-for-developers-project-386/compare/v1.0.0...v1.1.0) (2026-06-16)


### Features

* **infra:** add unified Docker image with frontend and backend ([8f581a5](https://github.com/artarn-v1/ai-for-developers-project-386/commit/8f581a5981c435155630d3e3650237b97c2ec5c6))

## 1.0.0 (2026-06-15)


### Features

* add copy client link button to meeting types page ([b2da68d](https://github.com/artarn-v1/ai-for-developers-project-386/commit/b2da68d900db1aaa09c2ab508c0856a16fe79830))
* add Docker support with docker-compose (postgres 12, Go backend, React frontend) ([fc1c708](https://github.com/artarn-v1/ai-for-developers-project-386/commit/fc1c70884a6d5b19dd3fd9aa7f21375568aa1db8))
* add docker-recreate-db make target ([b4c32b8](https://github.com/artarn-v1/ai-for-developers-project-386/commit/b4c32b8aada5b348a9723f6102dc1936c75ff603))
* add ESLint to tests directory ([8a7f73b](https://github.com/artarn-v1/ai-for-developers-project-386/commit/8a7f73ba5706e38bb131fa8babb7bd89d38eae47))
* add Go backend with PostgreSQL and API from TypeSpec spec ([949a58e](https://github.com/artarn-v1/ai-for-developers-project-386/commit/949a58e70b05c2bcb7711337edd34e9541dd80b1))
* add meetings filter by meeting type ([f593240](https://github.com/artarn-v1/ai-for-developers-project-386/commit/f5932408ed13d989e618887ea5d99fa747059149))
* add owners list page with GET /owners endpoint ([7d888ea](https://github.com/artarn-v1/ai-for-developers-project-386/commit/7d888ea0c6fc03a0b7a55fbcf922b3615fdaf21e))
* add Playwright integration tests ([3b06906](https://github.com/artarn-v1/ai-for-developers-project-386/commit/3b0690600ac49ce7369e373ded1da6a3970594aa))
* add TypeSpec Meeting Booking API with admin and client endpoints ([56240ea](https://github.com/artarn-v1/ai-for-developers-project-386/commit/56240ea712a1e59173395252827b2fe32d74e6d7))
* **admin:** add confirm/decline actions to meeting modal, unify filter design ([13e1259](https://github.com/artarn-v1/ai-for-developers-project-386/commit/13e1259f4a11573a68222985c641c4649f9f5be7))
* **api:** add isConfirmed filter to AdminMeetings list ([524e738](https://github.com/artarn-v1/ai-for-developers-project-386/commit/524e7383e841d3d710dd118343161d7408dce88d))
* **backend:** add .env file support via godotenv ([4f3e8de](https://github.com/artarn-v1/ai-for-developers-project-386/commit/4f3e8dec6cde313c06e9930ffef644690707f6d6))
* **backend:** add postgres credentials to default DATABASE_URL and migrate make targets ([fd92993](https://github.com/artarn-v1/ai-for-developers-project-386/commit/fd929938a47c74a9b7b64bbd071bddfbf3c0d675))
* **client:** add booking UI with calendar and time-slot selection ([e909594](https://github.com/artarn-v1/ai-for-developers-project-386/commit/e909594675c4c7097fdbd02920970275f2e2116f))
* **frontend:** add meeting filters UI with dark calendar ([8a477c7](https://github.com/artarn-v1/ai-for-developers-project-386/commit/8a477c764232b0760daedeabd5e7fa9761d571d6))
* merge calendar and booking form into a single card with side-by-side layout ([1f7cf72](https://github.com/artarn-v1/ai-for-developers-project-386/commit/1f7cf72c5d3d843e4a0403fcdc01dafc3514545e))


### Bug Fixes

* **backend:** add end_date_time column to fix exclusion constraint migration ([e4cd7b1](https://github.com/artarn-v1/ai-for-developers-project-386/commit/e4cd7b1eddf3589b7a1a6bec0e49326960e2966e))
* **backend:** prevent race condition on meeting booking with exclusion constraint ([5ade37a](https://github.com/artarn-v1/ai-for-developers-project-386/commit/5ade37aebf9404d152e0ad2a4874e02b33a74de2))
* **infra:** add main to allowed commitlint scopes for release-please ([25de005](https://github.com/artarn-v1/ai-for-developers-project-386/commit/25de0050a9a506efe80529ac9454274a9b62b4c4))
* **infra:** replace dynamic step id with static string ([0335f31](https://github.com/artarn-v1/ai-for-developers-project-386/commit/0335f31f73bf082ff4a71ffaf94981b2eee0d182))
* remove unused imports and dead code in test specs ([6c44480](https://github.com/artarn-v1/ai-for-developers-project-386/commit/6c444801ddc8137b7e6264eb75ea5bc058d521e3))
* return 404 when updating non-existent meeting/meeting-type; fix frontend toggle calling wrong endpoint ([e82f130](https://github.com/artarn-v1/ai-for-developers-project-386/commit/e82f130c05ab46284fd4b3ef3095e95fa13d64c8))
* use clientSlug вместо adminSlug в кнопках копирования ([4c4ca34](https://github.com/artarn-v1/ai-for-developers-project-386/commit/4c4ca34a7d43f4517b17f2b67c3d77a99c1b530f))
