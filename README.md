# Davronbekova DApp

Bu loyihada React.js asosida Ethereum DApp interfeysi yaratildi. U MetaMask, WalletConnect va Coinbase Wallet orqali ulanishni qo‘llab-quvvatlaydi.

## Qanday ishlaydi

1. `npm install` bilan bog‘liqliklar o‘rnatiladi.
2. `npm run dev` bilan lokal serverni ishga tushirasiz.
3. Ulanish tugmalari yordamida MetaMask, WalletConnect yoki Coinbase Wallet orqali hisobingizni ulang.
4. Smart kontraktdan ma’lumot o‘qiladi va sahifada ko‘rsatiladi.
5. Input orqali ma’lumot yuborib, tranzaksiya holatini ko‘rishingiz mumkin.

## Muhim

- `src/App.jsx` faylida `CONTRACT_ADDRESS` qiymatini o‘z testnet kontraktingiz adresiga o‘zgartiring.
- Hozirgi sozlama Sepolia testnet uchun mo‘ljallangan.

## Deploy

- Vercel: GitHub repositoriyangizni Vercelga ulang va `npm install` + `npm run build` buyrug‘ini ishlating.
- GitHub Pages: `gh-pages` yordamida yoki GitHub Pages sozlamalari orqali `dist` papkasini chop eting.
