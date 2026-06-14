const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("=== Menginisialisasi Script Setup VPS ===");

// 1. Cek / Install ssh2 secara dinamis
try {
  require.resolve('ssh2');
  console.log("[✓] Modul 'ssh2' sudah terinstall.");
} catch (e) {
  console.log("[*] Modul 'ssh2' belum ada. Sedang menginstall untuk keperluan koneksi SSH...");
  try {
    execSync('npm install ssh2 --no-save', { stdio: 'inherit', cwd: __dirname });
    console.log("[✓] Berhasil menginstall ssh2.");
  } catch (err) {
    console.error("[!] Gagal menginstall ssh2 secara otomatis. Silakan jalankan 'npm install ssh2' secara manual.");
    process.exit(1);
  }
}

const { Client } = require('ssh2');

const conn = new Client();
const config = {
  host: '154.19.37.25',
  port: 22,
  username: 'root',
  password: 'OryzaLokabasa123!'
};

console.log(`\n[*] Menghubungkan ke VPS ${config.host} sebagai ${config.username}...`);

conn.on('ready', () => {
  console.log("[✓] Koneksi SSH Berhasil Terjalin!");
  runSequence();
}).on('error', (err) => {
  console.error("[!] Gagal melakukan koneksi SSH:", err.message);
  console.log("\nTips: Pastikan VPS dalam kondisi menyala, IP public benar, dan password sesuai.");
  process.exit(1);
}).connect(config);

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', (code, signal) => {
        resolve({ code, stdout, stderr });
      }).on('data', (data) => {
        stdout += data.toString();
      }).stderr.on('data', (data) => {
        stderr += data.toString();
      });
    });
  });
}

async function runSequence() {
  const reports = [];
  
  const runAndLog = async (title, cmd) => {
    console.log(`\n[*] Menjalankan: ${title}...`);
    try {
      const res = await executeCommand(cmd);
      reports.push({ title, cmd, ...res });
      if (res.stdout.trim()) console.log(res.stdout.trim());
      if (res.stderr.trim()) console.warn("[Peringatan/Error]:", res.stderr.trim());
      return res;
    } catch (err) {
      console.error(`[!] Gagal menjalankan ${title}:`, err.message);
      reports.push({ title, cmd, code: -1, stdout: '', stderr: err.message });
      return { code: -1, stdout: '', stderr: err.message };
    }
  };

  // 1. Diagnostik Sistem & Resource
  await runAndLog("Cek OS VPS", "uname -a && cat /etc/os-release | grep PRETTY_NAME");
  await runAndLog("Cek Spesifikasi RAM & Disk", "free -m && echo '' && df -h /");

  // 2. Diagnostik Layanan yang Berjalan (Ports)
  await runAndLog("Cek Port & Layanan Aktif di VPS", "ss -tulpn || netstat -tulpn");

  // 3. Cek Status Docker & Docker Compose
  const dockerVer = await runAndLog("Cek Versi Docker", "docker --version");
  const composeVer = await runAndLog("Cek Versi Docker Compose", "docker compose version || docker-compose version");

  if (dockerVer.code !== 0) {
    console.log("\n[!] Docker belum terinstall atau tidak aktif di VPS Anda.");
    console.log("[*] Silakan install Docker terlebih dahulu di VPS Anda.");
    conn.end();
    writeReport(reports);
    return;
  }

  // 4. Cek Container Docker yang sedang aktif
  await runAndLog("Cek Container Docker Saat Ini", "docker ps -a");

  // 5. Buat folder dan docker-compose.yml untuk PostgreSQL
  console.log("\n[*] Membuat konfigurasi database PostgreSQL di VPS...");
  
  const dockerComposeContent = `services:
  postgres:
    image: postgres:15-alpine
    container_name: padjajaran_db
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: OryzaLokabasa123!
      POSTGRES_DB: padjajaran
    ports:
      - "127.0.0.1:5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;

  await runAndLog("Membuat direktori ~/padjajaran-db", "mkdir -p ~/padjajaran-db");
  await runAndLog("Menulis docker-compose.yml", `cat << 'EOF' > ~/padjajaran-db/docker-compose.yml
${dockerComposeContent}EOF`);

  // 6. Jalankan PostgreSQL dengan docker run
  console.log("\n[*] Menjalankan PostgreSQL di Docker VPS...");
  await runAndLog("Hapus container lama (jika ada)", "docker rm -f padjajaran_db || true");
  await runAndLog("Start Database Container", "docker run -d --name padjajaran_db --restart always -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=OryzaLokabasa123! -e POSTGRES_DB=padjajaran -p 127.0.0.1:5433:5432 -v padjajaran_postgres_data:/var/lib/postgresql/data postgres:15-alpine");

  // 7. Cek status container setelah dijalankan
  await runAndLog("Cek Container Docker Terbaru", "docker ps");

  conn.end();
  writeReport(reports);
}

function writeReport(reports) {
  let logContent = "=== LAPORAN SETUP VPS & DATABASE ===\n\n";
  reports.forEach(r => {
    logContent += `--- ${r.title} ---\n`;
    logContent += `Perintah: ${r.cmd}\n`;
    logContent += `Exit Code: ${r.code}\n`;
    if (r.stdout.trim()) logContent += `Output:\n${r.stdout}\n`;
    if (r.stderr.trim()) logContent += `Error/Stderr:\n${r.stderr}\n`;
    logContent += `\n`;
  });

  const outputPath = path.join(__dirname, 'vps_setup_report.txt');
  fs.writeFileSync(outputPath, logContent, 'utf8');
  console.log(`\n[✓] Selesai! Laporan lengkap telah disimpan di: ${outputPath}`);
  console.log(`\nSilakan jalankan perintah ini, kemudian berikan output / isi file 'vps_setup_report.txt' agar saya bisa menganalisis status VPS Anda.`);
}
