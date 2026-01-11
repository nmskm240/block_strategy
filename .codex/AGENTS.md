## プロジェクト概要

FXなどの売買戦略をビジュアルプログラミングし、ブラウザ完結でバックテストまで行う

## 技術スタック

- blockly
  - クライアントサイドで売買戦略の設計UIを提供する
- pyodide
  - `blockly`で実装した売買戦略を実行するランタイム環境を提供
- backtrader
  - `pyodide`上で売買戦略のバックテストを実行するエンジン
- chevrotain
  - `blockly`で実装した売買戦略を解析し、`backtrader`で実行可能な形に変換する

## アーキテクチャ

モノレポDDDをベースに開発します

### フォルダ構成

```
.
├── client
│   └── src
│       ├── adapter
│       ├── presentation
│       └── lib
│           ├── blockly
│           └── pyodide
├── server
│   └── src
│       ├── interface
│       └── infra
└── shared
    └── src
        ├── application
        ├── domain
        └── types
```

## コーディング規則

- コミットメッセージは Conventional Commits に従う
  - コミット内容部に関しては日本語で記述してください
- ブランチ名は Conventional Branch に従う
- コミットメッセージは対応内容をシンプルに1行で表現する
