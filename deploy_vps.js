const { Client } = require('ssh2');
const conn = new Client();
const host = '154.19.37.25', user = 'root', pass = 'OryzaLokabasa123!';

const execCmd = (cmd) => new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
        if (err) return reject(err);
        let out = '', errOut = '';
        stream.on('data', d => out += d).stderr.on('data', d => errOut += d);
        stream.on('close', (code) => resolve({code, out, errOut}));
    });
});

conn.on('ready', async () => {
    try {
        console.log('--- Cloning Repo ---');
        await execCmd('rm -rf ~/padjajaran-portal && git clone https://github.com/denisptra/padjadjaran-pusat.git ~/padjajaran-portal');
        
        console.log('--- Setting up .env ---');
        const envContent = `DB_USER=postgres
DB_PASSWORD=OryzaLokabasa123!
DB_NAME=padjajaran
JWT_ACCESS_SECRET=7a6c9d5e3f1b4a0c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c
JWT_REFRESH_SECRET=9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION_DAYS=7
COOKIE_SECRET=b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6
ENCRYPTION_KEY=4c7d9b0e2f4a6c8e0d2f4a6c8e0d2f4a
MAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=pusatpadjadjaran@gmail.com
SMTP_PASS='pvaw ovvu dwie xsdi'
SMTP_SECURE=false
SMTP_FROM='PPS Padjadjaran <pusatpadjadjaran@gmail.com>'
VITE_API_URL=http://154.19.37.25:5001/api
CLIENT_URL=http://154.19.37.25`;
        
        await execCmd("cat << 'EOF' > ~/padjajaran-portal/.env\n" + envContent + "\nEOF");

        console.log('--- Starting Backend and DB ---');
        const res = await execCmd('cd ~/padjajaran-portal && docker-compose up -d --build padjajaran_db padjajaran_backend');
        console.log(res.out);
        console.error(res.errOut);

        console.log('--- Verifying ---');
        const status = await execCmd('docker ps');
        console.log(status.out);
        
        conn.end();
    } catch (e) {
        console.error(e);
        conn.end();
    }
}).connect({ host, port: 22, username: user, password: pass });
