import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 全局路由前缀
  app.setGlobalPrefix('api')

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  )

  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  })

  const port = process.env.PORT || 3000
  await app.listen(port)
  console.log(` Marathon API running on http://localhost:${port}`)
}
bootstrap()
