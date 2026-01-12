# Strategy IL (トレード戦略中間言語)とは

Strategy IL は、Blockly で作成した戦略をアプリケーション層で変換可能な共通形式として表現する中間言語です。SQL のように構造を保持しつつ、最終的に Pine Script や Backtrader の Strategy へ変換されることを目的としています。

## 目的

- ブロックベースの戦略構築結果を構造的に保存する
- 実行ターゲット (Pine/Backtrader など) への変換を容易にする
- テキスト形式と AST 形式の双方で扱えるようにする

## 言語の位置付け

- 入力: Blockly Workspace (ブロック定義)
- 中間: Strategy IL (テキスト / AST)
- 出力: Pine Script, Backtrader Strategy など

## 構文 (テキスト形式)

- 代入は `=`、文末は `;` を推奨
- 条件分岐は `WHEN ... DO ...` で表現
- 複数アクションは `,` で連結

### 例

```
sma_fast = SMA(close, 20);
sma_slow = SMA(close, 50);

WHEN cross_over(sma_fast, sma_slow)
  DO ENTRY(
    side = LONG,
    size = FIXED(0.1)
  ), EXIT(
    side = LONG,
    size = FIXED(0.1)
  );
```

## AST 仕様

AST は TypeScript の型定義として `shared/src/domain/strategy_il.ts` に存在します。

### Program

- `Program` は `Statement[]` を持つトップレベル

### Statement

- `AssignmentStatement`: 代入文
- `WhenStatement`: 条件付きアクション

### Action

- `EntryAction`: エントリー
- `ExitAction`: エグジット

### Expression

- `IdentifierExpression`
- `LiteralExpression` (number/string/boolean)
- `EnumLiteralExpression` (LONG/SHORT など)
- `FunctionCallExpression`
- `UnaryExpression`
- `BinaryExpression`

## 主要ノードの意味

### AssignmentStatement

```
<identifier> = <expression>;
```

- 指標や中間値を `self.<name>` にバインドする想定

### WhenStatement

```
WHEN <expression>
  DO <action>, <action>;
```

- 条件が真のときにアクション列を実行

### EntryAction / ExitAction

```
ENTRY(side = LONG, size = FIXED(0.1))
EXIT(side = LONG, size = FIXED(0.1))
```

- `side` と `size` は必須扱い
- `side` は `LONG` / `SHORT` を推奨
- `size` は数量指定 (例: `FIXED(0.1)`)

## 式 (Expression) の仕様

### 識別子

- `close`, `open`, `high`, `low`, `volume` は価格系列として扱う
- その他の識別子は変数として扱う

### 関数呼び出し

```
SMA(close, 20)
EMA(close, 10)
RSI(close, 14)
FIXED(0.1)
```

### 比較 / 論理

- 比較: `==`, `!=`, `<`, `<=`, `>`, `>=`
- 論理: `AND`, `OR`, `NOT`

## 変換仕様 (Backtrader)

`shared/src/application/backtrader_generator.ts` にて IL から Backtrader Strategy を生成します。

- `SMA/EMA/RSI` は `bt.ind.*` に変換
- `cross_over(a, b)` は `bt.ind.CrossOver(a, b) > 0`
- `cross_under(a, b)` は `bt.ind.CrossOver(a, b) < 0`
- `ENTRY` は `buy` / `sell` を選択
- `EXIT` は `close` を呼び出す

## Blockly 変換仕様 (Workspace -> IL)

`client/src/lib/blockly/strategy_il.ts` にて Workspace を IL に変換します。

対応ブロック:

- `strategy_when` -> `WhenStatement`
- `strategy_entry` -> `EntryAction`
- `strategy_exit` -> `ExitAction`
- `strategy_price` -> `IdentifierExpression`
- `strategy_sma` / `strategy_ema` / `strategy_rsi` -> `FunctionCallExpression`
- `strategy_cross_over` / `strategy_cross_under` -> `FunctionCallExpression`
- `strategy_fixed` -> `FunctionCallExpression`

## エラーハンドリング

- 式が欠落した場合は `__missing__` を埋める
- 変換後に AST を解析して不足値を検出する想定

## 制約

- ループや関数定義は未対応
- `WHEN` のネストは未対応
- `ENTRY/EXIT` のみサポート (今後拡張予定)

## 拡張予定

- `STOP`, `TAKE_PROFIT`, `TRAILING` などの注文アクション
- `ELSE` 付きの条件分岐
- 多銘柄 / マルチタイムフレーム対応
- パラメータ宣言セクション

## バージョニング

- 仕様変更が入る場合は `Strategy IL vX` 形式で記載する
- 互換性のない変更時にはマイグレーション指針を併記する
