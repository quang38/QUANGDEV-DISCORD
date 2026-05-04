# QUANG.DEV Discord Image Storage

Một trang web lưu trữ image cho bot Discord của QUANG.DEV, được xây dựng với React JS và theo design system của Vercel.

## Features

- 🖼️ Gallery hiển thị images theo folder structure
- 📁 Filter images theo thư mục (root, acg, meme, etc.)
- 📋 Copy URL để sử dụng trong Discord bot
- 🎨 Design theo Vercel design system
- 📱 Responsive design

## URL Structure

Images được phục vụ qua các URL (case-insensitive):
- `http://localhost:3001/discord/image/1.png`
- `http://localhost:3001/DISCORD/IMAGE/1.png`
- `http://localhost:3001/discord/IMAGE/1.png`
- `http://localhost:3001/DISCORD/image/1.png`

Tất cả các variations trên đều trỏ về cùng thư mục `public/DISCORD/IMAGE/`

## Development

### Cài đặt
```bash
npm install
```

### Chạy development server
```bash
npm run dev
```

**Lưu ý:** 
- Tự động scan images trong `public/DISCORD/IMAGE/` và generate `images.json`
- Hỗ trợ case-insensitive URLs: `discord/image`, `DISCORD/IMAGE`, etc.
- Lưu preferences dark mode trong localStorage
- Khi thêm/xóa images: chạy `npm run generate` để cập nhật

### Generate images list thủ công
```bash
npm run generate
```

### Build production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## Cấu trúc thư mục

```
public/
└── DISCORD/
    └── IMAGE/
        ├── 1.png
        ├── 2.png
        ├── acg/
        │   ├── 1.png
        │   └── 2.png
        └── meme/
            └── 1.png
```

## Sử dụng trong Discord Bot

Trong Discord bot của bạn, có thể trỏ đến các image URLs:

```javascript
// Example usage in Discord bot
const imageUrl = 'http://localhost:3001/DISCORD/IMAGE/acg/1.png';
// Send image in Discord message
```

## Design System

Website sử dụng Vercel design system với:
- Geist font family
- Shadow-as-border technique
- Monochrome color palette
- Aggressive negative letter-spacing cho headings
- Multi-layer shadow stacks cho cards
