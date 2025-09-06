# Burme-Mark (Demo Scaffold)

# project structure 

```
Burme-Mark/
├── index.html

├── user/
│   ├── login.html
│   ├── register.html
│   ├── reset.html
│   └── css/
│       └── user.css

├── pages/
│   ├── main.html
│   ├── menu.html
│   ├── history_view.html
│   ├── setting.html
│   ├── docs.html
│   ├── error.html
│   ├── user_info.html
│   ├── profile.html
│   ├── about.html
│   └── dashboard.html

├── css/
│   ├── main.css
│   ├── setting.css
│   ├── dashboard.css
│   └── update.css

├── js/
│   ├── main.js
│   ├── setting.js
│   ├── dashboard.js
│   ├── loader_effect.js
│   ├── user_profile.js
│   ├── button.js
│   └── docs.js

├── server/
│   ├── server.js
│   ├── index.js
│   ├── database.js
│   ├── auth.js
│   ├── option.js
│   ├── chat.js
│   ├── api_call.js
│   └── generator.js

├── storage/
│   ├── storage_permission.js
│   ├── user_info.js
│   └── history.js

├── knowledge_base/
│   ├── engine.js          # logic for Q&A retrieval, indexing, searching
│   └── data_edit.js       # admin/editor tool to add/update knowledge entries

├── languages/
│   ├── my.json            # မြန်မာ
│   ├── en.json            # English
│   ├── th.json            # ไทย
│   ├── zh.json            # 中文
│   ├── ar.json            # العربية
│   ├── ru.json            # Русский
│   └── pt.json            # Português

├── assets/
│   ├── icon.png
│   ├── logo.png
│   └── background.png

├── worker.js
├── package.json
├── README.md
├── .gitignore
├── .env
└── .env.example
```

This scaffold contains a demo device-view system, language JSON files, sample JS, minimal chat iframe bridge, floating code animation, and gray+black theme.

## Quick Start

1. Unzip project and serve `index.html` via a static server (live-server, http-server, or your backend).

2. Visit `index.html`. Use the Desktop/Mobile buttons in the top-right to switch the preview device size.

3. Open `pages/main.html` inside the iframe to try the demo chat. Messages are posted to parent window and saved in `localStorage`.

## Files added/updated
- css/main.css : theme + floating animation + responsive device preview
- js/main.js : device toggle + i18n loader + simple postMessage handler
- js/iframe-chat.js : demo chat logic for pages/main.html
- languages/*.json : translation dictionaries for en, my, th, zh, ar, ru, pt
- .env, .env.example : demo environment variables placeholders
- .gitignore : ignores sensitive files

## Notes
- This is a frontend-focused demo to speed up development. Replace placeholder API keys and wire server endpoints (server/) as needed.
- The floating code block demonstrates animation and aesthetic; you can add more floating elements by copying the `.floating-code` style.
- 
