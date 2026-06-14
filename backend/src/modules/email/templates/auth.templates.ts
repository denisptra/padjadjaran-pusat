export const registerOtpTemplate = (otp: string) => `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #e0e0e0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
  <!-- Logo -->
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://i.ibb.co/BHW464p5/logo-kasepuhan.png" alt="PPS Padjadjaran" style="max-width: 60px; height: auto;">
  </div>
  
  <h2 style="color: #1a1a1a; text-align: center; margin-bottom: 20px;">Verifikasi Email Anda</h2>
  
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">Halo,</p>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">Terima kasih telah bergabung dengan <strong>PPS Padjadjaran</strong>. Untuk melanjutkan proses pendaftaran, silakan gunakan kode verifikasi di bawah ini:</p>
  
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #DCAF01; margin: 30px 0; border: 1px dashed #DCAF01;">
    ${otp}
  </div>
  
  <p style="color: #4a4a4a; font-size: 14px;">Kode ini hanya berlaku selama <strong>5 menit</strong>. Jangan bagikan kode ini kepada siapapun.</p>
  <p style="color: #4a4a4a; font-size: 14px;">Jika Anda merasa tidak melakukan pendaftaran ini, silakan abaikan email ini.</p>
  
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; text-align: center;">
    <p style="font-size: 12px; color: #999; margin-bottom: 10px;">
        <a href="https://padjadjaran.pps.id/privacy-policy" style="color: #999; text-decoration: underline;">Kebijakan Privasi</a> | 
        <a href="https://padjadjaran.pps.id/syarat-ketentuan" style="color: #999; text-decoration: underline;">Syarat & Ketentuan</a>
    </p>
    <p style="font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} PPS Padjadjaran. Hak Cipta Dilindungi.</p>
  </div>
</div>
`;

export const resetPasswordTemplate = (resetLink: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #333; text-align: center;">Reset Kata Sandi</h2>
    <p>Halo,</p>
    <p>Anda menerima email ini karena kami menerima permintaan untuk mereset kata sandi akun Anda.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Kata Sandi</a>
    </div>
    <p>Atau salin dan tempel tautan berikut ke browser Anda:</p>
    <p style="font-size: 12px; word-break: break-all; color: #007bff;">${resetLink}</p>
    <p>Tautan ini akan kedaluwarsa dalam <strong>1 jam</strong>. Jika Anda tidak meminta reset kata sandi, abaikan email ini.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 12px; color: #777; text-align: center;">Ini adalah email otomatis, mohon tidak membalas email ini.</p>
  </div>
`;

export const changeEmailOtpTemplate = (otp: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #333; text-align: center;">Konfirmasi Perubahan Email</h2>
    <p>Halo,</p>
    <p>Anda telah meminta untuk mengubah alamat email akun Anda. Gunakan kode OTP di bawah ini untuk memverifikasi alamat email baru Anda:</p>
    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 4px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #28a745; margin: 20px 0;">
      ${otp}
    </div>
    <p>Kode ini akan kedaluwarsa dalam <strong>5 menit</strong>. Jika Anda tidak merasa melakukan permintaan ini, segera hubungi admin.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 12px; color: #777; text-align: center;">Ini adalah email otomatis, mohon tidak membalas email ini.</p>
  </div>
`;
