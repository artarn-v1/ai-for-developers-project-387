# Changelog

## 1.0.0 (2026-06-15)


### Features

* add copy client link button to meeting types page ([b2da68d](https://github.com/artarn-v1/ai-for-developers-project-386/commit/b2da68d900db1aaa09c2ab508c0856a16fe79830))
* add Docker support with docker-compose (postgres 12, Go backend, React frontend) ([fc1c708](https://github.com/artarn-v1/ai-for-developers-project-386/commit/fc1c70884a6d5b19dd3fd9aa7f21375568aa1db8))
* add Go backend with PostgreSQL and API from TypeSpec spec ([949a58e](https://github.com/artarn-v1/ai-for-developers-project-386/commit/949a58e70b05c2bcb7711337edd34e9541dd80b1))
* add meetings filter by meeting type ([f593240](https://github.com/artarn-v1/ai-for-developers-project-386/commit/f5932408ed13d989e618887ea5d99fa747059149))
* add owners list page with GET /owners endpoint ([7d888ea](https://github.com/artarn-v1/ai-for-developers-project-386/commit/7d888ea0c6fc03a0b7a55fbcf922b3615fdaf21e))
* **admin:** add confirm/decline actions to meeting modal, unify filter design ([13e1259](https://github.com/artarn-v1/ai-for-developers-project-386/commit/13e1259f4a11573a68222985c641c4649f9f5be7))
* **api:** add isConfirmed filter to AdminMeetings list ([524e738](https://github.com/artarn-v1/ai-for-developers-project-386/commit/524e7383e841d3d710dd118343161d7408dce88d))
* **client:** add booking UI with calendar and time-slot selection ([e909594](https://github.com/artarn-v1/ai-for-developers-project-386/commit/e909594675c4c7097fdbd02920970275f2e2116f))
* **frontend:** add meeting filters UI with dark calendar ([8a477c7](https://github.com/artarn-v1/ai-for-developers-project-386/commit/8a477c764232b0760daedeabd5e7fa9761d571d6))
* merge calendar and booking form into a single card with side-by-side layout ([1f7cf72](https://github.com/artarn-v1/ai-for-developers-project-386/commit/1f7cf72c5d3d843e4a0403fcdc01dafc3514545e))


### Bug Fixes

* return 404 when updating non-existent meeting/meeting-type; fix frontend toggle calling wrong endpoint ([e82f130](https://github.com/artarn-v1/ai-for-developers-project-386/commit/e82f130c05ab46284fd4b3ef3095e95fa13d64c8))
* use clientSlug вместо adminSlug в кнопках копирования ([4c4ca34](https://github.com/artarn-v1/ai-for-developers-project-386/commit/4c4ca34a7d43f4517b17f2b67c3d77a99c1b530f))
