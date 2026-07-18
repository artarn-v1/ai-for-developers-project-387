# Changelog

## [1.3.0](https://github.com/artarn-v1/ai-for-developers-project-386/compare/v1.2.0...v1.3.0) (2026-06-16)


### Features

* **backend:** add in-memory storage when DATABASE_URL is unset ([6a72c17](https://github.com/artarn-v1/ai-for-developers-project-386/commit/6a72c174020e5f706921762cda7905b1b7d6a761))

## 1.0.0 (2026-06-15)


### Features

* add Docker support with docker-compose (postgres 12, Go backend, React frontend) ([fc1c708](https://github.com/artarn-v1/ai-for-developers-project-386/commit/fc1c70884a6d5b19dd3fd9aa7f21375568aa1db8))
* add Go backend with PostgreSQL and API from TypeSpec spec ([949a58e](https://github.com/artarn-v1/ai-for-developers-project-386/commit/949a58e70b05c2bcb7711337edd34e9541dd80b1))
* add owners list page with GET /owners endpoint ([7d888ea](https://github.com/artarn-v1/ai-for-developers-project-386/commit/7d888ea0c6fc03a0b7a55fbcf922b3615fdaf21e))
* **backend:** add .env file support via godotenv ([4f3e8de](https://github.com/artarn-v1/ai-for-developers-project-386/commit/4f3e8dec6cde313c06e9930ffef644690707f6d6))
* **backend:** add postgres credentials to default DATABASE_URL and migrate make targets ([fd92993](https://github.com/artarn-v1/ai-for-developers-project-386/commit/fd929938a47c74a9b7b64bbd071bddfbf3c0d675))


### Bug Fixes

* **backend:** add end_date_time column to fix exclusion constraint migration ([e4cd7b1](https://github.com/artarn-v1/ai-for-developers-project-386/commit/e4cd7b1eddf3589b7a1a6bec0e49326960e2966e))
* **backend:** prevent race condition on meeting booking with exclusion constraint ([5ade37a](https://github.com/artarn-v1/ai-for-developers-project-386/commit/5ade37aebf9404d152e0ad2a4874e02b33a74de2))
* return 404 when updating non-existent meeting/meeting-type; fix frontend toggle calling wrong endpoint ([e82f130](https://github.com/artarn-v1/ai-for-developers-project-386/commit/e82f130c05ab46284fd4b3ef3095e95fa13d64c8))
* use clientSlug вместо adminSlug в кнопках копирования ([4c4ca34](https://github.com/artarn-v1/ai-for-developers-project-386/commit/4c4ca34a7d43f4517b17f2b67c3d77a99c1b530f))
