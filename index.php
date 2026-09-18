<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Peminjaman Ruangan Kampus - Kelompok 1</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        body {
            background-color: #f8fafc;
            color: #334155;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }
        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #1e293b;
            padding: 1rem 2rem;
            color: white;
        }
        .navbar .logo {
            font-size: 1.25rem;
            font-weight: bold;
            color: #38bdf8;
        }
        .navbar nav a {
            color: #e2e8f0;
            text-decoration: none;
            margin-left: 1.5rem;
        }
        .navbar nav .btn-login {
            background-color: #0284c7;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            color: white;
        }
        .hero {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 4rem 2rem;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
        }
        .hero-content h1 {
            font-size: 2.2rem;
            margin-bottom: 1rem;
        }
        .hero-content p {
            font-size: 1rem;
            color: #94a3b8;
            margin-bottom: 2rem;
        }
        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin: 0 0.5rem;
        }
        .btn-primary { background-color: #0284c7; color: white; }
        .btn-secondary { border: 2px solid #64748b; color: #e2e8f0; }
        footer {
            text-align: center;
            padding: 1rem;
            background-color: #0f172a;
            color: #64748b;
        }
    </style>
</head>
<body>

    <header class="navbar">
        <div class="logo">🏛️ PinjamRuang Kampus</div>
        <nav>
            <a href="index.php">Beranda</a>
            <a href="#">Daftar Ruangan</a>
            <a href="#" class="btn-login">Login</a>
        </nav>
    </header>

    <main class="hero">
        <div class="hero-content">
            <h1>Sistem Peminjaman Ruangan Kampus</h1>
            <p>Ajukan peminjaman ruangan perkuliahan, laboratorium, dan aula kampus dengan cepat dan mudah.</p>
            <div class="hero-buttons">
                <a href="#" class="btn btn-primary">Lihat Ruangan</a>
                <a href="#" class="btn btn-secondary">Petunjuk Peminjaman</a>
            </div>
        </div>
    </main>

    <footer>
        <p>&copy; 2026 Kelompok 1 - Web Development PHP</p>
    </footer>

</body>
</html>