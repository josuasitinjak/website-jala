import './globals.css';

export const metadata = {
  title: 'JALA Roti Kirai Berinti & Es Telang Lemonade | Contemporary Malay Heritage Culinary',
  description: 'Kuliner khas Melayu Kepulauan Riau beraroma kunyit dalam format gulungan porsi pas siap santap dengan isian gurih praktis dan Es Telang Lemonade alami. Projek PKWU SMAN 1 Batam.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/images/assets/logo.jpeg' }
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" style={{ scrollBehavior: 'smooth' }}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{__html: `
          *, *::before, *::after {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            max-width: 100vw;
            overflow-x: hidden;
          }
          img, svg, video {
            max-width: 100%;
          }
          .jala-logo-img, header img {
            height: 44px !important;
            max-height: 48px !important;
            width: auto !important;
            object-fit: contain !important;
            display: inline-block !important;
          }
          body { font-family: 'Poppins', sans-serif; background-color: #fdfcfa; }
          .hero {
              background: linear-gradient(180deg, #fffcf5 0%, #fbf6ec 60%, #fffdf8 100%);
              background-size: cover;
              background-position: center;
              min-height: 75vh;
              display: flex;
              align-items: center;
          }
          .hero h1, .hero p { text-shadow: none; }
          .nav-link { position: relative; padding: 0.5rem 0; transition: all 0.3s ease; color: #4b5563; }
          .nav-link.active { color: #d97706; font-weight: 600; }
          .nav-link.active::after {
              content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
              height: 3px; background-color: #f59e0b; border-radius: 2px;
          }
          .whatsapp-float {
              position: fixed; bottom: 30px; right: 30px; background-color: #25D366; color: white;
              width: 60px; height: 60px; border-radius: 50%; text-align: center; font-size: 30px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25); z-index: 100; display: flex;
              align-items: center; justify-content: center; transition: all 0.3s;
          }
          .product-card, .testimonial-card, .farmer-card { transition: all 0.3s ease; height: 100%; display: flex; flex-direction: column; }
          .product-card:hover, .testimonial-card:hover, .farmer-card:hover { border-color: #fde68a; transform: translateY(-8px); box-shadow: 0 12px 28px rgba(245, 158, 11, 0.18); }
          .modal-overlay {
              position: fixed; top: 0; left: 0; right: 0; bottom: 0;
              background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
              z-index: 1000; opacity: 0; visibility: hidden; transition: all 0.3s ease-in-out;
          }
          .modal-overlay.active { opacity: 1; visibility: visible; }
          .modal-content {
              background: white; padding: 2rem; border-radius: 0.75rem; width: 90%;
              max-width: 550px; transform: translateY(-20px); transition: all 0.3s ease-in-out;
              max-height: 90vh; overflow-y: auto;
          }
          .modal-overlay.active .modal-content { transform: translateY(0); }
          .section { padding-top: 5rem; padding-bottom: 5rem; }
        `}} />
      </head>
      <body className="bg-white text-gray-800 antialiased">
        {children}
      </body>
    </html>
  )
}
