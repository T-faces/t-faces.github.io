<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $name = $_POST['name'];
  $email = $_POST['email'];
  $message = $_POST['message'];
  
  $to = 'ariagungsatria01@email.com';
  $subject = 'Pesan dari Formulir Kontak';
  $headers = "From: $email\r\n" .
             "Reply-To: $email\r\n" .
             "MIME-Version: 1.0\r\n" .
             "Content-Type: text/html; charset=UTF-8\r\n";
  
  $body = "Nama: $name<br><br>".
          "Email: $email<br><br>".
          "Pesan:<br>$message";
  
  if (mail($to, $subject, $body, $headers)) {
    echo 'Email berhasil dikirim.';
  } else {
    echo 'Terjadi kesalahan saat mengirim email.';
  }
}
?>
