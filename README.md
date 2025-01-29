# プロバイダーのサンプルアプリケーション

このガイドでは、NestJSのプロバイダーの概念を理解するための実践的なサンプルアプリケーションを作成します。

## 前提条件

- Node.js (バージョン12以上)
- npm (Node.jsに付属)
- NestJS CLI (`npm i -g @nestjs/cli`)

## プロジェクトのセットアップ

1. 新しいNestJSプロジェクトを作成します：

```bash
nest new nest-providers-sample
cd nest-providers-sample
```

プロンプトが表示されたら、パッケージマネージャーとして`npm`を選択します。

## Catモジュールの実装

1. まず、Catモジュールとその関連ファイルを生成します：

```bash
nest g module cats
nest g controller cats
nest g service cats
```

2. Catインターフェースを作成します。`src/cats/interfaces/cat.interface.ts`を作成し、以下の内容を追加します：

```typescript
export interface Cat {
  name: string;
  age: number;
  breed: string;
}
```

3. DTOを作成します。`src/cats/dto/create-cat.dto.ts`を作成し、以下の内容を追加します：

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

4. Catサービスを実装します。`src/cats/cats.service.ts`を以下のように更新します：

```typescript
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }

  findOne(name: string): Cat {
    const cat = this.cats.find((cat) => cat.name === name);
    if (!cat) {
      throw new Error(`Cat ${name} not found`);
    }
    return cat;
  }
}
```

5. Catコントローラーを実装します。`src/cats/cats.controller.ts`を以下のように更新します：

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
    return 'Cat has been created';
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @Get(':name')
  async findOne(@Param('name') name: string): Promise<Cat> {
    return this.catsService.findOne(name);
  }
}
```

6. アプリケーションモジュールを確認します。`src/app.module.ts`は以下のようになっているはずです：

```typescript
import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule {}
```

## アプリケーションの実行とテスト

1. アプリケーションを起動します：

```bash
npm run start:dev
```

2. 新しい猫を作成するPOSTリクエストを送信：

```bash
curl -X POST http://localhost:3000/cats \
-H "Content-Type: application/json" \
-d '{
  "name": "みけ",
  "age": 3,
  "breed": "雑種"
}'
```

3. 全ての猫を取得するGETリクエスト：

```bash
curl http://localhost:3000/cats
```

4. 特定の猫を名前で取得するGETリクエスト：

```bash
curl http://localhost:3000/cats/みけ
```

## 依存性注入の解説

このサンプルアプリケーションでは、以下のように依存性注入が機能しています：

1. `@Injectable()`デコレータ：

   - `CatsService`クラスに付与され、このクラスがNestJSのIoCコンテナによって管理されることを示します
   - これにより、サービスのライフサイクル管理が自動化されます

2. コンストラクタベースの注入：

   ```typescript
   constructor(private catsService: CatsService) {}
   ```

   - `CatsController`のコンストラクタで`CatsService`を注入
   - TypeScriptの型システムにより、依存関係が自動的に解決されます

3. モジュールでの登録：
   ```typescript
   @Module({
     controllers: [CatsController],
     providers: [CatsService],
   })
   ```
   - `CatsModule`で`CatsService`をプロバイダーとして登録
   - これにより、モジュール内でサービスが利用可能になります

## プロバイダーのスコープ

このサンプルでは、`CatsService`はデフォルトのシングルトンスコープで動作します：

- アプリケーション全体で同じインスタンスが共有されます
- メモリ内の`cats`配列は、アプリケーションが実行している間保持されます
- アプリケーションが再起動されると、データはリセットされます

## テストケース

1. `src/cats/cats.service.spec.ts`にサービスのテストを作成：

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CatsService } from './cats.service';

describe('CatsService', () => {
  let service: CatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatsService],
    }).compile();

    service = module.get<CatsService>(CatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a cat', () => {
    const cat = { name: 'テスト猫', age: 1, breed: 'テスト種' };
    service.create(cat);
    const cats = service.findAll();
    expect(cats).toContain(cat);
  });

  it('should find a cat by name', () => {
    const cat = { name: 'テスト猫2', age: 2, breed: 'テスト種2' };
    service.create(cat);
    const found = service.findOne('テスト猫2');
    expect(found).toEqual(cat);
  });
});
```

テストを実行：

```bash
npm run test
```

## 学習ポイント

このサンプルアプリケーションを通じて、以下の概念を実践的に学ぶことができます：

1. **プロバイダーの定義と使用**

   - `@Injectable()`デコレータの使用
   - サービスクラスの実装
   - 依存関係の注入

2. **モジュール構成**

   - 機能モジュールの作成
   - コントローラーとプロバイダーの登録
   - モジュール間の依存関係

3. **RESTful API設計**

   - HTTPメソッドの適切な使用
   - DTOとインターフェースの分離
   - エンドポイントの設計

4. **テスト駆動開発**
   - ユニットテストの作成
   - テストモジュールの設定
   - 依存性の注入を考慮したテスト

## 発展的な課題

1. バリデーションの追加

   - `class-validator`を使用してDTOにバリデーションを追加
   - カスタムバリデーションパイプの作成

2. データ永続化

   - データベース接続の追加
   - リポジトリパターンの実装

3. エラーハンドリング

   - カスタム例外フィルターの作成
   - エラーレスポンスの標準化

4. ドキュメント化
   - Swaggerを使用したAPI文書の自動生成
   - コードコメントの追加

これらの発展的な課題に取り組むことで、NestJSの高度な機能についても学ぶことができます。
